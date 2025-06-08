// const crypto = require('crypto');
// const bcrypt = require('bcryptjs');
// const nodemailer = require('nodemailer');

// // Forgot Password
// exports.forgotPassword = async (req, res) => {
//   const { email } = req.body;

//   try {
//     // Find user by email
//     const user = await findUserByEmail(email);
    
//     if (!user) {
//       return res.status(404).json({ message: 'No user found with that email' });
//     }

//     // Generate reset token
//     const resetToken = crypto.randomBytes(32).toString('hex');
//     const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now

//     // Save reset token to database
//     await saveResetToken(user.id, resetToken, resetTokenExpiry);

//     // Send reset email
//     const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
//     await sendResetPasswordEmail(email, resetUrl);

//     res.status(200).json({ 
//       message: 'Password reset link sent to your email' 
//     });
//   } catch (error) {
//     res.status(500).json({ 
//       message: 'Error processing password reset', 
//       error: error.message 
//     });
//   }
// };

// // Reset Password
// exports.resetPassword = async (req, res) => {
//   const { token, newPassword } = req.body;

//   try {
//     // Find user by reset token and check expiry
//     const user = await findUserByResetToken(token);
    
//     if (!user) {
//       return res.status(400).json({ message: 'Invalid or expired reset token' });
//     }

//     // Hash new password
//     const salt = bcrypt.genSaltSync(10);
//     const hashedPassword = bcrypt.hashSync(newPassword, salt);

//     // Update password and clear reset token
//     await updateUserPassword(user.id, hashedPassword);

//     res.status(200).json({ 
//       message: 'Password reset successful' 
//     });
//   } catch (error) {
//     res.status(500).json({ 
//       message: 'Error resetting password', 
//       error: error.message 
//     });
//   }
// };

// // Change Password (for logged-in users)
// exports.changePassword = async (req, res) => {
//   const { currentPassword, newPassword } = req.body;
//   const userId = req.user.id;

//   try {
//     // Fetch user from database
//     const user = await findUserById(userId);

//     // Verify current password
//     const isMatch = bcrypt.compareSync(currentPassword, user.password);
//     if (!isMatch) {
//       return res.status(400).json({ message: 'Current password is incorrect' });
//     }

//     // Hash new password
//     const salt = bcrypt.genSaltSync(10);
//     const hashedPassword = bcrypt.hashSync(newPassword, salt);

//     // Update password
//     await updateUserPassword(userId, hashedPassword);

//     res.status(200).json({ 
//       message: 'Password changed successfully' 
//     });
//   } catch (error) {
//     res.status(500).json({ 
//       message: 'Error changing password', 
//       error: error.message 
//     });
//   }
// };

// // Get All Users (admin-only)
// exports.getAllUsers = async (req, res) => {
//   try {
//     // Fetch users (exclude sensitive information)
//     const users = await fetchAllUsers();

//     res.status(200).json({ 
//       users: users.map(user => ({
//         id: user.id,
//         username: user.username,
//         email: user.email,
//         role: user.role
//       })) 
//     });
//   } catch (error) {
//     res.status(500).json({ 
//       message: 'Error fetching users', 
//       error: error.message 
//     });
//   }
// };

// // Helper functions (you'll need to implement these with your SQLite database)
// function findUserByEmail(email) {
//   return new Promise((resolve, reject) => {
//     db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
//       if (err) reject(err);
//       resolve(user);
//     });
//   });
// }

// function saveResetToken(userId, token, expiry) {
//   return new Promise((resolve, reject) => {
//     db.run(
//       'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?', 
//       [token, expiry, userId], 
//       (err) => {
//         if (err) reject(err);
//         resolve();
//       }
//     );
//   });
// }

// function sendResetPasswordEmail(email, resetUrl) {
//   // Configure nodemailer transporter
//   const transporter = nodemailer.createTransport({
//     // Your email configuration
//     service: 'gmail',
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS
//     }
//   });

//   const mailOptions = {
//     from: process.env.EMAIL_USER,
//     to: email,
//     subject: 'Password Reset',
//     html: `
//       <h1>Password Reset</h1>
//       <p>Click the link below to reset your password:</p>
//       <a href="${resetUrl}">Reset Password</a>
//     `
//   };

//   return transporter.sendMail(mailOptions);
// }

// // Login Controller
// exports.login = async (req, res) => {
//     const { email, password } = req.body;
  
//     try {
//       // Find user by email
//       const user = await findUserByEmail(email);
      
//       if (!user) {
//         return res.status(404).json({ 
//           message: 'No user found with that email' 
//         });
//       }
  
//       // Verify password
//       const isMatch = bcrypt.compareSync(password, user.password);
      
//       if (!isMatch) {
//         return res.status(401).json({ 
//           message: 'Invalid credentials' 
//         });
//       }
  
//       // Generate JWT token
//       const token = generateToken(user);
  
//       res.status(200).json({ 
//         message: 'Login successful',
//         token,
//         user: {
//           id: user.id,
//           username: user.username,
//           email: user.email,
//           role: user.role
//         }
//       });
//     } catch (error) {
//       res.status(500).json({ 
//         message: 'Login error', 
//         error: error.message 
//       });
//     }
//   };
  
//   // Helper function to generate JWT token
//   function generateToken(user) {
//     return jwt.sign(
//       { 
//         id: user.id, 
//         email: user.email, 
//         role: user.role 
//       }, 
//       process.env.JWT_SECRET, 
//       { 
//         expiresIn: '1h' // Token expires in 1 hour
//       }
//     );
//   }
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { validationResult, check } = require('express-validator');
const nodemailer = require('nodemailer');

// Validation middleware
exports.validateRegistration = [
  check('username')
    .trim()
    .not()
    .isEmpty()
    .withMessage('Username is required')
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters long'),
  check('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email'),
  check('password')
    .trim()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
];

// Helper function to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role 
    }, 
    process.env.JWT_SECRET, 
    { 
      expiresIn: '1h' 
    }
  );
};

// Send reset password email
const sendResetPasswordEmail = async (email, resetUrl) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Password Reset',
    html: `
      <h1>Password Reset</h1>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">Reset Password</a>
    `
  };

  return transporter.sendMail(mailOptions);
};

// Registration Controller
exports.register = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { username, email, password, role = 'USER' } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: { 
        OR: [
          { email: email },
          { username: username }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'User with this email or username already exists',
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        username, 
        email, 
        password: hashedPassword, 
        role
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true
      }
    });

    // Generate token
    const token = generateToken(newUser);

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: newUser
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      message: 'Error during registration',
      error: error.message,
    });
  }
};

// Login Controller
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      return res.status(404).json({ 
        message: 'No user found with that email' 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(401).json({ 
        message: 'Invalid credentials' 
      });
    }

    const token = generateToken(user);

    res.status(200).json({ 
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Login error', 
      error: error.message 
    });
  }
};

// Forgot Password Controller
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      return res.status(404).json({ message: 'No user found with that email' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Save reset token to database
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        resetToken, 
        resetTokenExpiry 
      }
    });

    // Send reset email
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    await sendResetPasswordEmail(email, resetUrl);

    res.status(200).json({ 
      message: 'Password reset link sent to your email' 
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error processing password reset', 
      error: error.message 
    });
  }
};

// Reset Password Controller
exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    // Find user by reset token and check expiry
    const user = await prisma.user.findFirst({
      where: { 
        resetToken: token,
        resetTokenExpiry: { gt: new Date() } 
      }
    });
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      }
    });

    res.status(200).json({ 
      message: 'Password reset successful' 
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error resetting password', 
      error: error.message 
    });
  }
};

// Change Password Controller
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  try {
    // Fetch user from database
    const user = await prisma.user.findUnique({ where: { id: userId } });

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    res.status(200).json({ 
      message: 'Password changed successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error changing password', 
      error: error.message 
    });
  }
};

// Get All Users (admin-only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true
      }
    });

    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching users', 
      error: error.message 
    });
  }
};

// Get User Profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        username: true,
        email: true,
        role: true
      }
    });

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching user profile', 
      error: error.message 
    });
  }
};

// Update User Profile
exports.updateUserProfile = async (req, res) => {
  const { username, email } = req.body;

  try {
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        username,
        email
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true
      }
    });

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error updating user profile', 
      error: error.message 
    });
  }
};