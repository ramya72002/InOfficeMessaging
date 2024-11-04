'use client';
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './chat.scss';
import { withAuth } from '../../../../utils/theme/auth';
import ShowGroupModal from '../groupchat/ShowGroupModal';
import ContactsSidebar from './ContactsSidebar';
import { Record } from '../../../../utils/interfaces/type';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Chat = () => {
  const [records, setRecords] = useState<Record[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<Record[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [selectedContact, setSelectedContact] = useState<Record | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showGroupModal, setShowGroupModal] = useState<boolean>(false);
  const [groupName, setGroupName] = useState<string>('');
  const [notificationShown, setNotificationShown] = useState<boolean>(false); // Track notification state

  const chatBodyRef = useRef<HTMLDivElement | null>(null);
  const userEmail = localStorage.getItem('email');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch contacts
  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:80/getrecords?email=${userEmail}`);
        if (response.data) {
          const companyResponse = await axios.get(`http://127.0.0.1:80/get_forms_company_name?company_name=${response.data.company_name}`);
          setRecords(companyResponse.data);
          setFilteredRecords(companyResponse.data);
        } else {
          setError("No records found for this user.");
        }
      } catch {
        setError("Error fetching records.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, [userEmail]);

  // Fetch messages for the selected contact
  const fetchMessages = async (contactEmail: string) => {
    try {
      const response = await axios.get(`http://127.0.0.1:80/get_conversation?sender=${userEmail}&receiver=${contactEmail}`);
      setMessages(response.data.conversation || []);
    } catch {
      setError("Error fetching messages.");
    }
  };

  const getCurrentTimestamp = () => {
    return (new Date()).toLocaleDateString('en-CA') + ' ' + (new Date()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() && selectedContact) {
      const newMessageObj = {
        sender: userEmail,
        receiver: selectedContact.email,
        message: newMessage,
        timestamp: getCurrentTimestamp(),
        isRead: false // Add isRead property
      };

      try {
        const response = await axios.post('http://127.0.0.1:80/send_message', newMessageObj);
        if (response.status === 200) {
          setMessages(prevMessages => [...prevMessages, newMessageObj]);
          setNewMessage('');
        } else {
          setError('Failed to send message. Please try again.');
        }
      } catch {
        setError('Error sending message. Please check the console for details.');
      }
    }
  };

  useEffect(() => {
    const filtered = records.filter(record => 
      record.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      record.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredRecords(filtered);
  }, [searchQuery, records]);

  const handleSelectAll = () => {
    setSelectedMembers(selectAll ? [] : filteredRecords.map(record => record.email));
    setSelectAll(!selectAll);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSendMessage();
      event.preventDefault();
    }
  };

  useEffect(() => {
    if (selectedContact) {
      fetchMessages(selectedContact.email);
      const intervalId = setInterval(() => fetchMessages(selectedContact.email), 1000);
      return () => clearInterval(intervalId);
    }
  }, [selectedContact]);

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].sender !== userEmail) {
      const lastMessage = messages[messages.length - 1];

      // Check if the last message is unread and if notification hasn't been shown
      if (!lastMessage.isRead && !notificationShown) {
        // Play sound and show toast notification
        if (audioRef.current) {
          audioRef.current.play().catch((error) => console.error('Error playing sound:', error));
        }
        toast.info('New message received!', {
          position: 'bottom-right',
          autoClose: 2000,
          hideProgressBar: true,
          closeOnClick: true,
          draggable: true,
          progress: undefined,
        });

        // Set notification shown to true
        setNotificationShown(true);
      }
    } else {
      // Reset notification shown if the last message is from the user or no messages
      setNotificationShown(false);
    }
  }, [messages, notificationShown]);

  const handleCreateGroup = async () => {
    const groupData = { group_name: groupName, createdBy: userEmail, members: selectedMembers };
    try {
      await axios.post('http://127.0.0.1:80/create_group', groupData);
      setShowGroupModal(false);
      setGroupName('');
      setSelectedMembers([]);
      alert('Group created successfully!');
    } catch (err) {
      console.error("Error creating group:", err);
    }
  };

  const handleToggleGroupModal = () => setShowGroupModal(!showGroupModal);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="chat-container">
      <ContactsSidebar
        records={filteredRecords}
        selectedContact={selectedContact}
        setSelectedContact={setSelectedContact}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleToggleGroupModal={handleToggleGroupModal}
      />

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
              {messages.length > 0 ? (
                messages.map((message, index) => (
                  <div
                    className={`message ${message.sender === userEmail ? 'message-sent' : 'message-received'}`}
                    key={index}
                  >
                    <span className="message-sender">{message.sender === userEmail ? 'You' : message.sender}:</span>
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
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
              />
              <button className="send-message-button" onClick={handleSendMessage} disabled={!newMessage.trim()}>
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="chat-header">Select a contact to start chatting</div>
        )}
      </div>

      {showGroupModal && (
        <ShowGroupModal
          show={showGroupModal}
          onClose={handleToggleGroupModal}
          groupName={groupName}
          setGroupName={setGroupName}
          selectedMembers={selectedMembers}
          setSelectedMembers={setSelectedMembers}
          filteredRecords={filteredRecords}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          handleSelectAll={handleSelectAll}
          selectAll={selectAll}
          handleCreateGroup={handleCreateGroup}
        />
      )}
      
      <audio ref={audioRef} src="/notification.mp3" preload="auto"></audio>
      <ToastContainer />
    </div>
  );
};

export default withAuth(Chat);
