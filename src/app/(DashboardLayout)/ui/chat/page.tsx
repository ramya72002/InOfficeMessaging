'use client'
import React, { useState, useEffect } from 'react';
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

const Chat = () => {
  const [records, setRecords] = useState<Record[]>([]);
  const [selectedContact, setSelectedContact] = useState<Record | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
    return (new Date()).toLocaleDateString('en-CA') + ' ' + (new Date()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) // e.g., "2024-10-19 02:22 PM"
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
  

  // Fetch messages when a contact is selected
  useEffect(() => {
    if (selectedContact) {
      fetchMessages(selectedContact.email);
    }
  }, [selectedContact]);

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

            <div className="chat-body">
              {Array.isArray(messages) && messages.length > 0 ? (
                messages.map((message, index) => (
                  <div
                    className={`message ${message.sender === localStorage.getItem('email') ? 'message-sent' : 'message-received'}`}
                    key={index}
                  >
                    <span className="message-sender">{message.sender === localStorage.getItem('email') ? 'You' : message.sender}:</span>
                    <span className="message-content">{message.message}</span>
                    <span className="message-time">{message.timestamp}</span> {/* Now below the message */}
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
