'use client';
import React, { useState, useEffect } from 'react';
import './postrecords.scss';
import { useRouter } from 'next/navigation';


const categories = [
  'Cardiology (Heart Health)',
  'Neurology (Brain & Nerves)',
  'Endocrinology (Hormonal Health)',
  'Dermatology (Skin Health)',
  'Oncology (Cancer)',
  'Orthopedics (Bone & Muscle Health)',
  'Pulmonology (Lung Health)',
  'Gastroenterology (Digestive Health)',
  'Nephrology (Kidney Health)',
  'Urology (Urinary Health)',
  'Gynecology & Obstetrics (Women’s Health)',
  'Pediatrics (Child Health)',
  'Psychiatry & Mental Health',
  'Ophthalmology (Eye Health)',
  'ENT (Ear, Nose, Throat)',
  'Dental Health',
  'Immunology (Allergies & Immune System)',
  'Rheumatology (Autoimmune Diseases)',
  'General Medicine',
  'Surgery & Procedures',
];

interface Record {
  title: string;
  category: string;
  date: string;
  time: string;
  image: string;
}

const PostRecords = () => {
  const router = useRouter();
  const [records, setRecords] = useState<Record[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [title, setTitle] = useState('');
  const [image, setImage] = useState<File | null>(null); // Fixed here

  const handleCategoryClick = (category: React.SetStateAction<string>) => {
    setSelectedCategory(category);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0]; // Check if files exist
    if (file) {
      setImage(file); // Update image state with the selected file
    }
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    if (!image) {
      console.error('No image selected');
      return;
    }

    // Convert the image file to base64
    const getBase64 = (file: Blob | null) => {
      return new Promise<string | ArrayBuffer | null>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file as Blob);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
      });
    };

    try {
      const base64Image = await getBase64(image);

      const recordData = {
        email:localStorage.getItem("email"), // Replace with actual email
        title: title.trim(),
        category: selectedCategory,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),

        image: base64Image,
      };

      const response = await fetch('http://127.0.0.1:80/postrecord', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(recordData),
      });

      const result = await response.json();
      if (result.success) {
        router.push('/dashboard')
      } else {
        console.error('Error submitting record:', result.error);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };
 

  return (
    <div className="postrecords-container">
      {!selectedCategory ? (
        <>
          <h1 className="heading">Select a Health Record Category</h1>
          <div className="card-grid">
            {categories.map((category, index) => (
              <div
                key={index}
                className="category-card"
                onClick={() => handleCategoryClick(category)}
              >
                {category}
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="form-container">
          <h2 className="form-heading">Upload Health Record for {selectedCategory}</h2>
          <form onSubmit={handleSubmit} className="record-form">
            <div className="form-group">
              <label>Date</label>
              <input type="text" value={new Date().toLocaleDateString()} readOnly />
            </div>
            <div className="form-group">
              <label>Time</label>
              <input type="text" value={new Date().toLocaleTimeString()} readOnly />
            </div>
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                placeholder="Enter title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Category</label>
              <input type="text" value={selectedCategory} readOnly />
            </div>
            <div className="form-group">
              <label>Upload Image</label>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={handleImageUpload}
                required
              />
            </div>
            <button type="submit" className="submit-button">Submit</button>
          </form>
        </div>
      )}
 
    </div>
  );
};

export default PostRecords;
