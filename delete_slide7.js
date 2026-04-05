const fs = require('fs');
const file = 'src/app/grad-presentation/page.tsx';
let source = fs.readFileSync(file, 'utf8');

const splitToken1 = '    // Slide 7: Version Evolutions (Detailed & Simplified)';
const splitToken2 = '  ];\n\n  const nextSlide';

if (source.includes(splitToken1) && source.includes(splitToken2)) {
  const p1 = source.split(splitToken1)[0];
  const endParts = source.split(splitToken2);
  // Reattach the second part
  const p2 = endParts.slice(1).join(splitToken2);
  
  // Need to make sure the comma before Slide 7 is removed if it's there
  const newSource = p1.trimEnd().replace(/,$/, '') + '\n  ];\n\n  const nextSlide' + p2;
  
  fs.writeFileSync(file, newSource);
  console.log("Successfully removed Slide 7.");
} else {
  console.log("Tokens not found!");
}
