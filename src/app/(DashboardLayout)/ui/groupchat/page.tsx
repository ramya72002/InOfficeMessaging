'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './groupchat.scss';

interface Group {
    group_name: string;
    _id: string;
}

interface Message {
    sender: string;
    message: string;
    timestamp: Date; // or string depending on your API response
}

const GroupChat: React.FC = () => {
    const [email, setEmail] = useState<string | null>(null); // State for email
    const [groups, setGroups] = useState<Group[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [selectedGroup, setSelectedGroup] = useState<string | null>(null); // State for selected group
    const [newMessage, setNewMessage] = useState<string>(''); // State for new message input

    // Fetch email from localStorage when the component mounts
    useEffect(() => {
        const storedEmail = localStorage.getItem('email');
        setEmail(storedEmail); // Set email in state
    }, []);

    // Fetch groups whenever the email is set
    useEffect(() => {
        if (email) {
            fetchGroups();
        }
    }, [email]);

    const fetchGroups = async () => {
        if (!email) return; // Ensure email is available
        try {
            const response = await axios.get(`https://in-office-messaging-backend.vercel.app/list_groups?email=${email}`);
            setGroups(response.data.groups);
        } catch (error) {
            console.error('Error fetching groups:', error);
        }
    };

    const fetchMessages = async (groupId: string) => {
        try {
            const response = await axios.get(`https://in-office-messaging-backend.vercel.app/get_group_messages?group_id=${groupId}`);
            setMessages(response.data.messages);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const handleGroupSelect = (groupId: string) => {
        setSelectedGroup(groupId); // Set selected group
        fetchMessages(groupId); // Fetch messages for the selected group
    };

    const handleSendMessage = async () => {
        if (!newMessage || !selectedGroup || !email) return; // Check for empty message or no group selected

        try {
            const response = await axios.post('https://in-office-messaging-backend.vercel.app/send_group_message', {
                sender: email, // Use the stored email as the sender's identifier
                group_id: selectedGroup,
                message: newMessage,
            });
            if (response.data.success) {
                // Reset new message input and fetch messages again
                setNewMessage('');
                fetchMessages(selectedGroup);
            }
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    return (
        <div className="chat-container">
            <div className="contacts-sidebar">
                <h2>Groups</h2>
                {groups.map(group => (
                    <div key={group._id} onClick={() => handleGroupSelect(group._id)}>
                        <h3>
                            <span className="profile-indicator" style={{ backgroundColor: '#4caf50' }}></span>
                            {group.group_name}
                        </h3>
                    </div>
                ))}
            </div>
            <div className="chat-window">
                {selectedGroup && (
                    <>
                        <div className="messages">
                            {messages.map((msg, index) => (
                                <div key={index}>
                                    <strong>{msg.sender}</strong>: {msg.message} <em>{new Date(msg.timestamp).toLocaleString()}</em>
                                </div>
                            ))}
                        </div>
                        <div className="message-input">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type your message here..."
                            />
                            <button onClick={handleSendMessage}>Send</button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default GroupChat;
