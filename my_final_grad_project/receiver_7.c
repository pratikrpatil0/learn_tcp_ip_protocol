#include <stdio.h> // for i/o operations
#include <string.h> // for string handling
#include <arpa/inet.h> // network operations
#include <unistd.h> // for system calls
#include <stdint.h>

#define PORT 9090 // this is where the receiver will listen the message
 // this is where the receiver will listen the message

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

int main(){  // the main entry point of the program where execution begins
    int sockfd = socket(AF_INET, SOCK_DGRAM, 0); // Create socket: IPv4 + datagram-style + default protocol (UDP) // Create socket: IPv4 + datagram-style + default protocol (UDP)
    if(sockfd < 0){  // check if the socket creation failed
        perror("");
    }

    struct sockaddr_in server_addr, // server_addr = receiver\'s address (we fill this) // server_addr = receiver\'s address (we fill this) client_addr;
    socklen_t addr_len = sizeof(client_addr);  // define a variable to store the size of the address structure, needed by OS network functions

    memset(&server_addr, 0, sizeof(server_addr));  // completely clear the memory of the address structure to prevent any leftover garbage data
    server_addr.sin_family = AF_INET; // this tells that the network protocol is IPv4 // this tells that the network protocol is IPv4
    server_addr.sin_port = htons(PORT); // htons() converts port number to network byte order // htons() converts port number to network byte order
    server_addr.sin_addr.s_addr = INADDR_ANY; // listen on all available network interfaces // listen on all available network interfaces

    if(bind(sockfd, (struct sockaddr *)&server_addr, sizeof(server_addr)) < 0){  // bind our created socket to the specified port and IP address, actively making it ready to listen for incoming data
        perror("bind");
        return 1;
    }

    printf("Receiver waiting on port %d...\n", PORT);  // print a human-readable log message to the console screen so we can see what is happening

    char received[MAX_MSG_LEN + 1];
    int count = 0;
    int error_count = 0;
    uint8_t expected_seq = 0;

    while(1){  // start an infinite loop to keep running this process continuously
        Packet pkt;
        ssize_t r = recvfrom(sockfd, &pkt, sizeof(pkt), 0, (struct sockaddr *)&client_addr, &addr_len);  // wait and listen patiently to receive an incoming packet from the network
        if(r != (ssize_t)sizeof(pkt)){
            continue;
        }

        uint8_t expected_parity = calculate_parity(pkt.data);
        uint8_t ack = 1;

        if(pkt.parity != expected_parity){
            printf("Seq:%u parity mismatch (got %u, expected %u) -> NAK\n", pkt.seq, pkt.parity, expected_parity);  // print a human-readable log message to the console screen so we can see what is happening
            ack = 0;
            error_count++;
            sendto(sockfd, &ack, sizeof(ack), 0, (struct sockaddr *)&client_addr, addr_len);  // dispatch and send the data packet over the network to the assigned receiver address
            continue;
        }

        sendto(sockfd, &ack, sizeof(ack), 0, (struct sockaddr *)&client_addr, addr_len);  // dispatch and send the data packet over the network to the assigned receiver address

        if(pkt.seq != expected_seq){
            printf("Seq:%u duplicate/out-of-order (expected %u), ACK sent, ignored\n", pkt.seq, expected_seq);  // print a human-readable log message to the console screen so we can see what is happening
            continue;
        }

        if(pkt.is_end){
            printf("Termination packet received [Seq:%u]\n", pkt.seq);  // print a human-readable log message to the console screen so we can see what is happening
            break;
        }

        if(count < MAX_MSG_LEN){
            received[count++] = (char)pkt.data;
            expected_seq++;
            printf("Accepted Seq:%u Data: '%c'\n", pkt.seq, (pkt.data >= 32 && pkt.data <= 126) ? pkt.data : '.');  // print a human-readable log message to the console screen so we can see what is happening
        }else{
            printf("Buffer Full, Stopping.\n");  // print a human-readable log message to the console screen so we can see what is happening
            break;
        }
    }

    received[count] = '\0';

    printf("\n========================================\n");  // print a human-readable log message to the console screen so we can see what is happening
    printf("Complete message: \"%s\"\n", received);  // print a human-readable log message to the console screen so we can see what is happening
    printf("Total characters: %d\n", count);  // print a human-readable log message to the console screen so we can see what is happening
    printf("Parity errors detected: %d\n", error_count);  // print a human-readable log message to the console screen so we can see what is happening
    printf("========================================\n");  // print a human-readable log message to the console screen so we can see what is happening

    close(sockfd);  // permanently close the socket connection to free up the computer\'s resources
    return 0;  // end the program execution successfully
}

