// SendMessage.tsx
'use client';
import React, { useEffect, useState } from 'react';
import './sendmessage.scss';
import axios from 'axios';
import SendEmail from '@/app/components/SendEmail';
import { withAuth } from '@/utils/theme/auth';

// Define the interface for a Record
export interface Record {
  name: string;
  email: string;
  company_name: string;
  phone:number;
  provider:string;
  signup_date: {
    $date: string; // This represents the date string returned from MongoDB
  };
}

const SendMessage = () => {
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecords, setSelectedRecords] = useState<Set<number>>(new Set<number>());
  const [showEmailComponent, setShowEmailComponent] = useState(false); // State to toggle the email component

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const email = localStorage.getItem('email'); // Get email from local storage
        const response = await axios.get(`https://in-office-messaging-backend.vercel.app/getrecords?email=${email}`);

        if (response.data) {
          const companyName = response.data.company_name; // Get the company name from the first record
          const companyResponse = await axios.get(`https://in-office-messaging-backend.vercel.app/get_forms_company_name?company_name=${companyName}`);
          setRecords(companyResponse.data); // Set the records in state
        } else {
          setError("No records found for this user.");
        }
      } catch (err) {
        setError('Error fetching records.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, []);

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = event.target.checked;
    const newSelectedRecords = isChecked ? new Set<number>(records.map((_, index) => index)) : new Set<number>();
    setSelectedRecords(newSelectedRecords);
  };

  const handleSelectRow = (index: number) => {
    const newSelectedRecords = new Set<number>(selectedRecords);
    if (newSelectedRecords.has(index)) {
      newSelectedRecords.delete(index);
    } else {
      newSelectedRecords.add(index);
    }
    setSelectedRecords(newSelectedRecords);
  };

  const handleNext = () => {
    setShowEmailComponent(true); // Show the email component when next is clicked
  };

  const handleBack = () => {
    setShowEmailComponent(false); // Go back to the records view
    setSelectedRecords(new Set<number>()); // Reset selected records
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  // Get selected records for email
  const emailRecords = records.filter((_, index) => selectedRecords.has(index)).map(record => ({
    name: record.name,
    email: record.email,
  }));

  return (
    <div className="sendmessage-container">
      <div className="heading-container">
        {showEmailComponent ? (
          <SendEmail selectedRecords={emailRecords} onBack={handleBack} /> // Pass selected records to SendEmail component
        ) : (
          <>
            <h1 className="heading">Select Records To Send Email</h1>
            <button
              className="next-button"
              onClick={handleNext}
              disabled={selectedRecords.size === 0}
            >
              Next
            </button>
          </>
        )}
      </div>

      {!showEmailComponent && (
        <table className="records-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selectedRecords.size === records.length}
                  onChange={handleSelectAll}
                />
              </th>
              <th>Name</th>
              <th>Email</th>
              <th>Mobile Number</th>
              <th>Provider</th>
              <th>Company</th>
            </tr>
          </thead>
          <tbody>
            {records.length > 0 ? (
              records.map((record, index) => (
                <tr
                  key={index}
                  onClick={() => handleSelectRow(index)}
                  className={selectedRecords.has(index) ? 'selected' : ''}
                >
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedRecords.has(index)}
                      onChange={() => handleSelectRow(index)}
                    />
                  </td>
                  <td>{record.name}</td>
                  <td>{record.email}</td>
                  <td>{record.phone}</td>
                  <td>{record.provider}</td>
                  <td>{record.company_name}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4}>No records found for this company.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default withAuth(SendMessage);
