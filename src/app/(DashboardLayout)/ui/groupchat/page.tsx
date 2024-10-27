'use client';
import React, { useState, useEffect , useRef} from 'react';
import axios from 'axios';
import './groupchat.scss';
import { withAuth } from '@/utils/theme/auth';

export interface Record {
    name: string;
    email: string;
    company_name: string;
    phone: number;
    provider: string;
    signup_date: {
        $date: string;
    };
}

interface Group {
    group_name: string;
    _id: string;
}

interface Message {
    sender: string;
    message: string;
    timestamp: Date;
}

const GroupChat: React.FC = () => {
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
    const [records, setRecords] = useState<Record[]>([]);
    const [selectedContact, setSelectedContact] = useState<Record | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectAll, setSelectAll] = useState<boolean>(false);
    const [email, setEmail] = useState<string | null>(null);
    const [groups, setGroups] = useState<Group[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
    const [newMessage, setNewMessage] = useState<string>('');
    const [showGroupModal, setShowGroupModal] = useState<boolean>(false);
    const [groupName, setGroupName] = useState<string>('');
    const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [fetchInterval, setFetchInterval] = useState<NodeJS.Timeout | null>(null); // State to hold interval ID

    useEffect(() => {
        const storedEmail = localStorage.getItem('email');
        setEmail(storedEmail);
    }, []);

    useEffect(() => {
        if (email) {
            fetchGroups();
        }
    }, [email]);

    useEffect(() => {
        const fetchRecords = async () => {
            try {
                const email = localStorage.getItem('email');
                const response = await axios.get(`https://in-office-messaging-backend.vercel.app/getrecords?email=${email}`);
                if (response.data) {
                    const companyName = response.data.company_name;
                    const companyResponse = await axios.get(`https://in-office-messaging-backend.vercel.app/get_forms_company_name?company_name=${companyName}`);
                    setRecords(companyResponse.data);
                } else {
                    setError("No records found for this user.");
                }
            } catch (err) {
                setError("Error fetching records.");
            } finally {
                setLoading(false);
            }
        };

        fetchRecords();
    }, []);
    useEffect(() => {
      if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
  }, [messages]);
  

    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedMembers([]);
        } else {
            const allEmails = records.map((record) => record.email);
            setSelectedMembers(allEmails);
        }
        setSelectAll(!selectAll);
    };

    const fetchGroups = async () => {
        if (!email) return;
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
        setSelectedGroup(groupId);
        fetchMessages(groupId);

        // Clear previous interval
        if (fetchInterval) {
            clearInterval(fetchInterval);
        }

        // Set interval to fetch messages every second
        const intervalId = setInterval(() => {
            fetchMessages(groupId);
        }, 1000);

        setFetchInterval(intervalId);
    };

    const handleSendMessage = async () => {
        if (!newMessage || !selectedGroup || !email) return;

        try {
            const response = await axios.post('https://in-office-messaging-backend.vercel.app/send_group_message', {
                sender: email,
                group_id: selectedGroup,
                message: newMessage,
            });
            if (response.data.success) {
                setNewMessage('');
                fetchMessages(selectedGroup);
            }
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    const handleCreateGroup = async () => {
        const userEmail = localStorage.getItem('email');

        try {
            const groupData = {
                group_name: groupName,
                createdBy: userEmail,
                members: selectedMembers,
            };
            const response = await axios.post('https://in-office-messaging-backend.vercel.app/create_group', groupData);
            if (response.status === 200) {
                setShowGroupModal(false);
                setGroupName('');
                setSelectedMembers([]);
                alert('Group created successfully!');
                fetchGroups();
            } else {
                setError('Failed to create group. Please try again.');
            }
        } catch (err) {
            setError('Error creating group. Please check the console for details.');
        }
    };

    const handleToggleGroupModal = () => {
        setShowGroupModal(!showGroupModal);
    };

    const handleRemoveMember = (index: number) => {
        const updatedMembers = [...selectedMembers];
        updatedMembers.splice(index, 1);
        setSelectedMembers(updatedMembers);
    };

    // Clear interval on unmount or when group changes
    useEffect(() => {
        return () => {
            if (fetchInterval) {
                clearInterval(fetchInterval);
            }
        };
    }, [fetchInterval]);

    return (
        <div className="chat-container">
            <div className="contacts-sidebar">
                <div className="header-container">
                    <h2>Groups</h2>
                    <button onClick={() => setShowGroupModal(true)} className="create-group-btn">+ Create Group</button>
                </div>
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
        <div key={index} className={`message ${msg.sender === email ? 'from-user' : 'from-other'}`}>
            <strong>{msg.sender}</strong>
            <p>{msg.message}</p>
            <em>{new Date(msg.timestamp).toLocaleTimeString()}</em>
        </div>
    ))}
    {/* Reference div for scrolling to the bottom */}
    <div ref={messagesEndRef} />
</div>


                        <div className="message-input">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyDown={handleKeyPress} // Add this line
                                placeholder="Type your message here..."
                            />
                            <button onClick={handleSendMessage}>Send</button>
                        </div>
                    </>
                )}
            </div>

            {showGroupModal && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close-button" onClick={handleToggleGroupModal}>&times;</span>
                        <h2>Create Group</h2>
                        <input
                            type="text"
                            className="group-name-input"
                            placeholder="Group Name"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                        />
                        <h3>Select Members</h3>
                        <label>
                            <input
                                type="checkbox"
                                checked={selectAll}
                                onChange={handleSelectAll}
                            />
                            Select All
                        </label>
                        <ul className="members-list">
                            {records.map((record) => (
                                <li key={record.email}>
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={selectedMembers.includes(record.email)}
                                            onChange={() => {
                                                const isSelected = selectedMembers.includes(record.email);
                                                if (isSelected) {
                                                    setSelectedMembers(selectedMembers.filter((email) => email !== record.email));
                                                } else {
                                                    setSelectedMembers([...selectedMembers, record.email]);
                                                }
                                            }}
                                        />
                                        {record.name} ({record.email})
                                    </label>
                                </li>
                            ))}
                        </ul>
                        <button className="create-group-button" onClick={handleCreateGroup}>
                            Create Group
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default withAuth(GroupChat);
