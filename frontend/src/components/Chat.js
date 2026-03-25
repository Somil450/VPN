import React, { useState, useEffect, useRef } from 'react';
import { getSocket, requestUserList } from '../utils/socket';
import CryptoJS from 'crypto-js';
import './Chat.css';

function Chat() {
    const [messagesPerUser, setMessagesPerUser] = useState({});
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messageText, setMessageText] = useState('');
    const socketRef = useRef(null);
    const messagesEndRef = useRef(null);
    const currentUserId = localStorage.getItem('userId');
    const currentUsername = localStorage.getItem('username');

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Helper function to decrypt messages (if encrypted)
    const processMessage = (message) => {
        // Messages are now sent plaintext, so no decryption needed
        return message;
    };

    useEffect(() => {
        scrollToBottom();
    }, [messagesPerUser, selectedUser]);

    useEffect(() => {
        socketRef.current = getSocket();
        if (!socketRef.current) return;

        requestUserList();

        // Handle user list
        const handleUserList = (userList) => {
            const filteredUsers = userList.filter(u => u.userId !== currentUserId);
            setUsers(filteredUsers);
        };

        // Handle incoming messages with decryption
        const handleReceiveMessage = (data) => {
            setMessagesPerUser(prev => {
                const userId = data.from;
                const messages = prev[userId] || [];
                const processedMessage = processMessage(data.message);
                return {
                    ...prev,
                    [userId]: [...messages, {
                        from: data.from,
                        username: data.username,
                        message: processedMessage,
                        timestamp: data.timestamp,
                        isIncoming: true,
                        latency: data.latency,
                        encrypted: data.encrypted
                    }]
                };
            });
        };

        socketRef.current.on('user_list', handleUserList);
        socketRef.current.on('receive_message', handleReceiveMessage);

        return () => {
            if (socketRef.current) {
                socketRef.current.off('user_list', handleUserList);
                socketRef.current.off('receive_message', handleReceiveMessage);
            }
        };
    }, [currentUserId]);

    // Refresh user list periodically
    useEffect(() => {
        const interval = setInterval(() => {
            requestUserList();
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!messageText.trim() || !selectedUser || !socketRef.current) return;

        const message = messageText.trim();

        // Add message to local state
        setMessagesPerUser(prev => ({
            ...prev,
            [selectedUser.userId]: [
                ...(prev[selectedUser.userId] || []),
                {
                    message,
                    username: currentUsername,
                    timestamp: Date.now(),
                    isIncoming: false,
                    latency: 0
                }
            ]
        }));

        // Send message via socket
        socketRef.current.emit('send_message', {
            to: selectedUser.userId,
            message: message
        });

        setMessageText('');
    };

    const currentMessages = messagesPerUser[selectedUser?.userId] || [];

    return (
        <div className="chat-container">
            <div className="users-list">
                <h3> Online Users ({users.length})</h3>
                <div className="users-scroll">
                    {users.length === 0 ? (
                        <p className="no-users">No other users online</p>
                    ) : (
                        users.map(user => (
                            <div
                                key={user.userId}
                                className={`user-item ${selectedUser?.userId === user.userId ? 'active' : ''}`}
                                onClick={() => setSelectedUser(user)}
                            >
                                <span className="user-status"></span>
                                <span className="user-name">{user.username}</span>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="chat-main">
                {selectedUser ? (
                    <>
                        <div className="chat-header">
                            <h3> Chat with {selectedUser.username}</h3>
                            <span className="chat-badge">Encrypted</span>
                        </div>

                        <div className="messages-container">
                            {currentMessages.length === 0 ? (
                                <div className="no-messages">
                                    <p>No messages yet. Start a conversation!</p>
                                </div>
                            ) : (
                                currentMessages.map((msg, idx) => (
                                    <div key={idx} className={`message ${msg.isIncoming ? 'incoming' : 'outgoing'}`}>
                                        <div className="message-header">
                                            <span className="message-user">{msg.username}</span>
                                            <span className="message-time">
                                                {msg.latency ? `${msg.latency}ms` : new Date(msg.timestamp).toLocaleTimeString()}
                                                {msg.encrypted && ' 🔐'}
                                            </span>
                                        </div>
                                        <div className="message-content">
                                            {msg.message}
                                        </div>
                                    </div>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <form onSubmit={handleSendMessage} className="chat-input-form">
                            <input
                                type="text"
                                value={messageText}
                                onChange={(e) => setMessageText(e.target.value)}
                                placeholder="Type a secure message..."
                                className="chat-input"
                                autoFocus
                            />
                            <button type="submit" className="btn btn-primary" disabled={!messageText.trim()}>
                                Send 🔐
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="no-chat-selected">
                        <p>Select a user to start chatting</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Chat;
