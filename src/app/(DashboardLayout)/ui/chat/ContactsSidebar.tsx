// src/components/chat/ContactsSidebar.tsx
'use client';
import React from 'react';
import { Record } from '../../../../utils/interfaces/type';
import './chat.scss'; // Create a separate SCSS file if needed

interface ContactsSidebarProps {
  records: Record[];
  selectedContact: Record | null;
  setSelectedContact: (contact: Record) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleToggleGroupModal: () => void;
}

const ContactsSidebar: React.FC<ContactsSidebarProps> = ({
  records,
  selectedContact,
  setSelectedContact,
  searchQuery,
  setSearchQuery,
  handleToggleGroupModal,
}) => {
  const generateColor = (email: string) => {
    const colors = ['#FF5733', '#33FF57', '#3357FF', '#F1C40F', '#8E44AD', '#3498DB'];
    const hash = email.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  return (
    <div className="contacts-sidebar">
      <div className="contacts-header">
        Contacts
        <button className="create-group-button" onClick={handleToggleGroupModal}>+</button>
      </div>
      <input
        type="text"
        className="search-input"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search contacts..."
      />
      {records.map(record => (
        <div
          key={record.email}
          className={`contact-item ${selectedContact?.email === record.email ? 'contact-selected' : ''}`}
          onClick={() => setSelectedContact(record)}
        >
          <div className="contact-avatar" style={{ backgroundColor: generateColor(record.email) }}>
            {record.name.charAt(0).toUpperCase()}
          </div>
          <div className="contact-name">{record.name}</div>
          {record.unread_count > 0 && <span className="unread-count">({record.unread_count})</span>}
        </div>
      ))}
    </div>
  );
};

export default ContactsSidebar;
