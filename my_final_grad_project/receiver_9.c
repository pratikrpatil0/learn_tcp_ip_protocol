#include <arpa/inet.h> // network operations
#include <stdint.h>
#include <stdio.h> // for i/o operations
#include <string.h> // for string handling
#include <unistd.h> // for system calls
#define PORT 9090 // this is where the receiver will listen the message
 // this is where the receiver will listen the message

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

static int send_packet(int sockfd, const struct sockaddr_in *client_addr, socklen_t addr_len, Packet *pkt) {  // define a variable to hold our socket file descriptor, which acts as an ID for our network connection
    finalize_packet(pkt);
    return sendto(sockfd, pkt, sizeof(*pkt), 0, (const struct sockaddr *)client_addr, addr_len) == (ssize_t)sizeof(*pkt)  // dispatch and send the data packet over the network to the assigned receiver address
               ? 0
               : -1;
}

int main(void) {  // the main entry point of the program where execution begins
    int sockfd = socket(AF_INET, SOCK_DGRAM, 0); // Create socket: IPv4 + datagram-style + default protocol (UDP) // Create socket: IPv4 + datagram-style + default protocol (UDP)
    if (sockfd < 0) {  // check if the socket creation failed
        perror("socket");
        return 1;
    }

    struct sockaddr_in server_addr;  // define a structure to hold the IP address and port number for the network connection
    struct sockaddr_in client_addr;  // define a structure to hold the IP address and port number for the network connection
    socklen_t addr_len = sizeof(client_addr);  // define a variable to store the size of the address structure, needed by OS network functions

    memset(&server_addr, 0, sizeof(server_addr));  // completely clear the memory of the address structure to prevent any leftover garbage data
    server_addr.sin_family = AF_INET; // this tells that the network protocol is IPv4 // this tells that the network protocol is IPv4
    server_addr.sin_port = htons(PORT); // htons() converts port number to network byte order // htons() converts port number to network byte order
    server_addr.sin_addr.s_addr = INADDR_ANY; // listen on all available network interfaces // listen on all available network interfaces

    if (bind(sockfd, (struct sockaddr *)&server_addr, sizeof(server_addr)) < 0) {  // bind our created socket to the specified port and IP address, actively making it ready to listen for incoming data
        perror("bind");
        close(sockfd);  // permanently close the socket connection to free up the computer\'s resources
        return 1;
    }

    printf("Receiver v9 listening on port %d...\n", PORT);  // print a human-readable log message to the console screen so we can see what is happening

    char received[MAX_MSG_LEN + 1];
    int count = 0;
    int checksum_errors = 0;
    uint8_t expected_seq = 1;

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
            Packet syn_ack;
            memset(&syn_ack, 0, sizeof(syn_ack));  // completely clear the memory of the address structure to prevent any leftover garbage data
            syn_ack.seq = 0;
            syn_ack.ack_num = (uint8_t)(pkt.seq + 1);
            syn_ack.flags = FLAG_SYN | FLAG_ACK;

            if (send_packet(sockfd, &client_addr, addr_len, &syn_ack) != 0) {
                perror("sendto SYN-ACK");
                continue;
            }

            printf("Received SYN, sent SYN-ACK\n");  // print a human-readable log message to the console screen so we can see what is happening

            Packet final_ack;
            r = recvfrom(sockfd, &final_ack, sizeof(final_ack), 0, (struct sockaddr *)&client_addr, &addr_len);  // wait and listen patiently to receive an incoming packet from the network
            if (r != (ssize_t)sizeof(final_ack)) {
                continue;
            }

            if (!checksum_valid(&final_ack)) {
                checksum_errors++;
                continue;
            }

            if ((final_ack.flags & FLAG_ACK) && final_ack.ack_num == 1) {
                established = 1;
                printf("Received final ACK. Connection established.\n\n");  // print a human-readable log message to the console screen so we can see what is happening
            }
        }
    }

    while (1) {  // start an infinite loop to keep running this process continuously
        Packet pkt;
        ssize_t r = recvfrom(sockfd, &pkt, sizeof(pkt), 0, (struct sockaddr *)&client_addr, &addr_len);  // wait and listen patiently to receive an incoming packet from the network
        if (r != (ssize_t)sizeof(pkt)) {
            continue;
        }

        if (!checksum_valid(&pkt)) {
            checksum_errors++;
            printf("Corrupted packet dropped (checksum mismatch).\n");  // print a human-readable log message to the console screen so we can see what is happening
            continue;
        }

        if (pkt.flags & FLAG_FIN) {
            Packet fin_ack;
            memset(&fin_ack, 0, sizeof(fin_ack));  // completely clear the memory of the address structure to prevent any leftover garbage data
            fin_ack.seq = 0;
            fin_ack.ack_num = (uint8_t)(pkt.seq + 1);
            fin_ack.flags = FLAG_ACK;

            if (send_packet(sockfd, &client_addr, addr_len, &fin_ack) != 0) {
                perror("sendto FIN-ACK");
            } else {
                printf("Received FIN seq=%u, sent ACK ack_num=%u\n", pkt.seq, fin_ack.ack_num);  // print a human-readable log message to the console screen so we can see what is happening
            }
            break;
        }

        if ((pkt.flags & FLAG_DATA) && pkt.len == 1) {
            Packet ack;
            memset(&ack, 0, sizeof(ack));  // completely clear the memory of the address structure to prevent any leftover garbage data
            ack.seq = 0;
            ack.flags = FLAG_ACK;

            if (pkt.seq == expected_seq) {
                if (count < MAX_MSG_LEN) {
                    received[count++] = (char)pkt.data;
                }
                expected_seq++;
                ack.ack_num = expected_seq;
                printf("Accepted DATA seq=%u, cumulative ACK=%u\n", pkt.seq, ack.ack_num);  // print a human-readable log message to the console screen so we can see what is happening
            } else {
                ack.ack_num = expected_seq;
                printf("Out-of-order DATA seq=%u (expected %u), duplicate ACK=%u\n", pkt.seq, expected_seq,  // print a human-readable log message to the console screen so we can see what is happening
                       ack.ack_num);
            }

            if (send_packet(sockfd, &client_addr, addr_len, &ack) != 0) {
                perror("sendto ACK");
            }
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
