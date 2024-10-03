// components/SendEmail.tsx
'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface SendEmailProps {
  selectedRecords: { name: string; email: string }[];
  onBack: () => void; // Callback to go back to the previous component
}

const SendEmail: React.FC<SendEmailProps> = ({ selectedRecords, onBack }) => {
const router=useRouter()
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
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

    // Extract email addresses for BCC
    const bccEmails = selectedRecords.map(record => record.email).join(', ');
    console.log(bccEmails)

    try {
      const response = await fetch('/api/submitform', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: selectedRecords.map(record => record.name).join(', '), // Send names of selected records
          bcc: bccEmails, 
          subject,
          message,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setSuccessMessage(data.message);
        router.push('/dashboard')
        setSubject('');
        setMessage('');
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      setErrorMessage('Error sending email: ' + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Send Email</h1>
      {successMessage && <p className="success-message">{successMessage}</p>}
      {errorMessage && <p className="error-message">{errorMessage}</p>}

      <label>
        Subject:
        <input 
          type="text" 
          value={subject} 
          onChange={e => setSubject(e.target.value)} 
          required 
        />
      </label>

      <label>
        Message:
        <textarea 
          value={message} 
          onChange={e => setMessage(e.target.value)} 
          required 
        />
      </label>

      <button onClick={handleSendEmail} disabled={loading}>
        {loading ? 'Sending...' : 'Send Email'}
      </button>
      
      <button onClick={onBack}>Back</button> {/* Button to go back to the previous component */}
    </div>
  );
};

export default SendEmail;
