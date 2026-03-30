#include <stdio.h> 
#include <string.h> 
#include <arpa/inet.h> 
#include <unistd.h> 
#include <stdint.h>

#define PORT 9090
#define MAX_MSG_LEN 99

typedef struct{
    uint8_t seq;
    uint8_t data;
    uint8_t parity;
    uint8_t is_end;
} Packet;

static uint8_t calculate_parity(uint8_t byte){
    uint8_t parity = 0;
    for(int i = 0; i < 8; i++){
        parity ^= ((byte >> i) & 1U);
    }
    return parity;
}

int main(){
    int sockfd = socket(AF_INET, SOCK_DGRAM, 0);
    if(sockfd < 0){
        perror("");
    } 

    struct sockaddr_in server_addr, client_addr;
    socklen_t addr_len = sizeof(client_addr);

    memset(&server_addr, 0, sizeof(server_addr));
    server_addr.sin_family = AF_INET;
    server_addr.sin_port = htons(PORT);
    server_addr.sin_addr.s_addr = INADDR_ANY;

    if(bind(sockfd, (struct sockaddr *)&server_addr, sizeof(server_addr)) < 0){
        perror("bind");
        return 1;
    }

    printf("Receiver waiting on port %d...\n", PORT);

    char received[MAX_MSG_LEN + 1];
    int count = 0;
    int error_count = 0;
    uint8_t expected_seq = 0;

    while(1){
        Packet pkt;
        ssize_t r = recvfrom(sockfd, &pkt, sizeof(pkt), 0, (struct sockaddr *)&client_addr, &addr_len);
        if(r != (ssize_t)sizeof(pkt)){
            continue;
        }

        uint8_t expected_parity = calculate_parity(pkt.data);
        uint8_t ack = 1;

        if(pkt.parity != expected_parity){
            printf("Seq:%u parity mismatch (got %u, expected %u) -> NAK\n", pkt.seq, pkt.parity, expected_parity);
            ack = 0;
            error_count++;
            sendto(sockfd, &ack, sizeof(ack), 0, (struct sockaddr *)&client_addr, addr_len);
            continue;
        }

        sendto(sockfd, &ack, sizeof(ack), 0, (struct sockaddr *)&client_addr, addr_len);

        if(pkt.seq != expected_seq){
            printf("Seq:%u duplicate/out-of-order (expected %u), ACK sent, ignored\n", pkt.seq, expected_seq);
            continue;
        }

        if(pkt.is_end){
            printf("Termination packet received [Seq:%u]\n", pkt.seq);
            break;
        }

        if(count < MAX_MSG_LEN){
            received[count++] = (char)pkt.data;
            expected_seq++;
            printf("Accepted Seq:%u Data: '%c'\n", pkt.seq, (pkt.data >= 32 && pkt.data <= 126) ? pkt.data : '.');
        }else{
            printf("Buffer Full, Stopping.\n");
            break;
        }
    }

    received[count] = '\0';

    printf("\n========================================\n");
    printf("Complete message: \"%s\"\n", received);
    printf("Total characters: %d\n", count);
    printf("Parity errors detected: %d\n", error_count);
    printf("========================================\n");

    close(sockfd);
    return 0;
}  

