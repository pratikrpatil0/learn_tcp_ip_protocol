#include <arpa/inet.h> // network operations
#include <errno.h>
#include <math.h>
#include <stdint.h>
#include <stdio.h> // for i/o operations
#include <string.h> // for string handling
#include <sys/time.h>  // include time structures like timeval for setting timeouts
#include <unistd.h> // for system calls
#define PORT 9090 // this is where the receiver will listen the message
 // this is where the receiver will listen the message

#define MAX_MSG_LEN 99
#define WINDOW_SIZE 8
#define CHUNK_SIZE 8
#define MAX_PACKETS ((MAX_MSG_LEN + CHUNK_SIZE - 1) / CHUNK_SIZE)
#define MAX_TIMEOUT_RETRIES 15

#define INIT_RTO_MS 400.0
#define MIN_RTO_MS 120.0
#define MAX_RTO_MS 1500.0

#define INIT_CWND 1.0
#define INIT_SSTHRESH 8.0
#define MAX_CWND ((double)WINDOW_SIZE)

#define FLAG_SYN 0x01
#define FLAG_ACK 0x02
#define FLAG_FIN 0x04
#define FLAG_DATA 0x08

typedef struct {
    uint8_t seq;
    uint8_t ack_num;
    uint8_t flags;
    uint8_t len;
    uint8_t data[CHUNK_SIZE];
    uint16_t checksum;
} Packet;

static uint16_t compute_checksum(const Packet *pkt) {
    uint32_t sum = 0;
    sum += pkt->seq;
    sum += pkt->ack_num;
    sum += pkt->flags;
    sum += pkt->len;

    for (int i = 0; i < CHUNK_SIZE; i++) {
        sum += pkt->data[i];
    }

    while (sum >> 16) {
        sum = (sum & 0xFFFFU) + (sum >> 16);
    }
    return (uint16_t)(~sum);
}

static void finalize_packet(Packet *pkt) {
    pkt->checksum = 0;
    pkt->checksum = compute_checksum(pkt);
}

static int checksum_valid(const Packet *pkt) {
    Packet tmp = *pkt;
    uint16_t received = tmp.checksum;
    tmp.checksum = 0;
    return received == compute_checksum(&tmp);
}

static int is_from_peer(const struct sockaddr_in *expected, const struct sockaddr_in *from) {  // define a structure to hold the IP address and port number for the network connection
    return expected->sin_port == from->sin_port && expected->sin_addr.s_addr == from->sin_addr.s_addr;
}

static long long now_ms(void) {
    struct timeval tv;  // define a structure to properly hold a time duration, used here for setting a timeout period
    gettimeofday(&tv, NULL);
    return (long long)tv.tv_sec * 1000LL + (long long)tv.tv_usec / 1000LL;
}

static double clamp_double(double v, double min_v, double max_v) {
    if (v < min_v) {
        return min_v;
    }
    if (v > max_v) {
        return max_v;
    }
    return v;
}

static int wait_for_response(int sockfd, const struct sockaddr_in *receiver_addr, Packet *resp) {  // define a variable to hold our socket file descriptor, which acts as an ID for our network connection
    struct sockaddr_in from_addr;  // define a structure to hold the IP address and port number for the network connection
    socklen_t from_len = sizeof(from_addr);  // define a variable to store the size of the address structure, needed by OS network functions

    while (1) {  // start an infinite loop to keep running this process continuously
        ssize_t r = recvfrom(sockfd, resp, sizeof(*resp), 0, (struct sockaddr *)&from_addr, &from_len);  // wait and listen patiently to receive an incoming packet from the network
        if (r < 0) {
            return -1;
        }
        if (r != (ssize_t)sizeof(*resp)) {
            continue;
        }
        if (!is_from_peer(receiver_addr, &from_addr)) {
            continue;
        }
        if (!checksum_valid(resp)) {
            continue;
        }
        return 0;  // end the program execution successfully
    }
}

static int connect_handshake(int sockfd, const struct sockaddr_in *receiver_addr) {  // define a variable to hold our socket file descriptor, which acts as an ID for our network connection
    Packet syn;
    Packet resp;

    memset(&syn, 0, sizeof(syn));  // completely clear the memory of the address structure to prevent any leftover garbage data
    syn.seq = 0;
    syn.flags = FLAG_SYN;
    finalize_packet(&syn);

    for (int retry = 0; retry <= 5; retry++) {
        if (retry > 0) {
            printf("[RETRY %d] Resending SYN\n", retry);  // print a human-readable log message to the console screen so we can see what is happening
        }

        if (sendto(sockfd, &syn, sizeof(syn), 0, (const struct sockaddr *)receiver_addr, sizeof(*receiver_addr)) !=  // dispatch and send the data packet over the network to the assigned receiver address
            (ssize_t)sizeof(syn)) {
            perror("sendto SYN");
            continue;
        }

        printf("Sent SYN\n");  // print a human-readable log message to the console screen so we can see what is happening

        if (wait_for_response(sockfd, receiver_addr, &resp) != 0) {
            if (errno == EAGAIN || errno == EWOULDBLOCK) {
                printf("Timeout waiting for SYN-ACK\n");  // print a human-readable log message to the console screen so we can see what is happening
            } else {
                perror("recvfrom SYN-ACK");
            }
            continue;
        }

        if ((resp.flags & (FLAG_SYN | FLAG_ACK)) == (FLAG_SYN | FLAG_ACK) && resp.ack_num == 1) {
            Packet final_ack;
            memset(&final_ack, 0, sizeof(final_ack));  // completely clear the memory of the address structure to prevent any leftover garbage data
            final_ack.seq = 1;
            final_ack.ack_num = 1;
            final_ack.flags = FLAG_ACK;
            finalize_packet(&final_ack);

            if (sendto(sockfd, &final_ack, sizeof(final_ack), 0, (const struct sockaddr *)receiver_addr,  // dispatch and send the data packet over the network to the assigned receiver address
                       sizeof(*receiver_addr)) != (ssize_t)sizeof(final_ack)) {
                perror("sendto final ACK");
                continue;
            }

            printf("Received SYN-ACK, sent final ACK. Connection established.\n\n");  // print a human-readable log message to the console screen so we can see what is happening
            return 0;  // end the program execution successfully
        }

        printf("Unexpected handshake packet (flags=0x%02X ack=%u).\n", resp.flags, resp.ack_num);  // print a human-readable log message to the console screen so we can see what is happening
    }

    return -1;
}

static int prepare_packets(Packet packets[MAX_PACKETS], const char *message, int len) {
    int total_packets = (len + CHUNK_SIZE - 1) / CHUNK_SIZE;

    for (int i = 0; i < total_packets; i++) {
        int offset = i * CHUNK_SIZE;
        int remaining = len - offset;
        int chunk_len = (remaining > CHUNK_SIZE) ? CHUNK_SIZE : remaining;

        memset(&packets[i], 0, sizeof(Packet));  // completely clear the memory of the address structure to prevent any leftover garbage data
        packets[i].seq = (uint8_t)(1 + i);
        packets[i].flags = FLAG_DATA;
        packets[i].len = (uint8_t)chunk_len;
        memcpy(packets[i].data, message + offset, (size_t)chunk_len);
        finalize_packet(&packets[i]);
    }

    return total_packets;
}

static void on_new_ack(double *cwnd, double ssthresh) {
    if (*cwnd < ssthresh) {
        *cwnd += 1.0;
    } else {
        *cwnd += 1.0 / *cwnd;
    }
    *cwnd = clamp_double(*cwnd, 1.0, MAX_CWND);
}

static void on_congestion_event(double *cwnd, double *ssthresh) {
    *ssthresh = clamp_double(*cwnd / 2.0, 1.0, MAX_CWND);
    *cwnd = INIT_CWND;
}

static int retransmit_packet(int sockfd, const struct sockaddr_in *receiver_addr, Packet *pkt) {  // define a variable to hold our socket file descriptor, which acts as an ID for our network connection
    return sendto(sockfd, pkt, sizeof(*pkt), 0, (const struct sockaddr *)receiver_addr, sizeof(*receiver_addr)) ==  // dispatch and send the data packet over the network to the assigned receiver address
                   (ssize_t)sizeof(*pkt)
               ? 0
               : -1;
}

static int send_with_cc_sr_adaptive(int sockfd, const struct sockaddr_in *receiver_addr, const char *message, int len) {  // define a variable to hold our socket file descriptor, which acts as an ID for our network connection
    Packet packets[MAX_PACKETS];
    int total_packets = prepare_packets(packets, message, len);

    int acked[MAX_PACKETS] = {0};
    int retries[MAX_PACKETS] = {0};
    int sent[MAX_PACKETS] = {0};
    int sample_ok[MAX_PACKETS] = {0};
    long long sent_at_ms[MAX_PACKETS] = {0};

    int base = 0;
    int next_to_send = 0;

    double srtt_ms = 0.0;
    double rttvar_ms = 0.0;
    double rto_ms = INIT_RTO_MS;
    int rtt_initialized = 0;

    double cwnd = INIT_CWND;
    double ssthresh = INIT_SSTHRESH;
    int dup_ack_count[MAX_PACKETS + 2] = {0};
    int in_fast_recovery = 0;
    int recover_idx = -1;

    while (base < total_packets) {
        int flight_limit = (int)cwnd;
        if (flight_limit < 1) {
            flight_limit = 1;
        }
        if (flight_limit > WINDOW_SIZE) {
            flight_limit = WINDOW_SIZE;
        }

        while (next_to_send < total_packets && next_to_send < base + flight_limit) {
            if (sendto(sockfd, &packets[next_to_send], sizeof(Packet), 0, (const struct sockaddr *)receiver_addr,  // dispatch and send the data packet over the network to the assigned receiver address
                       sizeof(*receiver_addr)) != (ssize_t)sizeof(Packet)) {
                perror("sendto DATA");
                return -1;
            }

            sent[next_to_send] = 1;
            sample_ok[next_to_send] = 1;
            sent_at_ms[next_to_send] = now_ms();
            printf("Sent DATA pkt=%d seq=%u len=%u (cwnd=%.2f ssthresh=%.2f RTO=%.0fms)\n", next_to_send + 1,  // print a human-readable log message to the console screen so we can see what is happening
                   packets[next_to_send].seq, packets[next_to_send].len, cwnd, ssthresh, rto_ms);
            next_to_send++;
        }

        Packet ack_pkt;
        if (wait_for_response(sockfd, receiver_addr, &ack_pkt) != 0) {
            if (errno == EAGAIN || errno == EWOULDBLOCK) {
                int retransmitted = 0;
                long long now = now_ms();

                for (int i = base; i < next_to_send; i++) {
                    if (acked[i]) {
                        continue;
                    }

                    if (!sent[i] || (double)(now - sent_at_ms[i]) < rto_ms) {
                        continue;
                    }

                    if (retries[i] >= MAX_TIMEOUT_RETRIES) {
                        printf("Too many retries for seq=%u, transfer failed.\n", packets[i].seq);  // print a human-readable log message to the console screen so we can see what is happening
                        return -1;
                    }

                    if (sendto(sockfd, &packets[i], sizeof(Packet), 0, (const struct sockaddr *)receiver_addr,  // dispatch and send the data packet over the network to the assigned receiver address
                               sizeof(*receiver_addr)) != (ssize_t)sizeof(Packet)) {
                        perror("sendto retransmit");
                        return -1;
                    }

                    retries[i]++;
                    sample_ok[i] = 0;
                    sent_at_ms[i] = now;
                    retransmitted++;

                    on_congestion_event(&cwnd, &ssthresh);
                          in_fast_recovery = 0;
                          recover_idx = -1;
                    printf("Timeout loss: retransmit pkt=%d seq=%u (retry=%d). cwnd=%.2f ssthresh=%.2f\n", i + 1,  // print a human-readable log message to the console screen so we can see what is happening
                           packets[i].seq, retries[i], cwnd, ssthresh);
                }

                if (retransmitted == 0) {
                    printf("Timeout tick: no packet exceeded adaptive RTO yet (RTO=%.0fms).\n", rto_ms);  // print a human-readable log message to the console screen so we can see what is happening
                }
                continue;
            }

            perror("recvfrom ACK");
            return -1;
        }

        if (!(ack_pkt.flags & FLAG_ACK)) {
            continue;
        }

        if (ack_pkt.ack_num < 1 || ack_pkt.ack_num > (uint8_t)total_packets) {
            printf("Ignoring invalid ACK=%u\n", ack_pkt.ack_num);  // print a human-readable log message to the console screen so we can see what is happening
            continue;
        }

        int ack_idx = (int)ack_pkt.ack_num - 1;
        if (ack_idx >= next_to_send) {
            printf("Ignoring future ACK=%u (base=%d next=%d)\n", ack_pkt.ack_num, base + 1, next_to_send);  // print a human-readable log message to the console screen so we can see what is happening
            continue;
        }

        if (!acked[ack_idx]) {
            acked[ack_idx] = 1;
            dup_ack_count[ack_pkt.ack_num] = 0;
            printf("Received ACK for seq=%u\n", ack_pkt.ack_num);  // print a human-readable log message to the console screen so we can see what is happening

            if (sample_ok[ack_idx]) {
                double sample_ms = (double)(now_ms() - sent_at_ms[ack_idx]);
                if (sample_ms < 1.0) {
                    sample_ms = 1.0;
                }

                if (!rtt_initialized) {
                    srtt_ms = sample_ms;
                    rttvar_ms = sample_ms / 2.0;
                    rtt_initialized = 1;
                } else {
                    double err = fabs(srtt_ms - sample_ms);
                    rttvar_ms = 0.75 * rttvar_ms + 0.25 * err;
                    srtt_ms = 0.875 * srtt_ms + 0.125 * sample_ms;
                }

                rto_ms = clamp_double(srtt_ms + 4.0 * rttvar_ms, MIN_RTO_MS, MAX_RTO_MS);
                printf("RTT sample=%.0fms SRTT=%.1fms RTTVAR=%.1fms new RTO=%.0fms\n", sample_ms, srtt_ms,  // print a human-readable log message to the console screen so we can see what is happening
                       rttvar_ms, rto_ms);
            }

            if (in_fast_recovery && ack_idx >= recover_idx) {
                in_fast_recovery = 0;
                cwnd = clamp_double(ssthresh, 1.0, MAX_CWND);
                printf("Fast recovery exit on new ACK: cwnd=%.2f ssthresh=%.2f\n", cwnd, ssthresh);  // print a human-readable log message to the console screen so we can see what is happening
            } else {
                on_new_ack(&cwnd, ssthresh);
                printf("Congestion update after ACK: cwnd=%.2f ssthresh=%.2f\n", cwnd, ssthresh);  // print a human-readable log message to the console screen so we can see what is happening
            }
        } else {
            printf("Duplicate ACK for seq=%u\n", ack_pkt.ack_num);  // print a human-readable log message to the console screen so we can see what is happening

            dup_ack_count[ack_pkt.ack_num]++;
            if (dup_ack_count[ack_pkt.ack_num] == 3) {
                int target_idx = ack_idx + 1;

                if (target_idx < total_packets && target_idx < next_to_send && !acked[target_idx]) {
                    if (retries[target_idx] >= MAX_TIMEOUT_RETRIES) {
                        printf("Too many retries for seq=%u, transfer failed.\n", packets[target_idx].seq);  // print a human-readable log message to the console screen so we can see what is happening
                        return -1;
                    }

                    if (retransmit_packet(sockfd, receiver_addr, &packets[target_idx]) != 0) {
                        perror("sendto fast retransmit");
                        return -1;
                    }

                    retries[target_idx]++;
                    sample_ok[target_idx] = 0;
                    sent_at_ms[target_idx] = now_ms();

                    ssthresh = clamp_double(cwnd / 2.0, 1.0, MAX_CWND);
                    cwnd = clamp_double(ssthresh + 3.0, 1.0, MAX_CWND);
                    in_fast_recovery = 1;
                    recover_idx = next_to_send - 1;

                    printf("Fast retransmit seq=%u, enter fast recovery (cwnd=%.2f ssthresh=%.2f)\n",  // print a human-readable log message to the console screen so we can see what is happening
                           packets[target_idx].seq, cwnd, ssthresh);
                }
            } else if (in_fast_recovery) {
                cwnd = clamp_double(cwnd + 1.0, 1.0, MAX_CWND);
                printf("Fast recovery dup ACK inflation: cwnd=%.2f\n", cwnd);  // print a human-readable log message to the console screen so we can see what is happening
            }
        }

        int old_base = base;
        while (base < total_packets && acked[base]) {
            base++;
        }

        if (base != old_base) {
            printf("Window advanced packet-base %d -> %d\n", old_base + 1, base + 1);  // print a human-readable log message to the console screen so we can see what is happening
        }
    }

    return total_packets;
}

static int close_with_fin(int sockfd, const struct sockaddr_in *receiver_addr, uint8_t fin_seq) {  // define a variable to hold our socket file descriptor, which acts as an ID for our network connection
    Packet fin_pkt;
    Packet resp;

    memset(&fin_pkt, 0, sizeof(fin_pkt));  // completely clear the memory of the address structure to prevent any leftover garbage data
    fin_pkt.seq = fin_seq;
    fin_pkt.flags = FLAG_FIN;
    finalize_packet(&fin_pkt);

    for (int retry = 0; retry <= 5; retry++) {
        if (retry > 0) {
            printf("[RETRY %d] Resending FIN\n", retry);  // print a human-readable log message to the console screen so we can see what is happening
        }

        if (sendto(sockfd, &fin_pkt, sizeof(fin_pkt), 0, (const struct sockaddr *)receiver_addr,  // dispatch and send the data packet over the network to the assigned receiver address
                   sizeof(*receiver_addr)) != (ssize_t)sizeof(fin_pkt)) {
            perror("sendto FIN");
            continue;
        }

        printf("Sent FIN seq=%u\n", fin_seq);  // print a human-readable log message to the console screen so we can see what is happening

        if (wait_for_response(sockfd, receiver_addr, &resp) != 0) {
            if (errno == EAGAIN || errno == EWOULDBLOCK) {
                printf("Timeout waiting for FIN-ACK\n");  // print a human-readable log message to the console screen so we can see what is happening
            } else {
                perror("recvfrom FIN-ACK");
            }
            continue;
        }

        if ((resp.flags & FLAG_ACK) && resp.ack_num == (uint8_t)(fin_seq + 1)) {
            printf("Received FIN-ACK. Connection closed cleanly.\n");  // print a human-readable log message to the console screen so we can see what is happening
            return 0;  // end the program execution successfully
        }

        printf("Unexpected close packet (flags=0x%02X ack=%u)\n", resp.flags, resp.ack_num);  // print a human-readable log message to the console screen so we can see what is happening
    }

    return -1;
}

int main(void) {  // the main entry point of the program where execution begins
    int sockfd = socket(AF_INET, SOCK_DGRAM, 0); // Create socket: IPv4 + datagram-style + default protocol (UDP) // Create socket: IPv4 + datagram-style + default protocol (UDP)
    if (sockfd < 0) {  // check if the socket creation failed
        perror("socket");
        return 1;
    }

    struct timeval timeout;  // define a structure to properly hold a time duration, used here for setting a timeout period
    timeout.tv_sec = 0;
    timeout.tv_usec = 120000;
    if (setsockopt(sockfd, SOL_SOCKET, SO_RCVTIMEO, &timeout, sizeof(timeout)) < 0) {  // dynamically change the socket internal options, such as enabling a receive timeout so it doesn\'t block forever
        perror("setsockopt");
        close(sockfd);  // permanently close the socket connection to free up the computer\'s resources
        return 1;
    }

    struct sockaddr_in receiver_addr; // structure to hold receiver\'s address information // structure to hold receiver\'s address information
    memset(&receiver_addr, 0, sizeof(receiver_addr));  // completely clear the memory of the address structure to prevent any leftover garbage data
    receiver_addr.sin_family = AF_INET;  // specifically state that we are using IPv4 addresses
    receiver_addr.sin_port = htons(PORT);  // set the port number and convert it to big-endian network byte order using htons() so the network understands it
    receiver_addr.sin_addr.s_addr = inet_addr("127.0.0.1");  // convert the human-readable string IP address (like "127.0.0.1") into the raw numerical format needed by the network

    if (connect_handshake(sockfd, &receiver_addr) != 0) {
        printf("Failed to establish connection.\n");  // print a human-readable log message to the console screen so we can see what is happening
        close(sockfd);  // permanently close the socket connection to free up the computer\'s resources
        return 1;
    }

    char message[MAX_MSG_LEN + 1];
    printf("Enter message (max %d chars): ", MAX_MSG_LEN);  // print a human-readable log message to the console screen so we can see what is happening
    if (fgets(message, sizeof(message), stdin) == NULL) {
        fprintf(stderr, "Failed to read input\n");  // print a human-readable log message to the console screen so we can see what is happening
        close(sockfd);  // permanently close the socket connection to free up the computer\'s resources
        return 1;
    }

    message[strcspn(message, "\n")] = '\0';
    int len = (int)strlen(message);

    printf("Sending v14 SR+chunking+adaptive-RTO+cc+fast-retransmit (window=%d chunk=%d): \"%s\" (%d chars)\n\n", WINDOW_SIZE,  // print a human-readable log message to the console screen so we can see what is happening
           CHUNK_SIZE, message, len);

    int total_packets = send_with_cc_sr_adaptive(sockfd, &receiver_addr, message, len);
    if (total_packets < 0) {
        close(sockfd);  // permanently close the socket connection to free up the computer\'s resources
        return 1;
    }

    if (close_with_fin(sockfd, &receiver_addr, (uint8_t)(1 + total_packets)) != 0) {
        printf("Failed to close connection cleanly.\n");  // print a human-readable log message to the console screen so we can see what is happening
        close(sockfd);  // permanently close the socket connection to free up the computer\'s resources
        return 1;
    }

    close(sockfd);  // permanently close the socket connection to free up the computer\'s resources
    return 0;  // end the program execution successfully
}
