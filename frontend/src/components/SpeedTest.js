import React, { useState, useEffect } from 'react';
import { connectSocket } from '../utils/socket';
import './SpeedTest.css';

function SpeedTest({ token }) {
    const [isRunning, setIsRunning] = useState(false);
    const [results, setResults] = useState(null);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const socket = connectSocket(token);

        socket.on('speed_test_results', (data) => {
            setResults(data);
            setIsRunning(false);
            setProgress(100);
        });

        return () => {
            socket.off('speed_test_results');
        };
    }, [token]);

    const runSpeedTest = () => {
        setIsRunning(true);
        setProgress(0);
        setResults(null);

        const socket = connectSocket(token);
        socket.emit('run_speed_test');

        // Simulate progress
        const progressInterval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 90) {
                    clearInterval(progressInterval);
                    return 90;
                }
                return prev + Math.random() * 15;
            });
        }, 500);

        // Clear interval after 10 seconds
        setTimeout(() => clearInterval(progressInterval), 10000);
    };

    const getSpeedColor = (speed) => {
        if (speed >= 50) return '#10b981';
        if (speed >= 20) return '#f59e0b';
        return '#ef4444';
    };

    const getSpeedGrade = (speed) => {
        if (speed >= 80) return 'Excellent';
        if (speed >= 50) return 'Good';
        if (speed >= 20) return 'Fair';
        return 'Poor';
    };

    const formatSpeed = (speed) => {
        return parseFloat(speed).toFixed(2);
    };

    return (
        <div className="speed-test">
            <div className="speed-test-header">
                <h3> Connection Speed Test</h3>
                <p>Test your VPN connection speed and performance</p>
            </div>

            <div className="speed-test-content">
                <div className="speed-test-main">
                    <div className="speed-display">
                        {isRunning ? (
                            <div className="speed-running">
                                <div className="speed-circle">
                                    <div className="progress-ring">
                                        <svg className="progress-svg" width="200" height="200">
                                            <circle
                                                className="progress-background"
                                                cx="100"
                                                cy="100"
                                                r="90"
                                                fill="none"
                                                stroke="#374151"
                                                strokeWidth="8"
                                            />
                                            <circle
                                                className="progress-bar"
                                                cx="100"
                                                cy="100"
                                                r="90"
                                                fill="none"
                                                stroke="#3b82f6"
                                                strokeWidth="8"
                                                strokeLinecap="round"
                                                style={{
                                                    strokeDasharray: `${2 * Math.PI * 90}`,
                                                    strokeDashoffset: `${2 * Math.PI * 90 * (1 - progress / 100)}`,
                                                    transform: 'rotate(-90deg)',
                                                    transformOrigin: 'center'
                                                }}
                                            />
                                        </svg>
                                        <div className="progress-text">
                                            <div className="progress-percentage">{Math.round(progress)}%</div>
                                            <div className="progress-label">Testing...</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="testing-phases">
                                    <div className={`phase ${progress >= 25 ? 'active' : ''}`}>Connecting</div>
                                    <div className={`phase ${progress >= 50 ? 'active' : ''}`}>Download</div>
                                    <div className={`phase ${progress >= 75 ? 'active' : ''}`}>Upload</div>
                                    <div className={`phase ${progress >= 100 ? 'active' : ''}`}>Complete</div>
                                </div>
                            </div>
                        ) : results ? (
                            <div className="speed-results">
                                <div className="speed-circle">
                                    <div className="speed-value" style={{ color: getSpeedColor(results.download) }}>
                                        {formatSpeed(results.download)}
                                    </div>
                                    <div className="speed-unit">Mbps</div>
                                    <div className="speed-grade" style={{ color: getSpeedColor(results.download) }}>
                                        {getSpeedGrade(results.download)}
                                    </div>
                                </div>
                                <div className="server-info">
                                    <div className="server-name">{results.server}</div>
                                    <div className="ping">Ping: {results.ping}ms</div>
                                </div>
                            </div>
                        ) : (
                            <div className="speed-ready">
                                <div className="speed-circle">
                                    <div className="ready-icon"></div>
                                    <div className="ready-text">Ready to Test</div>
                                </div>
                                <div className="ready-description">
                                    Click the button below to test your connection speed
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="speed-details">
                        {results && (
                            <div className="speed-metrics">
                                <div className="metric-card download">
                                    <div className="metric-icon"></div>
                                    <div className="metric-info">
                                        <div className="metric-label">Download</div>
                                        <div className="metric-value" style={{ color: getSpeedColor(results.download) }}>
                                            {formatSpeed(results.download)} Mbps
                                        </div>
                                    </div>
                                </div>

                                <div className="metric-card upload">
                                    <div className="metric-icon"></div>
                                    <div className="metric-info">
                                        <div className="metric-label">Upload</div>
                                        <div className="metric-value" style={{ color: getSpeedColor(results.upload) }}>
                                            {formatSpeed(results.upload)} Mbps
                                        </div>
                                    </div>
                                </div>

                                <div className="metric-card ping">
                                    <div className="metric-icon"></div>
                                    <div className="metric-info">
                                        <div className="metric-label">Ping</div>
                                        <div className="metric-value" style={{ color: results.ping < 50 ? '#10b981' : results.ping < 100 ? '#f59e0b' : '#ef4444' }}>
                                            {results.ping} ms
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="speed-test-actions">
                    <button
                        className={`speed-test-btn ${isRunning ? 'running' : ''}`}
                        onClick={runSpeedTest}
                        disabled={isRunning}
                    >
                        {isRunning ? (
                            <>
                                <div className="btn-spinner"></div>
                                Testing Connection...
                            </>
                        ) : (
                            <>
                                ⚡ Start Speed Test
                            </>
                        )}
                    </button>

                    {results && (
                        <div className="test-info">
                            <div className="test-time">
                                Last test: {new Date(results.timestamp).toLocaleTimeString()}
                            </div>
                            <div className="test-server">
                                Server: {results.server}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default SpeedTest;
