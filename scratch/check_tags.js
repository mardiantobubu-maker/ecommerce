const fs = require('fs');

const content = fs.readFileSync('src/components/BlogDetails/index.tsx', 'utf8');
const opens = (content.match(/<div/g) || []).length;
const closes = (content.match(/<\/div/g) || []).length;

console.log(`Opens: ${opens}, Closes: ${closes}`);

const lines = content.split('\n');
let balance = 0;
lines.forEach((line, i) => {
    const o = (line.match(/<div/g) || []).length;
    const c = (line.match(/<\/div/g) || []).length;
    balance += (o - c);
    if (o !== c) {
        console.log(`Line ${i + 1}: o:${o} c:${c} balance:${balance}`);
    }
});
