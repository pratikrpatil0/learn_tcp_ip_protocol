#include <sys/time.h>  // include time structures like timeval for setting timeouts


#define DELAYED_ACK_TIMEOUT_MS 120
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
#define MAX_WSCALE 0
static uint32_t now_ts32(void) {
    struct timeval tv;  // define a structure to properly hold a time duration, used here for setting a timeout period
    gettimeofday(&tv, NULL);
    return (uint32_t)(tv.tv_sec * 1000 + tv.tv_usec / 1000);
}
int ts_supported = 0;
uint32_t peer_ts_recent = 0;
#define MAX_PACKETS ((MAX_MSG_LEN + MIN_MSS - 1) / MIN_MSS)

#define FLAG_SYN 0x01
#define FLAG_ACK 0x02
#define FLAG_FIN 0x04
#define FLAG_DATA 0x08
#define FLAG_SACK 0x10
#define MAX_SACK_BLOCKS 4

typedef struct {
    uint32_t seq;
    uint32_t ack_num;
    uint8_t flags;
    uint8_t len;
    uint8_t data[CHUNK_SIZE];
    uint8_t opt_mss;
    uint8_t opt_wscale;
    uint16_t rwnd;
    uint32_t ts_val;
    uint32_t ts_ecr;
    uint8_t sack_count;
    struct {
        uint32_t left_edge;
        uint32_t right_edge;
    } sack_blocks[MAX_SACK_BLOCKS];
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
    sum += pkt->opt_wscale;
    sum += pkt->rwnd;

    sum += (pkt->ts_val & 0xFFFFU) + (pkt->ts_val >> 16);
    sum += (pkt->ts_ecr & 0xFFFFU) + (pkt->ts_ecr >> 16);
    sum += pkt->sack_count;
    for (int i = 0; i < pkt->sack_count; i++) {
        sum += (pkt->sack_blocks[i].left_edge & 0xFFFFU) + (pkt->sack_blocks[i].left_edge >> 16);
        sum += (pkt->sack_blocks[i].right_edge & 0xFFFFU) + (pkt->sack_blocks[i].right_edge >> 16);
    }


    for (int i = 0; i < CHUNK_SIZE; i++) {
        sum += pkt->data[i];
    }

    while (sum >> 16) {
        sum = (sum & 0xFFFFU) + (sum >> 16);
    }
    return (uint16_t)(~sum);
}


static void build_sack_blocks(Packet *ack_pkt, const int byte_buffered[MAX_MSG_LEN], uint32_t expected_byte) {
    ack_pkt->sack_count = 0;
    uint32_t left = 0;
    int in_block = 0;
    for (uint32_t i = expected_byte; i <= MAX_MSG_LEN; i++) {
        if (byte_buffered[i - 1]) {
            if (!in_block) {
                left = i;
                in_block = 1;
            }
        } else {
            if (in_block) {
                ack_pkt->sack_blocks[ack_pkt->sack_count].left_edge = left;
                ack_pkt->sack_blocks[ack_pkt->sack_count].right_edge = i;
                ack_pkt->sack_count++;
                if (ack_pkt->sack_count >= MAX_SACK_BLOCKS) break;
                in_block = 0;
            }
        }
    }
    if (in_block && ack_pkt->sack_count < MAX_SACK_BLOCKS) {
        ack_pkt->sack_blocks[ack_pkt->sack_count].left_edge = left;
        ack_pkt->sack_blocks[ack_pkt->sack_count].right_edge = MAX_MSG_LEN + 1;
        ack_pkt->sack_count++;
    }
    if (ack_pkt->sack_count > 0) {
        ack_pkt->flags |= FLAG_SACK;
    }
}

static void finalize_packet(Packet *pkt) {
    pkt->ts_val = now_ts32();
    pkt->ts_ecr = ts_supported ? peer_ts_recent : 0;
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

static uint16_t compute_advertised_rwnd(const int byte_buffered[MAX_MSG_LEN], uint32_t expected_byte, uint8_t mss, uint8_t wscale) {
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
    return (uint16_t)((capacity - used) >> wscale);
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
    uint8_t negotiated_wscale = 0;

    ReceiverState state = R_LISTEN;

    // Delayed ACK state
    int delayed_ack_pending = 0;
    uint32_t delayed_ack_num = 0;
    uint16_t delayed_ack_rwnd = 0;
    struct timeval delayed_ack_start = {0};  // define a structure to properly hold a time duration, used here for setting a timeout period

    fd_set readfds;
    struct timeval timeout;  // define a structure to properly hold a time duration, used here for setting a timeout period


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

            uint8_t peer_wscale = pkt.opt_wscale;
            if (pkt.ts_val != 0) { ts_supported = 1; peer_ts_recent = pkt.ts_val; }
            negotiated_wscale = (peer_wscale < MAX_WSCALE) ? peer_wscale : MAX_WSCALE;

            Packet syn_ack;
            memset(&syn_ack, 0, sizeof(syn_ack));  // completely clear the memory of the address structure to prevent any leftover garbage data
            syn_ack.seq = 0;
            syn_ack.ack_num = pkt.seq + 1;
            syn_ack.flags = FLAG_SYN | FLAG_ACK;
            syn_ack.opt_mss = negotiated_mss;
            syn_ack.opt_wscale = negotiated_wscale;
            syn_ack.rwnd = (WINDOW_SIZE * negotiated_mss) >> negotiated_wscale;

            if (send_packet(sockfd, &peer_addr, peer_len, &syn_ack) != 0) {
                perror("sendto SYN-ACK");
                continue;
            }

            state = R_SYN_RECEIVED;
            printf("Received SYN (peer MSS=%u, peer WSCALE=%u), negotiated MSS=%u, negotiated WSCALE=%u, sent SYN-ACK\n", pkt.opt_mss, pkt.opt_wscale, negotiated_mss, negotiated_wscale);  // print a human-readable log message to the console screen so we can see what is happening
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
        FD_ZERO(&readfds);  // fully clear out the set of file descriptors before assigning ours for select()
        FD_SET(sockfd, &readfds);  // register and add our socket to the set of descriptors we want the system to monitor with select()
        timeout.tv_sec = 0;
        timeout.tv_usec = DELAYED_ACK_TIMEOUT_MS * 1000;

        int ready = select(sockfd + 1, &readfds, NULL, NULL, delayed_ack_pending ? &timeout : NULL);  // efficiently monitor the socket and wait for activity (e.g., waiting for an acknowledgment) up to the specified timeout limit
        if (ready < 0) {
            perror("select");
            break;
        }

        if (ready == 0 && delayed_ack_pending) {
            // Timer expired, send delayed ACK
            Packet ack;
            memset(&ack, 0, sizeof(ack));  // completely clear the memory of the address structure to prevent any leftover garbage data
            ack.flags = FLAG_ACK;
            ack.ack_num = delayed_ack_num;
            ack.opt_mss = negotiated_mss;
            ack.rwnd = delayed_ack_rwnd;
            build_sack_blocks(&ack, byte_buffered, expected_byte);
            if (send_packet(sockfd, &peer_addr, peer_len, &ack) != 0) {
                perror("sendto delayed ACK");
            } else {
                printf("[DELAYED] Sent delayed ACK=%" PRIu32 " rwnd=%u\n", ack.ack_num, ack.rwnd);  // print a human-readable log message to the console screen so we can see what is happening
            }
            delayed_ack_pending = 0;
            continue;
        }

        Packet pkt;
        ssize_t r = recvfrom(sockfd, &pkt, sizeof(pkt), 0, (struct sockaddr *)&client_addr, &addr_len);  // wait and listen patiently to receive an incoming packet from the network
        if (r < 0 || r != (ssize_t)sizeof(pkt)) {
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
            dup_ack.rwnd = compute_advertised_rwnd(byte_buffered, expected_byte, negotiated_mss, negotiated_wscale);
            build_sack_blocks(&dup_ack, byte_buffered, expected_byte);
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
            fin_ack.rwnd = compute_advertised_rwnd(byte_buffered, expected_byte, negotiated_mss, negotiated_wscale);

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
            int seg_start = (int)pkt.seq;
            int seg_end = seg_start + (int)pkt.len - 1;
            int window_end = (int)expected_byte + (WINDOW_SIZE * negotiated_mss) - 1;
            if (window_end > MAX_MSG_LEN) {
                window_end = MAX_MSG_LEN;
            }

            int in_order = (seg_start == (int)expected_byte);
            int out_of_order = (seg_start < (int)expected_byte || seg_start > window_end);

            if (seg_start < 1 || seg_start > MAX_MSG_LEN || seg_end > MAX_MSG_LEN) {
                // Invalid range, ACK immediately
                Packet ack;
                memset(&ack, 0, sizeof(ack));  // completely clear the memory of the address structure to prevent any leftover garbage data
                ack.flags = FLAG_ACK;
                ack.ack_num = expected_byte;
                ack.opt_mss = negotiated_mss;
                ack.rwnd = compute_advertised_rwnd(byte_buffered, expected_byte, negotiated_mss, negotiated_wscale);
                build_sack_blocks(&ack, byte_buffered, expected_byte);
                send_packet(sockfd, &peer_addr, peer_len, &ack);
                continue;
            }

            // Buffer data
            int new_data = 0;
            for (int i = 0; i < pkt.len; i++) {
                int byte_no = seg_start + i;
                if (!byte_buffered[byte_no - 1]) {
                    stream_buf[byte_no - 1] = pkt.data[i];
                    byte_buffered[byte_no - 1] = 1;
                    count++;
                    new_data = 1;
                }
            }

            while (expected_byte <= MAX_MSG_LEN && byte_buffered[expected_byte - 1]) {
                expected_byte++;
            }

            if (in_order) {
                if (!delayed_ack_pending) {
                    delayed_ack_pending = 1;
                    delayed_ack_num = expected_byte;
                    delayed_ack_rwnd = compute_advertised_rwnd(byte_buffered, expected_byte, negotiated_mss, negotiated_wscale);
                    gettimeofday(&delayed_ack_start, NULL);
                    printf("Received in-order packet seq=%u len=%u. Delaying ACK (%" PRIu32 ").\n", pkt.seq, pkt.len, expected_byte);  // print a human-readable log message to the console screen so we can see what is happening
                } else {
                    // Second in-order segment: send immediate coalesced ACK
                    Packet ack;
                    memset(&ack, 0, sizeof(ack));  // completely clear the memory of the address structure to prevent any leftover garbage data
                    ack.flags = FLAG_ACK;
                    ack.ack_num = expected_byte;
                    ack.opt_mss = negotiated_mss;
                    ack.rwnd = compute_advertised_rwnd(byte_buffered, expected_byte, negotiated_mss, negotiated_wscale);
                    build_sack_blocks(&ack, byte_buffered, expected_byte);
                if (send_packet(sockfd, &peer_addr, peer_len, &ack) == 0) {
                        printf("[COALESCED] Sent ACK=%" PRIu32 " rwnd=%u\n", ack.ack_num, ack.rwnd);  // print a human-readable log message to the console screen so we can see what is happening
                    }
                    delayed_ack_pending = 0;
                }
            } else if (out_of_order) {
                // Out of order: send duplicate ACK immediately
                Packet ack;
                memset(&ack, 0, sizeof(ack));  // completely clear the memory of the address structure to prevent any leftover garbage data
                ack.flags = FLAG_ACK;
                ack.ack_num = expected_byte;
                ack.opt_mss = negotiated_mss;
                ack.rwnd = compute_advertised_rwnd(byte_buffered, expected_byte, negotiated_mss, negotiated_wscale);
                build_sack_blocks(&ack, byte_buffered, expected_byte);
                if (send_packet(sockfd, &peer_addr, peer_len, &ack) == 0) {
                    printf("Received out-of-order packet seq=%u len=%u. Sent duplicate ACK=%" PRIu32 "\n", pkt.seq, pkt.len, ack.ack_num);  // print a human-readable log message to the console screen so we can see what is happening
                }
                delayed_ack_pending = 0;
            }
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
