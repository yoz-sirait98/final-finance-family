const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend/src/pages/ShoppingDetailPage.vue');
let lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);

const idx = lines.findIndex(l => l.includes('function setupRealtime() {'));

if (idx !== -1) {
    for (let i = idx - 1; i >= 0; i--) {
        if (lines[i].trim() === '}') {
            lines.splice(i, 1);
            fs.writeFileSync(filePath, lines.join('\n'));
            console.log('Successfully removed stray brace at line ' + (i + 1));
            break;
        }
    }
}
