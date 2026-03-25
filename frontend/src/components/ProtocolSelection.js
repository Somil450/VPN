import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProtocolSelection.css';

function ProtocolSelection({ token, onProtocolSelect }) {
    const [protocols, setProtocols] = useState([]);
    const [selectedProtocol, setSelectedProtocol] = useState(null);
    const [loading, setLoading] = useState(true);
    const [connecting, setConnecting] = useState(false);

    useEffect(() => {
        fetchProtocols();
    }, []);

    const fetchProtocols = async () => {
        try {
            const response = await axios.get('http://localhost:3001/api/vpn/protocols');
            setProtocols(response.data.protocols);

            // Set default protocol (WireGuard - most popular)
            const defaultProtocol = response.data.protocols.find(p => p.id === 'wireguard');
            if (defaultProtocol) {
                setSelectedProtocol(defaultProtocol);
                onProtocolSelect(defaultProtocol);
            }
        } catch (error) {
            console.error('Failed to fetch protocols:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleProtocolSelect = async (protocol) => {
        if (connecting) return;

        setConnecting(true);
        try {
            const response = await axios.post('http://localhost:3001/api/vpn/select-protocol', {
                token,
                protocolId: protocol.id
            });

            if (response.data.success) {
                setSelectedProtocol(response.data.protocol);
                onProtocolSelect(response.data.protocol);
            }
        } catch (error) {
            console.error('Failed to select protocol:', error);
        } finally {
            setConnecting(false);
        }
    };

    const getSecurityBadgeColor = (security) => {
        switch (security) {
            case 'High': return '#10b981';
            case 'Medium': return '#f59e0b';
            default: return '#ef4444';
        }
    };

    const getSpeedBadgeColor = (speed) => {
        switch (speed) {
            case 'Fast': return '#10b981';
            case 'Medium': return '#f59e0b';
            case 'Slow': return '#ef4444';
            default: return '#6b7280';
        }
    };

    if (loading) {
        return (
            <div className="protocol-selection">
                <div className="loading">Loading protocols...</div>
            </div>
        );
    }

    return (
        <div className="protocol-selection">
            <div className="protocol-selection-header">
                <h3> Connection Protocol</h3>
                <p>Choose your preferred VPN protocol for optimal security and speed</p>
            </div>

            <div className="current-protocol">
                {selectedProtocol && (
                    <div className="selected-protocol-info">
                        <div className="protocol-icon"></div>
                        <div className="protocol-details">
                            <div className="protocol-name">{selectedProtocol.name}</div>
                            <div className="protocol-encryption">Encryption: {selectedProtocol.encryption}</div>
                            <div className="protocol-port">Port: {selectedProtocol.port}</div>
                        </div>
                        <div className="protocol-badges">
                            <span className="badge" style={{ backgroundColor: getSecurityBadgeColor(selectedProtocol.security) }}>
                                {selectedProtocol.security} Security
                            </span>
                            <span className="badge" style={{ backgroundColor: getSpeedBadgeColor(selectedProtocol.speed) }}>
                                {selectedProtocol.speed} Speed
                            </span>
                        </div>
                    </div>
                )}
            </div>

            <div className="protocols-grid">
                {protocols.map((protocol) => (
                    <div
                        key={protocol.id}
                        className={`protocol-card ${selectedProtocol?.id === protocol.id ? 'selected' : ''}`}
                        onClick={() => handleProtocolSelect(protocol)}
                    >
                        <div className="protocol-header">
                            <h4>{protocol.name}</h4>
                            {selectedProtocol?.id === protocol.id && (
                                <div className="selected-indicator">✓</div>
                            )}
                        </div>

                        <div className="protocol-specs">
                            <div className="spec">
                                <span className="spec-label">Encryption</span>
                                <span className="spec-value">{protocol.encryption}</span>
                            </div>
                            <div className="spec">
                                <span className="spec-label">Port</span>
                                <span className="spec-value">{protocol.port}</span>
                            </div>
                        </div>

                        <div className="protocol-characteristics">
                            <div className="characteristic">
                                <span className="char-label">Security</span>
                                <span className="char-badge" style={{ backgroundColor: getSecurityBadgeColor(protocol.security) }}>
                                    {protocol.security}
                                </span>
                            </div>
                            <div className="characteristic">
                                <span className="char-label">Speed</span>
                                <span className="char-badge" style={{ backgroundColor: getSpeedBadgeColor(protocol.speed) }}>
                                    {protocol.speed}
                                </span>
                            </div>
                        </div>

                        <div className="protocol-description">
                            {protocol.id === 'wireguard' && 'Modern, fast, and secure protocol with excellent performance.'}
                            {protocol.id === 'openvpn' && 'Industry standard protocol with strong security and wide compatibility.'}
                            {protocol.id === 'ikev2' && 'Fast and reliable protocol, great for mobile devices.'}
                            {protocol.id === 'l2tp' && 'Older protocol with basic security, not recommended for privacy.'}
                        </div>

                        {selectedProtocol?.id === protocol.id && (
                            <div className="selected-overlay">
                                <div className="selected-check">✓</div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {connecting && (
                <div className="connecting-overlay">
                    <div className="connecting-spinner"></div>
                    <p>Switching protocol...</p>
                </div>
            )}
        </div>
    );
}

export default ProtocolSelection;
