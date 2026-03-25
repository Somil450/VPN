import io from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001';

let socket = null;

export const initSocket = () => {
    if (!socket) {
        socket = io(SOCKET_URL);
    }
    return socket;
};

export const getSocket = () => {
    return socket;
};

export const connectSocket = (token) => {
    const socket = initSocket();

    socket.on('connect', () => {
        console.log('Connected to server');
        socket.emit('authenticate', { token });
    });

    socket.on('auth_success', (data) => {
        console.log('Authentication successful:', data);
    });

    socket.on('auth_error', (data) => {
        console.error('Authentication failed:', data);
    });

    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

export const sendMessage = (to, message) => {
    if (socket) {
        socket.emit('send_message', { to, message });
    }
};

export const getConnectionInfo = () => {
    return new Promise((resolve) => {
        if (socket) {
            socket.once('connection_info', resolve);
            socket.emit('get_connection_info');
        }
    });
};

export const simulateLatency = (latency) => {
    if (socket) {
        socket.emit('simulate_latency', { latency });
    }
};

export const simulatePacketLoss = (packetLoss) => {
    if (socket) {
        socket.emit('simulate_packet_loss', { packetLoss });
    }
};

export const requestUserList = () => {
    if (socket) {
        socket.emit('request_users');
    }
};

export const onUserList = (callback) => {
    if (socket) {
        socket.on('user_list', callback);
    }
};

export const onReceiveMessage = (callback) => {
    if (socket) {
        socket.on('receive_message', callback);
    }
};

export const onMessageSent = (callback) => {
    if (socket) {
        socket.on('message_sent', callback);
    }
};

export const ping = () => {
    if (socket) {
        socket.emit('ping');
    }
};

export const onPong = (callback) => {
    if (socket) {
        socket.on('pong', callback);
    }
};
