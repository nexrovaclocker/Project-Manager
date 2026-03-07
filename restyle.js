const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function walk(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
    });
}

const replacements = [
    { from: /var\(--color-green-accent\)/g, to: 'var(--color-brand-accent)' },
    { from: /\[#00FF88\]/gi, to: '[var(--color-brand-accent)]' },
    { from: /\[#0a0a0a\]/gi, to: '[var(--color-bg-dark)]' },
    { from: /\[#141414\]/gi, to: '[var(--color-panel)]' },
    { from: /\[#111111\]/gi, to: '[var(--color-panel)]' },
    { from: /\[#222222\]/gi, to: '[var(--color-panel-border)]' },
    { from: /\[#1e1e1e\]/gi, to: '[var(--color-panel-border)]' },
    { from: /rounded-none/g, to: 'rounded-xl' }
];

walk(srcDir, (filePath) => {
    if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let newContent = content;
        replacements.forEach(r => {
            newContent = newContent.replace(r.from, r.to);
        });
        if (content !== newContent) {
            fs.writeFileSync(filePath, newContent, 'utf8');
            console.log('Updated:', filePath);
        }
    }
});
