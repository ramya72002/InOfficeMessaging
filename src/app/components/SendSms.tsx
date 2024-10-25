import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import './SendEmail.scss';

interface SendSMSProps {
  selectedRecords: { phone: string; provider: string }[];
  onBack: () => void;
}

const SendSMS: React.FC<SendSMSProps> = ({ selectedRecords, onBack }) => {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showPopup, setShowPopup] = useState(false); // State for showing popup

  const handleSendSMS = async () => {
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    // Group records by provider
    const providerGroups: { [key: string]: string[] } = {};
    selectedRecords.forEach(record => {
      if (!providerGroups[record.provider]) {
        providerGroups[record.provider] = [];
      }
      providerGroups[record.provider].push(record.phone);
    });

    try {
      // Send SMS for each provider group
      for (const provider in providerGroups) {
        const response = await fetch('https://in-office-messaging-backend.vercel.app/send_sms', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            numbers: providerGroups[provider],
            message: message,
            provider: provider,
          }),
        });
        console.log(providerGroups[provider],message,provider)

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to send SMS');
        }
      }

      setSuccessMessage('SMS sent successfully to all providers!');
    } catch (error: any) {
      setErrorMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
      setShowPopup(true); // Show popup after sending SMS
    }
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    router.push('/ui/sendsms'); // Redirect to /sendmessage
  };

  return (
    <div className="containerSendEmail">
      <h1 className="title">Send SMS</h1>

      <label className="label">
        Message:
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          required
          className="textarea"
        />
      </label>

      <button onClick={handleSendSMS} disabled={loading} className="button">
        {loading ? 'Sending...' : 'Send SMS'}
      </button>

      <button onClick={onBack} className="backButton">Back</button>

      {/* Popup Modal */}
      {showPopup && (
        <div className="popup">
          <div className="popupContent">
            {successMessage && <p className="successMessage">{successMessage}</p>}
            {errorMessage && <p className="errorMessage">{errorMessage}</p>}
            <button onClick={handleClosePopup} className="popupButton">
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SendSMS;
