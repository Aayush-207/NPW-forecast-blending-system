const fs = require('fs');

const raw = fs.readFileSync('extracted.json');
let str;
if (raw[0] === 0xff && raw[1] === 0xfe) {
    str = raw.toString('utf16le');
} else {
    str = raw.toString('utf8');
}
str = str.replace(/^\uFEFF/, '');
const obj = JSON.parse(str);
const args = obj.tool_calls[0].args || JSON.parse(obj.tool_calls[0].function.arguments);

if (args.CodeContent) {
    fs.writeFileSync('src/App.tsx', args.CodeContent, 'utf8');
    console.log('Restored App.tsx correctly!');
} else {
    console.log('No CodeContent found.');
}
