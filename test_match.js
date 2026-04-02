const fs = require('fs');
const s10 = fs.readFileSync('my_final_grad_project/sender_10.c', 'utf8');
const match = "sendto(sockfd, &syn, sizeof(syn)";
const matchNoSpace = match.replace(/\s+/g, '');
const lines = s10.split('\n');
const foundCount = lines.filter(l => l.replace(/\s+/g,'').includes(matchNoSpace)).length;
console.log({foundCount});
