// components/SendEmail.tsx
'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import './SendEmail.scss'; // Directly import the SCSS file

interface SendEmailProps {
  selectedRecords: { name: string; email: string }[];
  onBack: () => void; // Callback to go back to the previous component
}

const SendEmail: React.FC<SendEmailProps> = ({ selectedRecords, onBack }) => {
  const router = useRouter();
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

    try {
      const response = await fetch('/api/submitform', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: selectedRecords.map(record => record.name).join(', '),
          bcc: bccEmails,
          subject,
          message,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setSuccessMessage(data.message);
        router.push('/dashboard');
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
