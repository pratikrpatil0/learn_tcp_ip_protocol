#include <stdio.h> 
#include <string.h> 
#include <arpa/inet.h> 
#include <unistd.h> 
#include <stdint.h>
#include <sys/time.h>
#include <errno.h> // this is for error hadnling and reporting

#define PORT 9090
#define MAX_RETRY 3
#define MAX_MSG_LEN 99

typedef struct{
    uint8_t seq; // here in this uint8_t is taken from stdint.h which is an unsigned 8 bit integer.
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
static int send_packet_with_retry(int sockfd, const struct sockaddr_in *receiver, const Packet *pkt, int char_index){
    uint8_t ack = 0;
    int retry = 0;
    struct sockaddr_in from_addr;
    socklen_t from_len = sizeof(from_addr);

    while(retry <= MAX_RETRY){
        if(retry > 0){
            if(pkt -> is_end){
                printf("[RETRY %d] Resending termination frame\n", retry);
            }else{
                printf("[RETRY %d] Resending character %d\n", retry, char_index);
            }
        }

        ssize_t sent = sendto(sockfd, pkt, sizeof(*pkt), 0, (const struct sockaddr *)receiver, sizeof(*receiver));
        if(sent != (ssize_t)sizeof(*pkt)){
            perror("sendto");
            retry++;
            continue;
        }

        if(pkt -> is_end){
            printf("Sent termination packet [Seq:%u]\n", pkt -> seq);
        }else{
            printf("Sent char %d: '%c' (ASCII:%u) [Seq:%u P:%u]\n", char_index, (pkt -> data >= 32 && pkt -> data <= 126) ? pkt -> data : '.', pkt -> data, pkt -> data, pkt -> parity);
        }

        ssize_t r = recvfrom(sockfd, &ack, sizeof(ack), 0, (struct sockaddr *)&from_addr, &from_len);

        if(r < 0){
            if(errno == EAGAIN || errno == EWOULDBLOCK){
                printf(" TIMEOUT waiting for ACK/NAK\n");
            }else{
                perror("recvfrom");
            }
            retry++;
            continue;
        }
        if(ack == 1){
            printf("Received ACK\n");
            return 0;
        }
        printf(" Received NAK\n");
        retry++;
    }

    return -1;
}


int main(void){
    int sockfd = socket(AF_INET, SOCK_DGRAM, 0);

    if(sockfd < 0){
        perror("socket");
        return 1;
    }

    struct timeval timeout;
    timeout.tv_sec = 2;
    timeout.tv_usec = 0;
    if(setsockopt(sockfd, SOL_SOCKET, SO_RCVTIMEO, &timeout, sizeof(timeout)) < 0){
        perror("setsockopt");
        close(sockfd);
        return 1;
    }
    
    struct sockaddr_in receiver_addr;
    memset(&receiver_addr, 0, sizeof(receiver_addr));
    receiver_addr.sin_family = AF_INET;
    receiver_addr.sin_port = htons(PORT);
    receiver_addr.sin_addr.s_addr = inet_addr("127.0.0.1");

    char message[MAX_MSG_LEN + 1];
    printf("Enter message (max %d chars): ", MAX_MSG_LEN);
    if(fgets(message, sizeof(message), stdin) == NULL){
        fprintf(stderr, "Failed to read input\n");
        close(sockfd);
        return 1;
    }

    message[strcspn(message, "\n")] = '\0';
    int len = (int)strlen(message);

    printf("Sending: \"%s\" (%d chars)\n\n", message, len);

    for(int i = 0; i < len; i++){
        Packet pkt;
        pkt.seq = (uint8_t)i;
        pkt.data = (uint8_t)message[i];
        pkt.parity = calculate_parity(pkt.data);
        pkt.is_end = 0;

        if(send_packet_with_retry(sockfd, &receiver_addr, &pkt, i + 1) != 0){
            printf("Failed to send char %d after retries. Aborting.\n", i + 1);
            close(sockfd);
            return 1;
        }
    }

    Packet end_pkt;
    end_pkt.seq = (uint8_t)len;
    end_pkt.data = 0;
    end_pkt.parity = calculate_parity(end_pkt.data);
    end_pkt.is_end = 1;

    if(send_packet_with_retry(sockfd, &receiver_addr, &end_pkt, 0) != 0){
        printf("Failed to send termination packet.\n");
        close(sockfd);
        return 1;
    }

    printf("\nAll packets sent successfully.\n");
    close(sockfd);
    return 0;
}
