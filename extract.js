const fs = require('fs');

const data = fs.readFileSync('C:\\Users\\anand\\.gemini\\antigravity-ide\\brain\\31fc6f41-3969-4e40-bdad-c34aa15d8921\\.system_generated\\steps\\247\\content.md', 'utf8');
const lines = data.split('\n');

for (let line of lines) {
    if (line.startsWith('vpn') && line.includes(',')) {
        const parts = line.split(',');
        if (parts.length >= 15) {
            const base64 = parts[14].trim();
            const decoded = Buffer.from(base64, 'base64').toString('utf8');
            fs.writeFileSync('c:\\Users\\anand\\vpn\\working-config.ovpn', decoded);
            console.log('Successfully extracted and saved working-config.ovpn');
            process.exit(0);
        }
    }
}
console.log('Failed to find a valid config');
