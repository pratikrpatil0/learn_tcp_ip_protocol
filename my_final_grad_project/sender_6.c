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
    struct sockaddr_in receiver_addr, from_addr;
    socklen_t addr_len = sizeof(receiver_addr);
    
    sockfd = socket(AF_INET, SOCK_DGRAM, 0); 

    if(sockfd < 0){
        perror("socket");
        return 1;
    }

    // setting the socket timeout (2 seconds)
    struct timeval timeout; // here in the timeval struct, we set the timeout for receiving data on the socket. If the sender does not receive an ACK/NAK within this time frame, it will consider it a timeout and will retry sending the character. also struct timeval represent two values - tv_sec (whole seconds) and tv_usec (fractional part seconds, microseconds). In this case, we set the timeout to 2 seconds and 0 microseconds.
    timeout.tv_sec = 2;
    timeout.tv_usec = 0;
    if(setsockopt(sockfd, SOL_SOCKET, SO_RCVTIMEO, &timeout, sizeof(timeout)) < 0) // SOL_SOCKET - here we are setting the socket level option, SO_RCVTIMEO - receive timeout option for (recvfrom), sizeof(timeout) - this is the size of the structure
        {
            perror("setsockopt");
            close(sockfd);
            return 1;
        }

    
    receiver_addr.sin_family = AF_INET; 
    receiver_addr.sin_port = htons(PORT); 
    receiver_addr.sin_addr.s_addr = inet_addr("127.0.0.1"); 

    char message[100]; 
    printf("Enter a message (max 99 characters): ");     
    if(fgets(message, sizeof(message), stdin) == NULL){
        fprintf(stderr, "Failed to read input\n");
        close(sockfd);
        return 1;
    }

    message[strcspn(message, "\n")] = '\0';  // replace newline character with null terminator

    int message_length = strlen(message); 
    printf("Sending message: \"%s\" (%d characters)\n\n", message, message_length); // if you want to use quotes, you can use \" to include them in the string

    for(int char_index = 0; char_index < message_length; char_index++){
        unsigned char byte_to_send = (unsigned char)message[char_index];
        char seq_num = (char)char_index;

        int retry_count = 0; // this count the tries that the sender has made to send the current character, if it reaches the max_retries, it will stop trying and will abort the transmission. this is important to prevent infinite loops in case of persistent errors or issues with the receiver.
        int max_retries = 3;
        char ack_received = 0;

        while(!ack_received && retry_count <= max_retries){
            if(retry_count > 0){
                printf(" [RETRY %d] Resending character %d\n", retry_count, char_index + 1);
            }

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

            // wait for ACK/NAK
            char ack_buffer[1];
            addr_len = sizeof(from_addr);
            ssize_t recv_result = recvfrom(sockfd, ack_buffer, sizeof(ack_buffer), 0, (struct sockaddr *)&from_addr, &addr_len); // here we are waiting for a response from the receiver after sending each character. the sender will wait for an ACK (ack_buffer[0] == 1) or a NAK (ack_buffer[0] == 0). if it receives an ACK, it will proceed to send the next character. if it receives a NAK or if it times out (recv_result < 0), it will retry sending the same character until it reaches the maximum number of retries.

            if(recv_result < 0){
                printf(" | TIMEOUT - NO response!\n");
                retry_count++;
            } else if(ack_buffer[0] == 1){
                printf(" | Received ACK\n");
                ack_received = 1;
            } else{
                printf(" | Received NAK - Error detected!\n");
                retry_count++;
            }

            usleep(50000);
        }

        if(!ack_received){
            printf(" [FAILED] Max retries reached for character %d\n", char_index + 1);
            printf(" Aborting transmission...\n");
            close(sockfd);
            return 1;
        }
    }

    printf("\nSending termination signal.....\n");

    // send the termination signal with retry logic
    int retry_count = 0;
    int max_retries = 3;
    char ack_received = 0;
    char null_seq = message_length;
    unsigned char null_byte = '\0';

    while(!ack_received && retry_count <= max_retries){
        if(retry_count > 0){
            printf(" [RETRY %d] Resending termination signal\n", retry_count);
        }

        // sending sequence number for null byte
        sendto(sockfd, &null_seq, sizeof(null_seq), 0, (struct sockaddr *)&receiver_addr, sizeof(receiver_addr));
        usleep(10000);

        for(int i = 7; i >= 0; i--){
            char bit = (null_byte >> i) & 1;
            sendto(sockfd, &bit, sizeof(bit), 0,
                   (struct sockaddr *)&receiver_addr, sizeof(receiver_addr));
            usleep(10000);
        }

        char null_parity = calculate_parity((char)null_byte);
        sendto(sockfd, &null_parity, sizeof(null_parity), 0,
               (struct sockaddr *)&receiver_addr, sizeof(receiver_addr));
        usleep(10000);

        char ack_buffer[1];
        addr_len = sizeof(from_addr);
        ssize_t recv_result = recvfrom(sockfd, ack_buffer, sizeof(ack_buffer), 0,
                                       (struct sockaddr *)&from_addr, &addr_len);

        if (recv_result < 0) {
            printf("Termination | TIMEOUT\n");
            retry_count++;
        } else if (ack_buffer[0] == 1) {
            printf("Termination signal sent | Received ACK\n");
            ack_received = 1;
        } else {
            printf("Termination signal sent | Received NAK\n");
            retry_count++;
        }
    }


if (!ack_received) {
        printf("Failed to terminate cleanly after retries.\n");
        close(sockfd);
        return 1;
    }

    printf("All characters sent successfully!\n");
    close(sockfd);
    return 0;
}