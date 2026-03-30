#include <arpa/inet.h>
#include <stdint.h>
#include <stdio.h>
#include <string.h>
#include <unistd.h>

#define PORT 9090
#define MAX_MSG_LEN 99

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

static int send_packet(int sockfd, const struct sockaddr_in *client_addr, socklen_t addr_len, Packet *pkt) {
    finalize_packet(pkt);
    return sendto(sockfd, pkt, sizeof(*pkt), 0, (const struct sockaddr *)client_addr, addr_len) == (ssize_t)sizeof(*pkt)
               ? 0
               : -1;
}

int main(void) {
    int sockfd = socket(AF_INET, SOCK_DGRAM, 0);
    if (sockfd < 0) {
        perror("socket");
        return 1;
    }

    struct sockaddr_in server_addr;
    struct sockaddr_in client_addr;
    socklen_t addr_len = sizeof(client_addr);

    memset(&server_addr, 0, sizeof(server_addr));
    server_addr.sin_family = AF_INET;
    server_addr.sin_port = htons(PORT);
    server_addr.sin_addr.s_addr = INADDR_ANY;

    if (bind(sockfd, (struct sockaddr *)&server_addr, sizeof(server_addr)) < 0) {
        perror("bind");
        close(sockfd);
        return 1;
    }

    printf("Receiver v9 listening on port %d...\n", PORT);

    char received[MAX_MSG_LEN + 1];
    int count = 0;
    int checksum_errors = 0;
    uint8_t expected_seq = 1;

    int established = 0;
    while (!established) {
        Packet pkt;
        ssize_t r = recvfrom(sockfd, &pkt, sizeof(pkt), 0, (struct sockaddr *)&client_addr, &addr_len);
        if (r != (ssize_t)sizeof(pkt)) {
            continue;
        }

        if (!checksum_valid(&pkt)) {
            checksum_errors++;
            continue;
        }

        if (pkt.flags & FLAG_SYN) {
            Packet syn_ack;
            memset(&syn_ack, 0, sizeof(syn_ack));
            syn_ack.seq = 0;
            syn_ack.ack_num = (uint8_t)(pkt.seq + 1);
            syn_ack.flags = FLAG_SYN | FLAG_ACK;

            if (send_packet(sockfd, &client_addr, addr_len, &syn_ack) != 0) {
                perror("sendto SYN-ACK");
                continue;
            }

            printf("Received SYN, sent SYN-ACK\n");

            Packet final_ack;
            r = recvfrom(sockfd, &final_ack, sizeof(final_ack), 0, (struct sockaddr *)&client_addr, &addr_len);
            if (r != (ssize_t)sizeof(final_ack)) {
                continue;
            }

            if (!checksum_valid(&final_ack)) {
                checksum_errors++;
                continue;
            }

            if ((final_ack.flags & FLAG_ACK) && final_ack.ack_num == 1) {
                established = 1;
                printf("Received final ACK. Connection established.\n\n");
            }
        }
    }

    while (1) {
        Packet pkt;
        ssize_t r = recvfrom(sockfd, &pkt, sizeof(pkt), 0, (struct sockaddr *)&client_addr, &addr_len);
        if (r != (ssize_t)sizeof(pkt)) {
            continue;
        }

        if (!checksum_valid(&pkt)) {
            checksum_errors++;
            printf("Corrupted packet dropped (checksum mismatch).\n");
            continue;
        }

        if (pkt.flags & FLAG_FIN) {
            Packet fin_ack;
            memset(&fin_ack, 0, sizeof(fin_ack));
            fin_ack.seq = 0;
            fin_ack.ack_num = (uint8_t)(pkt.seq + 1);
            fin_ack.flags = FLAG_ACK;

            if (send_packet(sockfd, &client_addr, addr_len, &fin_ack) != 0) {
                perror("sendto FIN-ACK");
            } else {
                printf("Received FIN seq=%u, sent ACK ack_num=%u\n", pkt.seq, fin_ack.ack_num);
            }
            break;
        }

        if ((pkt.flags & FLAG_DATA) && pkt.len == 1) {
            Packet ack;
            memset(&ack, 0, sizeof(ack));
            ack.seq = 0;
            ack.flags = FLAG_ACK;

            if (pkt.seq == expected_seq) {
                if (count < MAX_MSG_LEN) {
                    received[count++] = (char)pkt.data;
                }
                expected_seq++;
                ack.ack_num = expected_seq;
                printf("Accepted DATA seq=%u, cumulative ACK=%u\n", pkt.seq, ack.ack_num);
            } else {
                ack.ack_num = expected_seq;
                printf("Out-of-order DATA seq=%u (expected %u), duplicate ACK=%u\n", pkt.seq, expected_seq,
                       ack.ack_num);
            }

            if (send_packet(sockfd, &client_addr, addr_len, &ack) != 0) {
                perror("sendto ACK");
            }
        }
    }

    received[count] = '\0';

    printf("\n========================================\n");
    printf("Complete message: \"%s\"\n", received);
    printf("Total characters: %d\n", count);
    printf("Checksum errors detected: %d\n", checksum_errors);
    printf("========================================\n");

    close(sockfd);
    return 0;
}
