#include <stdio.h> 
#include <string.h> 
#include <arpa/inet.h> 
#include <unistd.h> 

char calculate_parity(unsigned char byte){
    char parity = 0;
    for(int i = 0; i < 8; i++){
        parity ^= ((byte >> i) & 1);
    }
    return parity;
}

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
    printf("Receiver waiting for message......\n");

    char received_message[100];
    int char_count = 0;
    int error_count = 0;

    while(1){
        unsigned char received_byte = 0;
        printf("Receiving character %d: ", char_count + 1);

        for(int i = 7; i >= 0; i--){
            recvfrom(sockfd, bit_buffer, sizeof(bit_buffer), 0, (struct sockaddr *)&client_addr, &addr_len);

            printf("%d", bit_buffer[0]);

            if(bit_buffer[0] == 1){
                received_byte |= (1<< i);
            }
        }

        recvfrom(sockfd, bit_buffer, sizeof(bit_buffer), 0, (struct sockaddr *)&client_addr, &addr_len);
        char received_parity = bit_buffer[0];

        char expected_parity = calculate_parity(received_byte);

        printf(" P:%d", received_parity);

        if(received_parity != expected_parity){
            printf(" [ERROR: Parity mismatch!]");
            error_count++;
        } else{
            printf(" [OK]");
        }

        if(received_byte == '\0'){
            printf(" - Termination signal received\n");
            break;
        }

        received_message[char_count] = received_byte;
        char_count++;
        printf("\n");

    }

    received_message[char_count] = '\0';

    printf("\n========================================\n");                                                                                                                                     
    printf("Complete message received: \"%s\"\n", received_message);
    printf("Total characters: %d\n", char_count);
    printf("Parity errors detected: %d\n", error_count);
    printf("========================================\n");

    close(sockfd); 
    return 0; 
}  

