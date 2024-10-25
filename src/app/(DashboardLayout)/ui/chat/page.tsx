'use client';
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './chat.scss';

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

// Define a function to generate a color based on a hash of the email
const generateColor = (email: string) => {
  const colors = ['#FF5733', '#33FF57', '#3357FF', '#F1C40F', '#8E44AD', '#3498DB'];
  const hash = email.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length]; // Select a color based on the hash
};

const Chat = () => {
  const [records, setRecords] = useState<Record[]>([]);
  const [selectedContact, setSelectedContact] = useState<Record | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showGroupModal, setShowGroupModal] = useState<boolean>(false);
  const [groupName, setGroupName] = useState<string>('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [file, setFile] = useState<File | null>(null); // State to hold the selected file

  // Reference for scrolling to the bottom of the chat body
  const chatBodyRef = useRef<HTMLDivElement | null>(null);

  // Fetch contacts
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

  // Handle select all functionality
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedMembers([]); // Clear all selections
    } else {
      const allEmails = records.map((record) => record.email);
      setSelectedMembers(allEmails); // Select all emails
    }
    setSelectAll(!selectAll); // Toggle select all
  };

  // Fetch messages for the selected contact
  const fetchMessages = async (contactEmail: string) => {
    try {
        const userEmail = localStorage.getItem('email');
        const response = await axios.get(`http://127.0.0.1:80/get_conversation?sender=${userEmail}&receiver=${contactEmail}`);
        setMessages(response.data.conversation || []);
    } catch (err) {
        setError("Error fetching messages.");
    }
};

  const getCurrentTimestamp = () => {
    return (new Date()).toLocaleDateString('en-CA') + ' ' + (new Date()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Handle sending a new message
  const handleSendMessage = async () => {
    if (newMessage.trim() && selectedContact) {
      const userEmail = localStorage.getItem('email');
      const formData = new FormData(); // Create a FormData object to handle file uploads
  
      // Append data to the FormData object
      if (file) {
        formData.append('file', file); // Only append file if it's not null
      }
  
      formData.append('sender', userEmail || ''); // Ensure sender is a non-null string
      formData.append('receiver', selectedContact.email);
      formData.append('message', newMessage);
      formData.append('timestamp', getCurrentTimestamp());
  
      try {
        const response = await axios.post('http://127.0.0.1:80/send_message', formData, {
          headers: {
            'Content-Type': 'multipart/form-data', // Set the correct content type for file uploads
          },
        });
        if (response.status === 200) {
          setMessages((prevMessages) => [
            ...prevMessages,
            { sender: userEmail || '', message: newMessage, timestamp: getCurrentTimestamp() },
          ]);
          setNewMessage('');
          setFile(null); // Reset file state after sending
        } else {
          setError('Failed to send message. Please try again.');
        }
      } catch (err) {
        setError('Error sending message. Please check the console for details.');
      }
    }
  };
  

  // Handle keydown event for sending messages
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSendMessage();
      event.preventDefault(); // Prevent form submission if in a form context
    }
  };

  // Fetch messages when a contact is selected
  useEffect(() => {
    if (selectedContact) {
      fetchMessages(selectedContact.email);

      // Set up interval to fetch messages every second
      const intervalId = setInterval(() => {
        fetchMessages(selectedContact.email);
      }, 1000);

      // Clear interval on component unmount or when selectedContact changes
      return () => clearInterval(intervalId);
    }
  }, [selectedContact]);

  // Scroll to the bottom of the chat body whenever messages change
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    setFile(selectedFile);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="chat-container">
      <div className="contacts-sidebar">
        <div className="contacts-header">
          Contacts
          <button className="create-group-button" onClick={handleToggleGroupModal}>+</button>
        </div>
        {records.map((record) => (
          <div
            key={record.email}
            className={`contact-item ${selectedContact?.email === record.email ? 'contact-selected' : ''}`}
            onClick={() => setSelectedContact(record)}
          >
            <div
              className="contact-avatar"
              style={{ backgroundColor: generateColor(record.email) }}
            >
              {record.name.charAt(0).toUpperCase()}
            </div>
            <div className="contact-name">{record.name}</div>
          </div>
        ))}
      </div>

      <div className="chat-window">
        {selectedContact ? (
          <>
            <div className="chat-header">
              <div className="contact-info">
                <div className="contact-name-large">{selectedContact.name}</div>
                <div className="contact-email-small">{selectedContact.email}</div>
              </div>
            </div>

            <div className="chat-body" ref={chatBodyRef}>
              {Array.isArray(messages) && messages.length > 0 ? (
                messages.map((message, index) => (
                  <div
                    className={`message ${message.sender === localStorage.getItem('email') ? 'message-sent' : 'message-received'}`}
                    key={index}
                  >
                    <span className="message-sender">{message.sender === localStorage.getItem('email') ? 'You' : message.sender}:</span>
                    <span className="message-content">{message.message}</span>
                    <span className="message-time">{message.timestamp}</span>
                  </div>
                ))
              ) : (
                <div className="no-messages">No messages to display</div>
              )}
            </div>

            <div className="message-input">
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <input
                type="file"
                accept="image/*, .pdf"
                onChange={handleFileChange}
              />
              <button onClick={handleSendMessage}>Send</button>
            </div>
          </>
        ) : (
          <div className="no-contact-selected">Select a contact to chat with</div>
        )}
      </div>

      {showGroupModal && (
        <div className="group-modal">
          <h3>Create Group</h3>
          <input
            type="text"
            placeholder="Group Name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />
          <label>
            <input type="checkbox" checked={selectAll} onChange={handleSelectAll} />
            Select All
          </label>
          <div className="group-members">
            {records.map((record) => (
              <label key={record.email}>
                <input
                  type="checkbox"
                  checked={selectedMembers.includes(record.email)}
                  onChange={() => {
                    const isSelected = selectedMembers.includes(record.email);
                    setSelectedMembers(isSelected ? selectedMembers.filter(email => email !== record.email) : [...selectedMembers, record.email]);
                  }}
                />
                {record.name}
              </label>
            ))}
          </div>
          <button onClick={handleCreateGroup}>Create Group</button>
          <button onClick={handleToggleGroupModal}>Close</button>
        </div>
      )}
    </div>
  );
};

export default Chat;
