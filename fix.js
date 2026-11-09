const fs = require('fs');
let content = fs.readFileSync('D:/HelloDad/app/src/main/assets/app.js', 'utf8');
content = content.replace(/\\`/g, '`');
content = content.replace(/\\\$\{/g, '${');
fs.writeFileSync('D:/HelloDad/app/src/main/assets/app.js', content);
