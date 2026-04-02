#include <stdio.h> // for i/o operations
#include <string.h> // for string handling
#include <arpa/inet.h> // network operations
#include <unistd.h> // for system calls

#define PORT 9090 // this is where the receiver will listen the message

int main(){  // the main entry point of the program where execution begins
    int sockfd; // socket file descriptor
    char buffer[1]; // buffer to hold received data
    struct sockaddr_in server_addr, client_addr;  // define a structure to hold the IP address and port number for the network connection
    // sockaddr_in: IPv4 address container (16 bytes total)
    // sin_family: AF_INET (tells kernel "use IPv4")
    // sin_port: port number (network byte order)
    // sin_addr: IP address (4 bytes for IPv4)
    // sin_zero: padding (ignored)
    // server_addr = receiver's address (we fill this)
    // client_addr = sender's address (kernel fills this after recvfrom)
    socklen_t addr_len = sizeof(client_addr); // variable to hold the size of the client address structure, a data type specifically for socket address lengths (usually an unsigned integer, typically 32 bits)

    //create a socket
    sockfd = socket(AF_INET, SOCK_DGRAM, 0);  // create a UDP socket (SOCK_DGRAM) meant for IPv4 networking (AF_INET)
    // Create socket: IPv4 + datagram-style + default protocol (UDP)
    // AF_INET = IPv4, SOCK_DGRAM = datagram type(meaning connectionless, not connection oriented which is automatically UDP), 0 = use default (UDP)
    // sockfd will hold the file descriptor for the created socket, which is an integer used by the operating system to identify the socket for subsequent operations (like sendto, recvfrom, etc.)

    // configuring the server address structure
    server_addr.sin_family = AF_INET; // this tells that the network protocol is IPv4
    server_addr.sin_port = htons(PORT); // here htons() converts the port number from host byte order to network byte order (big-endian), ensuring that the port number is correctly interpreted across different systems with varying endianness. This is necessary because network protocols expect data should be big endian byte order, and using htons() ensures that the port number is formatted correctly for transmission over the network.
    server_addr.sin_addr.s_addr = INADDR_ANY; // this set the ip address to 0.0.0.0, which means the server will listen on all available network interfaces (e.g., localhost, Ethernet, Wi-Fi) for incoming data on the specified port. This allows the receiver to accept messages sent to any of the machine's IP addresses without needing to specify a particular one.

    // bind the socket to the specified port
    bind(sockfd, (struct sockaddr *)&server_addr, sizeof(server_addr)); //
    printf("Receiver waiting for a bit......\n");  // print a human-readable log message to the console screen so we can see what is happening
    // Bind socket to address - Connect our configuration to the kernel's socket
    // Step 1: socket() created empty socket in kernel (sockfd=3)
    // Step 2: We configured server_addr in our memory (port 9090, IP 0.0.0.0)
    // Step 3: bind() copies our config from memory → updates kernel's socket
    // Parameters: sockfd (which socket), &server_addr (where our config is), sizeof (how much to copy)
    // After bind: OS routes all data arriving at port 9090 → to this socket


    //received data from the sender
    recvfrom(sockfd, buffer, sizeof(buffer), 0, (struct sockaddr *)&client_addr, &addr_len);  // wait and listen patiently to receive an incoming packet from the network
    // Receive data from sender (BLOCKING CALL - waits until data arrives)
    //   sockfd: which socket to listen on (FD #3)
    //   buffer: where to store received data (1 byte)
    //   sizeof(buffer): max bytes to receive (1)
    //   0: flags (none)
    //   &client_addr: kernel fills this with sender's IP:port
    //   &addr_len: input=16 (size available), output=16 (size written)
    // Process sleeps here until UDP packet arrives at port 9090
    // When packet arrives: kernel copies data→buffer, sender info→client_addr
    // Returns: number of bytes received (1 in our case)

    printf("Received bit: %d\n", buffer[0]); //
    close(sockfd); // close the socket to free up system resources
    return 0;  // end the program execution successfully
}
