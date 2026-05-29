const fs = require('fs');

const data = fs.readFileSync('C:\\Users\\anand\\.gemini\\antigravity-ide\\brain\\31fc6f41-3969-4e40-bdad-c34aa15d8921\\.system_generated\\steps\\247\\content.md', 'utf8');
const lines = data.split('\n');

let count = 0;
for (let line of lines) {
    if (line.startsWith('vpn') && line.includes(',')) {
        const parts = line.split(',');
        if (parts.length >= 15) {
            const base64 = parts[14].trim();
            const decoded = Buffer.from(base64, 'base64').toString('utf8');
            // Add cipher negotiation fix
            let finalConfig = decoded + '\ndata-ciphers DEFAULT:AES-128-CBC:AES-256-CBC\nauth-user-pass pass.txt\n';
            fs.writeFileSync(`c:\\Users\\anand\\vpn\\config-${count}.ovpn`, finalConfig);
            console.log(`Saved config-${count}.ovpn`);
            count++;
            if (count >= 10) break;
        }
    }
}
