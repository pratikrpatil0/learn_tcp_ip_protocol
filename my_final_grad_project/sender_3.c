#include <stdio.h> // for i/o operations
#include <string.h> // for string handling
#include <arpa/inet.h> // network operations
#include <unistd.h> // for system calls
#define PORT 9090 // this is where the receiver will listen the message
 // this is where the receiver will listen the message



char calculate_parity(char byte){
    char parity = 0;
    for(int i = 0; i < 8; i++){
        if((byte >> i) & 1){
            parity ^= 1; // this is the xor bitwise operator, if this results in 1, it means we have an odd number of 1s, if it results in 0, we have an even number of 1s.
        }
    }
    return parity;
}

int main(){  // the main entry point of the program where execution begins
    int sockfd;  // define a variable to hold our socket file descriptor, which acts as an ID for our network connection
    struct sockaddr_in receiver_addr; // structure to hold receiver\'s address information // structure to hold receiver\'s address information

    sockfd = socket(AF_INET, SOCK_DGRAM, 0); // Create socket: IPv4 + datagram-style + default protocol (UDP) // Create socket: IPv4 + datagram-style + default protocol (UDP)

    receiver_addr.sin_family = AF_INET;  // specifically state that we are using IPv4 addresses
    receiver_addr.sin_port = htons(PORT);  // set the port number and convert it to big-endian network byte order using htons() so the network understands it
    receiver_addr.sin_addr.s_addr = inet_addr("127.0.0.1");  // convert the human-readable string IP address (like "127.0.0.1") into the raw numerical format needed by the network

    char message[100];
    printf("Enter a message (max 99 characters): ");  // print a human-readable log message to the console screen so we can see what is happening
    fgets(message, sizeof(message), stdin);  // Read input from user

    message[strcspn(message, "\n")] = '\0';  // replace newline character with null terminator

    int message_length = strlen(message);
    printf("Sending message: \"%s\" (%d characters)\n\n", message, message_length); // if you want to use quotes, you can use \" to include them in the string

    for(int char_index = 0; char_index < message_length; char_index++){
        char byte_to_send = message[char_index];

        printf("Character %d: '%c' (ASCII: %d)\n", char_index + 1, byte_to_send, (unsigned char)byte_to_send);  // print a human-readable log message to the console screen so we can see what is happening
        printf("Binary representation: ");  // print a human-readable log message to the console screen so we can see what is happening

        for(int i = 7; i >= 0; i--){
            char bit = (byte_to_send >> i) & 1;
            printf("%d", bit);  // print a human-readable log message to the console screen so we can see what is happening

            sendto(sockfd, &bit, sizeof(bit), 0, (struct sockaddr *)&receiver_addr, sizeof(receiver_addr));  // dispatch and send the data packet over the network to the assigned receiver address
            usleep(10000);
        }

        char parity = calculate_parity(byte_to_send);
        printf(" P:%d", parity);  // print a human-readable log message to the console screen so we can see what is happening
        sendto(sockfd, &parity, sizeof(parity), 0, (struct sockaddr *)&receiver_addr, sizeof(receiver_addr));  // dispatch and send the data packet over the network to the assigned receiver address
        usleep(10000);

        printf(" - Sent\n");  // print a human-readable log message to the console screen so we can see what is happening
        usleep(50000);
    }

    printf("\nSending termination signal.....\n");  // print a human-readable log message to the console screen so we can see what is happening
    unsigned char null_byte = '\0';
    for(int i = 7; i>=0; i--){
        char bit = (null_byte >> i) & 1;
        sendto(sockfd, &bit, sizeof(bit), 0, (struct sockaddr *)&receiver_addr, sizeof(receiver_addr));  // dispatch and send the data packet over the network to the assigned receiver address
        usleep(10000);
    }

    char null_parity = calculate_parity(null_byte);
    sendto(sockfd, &null_parity, sizeof(null_parity), 0, (struct sockaddr *)&receiver_addr, sizeof(receiver_addr));  // dispatch and send the data packet over the network to the assigned receiver address
    usleep(10000);

    printf("All charactes sent successfully!\n");  // print a human-readable log message to the console screen so we can see what is happening

    close(sockfd);  // permanently close the socket connection to free up the computer\'s resources
    return 0;  // end the program execution successfully
}
