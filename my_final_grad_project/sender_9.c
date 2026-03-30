#include <arpa/inet.h>
#include <errno.h>
#include <stdint.h>
#include <stdio.h>
#include <string.h>
#include <sys/time.h>
#include <unistd.h>

#define PORT 9090
#define MAX_MSG_LEN 99
#define WINDOW_SIZE 4
#define MAX_TIMEOUT_RETRIES 15

#define FLAG_SYN 0x01
#define FLAG_ACK 0x02
#define FLAG_FIN 0x04
#define FLAG_DATA 0x08

typedef struct {
    uint8_t seq;
    uint8_t ack_num;
    uint8_t flags;
    uint8_t len;
    uint8_t data;
    uint16_t checksum;
} Packet;

static uint16_t compute_checksum(const Packet *pkt) {
    uint32_t sum = 0;
    sum += pkt->seq;
    sum += pkt->ack_num;
    sum += pkt->flags;
    sum += pkt->len;
    sum += pkt->data;
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

static int is_from_peer(const struct sockaddr_in *expected, const struct sockaddr_in *from) {
    return expected->sin_port == from->sin_port && expected->sin_addr.s_addr == from->sin_addr.s_addr;
}

static int wait_for_response(int sockfd, const struct sockaddr_in *receiver_addr, Packet *resp) {
    struct sockaddr_in from_addr;
    socklen_t from_len = sizeof(from_addr);

    while (1) {
        ssize_t r = recvfrom(sockfd, resp, sizeof(*resp), 0, (struct sockaddr *)&from_addr, &from_len);
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
        return 0;
    }
}

static int connect_handshake(int sockfd, const struct sockaddr_in *receiver_addr) {
    Packet syn;
    Packet resp;

    memset(&syn, 0, sizeof(syn));
    syn.seq = 0;
    syn.flags = FLAG_SYN;
    finalize_packet(&syn);

    for (int retry = 0; retry <= 5; retry++) {
        if (retry > 0) {
            printf("[RETRY %d] Resending SYN\n", retry);
        }

        if (sendto(sockfd, &syn, sizeof(syn), 0, (const struct sockaddr *)receiver_addr, sizeof(*receiver_addr)) !=
            (ssize_t)sizeof(syn)) {
            perror("sendto SYN");
            continue;
        }

        printf("Sent SYN\n");

        if (wait_for_response(sockfd, receiver_addr, &resp) != 0) {
            if (errno == EAGAIN || errno == EWOULDBLOCK) {
                printf("Timeout waiting for SYN-ACK\n");
            } else {
                perror("recvfrom SYN-ACK");
            }
            continue;
        }

        if ((resp.flags & (FLAG_SYN | FLAG_ACK)) == (FLAG_SYN | FLAG_ACK) && resp.ack_num == 1) {
            Packet final_ack;
            memset(&final_ack, 0, sizeof(final_ack));
            final_ack.seq = 1;
            final_ack.ack_num = 1;
            final_ack.flags = FLAG_ACK;
            finalize_packet(&final_ack);

            if (sendto(sockfd, &final_ack, sizeof(final_ack), 0, (const struct sockaddr *)receiver_addr,
                       sizeof(*receiver_addr)) != (ssize_t)sizeof(final_ack)) {
                perror("sendto final ACK");
                continue;
            }

            printf("Received SYN-ACK, sent final ACK. Connection established.\n\n");
            return 0;
        }

        printf("Unexpected handshake packet (flags=0x%02X ack=%u).\n", resp.flags, resp.ack_num);
    }

    return -1;
}

static int send_with_go_back_n(int sockfd, const struct sockaddr_in *receiver_addr, const char *message, int len) {
    Packet packets[MAX_MSG_LEN];
    int base = 0;
    int next_to_send = 0;
    int timeout_retries = 0;

    for (int i = 0; i < len; i++) {
        memset(&packets[i], 0, sizeof(Packet));
        packets[i].seq = (uint8_t)(1 + i);
        packets[i].flags = FLAG_DATA;
        packets[i].len = 1;
        packets[i].data = (uint8_t)message[i];
        finalize_packet(&packets[i]);
    }

    while (base < len) {
        while (next_to_send < len && next_to_send < base + WINDOW_SIZE) {
            if (sendto(sockfd, &packets[next_to_send], sizeof(Packet), 0, (const struct sockaddr *)receiver_addr,
                       sizeof(*receiver_addr)) != (ssize_t)sizeof(Packet)) {
                perror("sendto DATA");
                return -1;
            }

            printf("Sent DATA idx=%d seq=%u char='%c'\n", next_to_send + 1, packets[next_to_send].seq,
                   (packets[next_to_send].data >= 32 && packets[next_to_send].data <= 126) ? packets[next_to_send].data
                                                                                           : '.');
            next_to_send++;
        }

        Packet ack_pkt;
        if (wait_for_response(sockfd, receiver_addr, &ack_pkt) != 0) {
            if (errno == EAGAIN || errno == EWOULDBLOCK) {
                timeout_retries++;
                printf("Timeout: retransmitting window [%d..%d]\n", base + 1, next_to_send);

                if (timeout_retries > MAX_TIMEOUT_RETRIES) {
                    printf("Too many timeouts, transfer failed.\n");
                    return -1;
                }

                for (int i = base; i < next_to_send; i++) {
                    if (sendto(sockfd, &packets[i], sizeof(Packet), 0, (const struct sockaddr *)receiver_addr,
                               sizeof(*receiver_addr)) != (ssize_t)sizeof(Packet)) {
                        perror("sendto retransmit");
                        return -1;
                    }
                    printf("Resent DATA idx=%d seq=%u\n", i + 1, packets[i].seq);
                }
                continue;
            }

            perror("recvfrom ACK");
            return -1;
        }

        if (!(ack_pkt.flags & FLAG_ACK)) {
            continue;
        }

        int old_base = base;
        int current_base_ack = base + 1;
        int max_sent_ack = next_to_send + 1;

        if (ack_pkt.ack_num > current_base_ack && ack_pkt.ack_num <= max_sent_ack) {
            base = ack_pkt.ack_num - 1;
            timeout_retries = 0;
            printf("Received cumulative ACK=%u (window advanced %d -> %d)\n", ack_pkt.ack_num, old_base + 1,
                   base + 1);
        } else {
            printf("Received stale/out-of-range ACK=%u (base=%d next=%d)\n", ack_pkt.ack_num, base + 1,
                   next_to_send + 1);
        }
    }

    return 0;
}

static int close_with_fin(int sockfd, const struct sockaddr_in *receiver_addr, uint8_t fin_seq) {
    Packet fin_pkt;
    Packet resp;

    memset(&fin_pkt, 0, sizeof(fin_pkt));
    fin_pkt.seq = fin_seq;
    fin_pkt.flags = FLAG_FIN;
    finalize_packet(&fin_pkt);

    for (int retry = 0; retry <= 5; retry++) {
        if (retry > 0) {
            printf("[RETRY %d] Resending FIN\n", retry);
        }

        if (sendto(sockfd, &fin_pkt, sizeof(fin_pkt), 0, (const struct sockaddr *)receiver_addr,
                   sizeof(*receiver_addr)) != (ssize_t)sizeof(fin_pkt)) {
            perror("sendto FIN");
            continue;
        }

        printf("Sent FIN seq=%u\n", fin_seq);

        if (wait_for_response(sockfd, receiver_addr, &resp) != 0) {
            if (errno == EAGAIN || errno == EWOULDBLOCK) {
                printf("Timeout waiting for FIN-ACK\n");
            } else {
                perror("recvfrom FIN-ACK");
            }
            continue;
        }

        if ((resp.flags & FLAG_ACK) && resp.ack_num == (uint8_t)(fin_seq + 1)) {
            printf("Received FIN-ACK. Connection closed cleanly.\n");
            return 0;
        }

        printf("Unexpected close packet (flags=0x%02X ack=%u)\n", resp.flags, resp.ack_num);
    }

    return -1;
}

int main(void) {
    int sockfd = socket(AF_INET, SOCK_DGRAM, 0);
    if (sockfd < 0) {
        perror("socket");
        return 1;
    }

    struct timeval timeout;
    timeout.tv_sec = 0;
    timeout.tv_usec = 400000;
    if (setsockopt(sockfd, SOL_SOCKET, SO_RCVTIMEO, &timeout, sizeof(timeout)) < 0) {
        perror("setsockopt");
        close(sockfd);
        return 1;
    }

    struct sockaddr_in receiver_addr;
    memset(&receiver_addr, 0, sizeof(receiver_addr));
    receiver_addr.sin_family = AF_INET;
    receiver_addr.sin_port = htons(PORT);
    receiver_addr.sin_addr.s_addr = inet_addr("127.0.0.1");

    if (connect_handshake(sockfd, &receiver_addr) != 0) {
        printf("Failed to establish connection.\n");
        close(sockfd);
        return 1;
    }

    char message[MAX_MSG_LEN + 1];
    printf("Enter message (max %d chars): ", MAX_MSG_LEN);
    if (fgets(message, sizeof(message), stdin) == NULL) {
        fprintf(stderr, "Failed to read input\n");
        close(sockfd);
        return 1;
    }

    message[strcspn(message, "\n")] = '\0';
    int len = (int)strlen(message);

    printf("Sending with Go-Back-N (window=%d): \"%s\" (%d chars)\n\n", WINDOW_SIZE, message, len);

    if (send_with_go_back_n(sockfd, &receiver_addr, message, len) != 0) {
        close(sockfd);
        return 1;
    }

    if (close_with_fin(sockfd, &receiver_addr, (uint8_t)(1 + len)) != 0) {
        printf("Failed to close connection cleanly.\n");
        close(sockfd);
        return 1;
    }

    close(sockfd);
    return 0;
}
