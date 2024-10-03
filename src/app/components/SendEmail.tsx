// components/SendEmail.tsx
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import './SendEmail.scss';

interface SendEmailProps {
  selectedRecords: { name: string; email: string }[];
  onBack: () => void;
}

const SendEmail: React.FC<SendEmailProps> = ({ selectedRecords, onBack }) => {
  const router = useRouter();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [image, setImage] = useState<File | null>(null); // State for the image
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSendEmail = async () => {
    if (!subject || !message) {
      setErrorMessage('Subject and message are required.');
      return;
    }

    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    const bccEmails = selectedRecords.map(record => record.email).join(', ');

    const formData = new FormData(); // Create FormData object
    formData.append('name', selectedRecords.map(record => record.name).join(', '));
    formData.append('bcc', bccEmails);
    formData.append('subject', subject);
    formData.append('message', message);
    if (image) {
      formData.append('image', image); // Append the image file
    }

    try {
      const response = await fetch('/api/submitform', {
        method: 'POST',
        body: formData, // Make sure you use FormData here
      });
    
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response from server:', errorData); // Log server error response
        throw new Error(errorData.error || 'Error sending email');
      }
    
      const data = await response.json();
      setSuccessMessage(data.message);
    } catch (error) {
      setErrorMessage('Error sending email: ' + error);
    }
     finally {
      setLoading(false);
    }
  };

  return (
    <div className="containerSendEmail">
      <h1 className="title">Send Email</h1>
      {successMessage && <p className="successMessage">{successMessage}</p>}
      {errorMessage && <p className="errorMessage">{errorMessage}</p>}

      <label className="label">
        Subject:
        <input 
          type="text" 
          value={subject} 
          onChange={e => setSubject(e.target.value)} 
          required 
          className="input"
        />
      </label>

      <label className="label">
        Message:
        <textarea 
          value={message} 
          onChange={e => setMessage(e.target.value)} 
          required 
          className="textarea"
        />
      </label>

      <label className="label">
        Upload Image:
        <input 
          type="file" 
          accept="image/*" 
          onChange={e => setImage(e.target.files![0])} 
          className="input" 
        />
      </label>

      <button 
        onClick={handleSendEmail} 
        disabled={loading} 
        className="button"
      >
        {loading ? 'Sending...' : 'Send Email'}
      </button>

      <button onClick={onBack} className="backButton">Back</button>
    </div>
  );
};

export default SendEmail;
