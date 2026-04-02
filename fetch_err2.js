const fs = require('fs');
const path = require('path');
const filePath = path.join(process.cwd(), 'my_final_grad_project', 'sender_10.c');
try {
  let f = fs.readFileSync(filePath, 'utf8');
  console.log("Success reading", f.length);
} catch (e) {
  console.log(e);
}
