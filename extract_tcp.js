const fs = require('fs');

const data = fs.readFileSync('C:\\Users\\anand\\.gemini\\antigravity-ide\\brain\\31fc6f41-3969-4e40-bdad-c34aa15d8921\\.system_generated\\steps\\247\\content.md', 'utf8');
const lines = data.split('\n');

for (let line of lines) {
    if (line.includes(',') && line.length > 50) {
        const parts = line.split(',');
        if (parts.length >= 15) {
            const base64 = parts[14].trim();
            if (base64 && base64.length > 100) {
                try {
                    const decoded = Buffer.from(base64, 'base64').toString('utf8');
                    // Check if it's TCP on port 443
                    if (decoded.includes('proto tcp') && decoded.includes('443')) {
                        let finalConfig = decoded + '\ndata-ciphers DEFAULT:AES-128-CBC:AES-256-CBC\nauth-user-pass pass.txt\n';
                        fs.writeFileSync('c:\\Users\\anand\\vpn\\tcp443.ovpn', finalConfig);
                        console.log('Saved tcp443.ovpn!');
                        process.exit(0);
                    }
                } catch (e) {}
            }
        }
    }
}
console.log('Could not find a TCP 443 config in the list.');
