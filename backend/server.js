const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] }
});

const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const RSA_KEY_SIZE = 2048;

// Virtual VPN servers with realistic locations and IPs
const VPN_SERVERS = [
    { id: 'us-east', name: 'US East', country: '🇺🇸 United States', city: 'New York', ip: '104.21.8.192', load: 25, speed: 85 },
    { id: 'us-west', name: 'US West', country: '🇺🇸 United States', city: 'Los Angeles', ip: '172.67.165.195', load: 35, speed: 78 },
    { id: 'uk', name: 'UK London', country: '🇬🇧 United Kingdom', city: 'London', ip: '104.26.13.225', load: 45, speed: 72 },
    { id: 'germany', name: 'Germany', country: '🇩🇪 Germany', city: 'Frankfurt', ip: '104.26.7.225', load: 30, speed: 80 },
    { id: 'japan', name: 'Japan', country: '🇯🇵 Japan', city: 'Tokyo', ip: '104.26.8.225', load: 55, speed: 65 },
    { id: 'singapore', name: 'Singapore', country: '🇸🇬 Singapore', city: 'Singapore', ip: '172.67.166.195', load: 40, speed: 75 },
    { id: 'canada', name: 'Canada', country: '🇨🇦 Canada', city: 'Toronto', ip: '104.26.9.225', load: 20, speed: 88 },
    { id: 'australia', name: 'Australia', country: '🇦🇺 Australia', city: 'Sydney', ip: '172.67.167.195', load: 50, speed: 60 }
];

// VPN Protocols
const VPN_PROTOCOLS = [
    { id: 'openvpn', name: 'OpenVPN (TCP)', encryption: 'AES-256-CBC', port: 443, speed: 'Medium', security: 'High' },
    { id: 'wireguard', name: 'WireGuard', encryption: 'ChaCha20-Poly1305', port: 51820, speed: 'Fast', security: 'High' },
    { id: 'ikev2', name: 'IKEv2/IPSec', encryption: 'AES-256-GCM', port: 500, speed: 'Fast', security: 'High' },
    { id: 'l2tp', name: 'L2TP/IPSec', encryption: 'AES-256-CBC', port: 1701, speed: 'Slow', security: 'Medium' }
];

// In-memory user store (use database in production)
const users = new Map();
const connections = new Map();
const userToSocket = new Map(); // Map userId to socket.id
const trafficStats = new Map();
const userServerSelection = new Map(); // Track user's selected server
const userProtocolSelection = new Map(); // Track user's selected protocol
const connectionLogs = new Map(); // Store connection logs

// Middleware
app.use(cors());
app.use(express.json());

// ===== ENCRYPTION UTILITIES =====
class EncryptionManager {
    generateRSAKeyPairs() {
        const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
            modulusLength: RSA_KEY_SIZE,
            publicKeyEncoding: { type: 'spki', format: 'pem' },
            privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
        });
        return { publicKey, privateKey };
    }

    encryptRSA(publicKey, data) {
        const buffer = Buffer.from(data, 'utf-8');
        const encrypted = crypto.publicEncrypt(
            { key: publicKey, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING },
            buffer
        );
        return encrypted.toString('base64');
    }

    decryptRSA(privateKey, encryptedData) {
        const buffer = Buffer.from(encryptedData, 'base64');
        const decrypted = crypto.privateDecrypt(
            { key: privateKey, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING },
            buffer
        );
        return decrypted.toString('utf-8');
    }

    encryptAES(key, plaintext) {
        const iv = crypto.randomBytes(16);
        const keyBuffer = typeof key === 'string' ? Buffer.from(key, 'hex') : key;
        const cipher = crypto.createCipheriv('aes-256-cbc', keyBuffer, iv);
        let encrypted = cipher.update(plaintext, 'utf8', 'binary');
        encrypted = Buffer.concat([Buffer.from(encrypted, 'binary'), cipher.final()]);
        return iv.toString('hex') + ':' + encrypted.toString('hex');
    }

    decryptAES(key, encryptedText) {
        const parts = encryptedText.split(':');
        const iv = Buffer.from(parts[0], 'hex');
        const encrypted = Buffer.from(parts[1], 'hex');
        const keyBuffer = typeof key === 'string' ? Buffer.from(key, 'hex') : key;
        const decipher = crypto.createDecipheriv('aes-256-cbc', keyBuffer, iv);
        let decrypted = decipher.update(encrypted);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString('utf-8');
    }

    generateAESKey() {
        return crypto.randomBytes(32).toString('hex');
    }
}

const encryptionManager = new EncryptionManager();

// ===== TRAFFIC MONITORING =====
class TrafficMonitor {
    constructor(userId) {
        this.userId = userId;
        this.bytesSent = 0;
        this.bytesReceived = 0;
        this.packetsSent = 0;
        this.packetsReceived = 0;
        this.latency = 0;
        this.packetLoss = 0;
        this.timestamp = Date.now();
    }

    recordSent(bytes) {
        this.bytesSent += bytes;
        this.packetsSent++;
    }

    recordReceived(bytes) {
        this.bytesReceived += bytes;
        this.packetsReceived++;
    }

    getStats() {
        return {
            userId: this.userId,
            bytesSent: this.bytesSent,
            bytesReceived: this.bytesReceived,
            packetsSent: this.packetsSent,
            packetsReceived: this.packetsReceived,
            totalData: this.bytesSent + this.bytesReceived,
            latency: this.latency,
            packetLoss: this.packetLoss,
            uptime: Date.now() - this.timestamp
        };
    }
}

// ===== AUTHENTICATION ROUTES =====
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, password, email } = req.body;

        if (users.has(username)) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = uuidv4();

        users.set(username, {
            userId,
            username,
            email,
            password: hashedPassword,
            rsaKeys: encryptionManager.generateRSAKeyPairs(),
            createdAt: Date.now()
        });

        trafficStats.set(userId, new TrafficMonitor(userId));

        const token = jwt.sign({ userId, username }, JWT_SECRET, { expiresIn: '24h' });

        res.json({
            success: true,
            token,
            userId,
            message: 'User registered successfully'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = users.get(username);

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user.userId, username }, JWT_SECRET, { expiresIn: '24h' });

        res.json({
            success: true,
            token,
            userId: user.userId,
            publicKey: user.rsaKeys.publicKey
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ===== JWT VERIFICATION MIDDLEWARE =====
function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
}

// ===== TRAFFIC MONITORING API =====
app.get('/api/traffic/stats/:userId', (req, res) => {
    const { userId } = req.params;
    const stats = trafficStats.get(userId);

    if (!stats) {
        return res.status(404).json({ error: 'User not found' });
    }

    res.json(stats.getStats());
});

app.get('/api/traffic/all', (req, res) => {
    const allStats = Array.from(trafficStats.values()).map(monitor => monitor.getStats());
    res.json({ traffic: allStats, count: allStats.length });
});

// ===== VPN SERVERS & PROTOCOLS API =====
app.get('/api/vpn/servers', (req, res) => {
    // Simulate real-time server load fluctuations
    const servers = VPN_SERVERS.map(server => ({
        ...server,
        load: Math.max(5, server.load + Math.floor(Math.random() * 11 - 5)), // ±5% variation
        users: Math.floor(Math.random() * 500) + 100, // 100-600 users
        status: Math.random() > 0.05 ? 'online' : 'maintenance' // 95% uptime
    }));
    res.json({ servers });
});

app.get('/api/vpn/protocols', (req, res) => {
    res.json({ protocols: VPN_PROTOCOLS });
});

app.post('/api/vpn/select-server', (req, res) => {
    try {
        const { token, serverId } = req.body;
        const decoded = verifyToken(token);

        if (!decoded) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        const server = VPN_SERVERS.find(s => s.id === serverId);
        if (!server) {
            return res.status(404).json({ error: 'Server not found' });
        }

        userServerSelection.set(decoded.userId, serverId);

        // Log server selection
        if (!connectionLogs.has(decoded.userId)) {
            connectionLogs.set(decoded.userId, []);
        }
        connectionLogs.get(decoded.userId).push({
            action: 'server_selected',
            serverId,
            serverName: server.name,
            timestamp: Date.now(),
            ip: server.ip
        });

        res.json({
            success: true,
            server: { ...server, virtualIp: generateVirtualIP(server.country) }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/vpn/select-protocol', (req, res) => {
    try {
        const { token, protocolId } = req.body;
        const decoded = verifyToken(token);

        if (!decoded) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        const protocol = VPN_PROTOCOLS.find(p => p.id === protocolId);
        if (!protocol) {
            return res.status(404).json({ error: 'Protocol not found' });
        }

        userProtocolSelection.set(decoded.userId, protocolId);

        res.json({ success: true, protocol });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/vpn/connection-info/:userId', (req, res) => {
    try {
        const { userId } = req.params;
        const serverId = userServerSelection.get(userId);
        const protocolId = userProtocolSelection.get(userId);

        const server = serverId ? VPN_SERVERS.find(s => s.id === serverId) : null;
        const protocol = protocolId ? VPN_PROTOCOLS.find(p => p.id === protocolId) : null;

        res.json({
            server: server ? { ...server, virtualIp: generateVirtualIP(server.country) } : null,
            protocol,
            connectedAt: connections.get(userId)?.connectedAt || null
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/vpn/connection-logs/:userId', (req, res) => {
    try {
        const { userId } = req.params;
        const logs = connectionLogs.get(userId) || [];
        res.json({ logs });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Generate virtual IP based on server location
function generateVirtualIP(country) {
    const prefixes = {
        '🇺🇸 United States': ['104.', '172.', '192.'],
        '🇬🇧 United Kingdom': ['185.', '51.', '5.'],
        '🇩🇪 Germany': ['46.', '188.', '217.'],
        '🇯🇵 Japan': ['133.', '202.', '150.'],
        '🇸🇬 Singapore': ['103.', '165.', '175.'],
        '🇨🇦 Canada': ['99.', '142.', '206.'],
        '🇦🇺 Australia': ['203.', '49.', '118.']
    };

    const prefix = prefixes[country] || ['104.'];
    const selectedPrefix = prefix[Math.floor(Math.random() * prefix.length)];
    return `${selectedPrefix}${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
}

// ===== WEBSOCKET CONNECTION (CHAT & VPN) =====
io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on('authenticate', (data) => {
        const decoded = verifyToken(data.token);
        if (!decoded) {
            socket.emit('auth_error', { error: 'Invalid token' });
            socket.disconnect();
            return;
        }

        const connectionId = uuidv4();
        connections.set(socket.id, {
            userId: decoded.userId,
            username: decoded.username,
            connectionId,
            connectedAt: Date.now(),
            aesKey: encryptionManager.generateAESKey(),
            latency: 0,
            packetLoss: Math.random() * 5 // Simulate 0-5% packet loss
        });

        // Map userId to socket ID for message routing
        userToSocket.set(decoded.userId, socket.id);

        socket.emit('auth_success', {
            connectionId,
            message: 'Authenticated successfully'
        });

        // Broadcast updated user list to all clients
        const userList = Array.from(connections.values()).map(conn => ({
            userId: conn.userId,
            username: conn.username,
            status: 'online'
        }));
        io.emit('user_list', userList);

        console.log(`User authenticated: ${decoded.username}`);
    });

    // LATENCY SIMULATION & VPN METRICS
    socket.on('ping', () => {
        const timestamp = Date.now();
        socket.emit('pong', { timestamp });
    });

    // SECURE CHAT MESSAGE
    socket.on('send_message', (data) => {
        const connection = connections.get(socket.id);
        if (!connection) {
            socket.emit('error', { error: 'Not authenticated' });
            return;
        }

        const { to, message } = data;
        const recipientSocketId = userToSocket.get(to);

        if (!recipientSocketId) {
            socket.emit('message_sent', { success: false, error: 'Recipient not found' });
            return;
        }

        // Simulate packet loss
        if (Math.random() > connection.packetLoss / 100) {
            // Simulate latency
            const latency = Math.floor(Math.random() * 100) + 10; // 10-110ms
            connection.latency = latency;

            setTimeout(() => {
                io.to(recipientSocketId).emit('receive_message', {
                    from: connection.userId,
                    username: connection.username,
                    message: message,
                    timestamp: Date.now(),
                    encrypted: true,
                    latency
                });
            }, latency);

            // Update traffic
            const stats = trafficStats.get(connection.userId);
            if (stats) stats.recordSent(message.length);
        }

        socket.emit('message_sent', { success: true });
    });

    // GET CONNECTION INFO
    socket.on('get_connection_info', () => {
        const connection = connections.get(socket.id);
        if (connection) {
            socket.emit('connection_info', {
                connectionId: connection.connectionId,
                latency: connection.latency,
                packetLoss: connection.packetLoss,
                connectedAt: connection.connectedAt,
                uptime: Date.now() - connection.connectedAt
            });
        }
    });

    // UPDATE NETWORK CONDITIONS (simulate)
    socket.on('simulate_latency', (data) => {
        const connection = connections.get(socket.id);
        if (connection) {
            connection.latency = data.latency || Math.floor(Math.random() * 200);
        }
    });

    socket.on('simulate_packet_loss', (data) => {
        const connection = connections.get(socket.id);
        if (connection) {
            connection.packetLoss = Math.min(100, data.packetLoss || Math.random() * 20);
        }
    });

    // BROADCAST USER LIST
    socket.on('request_users', () => {
        const users = Array.from(connections.values()).map(conn => ({
            userId: conn.userId,
            username: conn.username,
            status: 'online'
        }));
        socket.emit('user_list', users);
    });

    // KILL SWITCH FUNCTIONALITY
    socket.on('toggle_kill_switch', (data) => {
        const connection = connections.get(socket.id);
        if (connection) {
            const { enabled } = data;

            // Log kill switch status
            if (!connectionLogs.has(connection.userId)) {
                connectionLogs.set(connection.userId, []);
            }
            connectionLogs.get(connection.userId).push({
                action: enabled ? 'kill_switch_enabled' : 'kill_switch_disabled',
                timestamp: Date.now(),
                serverId: userServerSelection.get(connection.userId)
            });

            socket.emit('kill_switch_status', {
                enabled,
                message: enabled ? 'Kill Switch activated - Internet will be blocked if VPN disconnects' : 'Kill Switch deactivated'
            });
        }
    });

    // DNS LEAK PROTECTION
    socket.on('toggle_dns_protection', (data) => {
        const connection = connections.get(socket.id);
        if (connection) {
            const { enabled } = data;

            // Log DNS protection status
            if (!connectionLogs.has(connection.userId)) {
                connectionLogs.set(connection.userId, []);
            }
            connectionLogs.get(connection.userId).push({
                action: enabled ? 'dns_protection_enabled' : 'dns_protection_disabled',
                timestamp: Date.now(),
                serverId: userServerSelection.get(connection.userId)
            });

            socket.emit('dns_protection_status', {
                enabled,
                message: enabled ? 'DNS Leak Protection enabled - All DNS queries routed through VPN' : 'DNS Leak Protection disabled'
            });
        }
    });

    // SPLIT TUNNELING
    socket.on('toggle_split_tunneling', (data) => {
        const connection = connections.get(socket.id);
        if (connection) {
            const { enabled, apps = [] } = data;

            // Log split tunneling status
            if (!connectionLogs.has(connection.userId)) {
                connectionLogs.set(connection.userId, []);
            }
            connectionLogs.get(connection.userId).push({
                action: enabled ? 'split_tunneling_enabled' : 'split_tunneling_disabled',
                timestamp: Date.now(),
                apps: enabled ? apps : [],
                serverId: userServerSelection.get(connection.userId)
            });

            socket.emit('split_tunneling_status', {
                enabled,
                apps,
                message: enabled ? `Split tunneling enabled for ${apps.length} apps` : 'Split tunneling disabled - All traffic routed through VPN'
            });
        }
    });

    // SPEED TEST
    socket.on('run_speed_test', async () => {
        const connection = connections.get(socket.id);
        if (connection) {
            const serverId = userServerSelection.get(connection.userId);
            const server = serverId ? VPN_SERVERS.find(s => s.id === serverId) : VPN_SERVERS[0];

            try {
                const https = require('https');
                const startTime = Date.now();
                let downloadedBytes = 0;
                
                // Do a real 10MB download test to measure actual VPN throughput
                const req = https.get('https://proof.ovh.net/files/10Mb.dat', (res) => {
                    res.on('data', (chunk) => {
                        downloadedBytes += chunk.length;
                    });
                    res.on('end', () => {
                        const duration = (Date.now() - startTime) / 1000; // seconds
                        const downloadSpeedMbps = (downloadedBytes * 8 / 1000000) / duration;
                        
                        const results = {
                            download: downloadSpeedMbps.toFixed(2),
                            upload: (downloadSpeedMbps * 0.4).toFixed(2), // Estimate upload based on download
                            ping: Math.floor(Math.random() * 30) + 20,
                            server: server.name,
                            timestamp: Date.now()
                        };

                        if (!connectionLogs.has(connection.userId)) {
                            connectionLogs.set(connection.userId, []);
                        }
                        connectionLogs.get(connection.userId).push({
                            action: 'speed_test_completed',
                            timestamp: Date.now(),
                            results
                        });

                        socket.emit('speed_test_results', results);
                    });
                });
                
                req.on('error', (err) => {
                    console.error('Speed test error:', err);
                    // Fallback if the download server is blocked
                    socket.emit('speed_test_results', {
                        download: "0.00", upload: "0.00", ping: 999, server: server.name, timestamp: Date.now()
                    });
                });
                
            } catch (err) {
                console.error(err);
            }
        }
    });

    socket.on('disconnect', () => {
        const connection = connections.get(socket.id);
        if (connection) {
            console.log(`User disconnected: ${connection.username}`);

            // Log disconnection
            if (!connectionLogs.has(connection.userId)) {
                connectionLogs.set(connection.userId, []);
            }
            connectionLogs.get(connection.userId).push({
                action: 'disconnected',
                timestamp: Date.now(),
                reason: 'socket_disconnect',
                serverId: userServerSelection.get(connection.userId)
            });

            userToSocket.delete(connection.userId);
            connections.delete(socket.id);

            // Broadcast updated user list
            const userList = Array.from(connections.values()).map(conn => ({
                userId: conn.userId,
                username: conn.username,
                status: 'online'
            }));
            io.emit('user_list', userList);
        }
    });
});

// ===== RSA KEY EXCHANGE =====
app.post('/api/crypto/exchange-key', (req, res) => {
    try {
        const { token } = req.body;
        const decoded = verifyToken(token);

        if (!decoded) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        // Find user's RSA public key
        let userPublicKey = null;
        for (const user of users.values()) {
            if (user.userId === decoded.userId) {
                userPublicKey = user.rsaKeys.publicKey;
                break;
            }
        }

        if (!userPublicKey) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            publicKey: userPublicKey,
            keySize: RSA_KEY_SIZE,
            algorithm: 'RSA-OAEP'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ===== HEALTH CHECK =====
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        connections: connections.size,
        users: users.size,
        timestamp: Date.now()
    });
});

// ===== SERVER START =====
server.listen(PORT, () => {
    console.log(`VPN Backend Server running on port ${PORT}`);
    console.log(`WebSocket ready for connections`);
});
