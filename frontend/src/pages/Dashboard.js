import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Chat from '../components/Chat';
import VPNStatus from '../components/VPNStatus';
import NetworkMonitor from '../components/NetworkMonitor';
import ServerSelection from '../components/ServerSelection';
import ProtocolSelection from '../components/ProtocolSelection';
import SecurityFeatures from '../components/SecurityFeatures';
import SpeedTest from '../components/SpeedTest';
import ConnectionLogs from '../components/ConnectionLogs';
import { connectSocket, disconnectSocket } from '../utils/socket';
import './Dashboard.css';

function Dashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('server');
    const [connected, setConnected] = useState(false);
    const [selectedServer, setSelectedServer] = useState(null);
    const [selectedProtocol, setSelectedProtocol] = useState(null);
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    const userId = localStorage.getItem('userId');

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }

        const socket = connectSocket(token);

        socket.on('auth_success', () => {
            setConnected(true);
        });

        socket.on('auth_error', () => {
            setConnected(false);
        });

        return () => {
            // Only disconnect when unmounting
        };
    }, [token, navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
        disconnectSocket();
        navigate('/login');
    };

    const handleServerSelect = (server) => {
        setSelectedServer(server);
    };

    const handleProtocolSelect = (protocol) => {
        setSelectedProtocol(protocol);
    };

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <div className="header-left">
                    <h1> Advanced VPN System</h1>
                    <span className="status-indicator" style={{
                        backgroundColor: connected ? '#10b981' : '#ef4444'
                    }}>
                        {connected ? 'Connected' : 'Disconnected'}
                    </span>
                    {selectedServer && (
                        <span className="server-indicator">
                            {selectedServer.city}
                        </span>
                    )}
                </div>
                <div className="header-right">
                    <span className="username">Welcome, {username}!</span>
                    <button className="btn btn-danger" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </div>

            <div className="dashboard-container">
                <div className="tabs">
                    <button
                        className={`tab-btn ${activeTab === 'server' ? 'active' : ''}`}
                        onClick={() => setActiveTab('server')}
                    >
                        Server Selection
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'protocol' ? 'active' : ''}`}
                        onClick={() => setActiveTab('protocol')}
                    >
                        Protocol
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
                        onClick={() => setActiveTab('security')}
                    >
                        Security
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'vpn' ? 'active' : ''}`}
                        onClick={() => setActiveTab('vpn')}
                    >
                        VPN Status
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'speed' ? 'active' : ''}`}
                        onClick={() => setActiveTab('speed')}
                    >
                        Speed Test
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'chat' ? 'active' : ''}`}
                        onClick={() => setActiveTab('chat')}
                    >
                        Secure Chat
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'monitor' ? 'active' : ''}`}
                        onClick={() => setActiveTab('monitor')}
                    >
                        Network Monitor
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'logs' ? 'active' : ''}`}
                        onClick={() => setActiveTab('logs')}
                    >
                        Connection Logs
                    </button>
                </div>

                <div className="tab-content">
                    {activeTab === 'server' && <ServerSelection token={token} onServerSelect={handleServerSelect} />}
                    {activeTab === 'protocol' && <ProtocolSelection token={token} onProtocolSelect={handleProtocolSelect} />}
                    {activeTab === 'security' && <SecurityFeatures token={token} />}
                    {activeTab === 'vpn' && <VPNStatus />}
                    {activeTab === 'speed' && <SpeedTest token={token} />}
                    {activeTab === 'chat' && <Chat />}
                    {activeTab === 'monitor' && <NetworkMonitor />}
                    {activeTab === 'logs' && <ConnectionLogs token={token} userId={userId} />}
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
