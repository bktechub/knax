const Enrollment = require('../models/Enrollment');
const PDFDocument = require('pdfkit');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Create pdfs directory if it doesn't exist
const pdfDirectory = path.join(__dirname, '../pdfs');
if (!fs.existsSync(pdfDirectory)) {
  fs.mkdirSync(pdfDirectory, { recursive: true });
}

// Email Configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Verify email connection on startup
transporter.verify(function(error, success) {
  if (error) {
    console.log('Email server connection error:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

// async function generateAcceptanceLetter(enrollment) {
//   return new Promise((resolve, reject) => {
//     try {
//       console.log('Generating acceptance letter for:', enrollment.fullname);

//       const doc = new PDFDocument({
//         margins: { top: 100, bottom: 50, left: 50, right: 50 } // Increase the top margin
//       });
//       const pdfPath = path.join(pdfDirectory, `acceptance_${enrollment.id}_${Date.now()}.pdf`);
//       const writeStream = fs.createWriteStream(pdfPath);

//       // Generate reference number for KICDDA
//       const refNumber = `TIR-${Date.now().toString().slice(-4)}-${enrollment.id}`;

//       // Pipe the PDF document to the write stream
//       doc.pipe(writeStream);

//       // Left side header information
//       doc
//         .fontSize(11)
//         .text(`Ref: ${refNumber}`)
//         .moveDown()
//         .text(enrollment.fullname)
//         .text(enrollment.organization || '')
//         .text(`Tel: ${enrollment.phone || 'N/A'}`)
//         .text(`Email: ${enrollment.email}`)
//         .text(`Country: ${enrollment.country || 'Rwanda'}`)
//         .moveDown(2);

//       // Right side header information
//       const rightColumnX = 400;
//       doc
//         .text('info@trainingsinkigali.com', rightColumnX, 100, { align: 'right' })
//         .text('www.trainingsinkigali.com', rightColumnX, 115, { align: 'right' })
//         .text(new Date().toLocaleDateString('en-US', {
//           month: 'long',
//           day: 'numeric',
//           year: 'numeric'
//         }), rightColumnX, 130, { align: 'right' });

//       // RE: ACCEPTANCE LETTER - Now aligned with the left margin
//       doc
//         .moveDown(7)
//         .fontSize(11)
//         .text('RE: ACCEPTANCE LETTER', 50, doc.y, { underline: true }); // Set x-coordinate to 50 to match left margin

//       // Main content
//       doc
//         .moveDown(2)
//         .text(
//           `We are delighted to inform you that your request to participate in a ${
//             enrollment.duration || 'two weeks (10 days)'
//           } training workshop on ${
//             enrollment.training_title
//           } to be held from ${
//             new Date(enrollment.start_date).toLocaleDateString('en-US', {
//               month: 'long',
//               day: 'numeric',
//               year: 'numeric'
//             })
//           } – ${
//             new Date(enrollment.end_date).toLocaleDateString('en-US', {
//               month: 'long',
//               day: 'numeric',
//               year: 'numeric'
//             })
//           } in Kigali, Rwanda has been accepted. The training will take place in Kigali, Rwanda.`,
//           { align: 'left', lineGap: 5 }
//         )
//         .moveDown()
//         .text(
//           'This training as well as all facilitation and materials will be offered in English language.',
//           { align: 'left', lineGap: 5 }
//         )
//         .moveDown()
//         .text(
//           'The participation fee for this training would be 500 $. Payment should be made to bank account before the course begins (more details are in the attached invoice).',
//           { align: 'left', lineGap: 5 }
//         )
//         .moveDown()
//         .text(
//           'For any enquiry regarding this training course, do not hesitate to contact us through our email: info@traininginrwanda.com.',
//           { align: 'left', lineGap: 5 }
//         )
//         .moveDown()
//         .text(
//           'We look forward to serving you and enabling you to bring a positive change in your organization in the near future.',
//           { align: 'left', lineGap: 5 }
//         )
//         .moveDown(2)
//         .text('Yours sincerely,')
//         .moveDown()
//         .text('Training In Rwanda')
//         .text('T: +250 785 283 918')
//         .text('E: info@traininginrwanda.com')
//         .text('W: www.traininginrwanda.com')
//         .moveDown(2);

//       // Footer
//       doc
//         .fontSize(8)
//         .text('We DEVELOP and DELIVER trainings that satisfy our clients', { align: 'center' })
//         .text('info@traininginrwanda.com; www.traininginrwanda.com; +250 785 283 918', { align: 'center' });

//       // Handle stream completion
//       writeStream.on('finish', () => {
//         console.log('Acceptance letter generated successfully:', pdfPath);
//         resolve(pdfPath);
//       }); 
//       writeStream.on('error', (error) => {
//         console.error('Error writing acceptance letter:', error);
//         reject(error);
//       });

//       doc.end();
//     } catch (error) {
//       console.error('Error in generateAcceptanceLetter:', error);
//       reject(error);
//     }
//   });
// }

async function generateAcceptanceLetter(enrollment) {
  return new Promise((resolve, reject) => {
    try {
      console.log('Generating acceptance letter for:', enrollment.fullname);

      const doc = new PDFDocument({
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      });
      const pdfPath = path.join(pdfDirectory, `acceptance_${enrollment.id}_${Date.now()}.pdf`);
      const writeStream = fs.createWriteStream(pdfPath);

      // Generate reference number
      const refNumber = `TIR-${Date.now().toString().slice(-4)}-${enrollment.id}`;

      doc.pipe(writeStream);

      // Calculate page dimensions for centering
      const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
      const pageCenter = doc.page.margins.left + (pageWidth / 2);

      try {
        // Add logo
        const logoPath = '/Users/benithalouange/Documents/TRAININGINRWANDA/traininginrwanda-backend/assets/images/header-logo.png';
        if (fs.existsSync(logoPath)) {
          doc.image(logoPath, pageCenter - 75, doc.page.margins.top, {
            fit: [150, 100],
            align: 'left'
          });
          doc.moveDown(4); // Add space after logo
        } else {
          console.error('Logo file not found at:', logoPath);
        }
      } catch (imageError) {
        console.error('Error loading logo:', imageError);
      }

      // Add header logo and company name
      doc
        .fontSize(11)
        .font('Helvetica')
        .text('Kigali Capacity Development & Leadership Center', { align: 'left' })
        .moveDown(0.5);

      // Contact information
      doc
        .fontSize(11)
        .font('Helvetica')
        .text('+250788444939', { align: 'center' })
        .text('info@traininginrwanda.com', { align: 'center' })
        .moveDown(2);

      // Date
      doc
        .text(new Date().toLocaleDateString('en-US', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }))
        .moveDown(2);

      // Recipient information
      doc
        .font('Helvetica-Bold')
        .text(enrollment.fullname)
        .font('Helvetica')
        .text(enrollment.email)
        .text(enrollment.phone)
        .text(enrollment.address)
        // .text(`${enrollment.country || 'Anytown'}, ${enrollment.city || 'ST 12345'}`)
        .moveDown(2);

      // Reference number
      doc
        .text(`Ref: ${refNumber}`)
        .moveDown(2);

      // Salutation
      doc
        .text(`Dear ${enrollment.fullname},`)
        .moveDown();

      // Main content
      doc
        .text(
          `We are delighted to inform you that your request to participate in a 
          
          training workshop on ${
            enrollment.training_schedule.training.title
          } to be held from ${
            new Date(enrollment.start_date).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })
          } – ${
            new Date(enrollment.end_date).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })
          } in Kigali, Rwanda has been accepted.`,
          { align: 'justify', lineGap: 8 }
        )
        .moveDown()
        .text(
          `The training will be conducted in English language, including all facilitation and materials.`,
          { align: 'justify', lineGap: 8 }
        )
        .moveDown()
        .text(
          `The participation fee for this training is ${enrollment.training_schedule.training.fee} USD. Payment should be made to the bank account before the course begins (please refer to the attached invoice for payment details).`,
          { align: 'justify', lineGap: 8 }
        )
        .moveDown()
        .text(
          'For any inquiries regarding this training course, please contact us at info@traininginrwanda.com.',
          { align: 'justify', lineGap: 8 }
        )
        .moveDown(2);

      // Closing
      doc
        .text('Sincerely,')
        .moveDown(2)
        .font('Helvetica-Bold')
        .text('Training Coordinator')
        .font('Helvetica')
        .text('Kigali Capacity Development & Leadership Center');

      // Footer
      const footerY = doc.page.height - 50;
      doc
        .fontSize(8)
        .text('Kigali Capacity Development & Leadership Center', 50, footerY, { align: 'center' })
        .text('Leading Excellence in Professional Development', { align: 'center' });

      writeStream.on('finish', () => {
        console.log('Acceptance letter generated successfully:', pdfPath);
        resolve(pdfPath);
      });

      writeStream.on('error', (error) => {
        console.error('Error writing acceptance letter:', error);
        reject(error);
      });

      doc.end();
    } catch (error) {
      console.error('Error in generateAcceptanceLetter:', error);
      reject(error);
    }
  });
}


async function generateInvoice(enrollment) {
  return new Promise((resolve, reject) => {
    try {
      console.log('Generating invoice for:', enrollment.fullname);
      
      // Create PDF document with custom margins
      const doc = new PDFDocument({
        margins: {
          top: 40,
          bottom: 40,
          left: 40,
          right: 40
        }
      });

      const pdfPath = path.join(pdfDirectory, `invoice_${enrollment.id}_${Date.now()}.pdf`);
      const invoiceNumber = `2456`; // You can modify this to match your numbering system
      const writeStream = fs.createWriteStream(pdfPath);

      // Pipe the PDF document to the write stream
      doc.pipe(writeStream);

      // Header section
      doc
        .fontSize(12)
        .text('TRAINING IN RWANDA', { align: 'left' })
        .font('Helvetica')
        .fontSize(10)
        .text('Kigali, RWANDA')
        .text('info@traininginrwanda.com')
        .text('+250785283917')
        .moveDown(1);

      // Invoice title and number section (right-aligned)
      doc
        .fontSize(24)
        .text('INVOICE', 400, 40, { align: 'right' })
        .fontSize(10)
        .fillColor('#666666')
        .text(`INVOICE # ${invoiceNumber}`, { align: 'right' })
        .text(`DATE: ${new Date().toLocaleDateString()}`, { align: 'right' })
        .moveDown(2);

      // Bill To section
      doc
        .fontSize(10)
        .fillColor('#666666')
        .text('Bill to:')
        .fillColor('#000000')
        .text(enrollment.fullname)
        .text(enrollment.email)
        .text(enrollment.address || 'Secondary Client Area')
        .text(enrollment.country || 'Location, Rwanda')
        .moveDown(2);

      // Table header
      const tableTop = doc.y;
      doc
        .fillColor('#666666')
        .rect(40, tableTop, 515, 20)
        .fill()
        .fillColor('#ffffff')
        .fontSize(10);

      // Table headers
      doc
        .text('QTY', 50, tableTop + 5)
        .text('PRODUCT DESCRIPTION', 100, tableTop + 5)
        .text('PRICE', 350, tableTop + 5, { width: 90, align: 'right' })
        .text('TOTAL', 450, tableTop + 5, { width: 90, align: 'right' });

      // Table content
      let tableContentTop = tableTop + 30;
      doc.fillColor('#000000');

      // Add course as line item
      doc
        .text('1', 50, tableContentTop)
        .text(enrollment.training_title, 100, tableContentTop, { width: 240 })
        .text('500.00 $', 350, tableContentTop, { width: 90, align: 'right' })
        .text('500.00 $', 450, tableContentTop, { width: 90, align: 'right' });

      // Calculate totals
      const subtotal = 500.00;
      const taxRate = 0.00;
      const total = subtotal + (subtotal * taxRate);

      // Add totals
      const totalsTop = tableContentTop + 50;
      doc
        .moveTo(350, totalsTop)
        .lineTo(555, totalsTop)
        .stroke()
        .fontSize(10);

      // Subtotal
      doc
        .text('Subtotal', 350, totalsTop + 10)
        .text(`$${subtotal.toFixed(2)}`, 450, totalsTop + 10, { width: 90, align: 'right' });

      // Tax rate
      doc
        .text('Tax Rate', 350, totalsTop + 30)
        .text(`${(taxRate * 100).toFixed(1)}%`, 450, totalsTop + 30, { width: 90, align: 'right' });

      // Total
      doc
        .fontSize(12)
        .text('TOTAL', 350, totalsTop + 50)
        .text(`$${total.toFixed(2)}`, 450, totalsTop + 50, { width: 90, align: 'right' });

      // Footer
      doc
        .fontSize(10)
        .moveDown(4)
        .text('THANK YOU FOR YOUR BUSINESS', { align: 'center' })
        .moveDown(1)
        .fontSize(10)
        .text('Payment is due max 7 days after invoice without deduction.', { align: 'center' });

      // Signature line
      doc
        .moveTo(400, doc.y + 30)
        .lineTo(555, doc.y + 30)
        // .stroke()
        // .text('Signature', 400, doc.y + 35, { width: 155, align: 'center' });

      // Handle stream completion
      writeStream.on('finish', () => {
        console.log('Invoice generated successfully:', pdfPath);
        resolve(pdfPath);
      });

      writeStream.on('error', (error) => {
        console.error('Error writing invoice:', error);
        reject(error);
      });

      doc.end();
    } catch (error) {
      console.error('Error in generateInvoice:', error);
      reject(error);
    }
  });
}

async function sendEnrollmentEmail(enrollment, acceptancePath, invoicePath) {
  try {
    console.log('Sending enrollment email to:', enrollment.email);
    console.log('Attachments:', { acceptancePath, invoicePath });

    const mailOptions = {
      from: {
        name: 'Training Center',
        address: process.env.EMAIL_USER
      },
      to: enrollment.email,
      subject: `Enrollment Confirmation: ${enrollment.training_title}`,
      text: `
Dear ${enrollment.fullname},

Thank you for enrolling in ${enrollment.training_title}. 

Please find attached:
1. Your official acceptance letter
2. Course invoice

If you have any questions, please don't hesitate to contact us.

Best regards,
Training Center Team
      `,
      attachments: [
        {
          filename: 'acceptance_letter.pdf',
          path: acceptancePath,
          contentType: 'application/pdf'
        },
        {
          filename: 'invoice.pdf',
          path: invoicePath,
          contentType: 'application/pdf'
        }
      ]
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error in sendEnrollmentEmail:', error);
    throw error;
  }
}

exports.createEnrollment = async (req, res) => {
  let acceptancePath = null;
  let invoicePath = null;

  try {
    console.log('Creating enrollment with data:', req.body);
    
    // Create enrollment
    const newEnrollment = await Enrollment.createEnrollment(req.body);
    console.log('Enrollment created:', newEnrollment);
    
    // Get full enrollment details including training info
    const enrollmentDetails = await Enrollment.getEnrollmentById(newEnrollment.id);
    console.log('Retrieved enrollment details:', enrollmentDetails);
    
    // Generate PDFs
    acceptancePath = await generateAcceptanceLetter(enrollmentDetails);
    invoicePath = await generateInvoice(enrollmentDetails);
    
    // Send email with PDFs
    await sendEnrollmentEmail(enrollmentDetails, acceptancePath, invoicePath);
    
    res.status(201).json({
      message: 'Enrollment created successfully and confirmation email sent',
      enrollment: newEnrollment
    });
  } catch (error) {
    console.error('Error in createEnrollment:', error);
    res.status(500).json({
      message: 'Error creating enrollment',
      error: error.message
    });
  } finally {
    // Cleanup PDF files
    try {
      if (acceptancePath && fs.existsSync(acceptancePath)) {
        fs.unlinkSync(acceptancePath);
        console.log('Acceptance letter deleted:', acceptancePath);
      }
      if (invoicePath && fs.existsSync(invoicePath)) {
        fs.unlinkSync(invoicePath);
        console.log('Invoice deleted:', invoicePath);
      }
    } catch (error) {
      console.error('Error cleaning up PDF files:', error);
    }
  }
};

exports.getAllEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.getAllEnrollments();
    res.status(200).json(enrollments);
  } catch (error) {
    console.error('Error in getAllEnrollments:', error);
    res.status(500).json({ 
      message: 'Error fetching enrollments', 
      error: error.message 
    });
  }
};

exports.getEnrollmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const enrollment = await Enrollment.getEnrollmentById(id);
    
    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }
    
    res.status(200).json(enrollment);
  } catch (error) {
    console.error('Error in getEnrollmentById:', error);
    res.status(500).json({ 
      message: 'Error fetching enrollment', 
      error: error.message 
    });
  }
};

exports.updateEnrollmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const result = await Enrollment.updateEnrollmentStatus(id, status);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error in updateEnrollmentStatus:', error);
    res.status(500).json({ 
      message: 'Error updating enrollment status', 
      error: error.message 
    });
  }
};