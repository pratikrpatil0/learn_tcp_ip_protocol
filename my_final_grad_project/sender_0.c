#include <stdio.h> // for i/o operations
#include <string.h> // for string handling
#include <arpa/inet.h> // network operations
#include <unistd.h> // for system calls

#define PORT 9090 // this is where the receiver will listen the message, the sender will send the message to this port number. The sender and receiver must use the same port number to communicate with each other. This is because the port number is used by the operating system to route the incoming data to the correct application (in this case, our receiver program). If the sender sends data to a different port number, the receiver will not receive it because it is not listening on that port. Therefore, both sender and receiver must agree on the same port number for successful communication.

int main(){
    int sockfd; // socket file descriptor
    char bit; // variable to hold the bit to be sent
    struct sockaddr_in receiver_addr;
    
    //create a socket
    sockfd = socket(AF_INET, SOCK_DGRAM, 0); 

    // configuring the receiver's address structure
    receiver_addr.sin_family = AF_INET; // set the address family to IPv4
    receiver_addr.sin_port = htons(PORT); // set the port number, converting it to network byte order
    receiver_addr.sin_addr.s_addr = inet_addr("127.0.0.1"); // set the IP address to localhost
    
    printf("Enter a bit (0 or 1): ");
    scanf("%hhd", &bit); // read a bit (0 or 1) from the user

    //send a bit 
    sendto(sockfd, &bit, sizeof(bit), 0, (struct sockaddr *)&receiver_addr, sizeof(receiver_addr)); // send the bit to the receiver's address structure
    // here sendto() is a system call used to send data over a socket.
    printf("Bit Sent. \n"); 

    close(sockfd); // close the socket to free up system resources
    return 0;
}                                                                                                                                                                                     