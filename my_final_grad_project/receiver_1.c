#include <stdio.h> 
#include <string.h> 
#include <arpa/inet.h> 
#include <unistd.h> 

#define PORT 9090 
int main(){
    int sockfd; 
    char bit_buffer[1]; 
    struct sockaddr_in server_addr, client_addr; 
    socklen_t addr_len = sizeof(client_addr); 

    sockfd = socket(AF_INET, SOCK_DGRAM, 0); 
    
    server_addr.sin_family = AF_INET; 
    server_addr.sin_port = htons(PORT); 
    server_addr.sin_addr.s_addr = INADDR_ANY; 

    bind(sockfd, (struct sockaddr *)&server_addr, sizeof(server_addr)); 
    printf("Receiver waiting for 8 bits......\n");

    unsigned char received_byte = 0;

    printf("Receiving bits: ");
    for(int i = 7; i >= 0; i--){
        recvfrom(sockfd, bit_buffer, sizeof(bit_buffer), 0, (struct sockaddr *)&client_addr, &addr_len);

        printf("%d", bit_buffer[0]);

        // here always remember that bit buffer is actually a one byte buffer, but we are only using the least significant bit of that byte to represent the received bit (0 or 1). So when we check if(bit_buffer[0] == 1), we are checking if the least significant bit of the received byte is 1, which indicates that the sender sent a bit value of 1. If it is 1, we set the corresponding bit in received_byte using the bitwise OR operation.
        if(bit_buffer[0] == 1){
            received_byte |= (1 << i); // here we are doing the bitwise OR operation to set the bit at position i in received_byte if the received bit is 1. The expression (1 << i) creates a byte with only the bit at position i set to 1, and the rest are 0. By doing received_byte |= (1 << i), we are updating received_byte to include the new bit information.
        }
    }

    printf("\nReconstructed character: '%c' (ASCII: %d) \n", received_byte, received_byte); 
    close(sockfd); 
    return 0; 
}                                                                                                                                                                                           