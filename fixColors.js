const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
    if (!fs.existsSync(dir)) return;
    fs.readdirSync(dir).forEach(f => {
        let p = path.join(dir, f);
        fs.statSync(p).isDirectory() ? walk(p, callback) : callback(p);
    });
}

walk('c:/Users/Harizz/OneDrive/Desktop/NEXROVA/Project-Manager/src', (p) => {
    if (!p.endsWith('.tsx') && !p.endsWith('.css') && !p.endsWith('.ts')) return;
    
    let contents = fs.readFileSync(p, 'utf8');
    let fixed = contents
        .replace(/#6366F1/gi, '#f97316')
        .replace(/#6366f1/g, '#f97316')
        .replace(/#4f46e5/gi, '#fb923c')
        .replace(/#8b5cf6/gi, '#f97316') // violet-500
        .replace(/#3b82f6/gi, '#f97316') // blue-500
        .replace(/rgba\(\s*99\s*,\s*102\s*,\s*241/g, 'rgba(249, 115, 22')
        .replace(/--color-bg-dark/g, '--color-bg-base')
        .replace(/indigo-pulse/g, 'orange-pulse')
        .replace(/-indigo-/g, '-orange-')
        .replace(/\btext-violet-/g, 'text-orange-')
        .replace(/\bbg-violet-/g, 'bg-orange-')
        .replace(/\btext-blue-/g, 'text-orange-')
        .replace(/\bbg-blue-/g, 'bg-orange-')
        .replace(/\bborder-violet-/g, 'border-orange-')
        .replace(/\bborder-blue-/g, 'border-orange-')
        .replace(/\bshadow-violet-/g, 'shadow-orange-')
        .replace(/\bshadow-blue-/g, 'shadow-orange-');
        
    if (fixed !== contents) {
        fs.writeFileSync(p, fixed, 'utf8');
        console.log('Fixed:', p);
    }
});
