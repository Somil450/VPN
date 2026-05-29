const { exec } = require('child_process');

exec('ipconfig', (err, stdout) => {
    if (err) return console.error(err);
    
    // Split output into blocks separated by blank lines
    // ipconfig outputs blocks separated by "\r\n\r\n"
    const blocks = stdout.split(/\r?\n\r?\n/);
    
    let vpnIp = null;
    for (const block of blocks) {
        if (block.includes('OpenVPN TAP-Windows6') || block.includes('TAP-Windows Adapter V9')) {
            if (!block.includes('Media disconnected')) {
                const match = block.match(/IPv4 Address[^:]*: (\d+\.\d+\.\d+\.\d+)/);
                if (match) {
                    vpnIp = match[1];
                    break;
                }
            }
        }
    }
    console.log("VPN IP:", vpnIp);
});
