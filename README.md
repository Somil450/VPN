# VPN Simulation System 🛡️

A complete VPN simulation system with secure chat, encryption, and network monitoring. Built with Node.js backend and React.js frontend.

## Features 🚀

### Backend
- ✅ **WebSocket Communication**: Real-time chat and VPN status updates
- ✅ **JWT Authentication**: Secure user authentication
- ✅ **AES-256-CBC Encryption**: Data encryption for messages
- ✅ **RSA Key Exchange**: 2048-bit RSA key pair generation and exchange
- ✅ **Latency Simulation**: Configurable network latency
- ✅ **Packet Loss Simulation**: Simulate network packet loss
- ✅ **Traffic Monitoring**: Track bytes sent/received and packet counts
- ✅ **User Management**: Registration and login with bcrypt hashing

### Frontend
- ✅ **Login/Register**: User authentication pages
- ✅ **Secure Chat**: Real-time encrypted messaging
- ✅ **VPN Status Dashboard**: Connection info, latency, packet loss simulation
- ✅ **Network Monitor**: Traffic statistics and visualization
- ✅ **User List**: See online users
- ✅ **Responsive Design**: Works on desktop and mobile

## Project Structure

```
vpn/
├── backend/
│   ├── server.js
│   ├── package.json
│   └── .env
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── Chat.js
    │   │   ├── VPNStatus.js
    │   │   └── NetworkMonitor.js
    │   ├── pages/
    │   │   ├── Login.js
    │   │   ├── Register.js
    │   │   └── Dashboard.js
    │   ├── utils/
    │   │   ├── api.js
    │   │   ├── socket.js
    │   │   └── crypto.js
    │   ├── App.js
    │   └── index.js
    └── package.json
```

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Backend Setup

```bash
cd backend
npm install
npm start
```

The backend will start on `http://localhost:3001`

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

The frontend will open on `http://localhost:3000`

## Environment Variables

### Backend (.env)
```
PORT=3001
JWT_SECRET=your-super-secret-jwt-key-change-in-production
NODE_ENV=development
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/crypto/exchange-key` - Exchange RSA public key

### Traffic Monitoring
- `GET /api/traffic/stats/:userId` - Get user traffic statistics
- `GET /api/traffic/all` - Get all users' traffic statistics

### Health
- `GET /api/health` - Check server health

## WebSocket Events

### Client → Server
- `authenticate` - Authenticate with JWT token
- `send_message` - Send encrypted message to another user
- `get_connection_info` - Request connection information
- `simulate_latency` - Set simulated latency
- `simulate_packet_loss` - Set simulated packet loss
- `request_users` - Request list of online users
- `ping` - Ping the server (for latency measurement)

### Server → Client
- `auth_success` - Authentication successful
- `auth_error` - Authentication failed
- `receive_message` - Receive encrypted message
- `message_sent` - Message was sent
- `connection_info` - Connection information
- `user_list` - List of online users
- `pong` - Pong response

## Encryption & Security

### AES-256-CBC
Used for encrypting messages in transit:
- 256-bit key
- IV (Initialization Vector) is randomly generated for each message
- Format: `iv:encryptedData` (both in hex)

### RSA-OAEP
Used for key exchange:
- 2048-bit key pairs
- OAEP padding for enhanced security

### JWT
Used for authentication:
- HS256 algorithm
- 24-hour expiration
- Contains userId and username

### bcryptjs
Used for password hashing:
- 10 salt rounds
- Industry-standard password hashing

## Usage

1. **Register/Login**: Create an account or login with existing credentials
2. **Connect**: You'll automatically connect via WebSocket after login
3. **Chat**: Select an online user and send encrypted messages
4. **Monitor VPN Status**: View connection metrics and simulate network conditions
5. **Track Traffic**: Monitor data sent/received in the Network Monitor

## Network Simulation

### Simulate Latency
Adjust the latency slider (0-500ms) to simulate network delay. This affects how long messages take to arrive.

### Simulate Packet Loss
Adjust the packet loss slider (0-100%) to simulate network packet loss. Some messages will fail to deliver.

## Security Considerations ⚠️

This is a simulation for educational purposes. For production use:
1. Change JWT_SECRET to a strong random string
2. Use HTTPS/WSS (WebSocket Secure)
3. Implement rate limiting
4. Add input validation and sanitization
5. Use a proper database instead of in-memory storage
6. Implement CORS properly for production domain
7. Add logging and monitoring
8. Set secure cookies with httpOnly flag

## Technologies Used

### Backend
- Express.js - Web framework
- Socket.io - Real-time communication
- JWT - Authentication
- bcryptjs - Password hashing
- Crypto - Encryption and key generation

### Frontend
- React - UI library
- React Router - Navigation
- Axios - HTTP client
- Socket.io Client - WebSocket client
- CryptoJS - Client-side encryption

## License

MIT License - Feel free to use this for learning and educational purposes.

## Support

For issues, questions, or contributions, please open an issue or submit a pull request.

---

**Happy Securing!** 🔐
