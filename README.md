# VPN Client & Simulation System 🛡️

A complete VPN system integrating a Node.js backend, a React web dashboard, an Electron desktop client for real OpenVPN connections, and a React Native mobile application. 

## Features 🚀

### Real VPN Integration
- ✅ **OpenVPN Support**: Connect to real `.ovpn` configuration files using the Electron Desktop App.
- ✅ **Cross-Platform Clients**: Available as a web dashboard, an Electron desktop application, and a React Native Android app.
- ✅ **Local Network Integration**: The desktop app runs system-level PowerShell commands to establish genuine OpenVPN tunnels.

### Backend & Chat
- ✅ **WebSocket Communication**: Real-time chat and VPN status updates.
- ✅ **JWT Authentication**: Secure user authentication.
- ✅ **Encryption**: AES-256-CBC and RSA-2048 key exchange for secure messaging.
- ✅ **Network Simulation**: Configurable latency, packet loss simulation, and traffic monitoring.

## Project Structure

```
vpn/
├── backend/          # Node.js + Express backend (WebSocket, Auth, APIs)
├── frontend/         # React application (Web Dashboard & Electron App)
├── mobile/           # React Native Android application
└── scripts/          # PowerShell scripts for OpenVPN connectivity
```

## Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- OpenVPN (Installed in `C:\Program Files\OpenVPN` for desktop app functionality)
- Android SDK (for mobile app compilation)

### Backend Setup
```bash
cd backend
npm install
npm start
```
The backend will start on `http://localhost:3001`

### Web Dashboard
```bash
cd frontend
npm install
npm start
```
The web app will open on `http://localhost:3007`. *Note: True VPN connectivity requires the Electron desktop app.*

### Electron Desktop App (Real VPN Client)
```bash
cd frontend
npm run electron:serve
```
This launches the application in a desktop window with system-level access to spawn OpenVPN processes and route traffic.

### React Native Mobile App
```bash
cd mobile
npm install
npm run android
```
This builds the mobile application and deploys it to your connected Android emulator or physical device.

## Usage

1. **Dashboard & Web**: Monitor traffic, simulate latency, and chat securely with other users on the network.
2. **Desktop Client**: Click "Connect" in the Electron app to establish a real OpenVPN connection using your selected `.ovpn` configuration profile.
3. **Mobile Client**: Experience the same UI adapted for Android devices.

## Security Considerations ⚠️

- The backend currently uses in-memory storage. For production use, wire up a database (e.g., PostgreSQL or MongoDB).
- Change the `JWT_SECRET` in production `.env`.
- Real VPN connections require local administrative/UAC privileges on Windows to modify network adapters.

## License

MIT License - Feel free to use this for learning and educational purposes.
