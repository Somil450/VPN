const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const sudo = require('sudo-prompt');
const fs = require('fs');
const { exec } = require('child_process');

let mainWindow;
let isConnecting = false;

// Resolve path to bundled VPN files (works in both dev and installed mode)
const vpnFilesDir = isDev
  ? 'c:\\Users\\anand\\vpn'
  : process.resourcesPath;

function vpnFile(name) {
  return path.join(vpnFilesDir, name);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 680,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadURL(
    isDev
      ? 'http://localhost:3007'
      : `file://${path.join(__dirname, '../build/index.html')}`
  );

  if (isDev) {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }

  mainWindow.on('closed', () => (mainWindow = null));
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// A quick and dirty way to kill openvpn on windows
function killOpenVPN() {
  return new Promise((resolve) => {
    try {
        exec(`powershell -Command "Start-Process powershell -ArgumentList '-ExecutionPolicy Bypass -File ${vpnFile('disconnect.ps1')}' -Verb RunAs -WindowStyle Hidden -Wait"`, (error) => { resolve(); });
    } catch (e) {
        resolve();
    }
  });
}

ipcMain.on('select-config-file', async (event) => {
  if (!mainWindow) return;
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [{ name: 'OpenVPN Config', extensions: ['ovpn'] }]
  });

  if (!result.canceled && result.filePaths.length > 0) {
    event.reply('selected-config-file', result.filePaths[0]);
  }
});

ipcMain.on('connect-vpn', async (event, config) => {
  console.log('Connecting to VPN with file:', config.path);
  isConnecting = true;
  
  if (!fs.existsSync(config.path)) {
    event.reply('vpn-status', { status: 'disconnected', error: 'Config file not found!' });
    return;
  }

  try {
    await killOpenVPN();
    event.reply('vpn-status', { status: 'connecting' });
    
    if (config.path && config.path.includes('working-config.ovpn')) {
        // Run the connect_loop.ps1 script to try all available configs
        // This will only prompt UAC once for the entire loop
        exec(`powershell -Command "Start-Process powershell -ArgumentList '-ExecutionPolicy Bypass -File ${vpnFile('connect_loop.ps1')}' -Verb RunAs -WindowStyle Hidden"`, (error) => {
            if (error) console.error('OpenVPN loop error:', error);
        });
    } else {
        const openvpnPath = 'C:\\Program Files\\OpenVPN\\bin\\openvpn.exe';
        // Launch openvpn with PowerShell elevation
        exec(`powershell -Command "Start-Process -FilePath '${openvpnPath}' -ArgumentList '--config \`"${config.path}\`"' -Verb RunAs -WindowStyle Hidden"`, (error) => {
          if (error) console.error('OpenVPN error:', error);
        });
    }

    // Give OpenVPN up to 200 seconds to establish a connection (since the loop can take 10 configs * 18s)
    // If it hasn't connected by then, the polling will automatically set the UI to disconnected
    setTimeout(() => {
      isConnecting = false;
    }, 200000);

  } catch (err) {
    console.error(err);
    event.reply('vpn-status', { status: 'disconnected', error: 'Failed to configure VPN' });
  }
});

ipcMain.on('disconnect-vpn', async (event) => {
  console.log('Disconnecting from VPN');
  isConnecting = false;
  await killOpenVPN();
  event.reply('vpn-status', { status: 'disconnected' });
});

// Auto-detect VPN status
setInterval(() => {
  if (!mainWindow) return;
  exec('ipconfig', (err, stdout) => {
    if (!err && stdout) {
      const lines = stdout.split(/\r?\n/);
      let vpnIp = null;
      let isVpnAdapter = false;
      for (const line of lines) {
        if (/^[A-Za-z]/.test(line)) {
            if (line.includes('OpenVPN TAP-Windows6') || line.includes('TAP-Windows Adapter V9')) {
                isVpnAdapter = true;
            } else {
                isVpnAdapter = false;
            }
        } else if (isVpnAdapter) {
            const match = line.match(/IPv4 Address[^:]*: (\d+\.\d+\.\d+\.\d+)/);
            if (match) {
                vpnIp = match[1];
                break;
            }
        }
      }
      
      if (vpnIp) {
        mainWindow.webContents.send('vpn-status', { status: 'connected', ip: vpnIp });
      } else {
        // Only send disconnected if we aren't currently trying to connect
        if (!isConnecting) {
          mainWindow.webContents.send('vpn-status', { status: 'disconnected' });
        }
      }
    }
  });
}, 3000);
