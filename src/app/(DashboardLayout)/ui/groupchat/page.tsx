'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './groupchat.scss';
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
    timestamp: Date; // or string depending on your API response
}

const GroupChat: React.FC = () => {
    const [records, setRecords] = useState<Record[]>([]);
  const [selectedContact, setSelectedContact] = useState<Record | null>(null);
 const [loading, setLoading] = useState<boolean>(true);
  const [selectAll, setSelectAll] = useState<boolean>(false);

    const [email, setEmail] = useState<string | null>(null); // State for email
    const [groups, setGroups] = useState<Group[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [selectedGroup, setSelectedGroup] = useState<string | null>(null); // State for selected group
    const [newMessage, setNewMessage] = useState<string>(''); // State for new message input
    const [showGroupModal, setShowGroupModal] = useState<boolean>(false); // Show or hide group creation modal
    const [groupName, setGroupName] = useState<string>(''); // State for new group name
    const [selectedMembers, setSelectedMembers] = useState<string[]>([]); // State for selected members
    const [error, setError] = useState<string | null>(null); // State for error handling

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
    useEffect(() => {
        const fetchRecords = async () => {
          try {
            const email = localStorage.getItem('email');
            const response = await axios.get(`http://127.0.0.1:80/getrecords?email=${email}`);
    
            if (response.data) {
              const companyName = response.data.company_name;
              const companyResponse = await axios.get(`http://127.0.0.1:80/get_forms_company_name?company_name=${companyName}`);
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
 const handleSelectAll = () => {
    if (selectAll) {
      setSelectedMembers([]); // Clear all selections
    } else {
      const allEmails = records.map((record) => record.email);
      setSelectedMembers(allEmails); // Select all emails
    }
    setSelectAll(!selectAll); // Toggle select all
  };

    const fetchGroups = async () => {
        if (!email) return; // Ensure email is available
        try {
            const response = await axios.get(`http://127.0.0.1:80/list_groups?email=${email}`);
            setGroups(response.data.groups);
        } catch (error) {
            console.error('Error fetching groups:', error);
        }
    };

    const fetchMessages = async (groupId: string) => {
        try {
            const response = await axios.get(`http://127.0.0.1:80/get_group_messages?group_id=${groupId}`);
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
            const response = await axios.post('http://127.0.0.1:80/send_group_message', {
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
 
    const handleCreateGroup = async () => {
        const userEmail = localStorage.getItem('email');
    
        try {
          const groupData = {
            group_name: groupName,
            createdBy: userEmail,
            members: selectedMembers,
          };
          const response = await axios.post('http://127.0.0.1:80/create_group', groupData);
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
        updatedMembers.splice(index, 1); // Remove member by index
        setSelectedMembers(updatedMembers); // Update the state
    };

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

export default GroupChat;
