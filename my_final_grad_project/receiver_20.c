#include <arpa/inet.h> // network operations
#include <inttypes.h>
#include <stdint.h>
#include <stdio.h> // for i/o operations
#include <string.h> // for string handling
#include <unistd.h> // for system calls
#define PORT 9090 // this is where the receiver will listen the message
 // this is where the receiver will listen the message

#define MAX_MSG_LEN 1024
#define WINDOW_SIZE 8
#define CHUNK_SIZE 8
#define MIN_MSS 1
#define MAX_PACKETS ((MAX_MSG_LEN + MIN_MSS - 1) / MIN_MSS)

#define FLAG_SYN 0x01
#define FLAG_ACK 0x02
#define FLAG_FIN 0x04
#define FLAG_DATA 0x08

typedef struct {
    uint32_t seq;
    uint32_t ack_num;
    uint8_t flags;
    uint8_t len;
    uint8_t data[CHUNK_SIZE];
    uint8_t opt_mss;
    uint16_t rwnd;
    uint16_t checksum;
} Packet;

typedef enum {
    R_CLOSED = 0,
    R_LISTEN,
    R_SYN_RECEIVED,
    R_ESTABLISHED,
    R_CLOSE_WAIT
} ReceiverState;

static uint16_t compute_checksum(const Packet *pkt) {
    uint32_t sum = 0;
    sum += (pkt->seq & 0xFFFFU) + (pkt->seq >> 16);
    sum += (pkt->ack_num & 0xFFFFU) + (pkt->ack_num >> 16);
    sum += pkt->flags;
    sum += pkt->len;
    sum += pkt->opt_mss;
    sum += pkt->rwnd;

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

static int send_packet(int sockfd, const struct sockaddr_in *client_addr, socklen_t addr_len, Packet *pkt) {  // define a variable to hold our socket file descriptor, which acts as an ID for our network connection
    finalize_packet(pkt);
    return sendto(sockfd, pkt, sizeof(*pkt), 0, (const struct sockaddr *)client_addr, addr_len) == (ssize_t)sizeof(*pkt)  // dispatch and send the data packet over the network to the assigned receiver address
               ? 0
               : -1;
}

static int is_from_peer(const struct sockaddr_in *expected, const struct sockaddr_in *from) {  // define a structure to hold the IP address and port number for the network connection
    return expected->sin_port == from->sin_port && expected->sin_addr.s_addr == from->sin_addr.s_addr;
}

static uint16_t compute_advertised_rwnd(const int byte_buffered[MAX_MSG_LEN], uint32_t expected_byte, uint8_t mss) {
    int used = 0;
    int start = (int)expected_byte;
    int end = start + (WINDOW_SIZE * mss) - 1;
    if (start > MAX_MSG_LEN) {
        return 0;  // end the program execution successfully
    }
    if (end > MAX_MSG_LEN) {
        end = MAX_MSG_LEN;
    }

    for (int byte_no = start; byte_no <= end; byte_no++) {
        if (byte_buffered[byte_no - 1]) {
            used++;
        }
    }

    int capacity = end - start + 1;
    if (capacity <= 0 || used >= capacity) {
        return 0;  // end the program execution successfully
    }
    return (uint16_t)(capacity - used);
}

int main(void) {  // the main entry point of the program where execution begins
    int sockfd = socket(AF_INET, SOCK_DGRAM, 0); // Create socket: IPv4 + datagram-style + default protocol (UDP) // Create socket: IPv4 + datagram-style + default protocol (UDP)
    if (sockfd < 0) {  // check if the socket creation failed
        perror("socket");
        return 1;
    }

    struct sockaddr_in server_addr;  // define a structure to hold the IP address and port number for the network connection
    struct sockaddr_in client_addr;  // define a structure to hold the IP address and port number for the network connection
    struct sockaddr_in peer_addr;  // define a structure to hold the IP address and port number for the network connection
    socklen_t addr_len = sizeof(client_addr);  // define a variable to store the size of the address structure, needed by OS network functions
    socklen_t peer_len = sizeof(peer_addr);  // define a variable to store the size of the address structure, needed by OS network functions

    memset(&server_addr, 0, sizeof(server_addr));  // completely clear the memory of the address structure to prevent any leftover garbage data
    server_addr.sin_family = AF_INET; // this tells that the network protocol is IPv4 // this tells that the network protocol is IPv4
    server_addr.sin_port = htons(PORT); // htons() converts port number to network byte order // htons() converts port number to network byte order
    server_addr.sin_addr.s_addr = INADDR_ANY; // listen on all available network interfaces // listen on all available network interfaces

    if (bind(sockfd, (struct sockaddr *)&server_addr, sizeof(server_addr)) < 0) {  // bind our created socket to the specified port and IP address, actively making it ready to listen for incoming data
        perror("bind");
        close(sockfd);  // permanently close the socket connection to free up the computer\'s resources
        return 1;
    }

    printf("Receiver v19 listening on port %d...\n", PORT);  // print a human-readable log message to the console screen so we can see what is happening

    char received[MAX_MSG_LEN + 1];
    char stream_buf[MAX_MSG_LEN];
    int byte_buffered[MAX_MSG_LEN] = {0};

    memset(stream_buf, 0, sizeof(stream_buf));

    int count = 0;
    int checksum_errors = 0;
    uint32_t expected_byte = 1;
    uint8_t negotiated_mss = CHUNK_SIZE;

    ReceiverState state = R_LISTEN;

    while (state != R_ESTABLISHED) {
        Packet pkt;
        ssize_t r = recvfrom(sockfd, &pkt, sizeof(pkt), 0, (struct sockaddr *)&client_addr, &addr_len);  // wait and listen patiently to receive an incoming packet from the network
        if (r != (ssize_t)sizeof(pkt)) {
            continue;
        }

        if (!checksum_valid(&pkt)) {
            checksum_errors++;
            continue;
        }

        if (state == R_LISTEN && (pkt.flags & FLAG_SYN)) {
            peer_addr = client_addr;
            peer_len = addr_len;

            uint8_t peer_mss = pkt.opt_mss;
            if (peer_mss < MIN_MSS || peer_mss > CHUNK_SIZE) {
                peer_mss = CHUNK_SIZE;
            }
            negotiated_mss = peer_mss;

            Packet syn_ack;
            memset(&syn_ack, 0, sizeof(syn_ack));  // completely clear the memory of the address structure to prevent any leftover garbage data
            syn_ack.seq = 0;
            syn_ack.ack_num = pkt.seq + 1;
            syn_ack.flags = FLAG_SYN | FLAG_ACK;
            syn_ack.opt_mss = negotiated_mss;
            syn_ack.rwnd = WINDOW_SIZE * negotiated_mss;

            if (send_packet(sockfd, &peer_addr, peer_len, &syn_ack) != 0) {
                perror("sendto SYN-ACK");
                continue;
            }

            state = R_SYN_RECEIVED;
            printf("Received SYN (peer MSS=%u), negotiated MSS=%u, sent SYN-ACK\n", pkt.opt_mss, negotiated_mss);  // print a human-readable log message to the console screen so we can see what is happening
            continue;
        }

        if (state == R_SYN_RECEIVED && is_from_peer(&peer_addr, &client_addr) && (pkt.flags & FLAG_ACK) &&
            pkt.ack_num == 1U) {
            if (pkt.opt_mss != negotiated_mss) {
                printf("Ignoring final ACK with mismatched MSS (got=%u expected=%u)\n", pkt.opt_mss, negotiated_mss);  // print a human-readable log message to the console screen so we can see what is happening
                continue;
            }
            state = R_ESTABLISHED;
            printf("Received final ACK. Connection established.\n\n");  // print a human-readable log message to the console screen so we can see what is happening
            continue;
        }

        printf("Ignoring packet during handshake (state=%d flags=0x%02X ack=%" PRIu32 ")\n", (int)state, pkt.flags,  // print a human-readable log message to the console screen so we can see what is happening
               pkt.ack_num);
    }

    while (state == R_ESTABLISHED) {
        Packet pkt;
        ssize_t r = recvfrom(sockfd, &pkt, sizeof(pkt), 0, (struct sockaddr *)&client_addr, &addr_len);  // wait and listen patiently to receive an incoming packet from the network
        if (r != (ssize_t)sizeof(pkt)) {
            continue;
        }

        if (!is_from_peer(&peer_addr, &client_addr)) {
            continue;
        }

        if (!checksum_valid(&pkt)) {
            Packet dup_ack;
            memset(&dup_ack, 0, sizeof(dup_ack));  // completely clear the memory of the address structure to prevent any leftover garbage data
            dup_ack.flags = FLAG_ACK;
            dup_ack.ack_num = expected_byte;
            dup_ack.opt_mss = negotiated_mss;
            dup_ack.rwnd = compute_advertised_rwnd(byte_buffered, expected_byte, negotiated_mss);
            if (send_packet(sockfd, &peer_addr, peer_len, &dup_ack) != 0) {
                perror("sendto duplicate ACK after checksum error");
            }

            checksum_errors++;
            printf("Corrupted packet dropped (checksum mismatch), cumulative ACK=%u\n", dup_ack.ack_num);  // print a human-readable log message to the console screen so we can see what is happening
            continue;
        }

        if (pkt.flags & FLAG_FIN) {
            Packet fin_ack;
            memset(&fin_ack, 0, sizeof(fin_ack));  // completely clear the memory of the address structure to prevent any leftover garbage data
            fin_ack.seq = 0;
            fin_ack.ack_num = pkt.seq + 1;
            fin_ack.flags = FLAG_ACK;
            fin_ack.opt_mss = negotiated_mss;
            fin_ack.rwnd = compute_advertised_rwnd(byte_buffered, expected_byte, negotiated_mss);

            if (send_packet(sockfd, &peer_addr, peer_len, &fin_ack) != 0) {
                perror("sendto FIN-ACK");
            } else {
                printf("Received FIN seq=%" PRIu32 ", sent ACK ack_num=%" PRIu32 "\n", pkt.seq, fin_ack.ack_num);  // print a human-readable log message to the console screen so we can see what is happening
            }
            state = R_CLOSE_WAIT;
            break;
        }

        if (pkt.flags & FLAG_SYN) {
            printf("Ignoring unexpected SYN in ESTABLISHED state\n");  // print a human-readable log message to the console screen so we can see what is happening
            continue;
        }

        if ((pkt.flags & FLAG_DATA) && pkt.len <= negotiated_mss && pkt.len <= CHUNK_SIZE) {
            Packet ack;
            memset(&ack, 0, sizeof(ack));  // completely clear the memory of the address structure to prevent any leftover garbage data
            ack.flags = FLAG_ACK;
            ack.opt_mss = negotiated_mss;

            int seg_start = (int)pkt.seq;
            int seg_end = seg_start + (int)pkt.len - 1;
            int window_end = (int)expected_byte + (WINDOW_SIZE * negotiated_mss) - 1;
            if (window_end > MAX_MSG_LEN) {
                window_end = MAX_MSG_LEN;
            }

            if (seg_start < 1 || seg_start > MAX_MSG_LEN || seg_end > MAX_MSG_LEN) {
                ack.ack_num = expected_byte;
                ack.rwnd = compute_advertised_rwnd(byte_buffered, expected_byte, negotiated_mss);
                if (send_packet(sockfd, &peer_addr, peer_len, &ack) != 0) {
                    perror("sendto invalid-range ACK");
                }
                printf("Invalid DATA range seq=%" PRIu32 " len=%u, ACK=%" PRIu32 " rwnd=%u\n", pkt.seq, pkt.len, ack.ack_num,  // print a human-readable log message to the console screen so we can see what is happening
                       ack.rwnd);
                continue;
            }

            if (seg_start <= window_end && seg_end >= (int)expected_byte) {
                for (int i = 0; i < pkt.len; i++) {
                    int byte_no = seg_start + i;
                    if (byte_no < (int)expected_byte || byte_no > window_end || byte_no > MAX_MSG_LEN) {
                        continue;
                    }

                    if (!byte_buffered[byte_no - 1]) {
                        byte_buffered[byte_no - 1] = 1;
                        stream_buf[byte_no - 1] = (char)pkt.data[i];
                    }
                }
                printf("Buffered DATA bytes=%d-%d\n", seg_start, seg_end);  // print a human-readable log message to the console screen so we can see what is happening

                while (expected_byte <= (uint32_t)MAX_MSG_LEN && byte_buffered[expected_byte - 1]) {
                    expected_byte++;
                }

                ack.ack_num = expected_byte;
                ack.rwnd = compute_advertised_rwnd(byte_buffered, expected_byte, negotiated_mss);
                if (send_packet(sockfd, &peer_addr, peer_len, &ack) != 0) {
                    perror("sendto cumulative ACK");
                } else {
                    printf("Sent cumulative ACK=%" PRIu32 " rwnd=%u\n", ack.ack_num, ack.rwnd);  // print a human-readable log message to the console screen so we can see what is happening
                }
                continue;
            }

            if (seg_end < (int)expected_byte) {
                ack.ack_num = expected_byte;
                ack.rwnd = compute_advertised_rwnd(byte_buffered, expected_byte, negotiated_mss);
                if (send_packet(sockfd, &peer_addr, peer_len, &ack) != 0) {
                    perror("sendto duplicate ACK");
                }
                printf("Old DATA bytes=%d-%d already delivered, cumulative ACK=%" PRIu32 " rwnd=%u resent\n", seg_start,  // print a human-readable log message to the console screen so we can see what is happening
                       seg_end, ack.ack_num, ack.rwnd);
                continue;
            }

            ack.ack_num = expected_byte;
            ack.rwnd = compute_advertised_rwnd(byte_buffered, expected_byte, negotiated_mss);
            if (send_packet(sockfd, &peer_addr, peer_len, &ack) != 0) {
                perror("sendto out-of-window ACK");
            }
            printf("Out-of-window DATA bytes=%d-%d (expected start=%" PRIu32 "), ACK=%" PRIu32 " rwnd=%u\n", seg_start, seg_end,  // print a human-readable log message to the console screen so we can see what is happening
                   expected_byte, ack.ack_num, ack.rwnd);
        }
    }

    count = (int)expected_byte - 1;
    if (count < 0) {
        count = 0;
    }
    if (count > MAX_MSG_LEN) {
        count = MAX_MSG_LEN;
    }
    if (count > 0) {
        memcpy(received, stream_buf, (size_t)count);
    }

    received[count] = '\0';

    if (state == R_CLOSE_WAIT) {
        state = R_CLOSED;
        printf("Receiver state transitioned CLOSE_WAIT -> CLOSED\n");  // print a human-readable log message to the console screen so we can see what is happening
    }

    printf("Negotiated MSS: %u bytes\n", negotiated_mss);  // print a human-readable log message to the console screen so we can see what is happening

    printf("\n========================================\n");  // print a human-readable log message to the console screen so we can see what is happening
    printf("Complete message: \"%s\"\n", received);  // print a human-readable log message to the console screen so we can see what is happening
    printf("Total characters: %d\n", count);  // print a human-readable log message to the console screen so we can see what is happening
    printf("Checksum errors detected: %d\n", checksum_errors);  // print a human-readable log message to the console screen so we can see what is happening
    printf("========================================\n");  // print a human-readable log message to the console screen so we can see what is happening

    close(sockfd);  // permanently close the socket connection to free up the computer\'s resources
    return 0;  // end the program execution successfully
}
