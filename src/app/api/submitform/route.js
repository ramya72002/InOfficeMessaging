// src/app/api/submitform/route.js
import nodemailer from 'nodemailer';

export async function POST(req) {
  const { name, bcc, subject, message } = await req.json();

  // Validate the form data
  if (!name || !bcc || !subject || !message) {
    return new Response(JSON.stringify({ error: 'All fields are required.' }), { status: 400 });
  }

  // Set up Nodemailer transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER, // Use your sender email here
    bcc: bcc, // Send emails for BCC
    subject: subject,
    text: `Name: ${name}\nMessage: ${message}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    return new Response(JSON.stringify({ message: 'Email sent successfully!' }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
