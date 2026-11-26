const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = dir + '/' + file;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if(file.endsWith('.tsx') || file.endsWith('.ts')) results.push(file);
        }
    });
    return results;
}

const files = walk('c:/Users/fandi/OneDrive/Desktop/ecommerce-main/src/components');
let changedCount = 0;
files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    if(content.includes('xl:px-0')) {
        const newContent = content.replace(/xl:px-0/g, 'xl:px-6 2xl:px-0');
        fs.writeFileSync(file, newContent, 'utf8');
        changedCount++;
    }
});
console.log(`Replaced in ${changedCount} files.`);
