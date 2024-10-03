import nodemailer from 'nodemailer';
import { Buffer } from 'buffer';

export async function POST(req) {
  const formData = await req.formData(); // Use formData() to parse the multipart form data
  
  const name = formData.get('name');
  const bcc = formData.get('bcc');
  const subject = formData.get('subject');
  const message = formData.get('message');
  const image = formData.get('image'); // File object for the image

  // Validate the form data
  if (!name || !bcc || !subject || !message || !image) {
    return new Response(JSON.stringify({ error: 'All fields are required, including the image.' }), { status: 400 });
  }

  // Convert the image file to a base64 string
  const imageBuffer = await image.arrayBuffer();
  const base64Image = Buffer.from(imageBuffer).toString('base64');

  // Set up Nodemailer transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Define the mail options, including the image as an attachment
  const mailOptions = {
    from: process.env.EMAIL_USER, // Sender's email
    bcc: bcc, // Send email as BCC
    subject: subject,
    text: `${message}`,
    attachments: [
      {
        filename: image.name, // Get the original file name
        content: base64Image, // Base64 encoded image
        encoding: 'base64', // Specify the encoding format
      },
    ],
  };

  try {
    // Send the email
    await transporter.sendMail(mailOptions);
    return new Response(JSON.stringify({ message: 'Email with image sent successfully!' }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
