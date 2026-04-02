#include <stdio.h> // for i/o operations
#include <string.h> // for string handling
#include <arpa/inet.h> // network operations
#include <unistd.h> // for system calls
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
    printf("Receiver waiting for 8 bits......\n");  // print a human-readable log message to the console screen so we can see what is happening

    unsigned char received_byte = 0;

    printf("Receiving bits: ");  // print a human-readable log message to the console screen so we can see what is happening
    for(int i = 7; i >= 0; i--){
        recvfrom(sockfd, bit_buffer, sizeof(bit_buffer), 0, (struct sockaddr *)&client_addr, &addr_len);  // wait and listen patiently to receive an incoming packet from the network

        printf("%d", bit_buffer[0]);  // print a human-readable log message to the console screen so we can see what is happening

        // here always remember that bit buffer is actually a one byte buffer, but we are only using the least significant bit of that byte to represent the received bit (0 or 1). So when we check if(bit_buffer[0] == 1), we are checking if the least significant bit of the received byte is 1, which indicates that the sender sent a bit value of 1. If it is 1, we set the corresponding bit in received_byte using the bitwise OR operation.
        if(bit_buffer[0] == 1){
            received_byte |= (1 << i); // here we are doing the bitwise OR operation to set the bit at position i in received_byte if the received bit is 1. The expression (1 << i) creates a byte with only the bit at position i set to 1, and the rest are 0. By doing received_byte |= (1 << i), we are updating received_byte to include the new bit information.
        }
    }

    printf("\nReconstructed character: '%c' (ASCII: %d) \n", received_byte, received_byte);  // print a human-readable log message to the console screen so we can see what is happening
    close(sockfd);  // permanently close the socket connection to free up the computer\'s resources
    return 0;  // end the program execution successfully
}
