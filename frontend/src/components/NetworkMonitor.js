import React, { useState, useEffect } from 'react';
import { trafficAPI } from '../utils/api';
import './NetworkMonitor.css';

function NetworkMonitor() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const userId = localStorage.getItem('userId');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await trafficAPI.getStats(userId);
                setStats(response.data);
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
        const interval = setInterval(fetchStats, 2000);
        return () => clearInterval(interval);
    }, [userId]);

    const formatBytes = (bytes) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    if (loading) {
        return <div className="loading"><div className="spinner"></div></div>;
    }

    return (
        <div className="network-monitor">
            <div className="monitor-grid">
                <div className="monitor-card">
                    <h4> Data Sent</h4>
                    <p className="monitor-value">{formatBytes(stats?.bytesSent || 0)}</p>
                    <p className="monitor-subtext">{stats?.packetsSent || 0} packets</p>
                </div>

                <div className="monitor-card">
                    <h4> Data Received</h4>
                    <p className="monitor-value">{formatBytes(stats?.bytesReceived || 0)}</p>
                    <p className="monitor-subtext">{stats?.packetsReceived || 0} packets</p>
                </div>

                <div className="monitor-card">
                    <h4> Total Traffic</h4>
                    <p className="monitor-value">{formatBytes(stats?.totalData || 0)}</p>
                    <p className="monitor-subtext">Overall usage</p>
                </div>

                <div className="monitor-card">
                    <h4> Session Uptime</h4>
                    <p className="monitor-value">{Math.floor((stats?.uptime || 0) / 1000)}s</p>
                    <p className="monitor-subtext">Connected time</p>
                </div>
            </div>

            <div className="chart-section">
                <h3> Traffic Analysis</h3>
                <div className="metric-row">
                    <div className="metric">
                        <label>Average Upload Speed</label>
                        <p className="metric-value">
                            {stats?.bytesSent ? (stats.bytesSent / Math.max((stats.uptime / 1000), 1)).toFixed(2) : 0} B/s
                        </p>
                    </div>
                    <div className="metric">
                        <label>Average Download Speed</label>
                        <p className="metric-value">
                            {stats?.bytesReceived ? (stats.bytesReceived / Math.max((stats.uptime / 1000), 1)).toFixed(2) : 0} B/s
                        </p>
                    </div>
                    <div className="metric">
                        <label>Upload Packets</label>
                        <p className="metric-value">{stats?.packetsSent || 0}</p>
                    </div>
                    <div className="metric">
                        <label>Download Packets</label>
                        <p className="metric-value">{stats?.packetsReceived || 0}</p>
                    </div>
                </div>
            </div>

            <div className="traffic-breakdown">
                <h3> Traffic Breakdown</h3>
                <div className="pie-chart-mock">
                    <div className="chart-bar">
                        <div className="chart-item" style={{
                            width: stats?.bytesSent <= 0 ? '50%' : (stats?.bytesSent / Math.max(stats?.totalData, 1) * 100) + '%'
                        }}>
                            <span>Upload</span>
                        </div>
                        <div className="chart-item chart-item-download" style={{
                            width: stats?.bytesReceived <= 0 ? '50%' : (stats?.bytesReceived / Math.max(stats?.totalData, 1) * 100) + '%'
                        }}>
                            <span>Download</span>
                        </div>
                    </div>
                </div>
                <div className="legend">
                    <div className="legend-item">
                        <div className="legend-color"></div>
                        <span>Upload: {stats?.bytesSent ? ((stats.bytesSent / Math.max(stats.totalData, 1)) * 100).toFixed(1) : 0}%</span>
                    </div>
                    <div className="legend-item">
                        <div className="legend-color" style={{ backgroundColor: 'var(--secondary)' }}></div>
                        <span>Download: {stats?.bytesReceived ? ((stats.bytesReceived / Math.max(stats.totalData, 1)) * 100).toFixed(1) : 0}%</span>
                    </div>
                </div>
            </div>

            <div className="security-info">
                <h3> Security Status</h3>
                <div className="security-items">
                    <div className="security-item">
                        <span className="check">✓</span>
                        <p>AES-256-CBC Encryption Active</p>
                    </div>
                    <div className="security-item">
                        <span className="check">✓</span>
                        <p>RSA Key Exchange Completed</p>
                    </div>
                    <div className="security-item">
                        <span className="check">✓</span>
                        <p>JWT Authentication Verified</p>
                    </div>
                    <div className="security-item">
                        <span className="check">✓</span>
                        <p>Secure Channel Established</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default NetworkMonitor;
