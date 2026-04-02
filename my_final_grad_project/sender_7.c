#include <stdio.h> // for i/o operations
#include <string.h> // for string handling
#include <arpa/inet.h> // network operations
#include <unistd.h> // for system calls
#include <stdint.h>
#include <sys/time.h>  // include time structures like timeval for setting timeouts
#include <errno.h> // this is for error hadnling and reporting

#define PORT 9090 // this is where the receiver will listen the message
 // this is where the receiver will listen the message

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
static int send_packet_with_retry(int sockfd, const struct sockaddr_in *receiver, const Packet *pkt, int char_index){  // define a variable to hold our socket file descriptor, which acts as an ID for our network connection
    uint8_t ack = 0;
    int retry = 0;
    struct sockaddr_in from_addr;  // define a structure to hold the IP address and port number for the network connection
    socklen_t from_len = sizeof(from_addr);  // define a variable to store the size of the address structure, needed by OS network functions

    while(retry <= MAX_RETRY){
        if(retry > 0){
            if(pkt -> is_end){
                printf("[RETRY %d] Resending termination frame\n", retry);  // print a human-readable log message to the console screen so we can see what is happening
            }else{
                printf("[RETRY %d] Resending character %d\n", retry, char_index);  // print a human-readable log message to the console screen so we can see what is happening
            }
        }

        ssize_t sent = sendto(sockfd, pkt, sizeof(*pkt), 0, (const struct sockaddr *)receiver, sizeof(*receiver));  // dispatch and send the data packet over the network to the assigned receiver address
        if(sent != (ssize_t)sizeof(*pkt)){
            perror("sendto");
            retry++;
            continue;
        }

        if(pkt -> is_end){
            printf("Sent termination packet [Seq:%u]\n", pkt -> seq);  // print a human-readable log message to the console screen so we can see what is happening
        }else{
            printf("Sent char %d: '%c' (ASCII:%u) [Seq:%u P:%u]\n", char_index, (pkt -> data >= 32 && pkt -> data <= 126) ? pkt -> data : '.', pkt -> data, pkt -> data, pkt -> parity);  // print a human-readable log message to the console screen so we can see what is happening
        }

        ssize_t r = recvfrom(sockfd, &ack, sizeof(ack), 0, (struct sockaddr *)&from_addr, &from_len);  // wait and listen patiently to receive an incoming packet from the network

        if(r < 0){
            if(errno == EAGAIN || errno == EWOULDBLOCK){
                printf(" TIMEOUT waiting for ACK/NAK\n");  // print a human-readable log message to the console screen so we can see what is happening
            }else{
                perror("recvfrom");
            }
            retry++;
            continue;
        }
        if(ack == 1){
            printf("Received ACK\n");  // print a human-readable log message to the console screen so we can see what is happening
            return 0;  // end the program execution successfully
        }
        printf(" Received NAK\n");  // print a human-readable log message to the console screen so we can see what is happening
        retry++;
    }

    return -1;
}


int main(void){  // the main entry point of the program where execution begins
    int sockfd = socket(AF_INET, SOCK_DGRAM, 0); // Create socket: IPv4 + datagram-style + default protocol (UDP) // Create socket: IPv4 + datagram-style + default protocol (UDP)

    if(sockfd < 0){  // check if the socket creation failed
        perror("socket");
        return 1;
    }

    struct timeval timeout;  // define a structure to properly hold a time duration, used here for setting a timeout period
    timeout.tv_sec = 2;
    timeout.tv_usec = 0;
    if(setsockopt(sockfd, SOL_SOCKET, SO_RCVTIMEO, &timeout, sizeof(timeout)) < 0){  // dynamically change the socket internal options, such as enabling a receive timeout so it doesn\'t block forever
        perror("setsockopt");
        close(sockfd);  // permanently close the socket connection to free up the computer\'s resources
        return 1;
    }

    struct sockaddr_in receiver_addr; // structure to hold receiver\'s address information // structure to hold receiver\'s address information
    memset(&receiver_addr, 0, sizeof(receiver_addr));  // completely clear the memory of the address structure to prevent any leftover garbage data
    receiver_addr.sin_family = AF_INET;  // specifically state that we are using IPv4 addresses
    receiver_addr.sin_port = htons(PORT);  // set the port number and convert it to big-endian network byte order using htons() so the network understands it
    receiver_addr.sin_addr.s_addr = inet_addr("127.0.0.1");  // convert the human-readable string IP address (like "127.0.0.1") into the raw numerical format needed by the network

    char message[MAX_MSG_LEN + 1];
    printf("Enter message (max %d chars): ", MAX_MSG_LEN);  // print a human-readable log message to the console screen so we can see what is happening
    if(fgets(message, sizeof(message), stdin) == NULL){
        fprintf(stderr, "Failed to read input\n");  // print a human-readable log message to the console screen so we can see what is happening
        close(sockfd);  // permanently close the socket connection to free up the computer\'s resources
        return 1;
    }

    message[strcspn(message, "\n")] = '\0';
    int len = (int)strlen(message);

    printf("Sending: \"%s\" (%d chars)\n\n", message, len);  // print a human-readable log message to the console screen so we can see what is happening

    for(int i = 0; i < len; i++){
        Packet pkt;
        pkt.seq = (uint8_t)i;
        pkt.data = (uint8_t)message[i];
        pkt.parity = calculate_parity(pkt.data);
        pkt.is_end = 0;

        if(send_packet_with_retry(sockfd, &receiver_addr, &pkt, i + 1) != 0){
            printf("Failed to send char %d after retries. Aborting.\n", i + 1);  // print a human-readable log message to the console screen so we can see what is happening
            close(sockfd);  // permanently close the socket connection to free up the computer\'s resources
            return 1;
        }
    }

    Packet end_pkt;
    end_pkt.seq = (uint8_t)len;
    end_pkt.data = 0;
    end_pkt.parity = calculate_parity(end_pkt.data);
    end_pkt.is_end = 1;

    if(send_packet_with_retry(sockfd, &receiver_addr, &end_pkt, 0) != 0){
        printf("Failed to send termination packet.\n");  // print a human-readable log message to the console screen so we can see what is happening
        close(sockfd);  // permanently close the socket connection to free up the computer\'s resources
        return 1;
    }

    printf("\nAll packets sent successfully.\n");  // print a human-readable log message to the console screen so we can see what is happening
    close(sockfd);  // permanently close the socket connection to free up the computer\'s resources
    return 0;  // end the program execution successfully
}
