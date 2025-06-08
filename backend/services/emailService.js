const PDFDocument = require('pdfkit');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const { db } = require('../app');

// Email Configuration - Using environment variables for security
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Company configuration - Should be moved to a config file
const companyInfo = {
  name: 'Professional Training Center',
  address: '123 Education Street',
  city: 'New York, NY 10001',
  phone: '+1 (555) 123-4567',
  email: 'contact@trainingcenter.com',
  website: 'www.trainingcenter.com',
  logo: path.join(__dirname, '../assets/logo.png')
};

exports.enrollInCourse = (req, res) => {
  const { userId, courseId, personalInfo } = req.body;

  // Validate required fields
  if (!userId || !courseId || !personalInfo) {
    return res.status(400).json({ error: 'Missing required information' });
  }

  // First, check if course has available capacity
  db.get(`
    SELECT c.*, t.price, t.title as training_title
    FROM courses c
    JOIN trainings t ON c.training_id = t.id
    WHERE c.id = ?`, 
    [courseId], 
    async (err, course) => {
      if (err || !course) {
        return res.status(404).json({ error: 'Course not found' });
      }

      try {
        // Begin transaction
        await new Promise((resolve, reject) => {
          db.run('BEGIN TRANSACTION', err => {
            if (err) reject(err);
            resolve();
          });
        });

        // Insert enrollment with timestamp
        const enrollQuery = `
          INSERT INTO enrollments (user_id, course_id, enrolled_at)
          VALUES (?, ?, datetime('now'))
        `;

        await new Promise((resolve, reject) => {
          db.run(enrollQuery, [userId, courseId], (err) => {
            if (err) reject(err);
            resolve();
          });
        });

        // Generate documents with enrollment reference
        const enrollmentRef = `ENR-${Date.now().toString().slice(-6)}`;
        const acceptancePdfPath = await generateAcceptanceLetter(course, personalInfo, enrollmentRef);
        const invoicePdfPath = await generateInvoice(course, personalInfo, enrollmentRef);

        // Send Email
        await sendEnrollmentEmail(personalInfo.email, course, acceptancePdfPath, invoicePdfPath, enrollmentRef);

        // Commit transaction
        await new Promise((resolve, reject) => {
          db.run('COMMIT', err => {
            if (err) reject(err);
            resolve();
          });
        });

        // Clean up PDF files after sending
        fs.unlinkSync(acceptancePdfPath);
        fs.unlinkSync(invoicePdfPath);

        res.status(201).json({
          message: 'Successfully enrolled',
          enrollmentReference: enrollmentRef,
          course: course
        });

      } catch (error) {
        // Rollback transaction on error
        db.run('ROLLBACK');
        res.status(500).json({ 
          error: 'Enrollment process failed',
          details: error.message 
        });
      }
    });
};

function generateAcceptanceLetter(course, personalInfo, enrollmentRef) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50
    });
    
    const pdfPath = path.join(__dirname, '../pdfs', `acceptance_${enrollmentRef}.pdf`);
    doc.pipe(fs.createWriteStream(pdfPath));

    // Add company logo
    if (fs.existsSync(companyInfo.logo)) {
      doc.image(companyInfo.logo, 50, 45, { width: 150 });
    }

    // Header with company info
    doc
      .fontSize(10)
      .text(companyInfo.name, 400, 50, { align: 'right' })
      .text(companyInfo.address, { align: 'right' })
      .text(companyInfo.city, { align: 'right' })
      .text(companyInfo.phone, { align: 'right' })
      .text(companyInfo.email, { align: 'right' });

    // Reference number and date
    doc
      .moveDown(2)
      .fontSize(10)
      .text(`Ref: ${enrollmentRef}`, { align: 'left' })
      .text(`Date: ${new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}`, { align: 'left' });

    // Main content
    doc
      .moveDown(2)
      .fontSize(20)
      .text('LETTER OF ACCEPTANCE', { align: 'center' })
      .moveDown(2)
      .fontSize(12)
      .text(`Dear ${personalInfo.fullName},`)
      .moveDown()
      .text('We are delighted to confirm your acceptance into our professional training program:')
      .moveDown()
      .fontSize(14)
      .text(course.training_title, { indent: 30, bold: true })
      .moveDown()
      .fontSize(12)
      .text('Course Details:', { bold: true })
      .moveDown()
      .text('Duration:', { continued: true, indent: 30 })
      .text(`${formatDate(course.start_date)} to ${formatDate(course.end_date)}`, { indent: 150 })
      .text('Location:', { continued: true, indent: 30 })
      .text(course.location || 'Online/Virtual', { indent: 150 })
      .text('Course Format:', { continued: true, indent: 30 })
      .text(course.format || 'Full-time', { indent: 150 })
      .moveDown(2)
      .text('Important Information:')
      .moveDown()
      .text('1. Please find the attached invoice for the course fees.', { indent: 30 })
      .text('2. Your enrollment will be confirmed upon receipt of payment.', { indent: 30 })
      .text('3. Course materials will be provided on the first day of training.', { indent: 30 })
      .moveDown(2)
      .text('We look forward to providing you with an enriching learning experience. Should you have any questions, please don\'t hesitate to contact our support team.')
      .moveDown(2)
      .text('Best regards,')
      .moveDown()
      .text('Training Center Management')
      .text(companyInfo.name);

    // Footer
    const pageBottom = doc.page.height - 100;
    doc
      .fontSize(8)
      .text(companyInfo.website, 50, pageBottom, { align: 'center', color: 'blue' })
      .text(`${companyInfo.name} - ${companyInfo.address} - ${companyInfo.city}`, { align: 'center' });

    doc.end();
    doc.on('finish', () => resolve(pdfPath));
    doc.on('error', reject);
  });
}

function generateInvoice(course, personalInfo, enrollmentRef) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50
    });
    
    const pdfPath = path.join(__dirname, '../pdfs', `invoice_${enrollmentRef}.pdf`);
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
    
    doc.pipe(fs.createWriteStream(pdfPath));

    // Company logo
    if (fs.existsSync(companyInfo.logo)) {
      doc.image(companyInfo.logo, 50, 45, { width: 150 });
    }

    // Company Info (Right aligned)
    doc
      .fontSize(10)
      .text(companyInfo.name, 400, 50, { align: 'right' })
      .text(companyInfo.address, { align: 'right' })
      .text(companyInfo.city, { align: 'right' })
      .text(companyInfo.phone, { align: 'right' })
      .text(companyInfo.email, { align: 'right' });

    // Invoice Title and Details
    doc
      .moveDown(4)
      .fontSize(20)
      .text('INVOICE', { align: 'center' })
      .moveDown()
      .fontSize(10)
      .text(`Invoice Number: ${invoiceNumber}`)
      .text(`Date: ${new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}`)
      .text(`Enrollment Reference: ${enrollmentRef}`);

    // Bill To section
    doc
      .moveDown(2)
      .fontSize(12)
      .text('Bill To:', { bold: true })
      .fontSize(10)
      .text(personalInfo.fullName)
      .text(personalInfo.email)
      .text(personalInfo.address || '')
      .moveDown(2);

    // Invoice Table
    const tableTop = doc.y;
    const tableHeaders = ['Description', 'Amount'];
    const columnWidth = (doc.page.width - 100) / 2;

    // Draw table headers
    doc
      .fontSize(10)
      .text(tableHeaders[0], 50, tableTop, { width: columnWidth, bold: true })
      .text(tableHeaders[1], 50 + columnWidth, tableTop, { width: columnWidth, align: 'right', bold: true });

    // Draw horizontal line
    doc
      .moveTo(50, tableTop + 20)
      .lineTo(550, tableTop + 20)
      .stroke();

    // Add course details
    const courseY = tableTop + 30;
    doc
      .text(course.training_title, 50, courseY, { width: columnWidth })
      .text(`$${course.price.toFixed(2)}`, 50 + columnWidth, courseY, { width: columnWidth, align: 'right' });

    // Draw bottom line
    doc
      .moveTo(50, courseY + 30)
      .lineTo(550, courseY + 30)
      .stroke();

    // Total
    doc
      .moveDown(2)
      .fontSize(12)
      .text('Total:', 350)
      .text(`$${course.price.toFixed(2)}`, { align: 'right' });

    // Payment Instructions
    doc
      .moveDown(3)
      .fontSize(12)
      .text('Payment Instructions', { underline: true })
      .moveDown()
      .fontSize(10)
      .text('Please make payment within 14 days to:')
      .moveDown()
      .text('Bank Name: International Bank')
      .text('Account Name: Professional Training Center')
      .text('Account Number: XXXX-XXXX-XXXX-XXXX')
      .text('Swift Code: XXXXXX')
      .text(`Payment Reference: ${invoiceNumber}`)
      .moveDown(2)
      .text('Note: Please include the invoice number in your payment reference to ensure proper allocation of your payment.');

    // Footer
    const pageBottom = doc.page.height - 100;
    doc
      .fontSize(8)
      .text(companyInfo.website, 50, pageBottom, { align: 'center', color: 'blue' })
      .text(`${companyInfo.name} - ${companyInfo.address} - ${companyInfo.city}`, { align: 'center' });

    doc.end();
    doc.on('finish', () => resolve(pdfPath));
    doc.on('error', reject);
  });
}

async function sendEnrollmentEmail(email, course, acceptancePath, invoicePath, enrollmentRef) {
  const mailOptions = {
    from: {
      name: companyInfo.name,
      address: process.env.EMAIL_USER
    },
    to: email,
    subject: `Course Enrollment Confirmation - ${enrollmentRef}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Course Enrollment Confirmation</h2>
        <p>Dear ${email},</p>
        
        <p>Thank you for enrolling in <strong>${course.training_title}</strong>.</p>
        
        <p>Your enrollment reference number is: <strong>${enrollmentRef}</strong></p>
        
        <p>Please find attached:</p>
        <ul>
          <li>Official Acceptance Letter</li>
          <li>Course Invoice</li>
        </ul>
        
        <p><strong>Next Steps:</strong></p>
        <ol>
          <li>Review the attached documents carefully</li>
          <li>Process the payment according to the instructions in the invoice</li>
          <li>Keep your enrollment reference number for future correspondence</li>
        </ol>
        
        <p>If you have any questions, please don't hesitate to contact our support team at ${companyInfo.email}</p>
        
        <p>Best regards,<br>
        ${companyInfo.name} Team</p>
        
        <hr>
        <p style="font-size: 12px; color: #666;">
          ${companyInfo.name}<br>
          ${companyInfo.address}<br>
          ${companyInfo.city}<br>
          ${companyInfo.phone}
        </p>
      </div>
    `,
    attachments: [
      {
        filename: `acceptance_letter_${enrollmentRef}.pdf`,
        path: acceptancePath
      },
      {
        filename: `invoice_${enrollmentRef}.pdf`,
        path: invoicePath
      }
    ]
  };

  return transporter.sendMail(mailOptions);
}

// Utility function to format dates
function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}