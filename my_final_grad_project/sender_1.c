#include <stdio.h> // for i/o operations
#include <string.h> // for string handling
#include <arpa/inet.h> // network operations
#include <unistd.h> // for system calls
#define PORT 9090 // this is where the receiver will listen the message
 // this is where the receiver will listen the message


int main(){  // the main entry point of the program where execution begins
    int sockfd;  // define a variable to hold our socket file descriptor, which acts as an ID for our network connection
    struct sockaddr_in receiver_addr; // structure to hold receiver\'s address information // structure to hold receiver\'s address information

    sockfd = socket(AF_INET, SOCK_DGRAM, 0); // Create socket: IPv4 + datagram-style + default protocol (UDP) // Create socket: IPv4 + datagram-style + default protocol (UDP)

    receiver_addr.sin_family = AF_INET;  // specifically state that we are using IPv4 addresses
    receiver_addr.sin_port = htons(PORT);  // set the port number and convert it to big-endian network byte order using htons() so the network understands it
    receiver_addr.sin_addr.s_addr = inet_addr("127.0.0.1");  // convert the human-readable string IP address (like "127.0.0.1") into the raw numerical format needed by the network

    char byte_to_send;
    printf("Enter a character: ");  // print a human-readable log message to the console screen so we can see what is happening
    scanf("%c", &byte_to_send);

    printf("sending character '%c' (ASCII: %d)\n" , byte_to_send, (unsigned char) byte_to_send);  // print a human-readable log message to the console screen so we can see what is happening
    printf("Binary representation: ");  // print a human-readable log message to the console screen so we can see what is happening

    for(int i = 7; i>=0 ; i--){
        char bit = (byte_to_send >> i) & 1; // here we are doing the right shift to get the bit at position i and then we are doing bitwise AND with 1 to get the value of that bit (0 or 1)
        printf("%d", bit);  // print a human-readable log message to the console screen so we can see what is happening

        sendto(sockfd, &bit, sizeof(bit), 0, (struct sockaddr *)&receiver_addr, sizeof(receiver_addr));  // dispatch and send the data packet over the network to the assigned receiver address

        usleep(10000);// Sleep for 10 milliseconds to ensure the receiver has time to process each bit
    }

    printf("\nAll 8 bits Sent. \n");  // print a human-readable log message to the console screen so we can see what is happening

    close(sockfd);  // permanently close the socket connection to free up the computer\'s resources
    return 0;  // end the program execution successfully
}
