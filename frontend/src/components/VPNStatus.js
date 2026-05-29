import React, { useState, useEffect } from 'react';
import './VPNStatus.css';

// Safely import ipcRenderer for Electron context
const electron = window.require ? window.require('electron') : null;
const ipcRenderer = electron ? electron.ipcRenderer : null;

function VPNStatus() {
    const [vpnStatus, setVpnStatus] = useState('disconnected');
    const [vpnIp, setVpnIp] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);
    
    const [selectedConfig, setSelectedConfig] = useState(null);

    useEffect(() => {
        if (!ipcRenderer) return;

        const handleStatus = (event, data) => {
            if (data.error) {
                setErrorMessage(data.error);
                setVpnStatus('disconnected');
                setVpnIp(null);
                return;
            }
            
            setErrorMessage(null);
            setVpnStatus(data.status);
            if (data.ip) {
                setVpnIp(data.ip);
            } else {
                setVpnIp(null);
            }
        };

        const handleSelectedFile = (event, filePath) => {
            setSelectedConfig(filePath);
            setErrorMessage(null);
        };

        ipcRenderer.on('vpn-status', handleStatus);
        ipcRenderer.on('selected-config-file', handleSelectedFile);

        return () => {
            ipcRenderer.removeAllListeners('vpn-status');
            ipcRenderer.removeAllListeners('selected-config-file');
        };
    }, []);

    const browseFile = () => {
        if (!ipcRenderer) {
            alert('This feature only works in the Electron desktop app!');
            return;
        }
        ipcRenderer.send('select-config-file');
    };

    const toggleConnection = () => {
        if (!ipcRenderer) {
            alert('This feature only works in the Electron desktop app!');
            return;
        }

        let configToUse = selectedConfig;
        if (!configToUse) {
            configToUse = 'C:\\Users\\anand\\vpn\\working-config.ovpn';
        }

        setErrorMessage(null);

        if (vpnStatus === 'disconnected') {
            setVpnStatus('connecting');
            ipcRenderer.send('connect-vpn', { path: configToUse });
        } else {
            setVpnStatus('disconnecting');
            ipcRenderer.send('disconnect-vpn');
        }
    };

    return (
        <div className="vpn-status">
            <div className="status-grid">
                <h2>Real VPN Client</h2>
                <p>OpenVPN Engine is installed and ready.</p>
                
                {errorMessage && (
                    <div style={{ padding: '10px', backgroundColor: '#f44336', color: 'white', borderRadius: '4px', marginBottom: '20px', maxWidth: '400px', textAlign: 'center' }}>
                        {errorMessage}
                    </div>
                )}
                
                <div style={{ margin: '20px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                    <label style={{color: '#94a3b8'}}>Import your .ovpn configuration file:</label>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <input 
                            type="text" 
                            readOnly 
                            value={selectedConfig || 'C:\\Users\\anand\\vpn\\working-config.ovpn (Default)'} 
                            style={{ padding: '10px 15px', borderRadius: '8px', width: '280px', backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                        />
                        <button 
                            onClick={browseFile}
                            disabled={vpnStatus !== 'disconnected'}
                            style={{ padding: '10px 20px', cursor: 'pointer', borderRadius: '8px', backgroundColor: '#3b82f6', color: 'white', border: 'none', fontWeight: 'bold' }}
                        >
                            Browse
                        </button>
                    </div>
                </div>

                <button 
                    className={`connection-button ${vpnStatus === 'connected' ? 'connected' : 'disconnected'}`}
                    onClick={vpnStatus === 'connecting' || vpnStatus === 'disconnecting' ? null : toggleConnection}
                    disabled={vpnStatus === 'connecting' || vpnStatus === 'disconnecting'}
                >
                    {vpnStatus.toUpperCase()}
                </button>

                {vpnStatus === 'connected' && vpnIp && (
                    <div className="status-card" style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
                        <h3>Connection Secured</h3>
                        <p className="status-value" style={{ fontSize: '24px', color: '#4caf50' }}>{vpnIp}</p>
                        <p>Your traffic is now routed through the VPN server. Your real IP is hidden.</p>
                    </div>
                )}

                {vpnStatus === 'disconnected' && (
                    <p style={{ color: '#aaa' }}>Your connection is not protected. Your real IP is visible.</p>
                )}
            </div>
        </div>
    );
}

export default VPNStatus;
