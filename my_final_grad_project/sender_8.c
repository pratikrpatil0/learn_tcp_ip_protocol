#include <arpa/inet.h> // network operations
#include <errno.h>
#include <stdint.h>
#include <stdio.h> // for i/o operations
#include <string.h> // for string handling
#include <sys/time.h>  // include time structures like timeval for setting timeouts
#include <unistd.h> // for system calls
#define PORT 9090 // this is where the receiver will listen the message
 // this is where the receiver will listen the message

#define MAX_MSG_LEN 99
#define MAX_RETRY 5

#define FLAG_SYN 0x01
#define FLAG_ACK 0x02
#define FLAG_FIN 0x04
#define FLAG_DATA 0x08

typedef struct {
	uint8_t seq;
	uint8_t ack_num;
	uint8_t flags;
	uint8_t len;
	uint8_t data;
	uint16_t checksum;
} Packet;

static uint16_t compute_checksum(const Packet *pkt) {
	uint32_t sum = 0;
	sum += pkt->seq;
	sum += pkt->ack_num;
	sum += pkt->flags;
	sum += pkt->len;
	sum += pkt->data;
	while (sum >> 16) {
		sum = (sum & 0xFFFFU) + (sum >> 16);
	}
	return (uint16_t)(~sum);
}

static void finalize_packet(Packet *pkt) {
	pkt->checksum = 0;
	pkt->checksum = compute_checksum(pkt);
}

static int checksum_valid(const Packet *pkt) {
	Packet tmp = *pkt;
	uint16_t received = tmp.checksum;
	tmp.checksum = 0;
	return received == compute_checksum(&tmp);
}

static int is_from_peer(const struct sockaddr_in *expected, const struct sockaddr_in *from) {  // define a structure to hold the IP address and port number for the network connection
	return expected->sin_port == from->sin_port && expected->sin_addr.s_addr == from->sin_addr.s_addr;
}

static int wait_for_response(int sockfd, const struct sockaddr_in *receiver_addr, Packet *resp) {  // define a variable to hold our socket file descriptor, which acts as an ID for our network connection
	struct sockaddr_in from_addr;  // define a structure to hold the IP address and port number for the network connection
	socklen_t from_len = sizeof(from_addr);  // define a variable to store the size of the address structure, needed by OS network functions

	while (1) {  // start an infinite loop to keep running this process continuously
		ssize_t r = recvfrom(sockfd, resp, sizeof(*resp), 0, (struct sockaddr *)&from_addr, &from_len);  // wait and listen patiently to receive an incoming packet from the network
		if (r < 0) {
			return -1;
		}
		if (r != (ssize_t)sizeof(*resp)) {
			continue;
		}
		if (!is_from_peer(receiver_addr, &from_addr)) {
			continue;
		}
		if (!checksum_valid(resp)) {
			continue;
		}
		return 0;  // end the program execution successfully
	}
}

static int connect_handshake(int sockfd, const struct sockaddr_in *receiver_addr) {  // define a variable to hold our socket file descriptor, which acts as an ID for our network connection
	Packet syn;
	Packet resp;

	memset(&syn, 0, sizeof(syn));  // completely clear the memory of the address structure to prevent any leftover garbage data
	syn.seq = 0;
	syn.flags = FLAG_SYN;
	finalize_packet(&syn);

	for (int retry = 0; retry <= MAX_RETRY; retry++) {
		if (retry > 0) {
			printf("[RETRY %d] Resending SYN\n", retry);  // print a human-readable log message to the console screen so we can see what is happening
		}

		if (sendto(sockfd, &syn, sizeof(syn), 0, (const struct sockaddr *)receiver_addr, sizeof(*receiver_addr)) !=  // dispatch and send the data packet over the network to the assigned receiver address
			(ssize_t)sizeof(syn)) {
			perror("sendto SYN");
			continue;
		}

		printf("Sent SYN\n");  // print a human-readable log message to the console screen so we can see what is happening

		if (wait_for_response(sockfd, receiver_addr, &resp) != 0) {
			if (errno == EAGAIN || errno == EWOULDBLOCK) {
				printf("Timeout waiting for SYN-ACK\n");  // print a human-readable log message to the console screen so we can see what is happening
			} else {
				perror("recvfrom SYN-ACK");
			}
			continue;
		}

		if ((resp.flags & (FLAG_SYN | FLAG_ACK)) == (FLAG_SYN | FLAG_ACK) && resp.ack_num == 1) {
			Packet final_ack;
			memset(&final_ack, 0, sizeof(final_ack));  // completely clear the memory of the address structure to prevent any leftover garbage data
			final_ack.seq = 1;
			final_ack.ack_num = 1;
			final_ack.flags = FLAG_ACK;
			finalize_packet(&final_ack);

			if (sendto(sockfd, &final_ack, sizeof(final_ack), 0, (const struct sockaddr *)receiver_addr,  // dispatch and send the data packet over the network to the assigned receiver address
					   sizeof(*receiver_addr)) != (ssize_t)sizeof(final_ack)) {
				perror("sendto final ACK");
				continue;
			}

			printf("Received SYN-ACK, sent final ACK. Connection established.\n\n");  // print a human-readable log message to the console screen so we can see what is happening
			return 0;  // end the program execution successfully
		}

		printf("Unexpected packet during handshake (flags=0x%02X ack=%u).\n", resp.flags, resp.ack_num);  // print a human-readable log message to the console screen so we can see what is happening
	}

	return -1;
}

static int send_data_with_retry(int sockfd, const struct sockaddr_in *receiver_addr, uint8_t seq, uint8_t ch, int index) {  // define a variable to hold our socket file descriptor, which acts as an ID for our network connection
	Packet data_pkt;
	Packet resp;

	memset(&data_pkt, 0, sizeof(data_pkt));  // completely clear the memory of the address structure to prevent any leftover garbage data
	data_pkt.seq = seq;
	data_pkt.flags = FLAG_DATA;
	data_pkt.len = 1;
	data_pkt.data = ch;
	finalize_packet(&data_pkt);

	for (int retry = 0; retry <= MAX_RETRY; retry++) {
		if (retry > 0) {
			printf("[RETRY %d] Resending DATA seq=%u\n", retry, seq);  // print a human-readable log message to the console screen so we can see what is happening
		}

		if (sendto(sockfd, &data_pkt, sizeof(data_pkt), 0, (const struct sockaddr *)receiver_addr,  // dispatch and send the data packet over the network to the assigned receiver address
				   sizeof(*receiver_addr)) != (ssize_t)sizeof(data_pkt)) {
			perror("sendto DATA");
			continue;
		}

		printf("Sent DATA[%d] '%c' seq=%u\n", index, (ch >= 32 && ch <= 126) ? ch : '.', seq);  // print a human-readable log message to the console screen so we can see what is happening

		if (wait_for_response(sockfd, receiver_addr, &resp) != 0) {
			if (errno == EAGAIN || errno == EWOULDBLOCK) {
				printf("Timeout waiting for ACK for seq=%u\n", seq);  // print a human-readable log message to the console screen so we can see what is happening
			} else {
				perror("recvfrom DATA ACK");
			}
			continue;
		}

		if ((resp.flags & FLAG_ACK) && resp.ack_num == (uint8_t)(seq + 1)) {
			printf("Received ACK ack_num=%u\n", resp.ack_num);  // print a human-readable log message to the console screen so we can see what is happening
			return 0;  // end the program execution successfully
		}

		printf("Unexpected ACK packet (flags=0x%02X ack=%u), retrying.\n", resp.flags, resp.ack_num);  // print a human-readable log message to the console screen so we can see what is happening
	}

	return -1;
}

static int close_with_fin(int sockfd, const struct sockaddr_in *receiver_addr, uint8_t fin_seq) {  // define a variable to hold our socket file descriptor, which acts as an ID for our network connection
	Packet fin_pkt;
	Packet resp;

	memset(&fin_pkt, 0, sizeof(fin_pkt));  // completely clear the memory of the address structure to prevent any leftover garbage data
	fin_pkt.seq = fin_seq;
	fin_pkt.flags = FLAG_FIN;
	finalize_packet(&fin_pkt);

	for (int retry = 0; retry <= MAX_RETRY; retry++) {
		if (retry > 0) {
			printf("[RETRY %d] Resending FIN\n", retry);  // print a human-readable log message to the console screen so we can see what is happening
		}

		if (sendto(sockfd, &fin_pkt, sizeof(fin_pkt), 0, (const struct sockaddr *)receiver_addr,  // dispatch and send the data packet over the network to the assigned receiver address
				   sizeof(*receiver_addr)) != (ssize_t)sizeof(fin_pkt)) {
			perror("sendto FIN");
			continue;
		}

		printf("Sent FIN seq=%u\n", fin_seq);  // print a human-readable log message to the console screen so we can see what is happening

		if (wait_for_response(sockfd, receiver_addr, &resp) != 0) {
			if (errno == EAGAIN || errno == EWOULDBLOCK) {
				printf("Timeout waiting for FIN-ACK\n");  // print a human-readable log message to the console screen so we can see what is happening
			} else {
				perror("recvfrom FIN-ACK");
			}
			continue;
		}

		if ((resp.flags & FLAG_ACK) && resp.ack_num == (uint8_t)(fin_seq + 1)) {
			printf("Received FIN-ACK. Connection closed cleanly.\n");  // print a human-readable log message to the console screen so we can see what is happening
			return 0;  // end the program execution successfully
		}

		printf("Unexpected close packet (flags=0x%02X ack=%u)\n", resp.flags, resp.ack_num);  // print a human-readable log message to the console screen so we can see what is happening
	}

	return -1;
}

int main(void) {  // the main entry point of the program where execution begins
	int sockfd = socket(AF_INET, SOCK_DGRAM, 0); // Create socket: IPv4 + datagram-style + default protocol (UDP) // Create socket: IPv4 + datagram-style + default protocol (UDP)
	if (sockfd < 0) {  // check if the socket creation failed
		perror("socket");
		return 1;
	}

	struct timeval timeout;  // define a structure to properly hold a time duration, used here for setting a timeout period
	timeout.tv_sec = 2;
	timeout.tv_usec = 0;
	if (setsockopt(sockfd, SOL_SOCKET, SO_RCVTIMEO, &timeout, sizeof(timeout)) < 0) {  // dynamically change the socket internal options, such as enabling a receive timeout so it doesn\'t block forever
		perror("setsockopt");
		close(sockfd);  // permanently close the socket connection to free up the computer\'s resources
		return 1;
	}

	struct sockaddr_in receiver_addr; // structure to hold receiver\'s address information // structure to hold receiver\'s address information
	memset(&receiver_addr, 0, sizeof(receiver_addr));  // completely clear the memory of the address structure to prevent any leftover garbage data
	receiver_addr.sin_family = AF_INET;  // specifically state that we are using IPv4 addresses
	receiver_addr.sin_port = htons(PORT);  // set the port number and convert it to big-endian network byte order using htons() so the network understands it
	receiver_addr.sin_addr.s_addr = inet_addr("127.0.0.1");  // convert the human-readable string IP address (like "127.0.0.1") into the raw numerical format needed by the network

	if (connect_handshake(sockfd, &receiver_addr) != 0) {
		printf("Failed to establish connection.\n");  // print a human-readable log message to the console screen so we can see what is happening
		close(sockfd);  // permanently close the socket connection to free up the computer\'s resources
		return 1;
	}

	char message[MAX_MSG_LEN + 1];
	printf("Enter message (max %d chars): ", MAX_MSG_LEN);  // print a human-readable log message to the console screen so we can see what is happening
	if (fgets(message, sizeof(message), stdin) == NULL) {
		fprintf(stderr, "Failed to read input\n");  // print a human-readable log message to the console screen so we can see what is happening
		close(sockfd);  // permanently close the socket connection to free up the computer\'s resources
		return 1;
	}

	message[strcspn(message, "\n")] = '\0';
	int len = (int)strlen(message);

	printf("Sending: \"%s\" (%d chars)\n\n", message, len);  // print a human-readable log message to the console screen so we can see what is happening

	for (int i = 0; i < len; i++) {
		uint8_t seq = (uint8_t)(1 + i);
		if (send_data_with_retry(sockfd, &receiver_addr, seq, (uint8_t)message[i], i + 1) != 0) {
			printf("Failed to send data at index %d.\n", i);  // print a human-readable log message to the console screen so we can see what is happening
			close(sockfd);  // permanently close the socket connection to free up the computer\'s resources
			return 1;
		}
	}

	if (close_with_fin(sockfd, &receiver_addr, (uint8_t)(1 + len)) != 0) {
		printf("Failed to close connection cleanly.\n");  // print a human-readable log message to the console screen so we can see what is happening
		close(sockfd);  // permanently close the socket connection to free up the computer\'s resources
		return 1;
	}

	close(sockfd);  // permanently close the socket connection to free up the computer\'s resources
	return 0;  // end the program execution successfully
}
