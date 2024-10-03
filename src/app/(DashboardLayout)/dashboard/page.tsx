// "use client";
// import React, { useEffect, useState } from "react";
// import { Badge, Dropdown, Progress, Table, Modal, Button } from "flowbite-react";
// import { HiOutlineDotsVertical } from "react-icons/hi";
// import SimpleBar from "simplebar-react";
// import axios from "axios";

// // Category options
// const categoryOptions = [
//   "Cardiology (Heart Health)",
//   "Neurology (Brain & Nerves)",
//   "Endocrinology (Hormonal Health)",
//   "Dermatology (Skin Health)",
//   "Oncology (Cancer)",
//   "Orthopedics (Bone & Muscle Health)",
//   "Pulmonology (Lung Health)",
//   "Gastroenterology (Digestive Health)",
//   "Nephrology (Kidney Health)",
//   "Urology (Urinary Health)",
//   "Gynecology & Obstetrics (Women’s Health)",
//   "Pediatrics (Child Health)",
//   "Psychiatry & Mental Health",
//   "Ophthalmology (Eye Health)",
//   "ENT (Ear, Nose, Throat)",
//   "Dental Health",
//   "Immunology (Allergies & Immune System)",
//   "Rheumatology (Autoimmune Diseases)",
//   "General Medicine",
//   "Surgery & Procedures",
// ];

// // Record interface
// interface Record {
//   title: string;
//   category: string;
//   date: string; // Format: "MM/DD/YYYY"
//   time: string; // Format: "HH:mm"
//   image: string; // Image URL
// }

// const PopularProducts = () => {
//   const [records, setRecords] = useState<Record[]>([]);
//   const [filteredRecords, setFilteredRecords] = useState<Record[]>([]);
//   const [selectedImage, setSelectedImage] = useState<string | null>(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   // Filter states
//   const [filterTitle, setFilterTitle] = useState("");
//   const [filterCategory, setFilterCategory] = useState("");
//   const [filterDate, setFilterDate] = useState(""); // Date in MM/DD/YYYY format
//   const [filterTime, setFilterTime] = useState(""); // Time in HH:mm format

//   // Fetch records
//   useEffect(() => {
//     const fetchRecords = async () => {
//       try {
//         const email = localStorage.getItem("email"); // Replace with the actual email to fetch data for
//         const response = await axios.get(`https://in-office-messaging-backend.vercel.app/getrecords?email=${email}`);
//         setRecords(response.data.records);
//         setFilteredRecords(response.data.records);
//       } catch (error) {
//         console.error("Error fetching records:", error);
//       }
//     };

//     fetchRecords();
//   }, []);

//   // Handle Image Click to Open Modal
//   const handleImageClick = (image: string) => {
//     setSelectedImage(image);
//     setIsModalOpen(true);
//   };

//   // Handle Image Download
//   const handleDownloadImage = () => {
//     if (selectedImage) {
//       const link = document.createElement("a");
//       link.href = selectedImage;
//       link.download = "downloaded-image.jpg";
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//     }
//   };

//   // Close the Modal
//   const handleCloseModal = () => {
//     setIsModalOpen(false);
//     setSelectedImage(null);
//   };

//   // Filter records based on inputs
//   const handleFilter = () => {
//     let filtered = records;

//     // Filter by Title
//     if (filterTitle) {
//       filtered = filtered.filter((record) =>
//         record.title.toLowerCase().includes(filterTitle.toLowerCase())
//       );
//     }

//     // Filter by Category
//     if (filterCategory) {
//       filtered = filtered.filter((record) => record.category === filterCategory);
//     }

//     // Filter by Date
//     if (filterDate) {
//       const formattedFilterDate = new Date(filterDate).toLocaleDateString('en-US');
//       filtered = filtered.filter((record) => record.date === formattedFilterDate);
//     }

//     // Filter by Time
//     if (filterTime) {
//       // Ensure that you're checking against the time string
//       filtered = filtered.filter((record) => record.time === filterTime);
//     }

//     // Update filtered records
//     setFilteredRecords(filtered);
//   };

//   // Reset filters
//   const handleResetFilters = () => {
//     setFilterTitle("");
//     setFilterCategory("");
//     setFilterDate("");
//     setFilterTime("");
//     setFilteredRecords(records);
//   };

//   return (
//     <>
//       <div className="rounded-lg dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray py-6 px-0 relative w-full break-words">
//         <div className="px-6">
//           <h5 className="card-title">Health Records</h5>
//         </div>

//         {/* Filters */}
//         <div className="flex gap-4 p-4">
//           <input
//             type="text"
//             value={filterTitle}
//             onChange={(e) => setFilterTitle(e.target.value)}
//             placeholder="Filter by Title"
//             className="p-2 border border-gray-300 rounded"
//           />
//           <select
//             value={filterCategory}
//             onChange={(e) => setFilterCategory(e.target.value)}
//             className="p-2 border border-gray-300 rounded"
//           >
//             <option value="">Filter by Category</option>
//             {categoryOptions.map((category) => (
//               <option key={category} value={category}>
//                 {category}
//               </option>
//             ))}
//           </select>
//           <input
//             type="date"
//             value={filterDate}
//             onChange={(e) => setFilterDate(e.target.value)}
//             className="p-2 border border-gray-300 rounded"
//           />
//           <input
//             type="time"
//             value={filterTime}
//             onChange={(e) => setFilterTime(e.target.value)}
//             className="p-2 border border-gray-300 rounded"
//           />
//           <button onClick={handleFilter} className="p-2 bg-blue-500 text-white rounded">
//             Filter
//           </button>
//           <button onClick={handleResetFilters} className="p-2 bg-gray-500 text-white rounded">
//             Reset Filters
//           </button>
//         </div>

//         <SimpleBar className="max-h-[450px]">
//           <div className="overflow-x-auto">
//             <Table hoverable>
//               <Table.Head>
//                 <Table.HeadCell className="p-6">Image</Table.HeadCell>
//                 <Table.HeadCell className="p-6">Title</Table.HeadCell>
//                 <Table.HeadCell>Category</Table.HeadCell>
//                 <Table.HeadCell>Date</Table.HeadCell>
//                 <Table.HeadCell>Time</Table.HeadCell>
//                 <Table.HeadCell>Actions</Table.HeadCell>
//               </Table.Head>
//               <Table.Body className="divide-y divide-border dark:divide-darkborder">
//                 {/* {filteredRecords.map((item, index) => (
//                   <Table.Row key={index}>
//                     <Table.Cell className="whitespace-nowrap ps-6">
//                       <img
//                         src={item.image}
//                         alt={item.title}
//                         className="w-20 h-20 rounded cursor-pointer"
//                         onClick={() => handleImageClick(item.image)}
//                       />
//                     </Table.Cell>
//                     <Table.Cell className="whitespace-nowrap font-semibold">
//                       {item.title}
//                     </Table.Cell>
//                     <Table.Cell>{item.category}</Table.Cell>
//                     <Table.Cell>{item.date}</Table.Cell>
//                     <Table.Cell>{item.time}</Table.Cell>
//                     <Table.Cell>
//                       <Dropdown
//                         inline
//                         label={<HiOutlineDotsVertical className="w-5 h-5 text-gray-500" />}
//                       >
//                         <Dropdown.Item onClick={handleDownloadImage}>
//                           Download Image
//                         </Dropdown.Item>
//                       </Dropdown>
//                     </Table.Cell>
//                   </Table.Row>
//                 ))} */}
//               </Table.Body>
//             </Table>
//           </div>
//         </SimpleBar>
//       </div>
//         {/* Modal for Image Preview */}
//         <Modal show={isModalOpen} onClose={handleCloseModal} size="5xl">
//         <Modal.Header>
//           <h5 className="text-xl font-semibold">Full-Screen Image</h5>
//         </Modal.Header>
//         <Modal.Body>
//           {selectedImage && (
//             <div className="flex justify-center">
//               <img src={selectedImage} alt="Full Screen" className="max-w-full max-h-screen" />
//             </div>
//           )}
//         </Modal.Body>
//         <Modal.Footer>
//           <Button color="success" onClick={handleDownloadImage}>
//             Download Image
//           </Button>
//           <Button color="gray" onClick={handleCloseModal}>
//             Close
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </>
//   );
// };
     

// export default PopularProducts;
import React from 'react'

const page = () => {
  return (
    <div>page</div>
  )
}

export default page
