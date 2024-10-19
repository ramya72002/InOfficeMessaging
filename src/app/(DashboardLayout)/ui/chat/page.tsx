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
      const newMessageObj = {
        sender: userEmail,
        receiver: selectedContact.email,
        message: newMessage,
        timestamp: getCurrentTimestamp(),
      };

      try {
        const response = await axios.post('http://127.0.0.1:80/send_message', newMessageObj);
        if (response.status === 200) {
          setMessages((prevMessages) => [...prevMessages, newMessageObj]);
          setNewMessage('');
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
      }, 100);

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

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="chat-container">
      <div className="contacts-sidebar">
        <div className="contacts-header">Contacts</div>
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

            <div className="send-message-container">
              <input
                type="text"
                className="send-message-input"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown} // Add the keydown event handler here
                placeholder="Type a message..."
              />
              <button
                className="send-message-button"
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="chat-header">Select a contact to start chatting</div>
        )}
      </div>
    </div>
  );
};

export default Chat;
