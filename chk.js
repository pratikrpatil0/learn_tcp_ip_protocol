const fs = require('fs');
const code = fs.readFileSync('src/components/FiveVersionsVisualizer.tsx', 'utf8');

const regex = /const (v\d+Steps) = (\[[\s\S]*?\]);/g;
let match;
while ((match = regex.exec(code)) !== null) {
  const name = match[1];
  const arr = eval(match[2]);
  arr.forEach((obj, i) => {
    if (!obj.fsm) console.log(name, i, "missing fsm!");
    if (!obj.tmMsg) console.log(name, i, "missing tmMsg!");
  });
  console.log(name, "OK! Length:", arr.length);
}
