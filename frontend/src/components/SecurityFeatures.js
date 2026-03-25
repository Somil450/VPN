import React, { useState, useEffect } from 'react';
import { connectSocket } from '../utils/socket';
import './SecurityFeatures.css';

function SecurityFeatures({ token }) {
    const [killSwitchEnabled, setKillSwitchEnabled] = useState(false);
    const [dnsProtectionEnabled, setDnsProtectionEnabled] = useState(false);
    const [splitTunnelingEnabled, setSplitTunnelingEnabled] = useState(false);
    const [selectedApps, setSelectedApps] = useState([]);
    const [availableApps] = useState([
        { id: 'browser', name: 'Web Browser', icon: '🌐' },
        { id: 'email', name: 'Email Client', icon: '📧' },
        { id: 'gaming', name: 'Gaming Platform', icon: '🎮' },
        { id: 'streaming', name: 'Streaming Service', icon: '📺' },
        { id: 'social', name: 'Social Media', icon: '💬' },
        { id: 'banking', name: 'Banking App', icon: '🏦' }
    ]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const socket = connectSocket(token);

        socket.on('kill_switch_status', (data) => {
            setKillSwitchEnabled(data.enabled);
            setLoading(false);
        });

        socket.on('dns_protection_status', (data) => {
            setDnsProtectionEnabled(data.enabled);
            setLoading(false);
        });

        socket.on('split_tunneling_status', (data) => {
            setSplitTunnelingEnabled(data.enabled);
            setSelectedApps(data.apps || []);
            setLoading(false);
        });

        return () => {
            socket.off('kill_switch_status');
            socket.off('dns_protection_status');
            socket.off('split_tunneling_status');
        };
    }, [token]);

    const toggleKillSwitch = () => {
        setLoading(true);
        const socket = connectSocket(token);
        socket.emit('toggle_kill_switch', { enabled: !killSwitchEnabled });
    };

    const toggleDNSProtection = () => {
        setLoading(true);
        const socket = connectSocket(token);
        socket.emit('toggle_dns_protection', { enabled: !dnsProtectionEnabled });
    };

    const toggleSplitTunneling = () => {
        setLoading(true);
        const socket = connectSocket(token);
        socket.emit('toggle_split_tunneling', {
            enabled: !splitTunnelingEnabled,
            apps: !splitTunnelingEnabled ? selectedApps : []
        });
    };

    const toggleAppSelection = (appId) => {
        if (selectedApps.includes(appId)) {
            setSelectedApps(selectedApps.filter(id => id !== appId));
        } else {
            setSelectedApps([...selectedApps, appId]);
        }
    };

    const updateSplitTunnelingApps = () => {
        setLoading(true);
        const socket = connectSocket(token);
        socket.emit('toggle_split_tunneling', {
            enabled: true,
            apps: selectedApps
        });
    };

    return (
        <div className="security-features">
            <div className="security-header">
                <h3> Advanced Security Features</h3>
                <p>Configure additional privacy and security settings</p>
            </div>

            <div className="security-grid">
                {/* Kill Switch */}
                <div className="security-card">
                    <div className="security-card-header">
                        <div className="security-icon">⚡</div>
                        <div className="security-info">
                            <h4>Kill Switch</h4>
                            <p>Automatically blocks internet if VPN disconnects</p>
                        </div>
                        <div className="security-toggle">
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={killSwitchEnabled}
                                    onChange={toggleKillSwitch}
                                    disabled={loading}
                                />
                                <span className="slider"></span>
                            </label>
                        </div>
                    </div>
                    <div className="security-status">
                        {killSwitchEnabled ? (
                            <span className="status-active">✓ Active - Internet protected</span>
                        ) : (
                            <span className="status-inactive">⚠ Disabled - No protection</span>
                        )}
                    </div>
                    <div className="security-description">
                        Prevents data leaks if your VPN connection drops unexpectedly.
                        All internet traffic will be blocked until the VPN is reconnected.
                    </div>
                </div>

                {/* DNS Leak Protection */}
                <div className="security-card">
                    <div className="security-card-header">
                        <div className="security-icon"></div>
                        <div className="security-info">
                            <h4>DNS Leak Protection</h4>
                            <p>Routes all DNS queries through VPN tunnel</p>
                        </div>
                        <div className="security-toggle">
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={dnsProtectionEnabled}
                                    onChange={toggleDNSProtection}
                                    disabled={loading}
                                />
                                <span className="slider"></span>
                            </label>
                        </div>
                    </div>
                    <div className="security-status">
                        {dnsProtectionEnabled ? (
                            <span className="status-active">✓ DNS queries secured</span>
                        ) : (
                            <span className="status-inactive">⚠ DNS may leak</span>
                        )}
                    </div>
                    <div className="security-description">
                        Prevents your DNS requests from being exposed to your ISP.
                        All DNS queries are routed through the encrypted VPN tunnel.
                    </div>
                </div>

                {/* Split Tunneling */}
                <div className="security-card split-tunneling">
                    <div className="security-card-header">
                        <div className="security-icon"></div>
                        <div className="security-info">
                            <h4>Split Tunneling</h4>
                            <p>Choose which apps use VPN connection</p>
                        </div>
                        <div className="security-toggle">
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={splitTunnelingEnabled}
                                    onChange={toggleSplitTunneling}
                                    disabled={loading}
                                />
                                <span className="slider"></span>
                            </label>
                        </div>
                    </div>
                    <div className="security-status">
                        {splitTunnelingEnabled ? (
                            <span className="status-active"> {selectedApps.length} apps configured</span>
                        ) : (
                            <span className="status-inactive">All traffic through VPN</span>
                        )}
                    </div>
                    <div className="security-description">
                        Select specific applications to route through the VPN while
                        others use your regular internet connection.
                    </div>

                    {splitTunnelingEnabled && (
                        <div className="split-tunneling-apps">
                            <h5>Select Apps for VPN:</h5>
                            <div className="apps-grid">
                                {availableApps.map((app) => (
                                    <div
                                        key={app.id}
                                        className={`app-item ${selectedApps.includes(app.id) ? 'selected' : ''}`}
                                        onClick={() => toggleAppSelection(app.id)}
                                    >
                                        <span className="app-icon">{app.icon}</span>
                                        <span className="app-name">{app.name}</span>
                                        {selectedApps.includes(app.id) && (
                                            <span className="app-selected">✓</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <button
                                className="update-apps-btn"
                                onClick={updateSplitTunnelingApps}
                                disabled={loading}
                            >
                                Update Apps Selection
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {loading && (
                <div className="security-loading">
                    <div className="loading-spinner"></div>
                    <p>Updating security settings...</p>
                </div>
            )}
        </div>
    );
}

export default SecurityFeatures;
