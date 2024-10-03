'use client';
import React, { useEffect, useState } from 'react';
import './sendmessage.scss';
import axios from 'axios';

// Define the interface for a Record
export interface Record {
  name: string;
  email: string;
  company_name: string;
  signup_date: {
    $date: string; // This represents the date string returned from MongoDB
  };
}

const SendMessage = () => {
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecords, setSelectedRecords] = useState<Set<number>>(new Set<number>()); // Specify Set<number>()

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const email = localStorage.getItem('email'); // Get email from local storage
        const response = await axios.get(`http://127.0.0.1:80/getrecords?email=${email}`);
        
        if (response.data) {
          const companyName = response.data.company_name; // Get the company name from the first record
          const companyResponse = await axios.get(`http://127.0.0.1:80/get_forms_company_name?company_name=${companyName}`);
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
    const newSelectedRecords = isChecked ? new Set<number>(records.map((_, index) => index)) : new Set<number>(); // Specify <number>()
    setSelectedRecords(newSelectedRecords);
  };

  const handleSelectRow = (index: number) => {
    const newSelectedRecords = new Set<number>(selectedRecords); // Specify <number>()
    if (newSelectedRecords.has(index)) {
      newSelectedRecords.delete(index);
    } else {
      newSelectedRecords.add(index);
    }
    setSelectedRecords(newSelectedRecords);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  // Check if any records are selected
  const isNextButtonEnabled = selectedRecords.size > 0;

  return (
    <div className="sendmessage-container">
      <div className="heading-container">
        <h1 className="heading">Records for Company</h1>
        <button 
          className="next-button" 
          disabled={!isNextButtonEnabled} 
          onClick={() => alert('Next button clicked!')} // Replace with your navigation logic
        >
          Next
        </button>
      </div>
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
            <th>Company</th>
          </tr>
        </thead>
        <tbody>
          {records.length > 0 ? (
            records.map((record, index) => (
              <tr key={index} onClick={() => handleSelectRow(index)} className={selectedRecords.has(index) ? 'selected' : ''}>
                <td>
                  <input 
                    type="checkbox" 
                    checked={selectedRecords.has(index)} 
                    onChange={() => handleSelectRow(index)} 
                  />
                </td>
                <td>{record.name}</td>
                <td>{record.email}</td>
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
    </div>
  );
};

export default SendMessage;
