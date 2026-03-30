#include <stdio.h> 
#include <string.h> 
#include <arpa/inet.h> 
#include <unistd.h> 

#define PORT 9090 

int main(){
    int sockfd; 
    struct sockaddr_in receiver_addr;
    
    sockfd = socket(AF_INET, SOCK_DGRAM, 0); 

    receiver_addr.sin_family = AF_INET; 
    receiver_addr.sin_port = htons(PORT); 
    receiver_addr.sin_addr.s_addr = inet_addr("127.0.0.1"); 

    char byte_to_send;
    printf("Enter a character: ");
    scanf("%c", &byte_to_send);
    
    printf("sending character '%c' (ASCII: %d)\n" , byte_to_send, (unsigned char) byte_to_send);
    printf("Binary representation: ");

    for(int i = 7; i>=0 ; i--){
        char bit = (byte_to_send >> i) & 1; // here we are doing the right shift to get the bit at position i and then we are doing bitwise AND with 1 to get the value of that bit (0 or 1)
        printf("%d", bit);

        sendto(sockfd, &bit, sizeof(bit), 0, (struct sockaddr *)&receiver_addr, sizeof(receiver_addr));

        usleep(10000);// Sleep for 10 milliseconds to ensure the receiver has time to process each bit
    }

    printf("\nAll 8 bits Sent. \n"); 

    close(sockfd); 
    return 0;
}                                                                                                                                                                                     