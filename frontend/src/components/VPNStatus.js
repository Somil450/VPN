import React, { useState, useEffect } from 'react';
import { getConnectionInfo, simulateLatency, simulatePacketLoss } from '../utils/socket';
import './VPNStatus.css';

function VPNStatus() {
    const [vpnInfo, setVpnInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [simLatency, setSimLatency] = useState(0);
    const [simPacketLoss, setSimPacketLoss] = useState(0);

    useEffect(() => {
        const fetchInfo = async () => {
            try {
                const info = await getConnectionInfo();
                setVpnInfo(info);
                setSimLatency(info.latency);
                setSimPacketLoss(info.packetLoss);
            } catch (error) {
                console.error('Failed to fetch connection info:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchInfo();
        const interval = setInterval(fetchInfo, 2000);
        return () => clearInterval(interval);
    }, []);

    const handleLatencyChange = (e) => {
        const value = parseInt(e.target.value);
        setSimLatency(value);
        simulateLatency(value);
    };

    const handlePacketLossChange = (e) => {
        const value = parseInt(e.target.value);
        setSimPacketLoss(value);
        simulatePacketLoss(value);
    };

    if (loading) {
        return <div className="loading"><div className="spinner"></div></div>;
    }

    return (
        <div className="vpn-status">
            <div className="status-grid">
                <div className="status-card">
                    <h3> Connection ID</h3>
                    <p className="connection-id">{vpnInfo?.connectionId?.substring(0, 16)}...</p>
                </div>

                <div className="status-card">
                    <h3> Latency</h3>
                    <p className="status-value">{vpnInfo?.latency || 0}ms</p>
                </div>

                <div className="status-card">
                    <h3> Packet Loss</h3>
                    <p className="status-value">{vpnInfo?.packetLoss?.toFixed(2) || 0}%</p>
                </div>

                <div className="status-card">
                    <h3> Uptime</h3>
                    <p className="status-value">{Math.floor((vpnInfo?.uptime || 0) / 1000)}s</p>
                </div>
            </div>

            <div className="simulation-section">
                <h3> Network Simulation</h3>

                <div className="simulation-control">
                    <label>Simulate Latency (ms)</label>
                    <div className="slider-container">
                        <input
                            type="range"
                            min="0"
                            max="500"
                            value={simLatency}
                            onChange={handleLatencyChange}
                            className="slider"
                        />
                        <span className="slider-value">{simLatency}ms</span>
                    </div>
                </div>

                <div className="simulation-control">
                    <label>Simulate Packet Loss (%)</label>
                    <div className="slider-container">
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={simPacketLoss}
                            onChange={handlePacketLossChange}
                            className="slider"
                        />
                        <span className="slider-value">{simPacketLoss.toFixed(1)}%</span>
                    </div>
                </div>
            </div>

            <div className="encryption-section">
                <h3> Encryption Info</h3>
                <div className="encryption-details">
                    <p><strong>Protocol:</strong> TLS 1.3</p>
                    <p><strong>Key Exchange:</strong> RSA-OAEP (2048-bit)</p>
                    <p><strong>Data Encryption:</strong> AES-256-CBC</p>
                    <p><strong>Status:</strong> <span className="badge badge-success">Secured</span></p>
                </div>
            </div>
        </div>
    );
}

export default VPNStatus;
