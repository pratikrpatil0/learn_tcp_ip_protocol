#include <arpa/inet.h> // network operations
#include <stdint.h>
#include <stdio.h> // for i/o operations
#include <string.h> // for string handling
#include <unistd.h> // for system calls
#define PORT 9090 // this is where the receiver will listen the message
 // this is where the receiver will listen the message

#define MAX_MSG_LEN 99
#define WINDOW_SIZE 8
#define CHUNK_SIZE 8
#define MAX_PACKETS ((MAX_MSG_LEN + CHUNK_SIZE - 1) / CHUNK_SIZE)

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

static int send_packet(int sockfd, const struct sockaddr_in *client_addr, socklen_t addr_len, Packet *pkt) {  // define a variable to hold our socket file descriptor, which acts as an ID for our network connection
    finalize_packet(pkt);
    return sendto(sockfd, pkt, sizeof(*pkt), 0, (const struct sockaddr *)client_addr, addr_len) == (ssize_t)sizeof(*pkt)  // dispatch and send the data packet over the network to the assigned receiver address
               ? 0
               : -1;
}

static int is_from_peer(const struct sockaddr_in *expected, const struct sockaddr_in *from) {  // define a structure to hold the IP address and port number for the network connection
    return expected->sin_port == from->sin_port && expected->sin_addr.s_addr == from->sin_addr.s_addr;
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

    printf("Receiver v14 listening on port %d...\n", PORT);  // print a human-readable log message to the console screen so we can see what is happening

    char received[MAX_MSG_LEN + 1];
    char chunk_data[MAX_PACKETS + 2][CHUNK_SIZE];
    uint8_t chunk_len[MAX_PACKETS + 2] = {0};
    int buffered[MAX_PACKETS + 2] = {0};

    memset(chunk_data, 0, sizeof(chunk_data));

    int count = 0;
    int checksum_errors = 0;
    uint8_t expected_seq = 1;

    int syn_seen = 0;
    int established = 0;

    while (!established) {
        Packet pkt;
        ssize_t r = recvfrom(sockfd, &pkt, sizeof(pkt), 0, (struct sockaddr *)&client_addr, &addr_len);  // wait and listen patiently to receive an incoming packet from the network
        if (r != (ssize_t)sizeof(pkt)) {
            continue;
        }

        if (!checksum_valid(&pkt)) {
            checksum_errors++;
            continue;
        }

        if (pkt.flags & FLAG_SYN) {
            peer_addr = client_addr;
            peer_len = addr_len;
            syn_seen = 1;

            Packet syn_ack;
            memset(&syn_ack, 0, sizeof(syn_ack));  // completely clear the memory of the address structure to prevent any leftover garbage data
            syn_ack.seq = 0;
            syn_ack.ack_num = (uint8_t)(pkt.seq + 1);
            syn_ack.flags = FLAG_SYN | FLAG_ACK;

            if (send_packet(sockfd, &peer_addr, peer_len, &syn_ack) != 0) {
                perror("sendto SYN-ACK");
                continue;
            }

            printf("Received SYN, sent SYN-ACK\n");  // print a human-readable log message to the console screen so we can see what is happening
            continue;
        }

        if (syn_seen && is_from_peer(&peer_addr, &client_addr) && (pkt.flags & FLAG_ACK) && pkt.ack_num == 1) {
            established = 1;
            printf("Received final ACK. Connection established.\n\n");  // print a human-readable log message to the console screen so we can see what is happening
        }
    }

    while (1) {  // start an infinite loop to keep running this process continuously
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
            dup_ack.ack_num = (expected_seq > 1) ? (uint8_t)(expected_seq - 1) : 0;
            if (send_packet(sockfd, &peer_addr, peer_len, &dup_ack) != 0) {
                perror("sendto duplicate ACK after checksum error");
            }

            checksum_errors++;
            printf("Corrupted packet dropped (checksum mismatch), duplicate ACK=%u\n", dup_ack.ack_num);  // print a human-readable log message to the console screen so we can see what is happening
            continue;
        }

        if (pkt.flags & FLAG_FIN) {
            Packet fin_ack;
            memset(&fin_ack, 0, sizeof(fin_ack));  // completely clear the memory of the address structure to prevent any leftover garbage data
            fin_ack.seq = 0;
            fin_ack.ack_num = (uint8_t)(pkt.seq + 1);
            fin_ack.flags = FLAG_ACK;

            if (send_packet(sockfd, &peer_addr, peer_len, &fin_ack) != 0) {
                perror("sendto FIN-ACK");
            } else {
                printf("Received FIN seq=%u, sent ACK ack_num=%u\n", pkt.seq, fin_ack.ack_num);  // print a human-readable log message to the console screen so we can see what is happening
            }
            break;
        }

        if ((pkt.flags & FLAG_DATA) && pkt.len <= CHUNK_SIZE) {
            Packet ack;
            memset(&ack, 0, sizeof(ack));  // completely clear the memory of the address structure to prevent any leftover garbage data
            ack.flags = FLAG_ACK;

            if (pkt.seq >= expected_seq && pkt.seq < (uint8_t)(expected_seq + WINDOW_SIZE)) {
                if (!buffered[pkt.seq]) {
                    buffered[pkt.seq] = 1;
                    chunk_len[pkt.seq] = pkt.len;
                    memcpy(chunk_data[pkt.seq], pkt.data, pkt.len);
                    printf("Buffered DATA seq=%u len=%u\n", pkt.seq, pkt.len);  // print a human-readable log message to the console screen so we can see what is happening
                } else {
                    printf("Duplicate in-window DATA seq=%u\n", pkt.seq);  // print a human-readable log message to the console screen so we can see what is happening
                }

                ack.ack_num = pkt.seq;
                if (send_packet(sockfd, &peer_addr, peer_len, &ack) != 0) {
                    perror("sendto ACK");
                }

                if (pkt.seq > expected_seq) {
                    Packet dup_ack;
                    memset(&dup_ack, 0, sizeof(dup_ack));  // completely clear the memory of the address structure to prevent any leftover garbage data
                    dup_ack.flags = FLAG_ACK;
                    dup_ack.ack_num = (expected_seq > 1) ? (uint8_t)(expected_seq - 1) : 0;

                    if (send_packet(sockfd, &peer_addr, peer_len, &dup_ack) != 0) {
                        perror("sendto duplicate cumulative ACK");
                    } else {
                        printf("Sent duplicate cumulative ACK=%u for gap before seq=%u\n", dup_ack.ack_num,  // print a human-readable log message to the console screen so we can see what is happening
                               expected_seq);
                    }
                }

                while (expected_seq <= MAX_PACKETS && buffered[expected_seq]) {
                    int clen = (int)chunk_len[expected_seq];
                    if (count + clen > MAX_MSG_LEN) {
                        clen = MAX_MSG_LEN - count;
                    }
                    if (clen > 0) {
                        memcpy(received + count, chunk_data[expected_seq], (size_t)clen);
                        count += clen;
                    }
                    buffered[expected_seq] = 0;
                    chunk_len[expected_seq] = 0;
                    expected_seq++;
                }
                continue;
            }

            if (pkt.seq < expected_seq) {
                ack.ack_num = pkt.seq;
                if (send_packet(sockfd, &peer_addr, peer_len, &ack) != 0) {
                    perror("sendto duplicate ACK");
                }
                printf("Old DATA seq=%u already delivered, ACK resent\n", pkt.seq);  // print a human-readable log message to the console screen so we can see what is happening
                continue;
            }

            ack.ack_num = (expected_seq > 1) ? (uint8_t)(expected_seq - 1) : 0;
            if (send_packet(sockfd, &peer_addr, peer_len, &ack) != 0) {
                perror("sendto out-of-window ACK");
            }
            printf("Out-of-window DATA seq=%u (expected range %u-%u), ACK=%u\n", pkt.seq, expected_seq,  // print a human-readable log message to the console screen so we can see what is happening
                   (uint8_t)(expected_seq + WINDOW_SIZE - 1), ack.ack_num);
        }
    }

    received[count] = '\0';

    printf("\n========================================\n");  // print a human-readable log message to the console screen so we can see what is happening
    printf("Complete message: \"%s\"\n", received);  // print a human-readable log message to the console screen so we can see what is happening
    printf("Total characters: %d\n", count);  // print a human-readable log message to the console screen so we can see what is happening
    printf("Checksum errors detected: %d\n", checksum_errors);  // print a human-readable log message to the console screen so we can see what is happening
    printf("========================================\n");  // print a human-readable log message to the console screen so we can see what is happening

    close(sockfd);  // permanently close the socket connection to free up the computer\'s resources
    return 0;  // end the program execution successfully
}
