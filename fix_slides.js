const fs = require('fs');
const file = 'src/app/grad-presentation/page.tsx';
let source = fs.readFileSync(file, 'utf8');

const anchor1 = '    // Slide 7: Version 0';
const anchor2 = '  ];\n\n  const nextSlide';

if (source.split(anchor1).length > 2) {
    const firstPart = source.split(anchor1)[0];
    const middlePart = source.split(anchor1)[1]; // One copy of the slide code
    const lastPart = anchor2 + source.split(anchor2)[1];
    
    // Middle part might contain anchor2 and another anchor1, let's just extract up to the closing `</div>` of the slide
    const slideEnd = '      </div>\n    </div>\n';
    
    let cleanMiddlePart = middlePart.substring(0, middlePart.indexOf(slideEnd) + slideEnd.length);
    
    // Change the visualizer link correctly
    cleanMiddlePart = cleanMiddlePart.replace('href="/simulator?v=0"', 'href="http://localhost:3000/demonstration"');

    const newSource = firstPart + anchor1 + cleanMiddlePart + lastPart;
    fs.writeFileSync(file, newSource);
    console.log("Fixed duplicates and updated URL!");
} else {
    // If only one exists, just replace the URL
    source = source.replace('href="/simulator?v=0"', 'href="http://localhost:3000/demonstration"');
    fs.writeFileSync(file, source);
    console.log("Updated URL securely.");
}
