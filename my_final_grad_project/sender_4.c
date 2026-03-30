#include <stdio.h> 
#include <string.h> 
#include <arpa/inet.h> 
#include <unistd.h> 

#define PORT 9090 

char calculate_parity(char byte){
    char parity = 0;
    for(int i = 0; i < 8; i++){
        if((byte >> i) & 1){
            parity ^= 1; // this is the xor bitwise operator, if this results in 1, it means we have an odd number of 1s, if it results in 0, we have an even number of 1s.
        }
    }
    return parity;
}

int main(){
    int sockfd; 
    struct sockaddr_in receiver_addr;
    
    sockfd = socket(AF_INET, SOCK_DGRAM, 0); 

    receiver_addr.sin_family = AF_INET; 
    receiver_addr.sin_port = htons(PORT); 
    receiver_addr.sin_addr.s_addr = inet_addr("127.0.0.1"); 

    char message[100]; 
    printf("Enter a message (max 99 characters): ");     
    fgets(message, sizeof(message), stdin);  // Read input from user

    message[strcspn(message, "\n")] = '\0';  // replace newline character with null terminator

    int message_length = strlen(message); 
    printf("Sending message: \"%s\" (%d characters)\n\n", message, message_length); // if you want to use quotes, you can use \" to include them in the string

    for(int char_index = 0; char_index < message_length; char_index++){
        char byte_to_send = message[char_index];

        // sending the sequence number, sequence number start from 0
        char seq_num = char_index;
        sendto(sockfd, &seq_num, sizeof(seq_num), 0, (struct sockaddr *)&receiver_addr, sizeof(receiver_addr));
        usleep(10000);

        printf("Character %d: '%c' (ASCII: %d) [Seq:%d]\n", char_index + 1, byte_to_send, (unsigned char)byte_to_send, seq_num);
        printf("Binary representation: ");

        for(int i = 7; i >= 0; i--){
            char bit = (byte_to_send >> i) & 1;
            printf("%d", bit);

            sendto(sockfd, &bit, sizeof(bit), 0, (struct sockaddr *)&receiver_addr, sizeof(receiver_addr));
            usleep(10000);
        }

        char parity = calculate_parity(byte_to_send);
        printf(" P:%d", parity);
        sendto(sockfd, &parity, sizeof(parity), 0, (struct sockaddr *)&receiver_addr, sizeof(receiver_addr));
        usleep(10000);

        printf(" - Sent\n");
        usleep(50000);
    }

    printf("\nSending termination signal.....\n");

    //sending the sequence number for null byte 
    char null_seq = message_length;
    sendto(sockfd, &null_seq, sizeof(null_seq), 0, (struct sockaddr *)&receiver_addr, sizeof(receiver_addr));
    usleep(10000);

    unsigned char null_byte = '\0';
    for(int i = 7; i>=0; i--){
        char bit = (null_byte >> i) & 1;
        sendto(sockfd, &bit, sizeof(bit), 0, (struct sockaddr *)&receiver_addr, sizeof(receiver_addr));
        usleep(10000);
    }

    char null_parity = calculate_parity(null_byte);
    sendto(sockfd, &null_parity, sizeof(null_parity), 0, (struct sockaddr *)&receiver_addr, sizeof(receiver_addr));
    usleep(10000);

    printf("All charactes sent successfully!\n");

    close(sockfd); 
    return 0;
}                                                                                                                                                                                     