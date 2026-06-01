import fs from 'fs';
try {
    const content = fs.readFileSync('final_lint.txt', 'utf16le');
    fs.writeFileSync('final_lint_utf8.txt', content, 'utf8');
    console.log('Conversion successful');
} catch (e) {
    console.error('Error:', e.message);
}
