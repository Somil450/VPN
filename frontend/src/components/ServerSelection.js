import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ServerSelection.css';

function ServerSelection({ token, onServerSelect }) {
    const [servers, setServers] = useState([]);
    const [selectedServer, setSelectedServer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [connecting, setConnecting] = useState(false);

    useEffect(() => {
        fetchServers();
        const interval = setInterval(fetchServers, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchServers = async () => {
        try {
            const response = await axios.get('http://localhost:3001/api/vpn/servers');
            setServers(response.data.servers);

            // Set default server if none selected
            if (!selectedServer && response.data.servers.length > 0) {
                const bestServer = response.data.servers.reduce((best, server) =>
                    server.load < best.load ? server : best
                );
                setSelectedServer(bestServer);
            }
        } catch (error) {
            console.error('Failed to fetch servers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleServerClick = async (server) => {
        if (connecting) return;

        setConnecting(true);
        try {
            const response = await axios.post('http://localhost:3001/api/vpn/select-server', {
                token,
                serverId: server.id
            });

            if (response.data.success) {
                setSelectedServer(response.data.server);
                onServerSelect(response.data.server);
            }
        } catch (error) {
            console.error('Failed to select server:', error);
        } finally {
            setConnecting(false);
        }
    };

    const getServerStatusColor = (status) => {
        switch (status) {
            case 'online': return '#10b981';
            case 'maintenance': return '#f59e0b';
            default: return '#ef4444';
        }
    };

    const getLoadColor = (load) => {
        if (load < 30) return '#10b981';
        if (load < 60) return '#f59e0b';
        return '#ef4444';
    };

    if (loading) {
        return (
            <div className="server-selection">
                <div className="loading">Loading servers...</div>
            </div>
        );
    }

    return (
        <div className="server-selection">
            <div className="server-selection-header">
                <h3> Select VPN Server</h3>
                <p>Choose from our global network of secure servers</p>
            </div>

            <div className="current-server">
                {selectedServer && (
                    <div className="selected-server-info">
                        <div className="server-flag">{selectedServer.country.split(' ')[0]}</div>
                        <div className="server-details">
                            <div className="server-name">{selectedServer.name}</div>
                            <div className="server-location">{selectedServer.city}, {selectedServer.country.split(' ')[1]}</div>
                            <div className="server-ip">Virtual IP: {selectedServer.virtualIp}</div>
                        </div>
                        <div className="server-status">
                            <div className="status-dot" style={{ backgroundColor: getServerStatusColor(selectedServer.status) }}></div>
                            <span>{selectedServer.status}</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="servers-grid">
                {servers.map((server) => (
                    <div
                        key={server.id}
                        className={`server-card ${selectedServer?.id === server.id ? 'selected' : ''}`}
                        onClick={() => handleServerClick(server)}
                    >
                        <div className="server-header">
                            <div className="server-flag">{server.country.split(' ')[0]}</div>
                            <div className="server-status">
                                <div className="status-dot" style={{ backgroundColor: getServerStatusColor(server.status) }}></div>
                            </div>
                        </div>

                        <div className="server-info">
                            <h4>{server.name}</h4>
                            <p className="location">{server.city}</p>
                            <p className="ip">{server.ip}</p>
                        </div>

                        <div className="server-metrics">
                            <div className="metric">
                                <span className="metric-label">Load</span>
                                <div className="metric-bar">
                                    <div
                                        className="metric-fill"
                                        style={{
                                            width: `${server.load}%`,
                                            backgroundColor: getLoadColor(server.load)
                                        }}
                                    ></div>
                                </div>
                                <span className="metric-value">{server.load}%</span>
                            </div>

                            <div className="metric">
                                <span className="metric-label">Speed</span>
                                <span className="metric-value">{server.speed} Mbps</span>
                            </div>

                            <div className="metric">
                                <span className="metric-label">Users</span>
                                <span className="metric-value">{server.users}</span>
                            </div>
                        </div>

                        {selectedServer?.id === server.id && (
                            <div className="selected-badge">
                                Connected
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {connecting && (
                <div className="connecting-overlay">
                    <div className="connecting-spinner"></div>
                    <p>Connecting to server...</p>
                </div>
            )}
        </div>
    );
}

export default ServerSelection;
