#include <stdio.h> // for i/o operations
#include <string.h> // for string handling
#include <arpa/inet.h> // network operations
#include <unistd.h> // for system calls
char calculate_parity(unsigned char byte){
    char parity = 0;
    for(int i = 0; i < 8; i++){
        parity ^= ((byte >> i) & 1);
    }
    return parity;
}

#define PORT 9090 // this is where the receiver will listen the message
 // this is where the receiver will listen the message

int main(){  // the main entry point of the program where execution begins
    int sockfd;  // define a variable to hold our socket file descriptor, which acts as an ID for our network connection
    char bit_buffer[1];
    struct sockaddr_in server_addr, // server_addr = receiver\'s address (we fill this) // server_addr = receiver\'s address (we fill this) client_addr;
    socklen_t addr_len = sizeof(client_addr);  // define a variable to store the size of the address structure, needed by OS network functions

    sockfd = socket(AF_INET, SOCK_DGRAM, 0); // Create socket: IPv4 + datagram-style + default protocol (UDP) // Create socket: IPv4 + datagram-style + default protocol (UDP)

    server_addr.sin_family = AF_INET; // this tells that the network protocol is IPv4 // this tells that the network protocol is IPv4
    server_addr.sin_port = htons(PORT); // htons() converts port number to network byte order // htons() converts port number to network byte order
    server_addr.sin_addr.s_addr = INADDR_ANY; // listen on all available network interfaces // listen on all available network interfaces

    bind(sockfd, (struct sockaddr *)&server_addr, sizeof(server_addr)); // Bind socket to address - Connect our configuration to the kernel\'s socket
    printf("Receiver waiting for message......\n");  // print a human-readable log message to the console screen so we can see what is happening

    char received_message[100];
    int char_count = 0;
    int error_count = 0;

    while(1){  // start an infinite loop to keep running this process continuously

        // receive sequence number
        recvfrom(sockfd, bit_buffer, sizeof(bit_buffer), 0, (struct sockaddr *)&client_addr, &addr_len);  // wait and listen patiently to receive an incoming packet from the network
        char seq_num = bit_buffer[0];

        unsigned char received_byte = 0;
        printf("Receiving character %d [Seq: %d]: ", char_count + 1, seq_num);  // print a human-readable log message to the console screen so we can see what is happening

        for(int i = 7; i >= 0; i--){
            recvfrom(sockfd, bit_buffer, sizeof(bit_buffer), 0, (struct sockaddr *)&client_addr, &addr_len);  // wait and listen patiently to receive an incoming packet from the network

            printf("%d", bit_buffer[0]);  // print a human-readable log message to the console screen so we can see what is happening

            if(bit_buffer[0] == 1){
                received_byte |= (1<< i);
            }
        }

        recvfrom(sockfd, bit_buffer, sizeof(bit_buffer), 0, (struct sockaddr *)&client_addr, &addr_len);  // wait and listen patiently to receive an incoming packet from the network
        char received_parity = bit_buffer[0];

        char expected_parity = calculate_parity(received_byte);

        printf(" P:%d", received_parity);  // print a human-readable log message to the console screen so we can see what is happening

        if(received_parity != expected_parity){
            printf(" [ERROR: Parity mismatch!]");  // print a human-readable log message to the console screen so we can see what is happening
            error_count++;
        } else{
            printf(" [OK]");  // print a human-readable log message to the console screen so we can see what is happening
        }

        if(received_byte == '\0'){
            printf(" - Termination signal received\n");  // print a human-readable log message to the console screen so we can see what is happening
            break;
        }

        received_message[char_count] = received_byte;
        char_count++;
        printf("\n");  // print a human-readable log message to the console screen so we can see what is happening

    }

    received_message[char_count] = '\0';

    printf("\n========================================\n");  // print a human-readable log message to the console screen so we can see what is happening
    printf("Complete message received: \"%s\"\n", received_message);  // print a human-readable log message to the console screen so we can see what is happening
    printf("Total characters: %d\n", char_count);  // print a human-readable log message to the console screen so we can see what is happening
    printf("Parity errors detected: %d\n", error_count);  // print a human-readable log message to the console screen so we can see what is happening
    printf("========================================\n");  // print a human-readable log message to the console screen so we can see what is happening

    close(sockfd);  // permanently close the socket connection to free up the computer\'s resources
    return 0;  // end the program execution successfully
}

