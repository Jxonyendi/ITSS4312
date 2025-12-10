/**
 * Pizza Time Backend API Server
 * Node.js + Express + JSON File Storage
 * 
 * To use this backend:
 * 1. Install dependencies: npm install express cors dotenv bcryptjs jsonwebtoken
 * 2. Create .env file with configuration
 * 3. Run: node server.js
 */

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Use MongoDB if connection string is provided, otherwise fall back to file storage
const useMongoDB = !!(process.env.MONGODB_URI || process.env.MONGODB_CONNECTION_STRING);
const db = useMongoDB ? require('./mongo-storage') : require('./data-storage');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// JWT Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Routes

// Root route
app.get('/', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Pizza Time Backend API', 
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth/*',
      contacts: '/api/contacts',
      orders: '/api/orders',
      email: '/api/contact/send-email',
      chat: '/api/chat/message'
    },
    note: 'This is the API server. Use the frontend at http://localhost:4200'
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'API is running', 
    storage: useMongoDB ? 'MongoDB Atlas' : 'JSON file storage' 
  });
});

// Email configuration check (for debugging)
app.get('/api/contact/check-email-config', (req, res) => {
  const hasEmailUser = !!process.env.EMAIL_USER && process.env.EMAIL_USER !== 'your-email@gmail.com';
  const hasEmailPass = !!process.env.EMAIL_PASSWORD && process.env.EMAIL_PASSWORD !== 'your-app-password';
  res.json({ 
    success: true, 
    emailConfigured: hasEmailUser && hasEmailPass,
    hasEmailUser,
    hasEmailPass,
    emailUser: hasEmailUser ? process.env.EMAIL_USER.substring(0, 3) + '***' : 'not set'
  });
});

// Authentication Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required' });
    }

    // Check if user exists
    const existingUser = await db.findOne('users', { username: username.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Username already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = {
      username: username.toLowerCase(),
      email: email || undefined,
      password: hashedPassword
    };

    const savedUser = await db.insert('users', user);

    // Generate token
    const token = jwt.sign(
      { userId: savedUser._id, username: savedUser.username },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Registration successful',
      token,
      user: { id: savedUser._id, username: savedUser.username, email: savedUser.email, createdAt: savedUser.createdAt }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Registration failed', error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required' });
    }

    // Find user
    const user = await db.findOne('users', { username: username.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: { id: user._id, username: user.username, email: user.email, createdAt: user.createdAt }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Login failed', error: error.message });
  }
});

// Delete account
app.post('/api/auth/delete-account', authenticateToken, async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ success: false, message: 'Password is required' });
    }

    // Find user
    const user = await db.findById('users', req.user.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password || '');
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid password' });
    }

    // Delete user
    const deletedUser = await db.findOneAndDelete('users', { _id: req.user.userId });
    if (!deletedUser) {
      return res.status(500).json({ success: false, message: 'Failed to delete user' });
    }

    // Also delete user-related data (contacts and orders)
    const userId = req.user.userId;
    await db.delete('contacts', { userId });
    await db.delete('orders', { userId });

    return res.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete account', error: error.message });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await db.findById('users', req.user.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    res.json({ success: true, user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get user', error: error.message });
  }
});

// Contacts Routes
app.get('/api/contacts', authenticateToken, async (req, res) => {
  try {
    const contacts = await db.find('contacts', { userId: req.user.userId });
    res.json({ success: true, data: contacts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get contacts', error: error.message });
  }
});

app.post('/api/contacts', authenticateToken, async (req, res) => {
  try {
    const { name, phone, isPrimary } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ success: false, message: 'Name and phone are required' });
    }

    const contact = await db.insert('contacts', {
      userId: req.user.userId,
      name,
      phone,
      isPrimary: isPrimary || false
    });
    res.json({ success: true, data: contact, message: 'Contact created' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create contact', error: error.message });
  }
});

app.put('/api/contacts/:id', authenticateToken, async (req, res) => {
  try {
    const contact = await db.findOneAndUpdate(
      'contacts',
      { _id: req.params.id, userId: req.user.userId },
      req.body
    );
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }
    res.json({ success: true, data: contact, message: 'Contact updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update contact', error: error.message });
  }
});

app.delete('/api/contacts/:id', authenticateToken, async (req, res) => {
  try {
    const contact = await db.findOneAndDelete('contacts', { _id: req.params.id, userId: req.user.userId });
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }
    res.json({ success: true, message: 'Contact deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete contact', error: error.message });
  }
});

// Orders Routes
app.get('/api/orders', authenticateToken, async (req, res) => {
  try {
    const orders = await db.find('orders', { userId: req.user.userId });
    // Sort by placedAt descending (most recent first)
    orders.sort((a, b) => {
      const dateA = typeof a.placedAt === 'number' ? a.placedAt : new Date(a.placedAt).getTime();
      const dateB = typeof b.placedAt === 'number' ? b.placedAt : new Date(b.placedAt).getTime();
      return dateB - dateA;
    });
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get orders', error: error.message });
  }
});

app.post('/api/orders', authenticateToken, async (req, res) => {
  try {
    const orderData = {
      userId: req.user.userId,
      ...req.body,
      placedAt: req.body.placedAt || Date.now()
    };
    const order = await db.insert('orders', orderData);
    res.json({ success: true, data: order, message: 'Order created' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create order', error: error.message });
  }
});

app.get('/api/orders/:id', authenticateToken, async (req, res) => {
  try {
    const order = await db.findOne('orders', { _id: req.params.id, userId: req.user.userId });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get order', error: error.message });
  }
});

app.put('/api/orders/:id', authenticateToken, async (req, res) => {
  try {
    const order = await db.findOneAndUpdate(
      'orders',
      { _id: req.params.id, userId: req.user.userId },
      req.body
    );
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, data: order, message: 'Order updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update order', error: error.message });
  }
});

app.delete('/api/orders/:id', authenticateToken, async (req, res) => {
  try {
    const order = await db.findOneAndDelete('orders', { _id: req.params.id, userId: req.user.userId });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, message: 'Order cancelled' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to cancel order', error: error.message });
  }
});

// Gemini Chat Routes (No authentication required for contact form)
app.post('/api/chat/message', async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    // Check if Gemini API key is configured
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your-gemini-api-key-here') {
      return res.status(500).json({ 
        success: false, 
        message: 'Chat service is not configured. Please add GEMINI_API_KEY to backend/.env file.' 
      });
    }

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Try gemini-2.5-flash first, fallback to gemini-1.5-flash if not available
    let model;
    let modelName = 'gemini-2.5-flash';
    
    try {
      model = genAI.getGenerativeModel({ model: modelName });
      // Test if model is accessible with a simple call
      try {
        const testResult = await model.generateContent('test');
        testResult.response.text(); // Ensure it works
        console.log(`✓ Using model: ${modelName}`);
      } catch (testError) {
        console.log(`✗ Model ${modelName} test failed: ${testError.message}`);
        throw testError; // Re-throw to trigger fallback
      }
    } catch (modelError) {
      console.log(`⚠ Model ${modelName} not available: ${modelError.message}`);
      console.log('↻ Falling back to gemini-1.5-flash');
      modelName = 'gemini-1.5-flash';
      model = genAI.getGenerativeModel({ model: modelName });
      // Test the fallback model too
      try {
        const testResult = await model.generateContent('test');
        testResult.response.text();
        console.log(`✓ Using fallback model: ${modelName}`);
      } catch (fallbackError) {
        console.error(`✗ Fallback model also failed: ${fallbackError.message}`);
        throw new Error(`Both models failed. Last error: ${fallbackError.message}`);
      }
    }

    // Build conversation history for prompt
    const recentHistory = (history || []).slice(-10); // Keep last 10 messages
    
    // Build prompt with conversation history
    let prompt = 'You are a helpful customer support assistant for Pizza Time, a pizza delivery app. Be friendly, concise, and helpful. Answer questions about orders, menu items, delivery, and account issues.\n\n';
    
    // Add conversation history
    if (recentHistory.length > 0) {
      recentHistory.forEach(msg => {
        if (msg.role === 'user') {
          prompt += `User: ${msg.content}\n`;
        } else if (msg.role === 'assistant') {
          prompt += `Assistant: ${msg.content}\n`;
        }
      });
    }
    
    // Add current user message
    prompt += `User: ${message}\n\nAssistant:`;
    
    // Use generateContent for all requests (simpler and more reliable)
    const result = await model.generateContent(prompt);
    const assistantMessage = result.response.text();
    
    res.json({ 
      success: true, 
      data: { message: assistantMessage },
      message: assistantMessage
    });
    return;

    res.json({ 
      success: true, 
      message: assistantMessage
    });
  } catch (error) {
    console.error('Gemini API error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      status: error.status,
      stack: error.stack
    });
    
    // Provide more helpful error messages
    let errorMessage = 'Failed to get chat response';
    if (error.message?.includes('API_KEY_INVALID') || error.message?.includes('invalid API key') || error.message?.includes('API key')) {
      errorMessage = 'Invalid Gemini API key. Please check your GEMINI_API_KEY in backend/.env file.';
    } else if (error.message?.includes('MODEL_NOT_FOUND') || error.message?.includes('model') || error.message?.includes('Model')) {
      errorMessage = 'Gemini model not found. The model name may be incorrect.';
    } else if (error.message?.includes('quota') || error.message?.includes('Quota')) {
      errorMessage = 'API quota exceeded. Please check your Google AI Studio quota.';
    } else if (error.message) {
      errorMessage = `Chat error: ${error.message}`;
    }
    
    res.status(500).json({ 
      success: false, 
      message: errorMessage,
      error: error.message || 'Unknown error'
    });
  }
});

// Email Routes (No authentication required for contact form)
app.post('/api/contact/send-email', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Name, email, and message are required' });
    }

    // Simulate email sending (mock mode)
    // Log the email details for debugging
    console.log('📧 Email submission received:');
    console.log(`   From: ${name} (${email})`);
    console.log(`   Subject: ${subject || 'Support Request'}`);
    console.log(`   Message: ${message.substring(0, 100)}${message.length > 100 ? '...' : ''}`);

    // Simulate a small delay (like sending an email would take)
    await new Promise(resolve => setTimeout(resolve, 500));

    // Return success response
    res.json({ 
      success: true, 
      message: 'Email sent successfully!' 
    });
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send email',
      error: error.message || 'Unknown error'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
  if (useMongoDB) {
    console.log('💾 Using MongoDB Atlas');
  } else {
  console.log('💾 Using JSON file storage (no MongoDB required)');
  console.log(`📁 Data stored in: ${__dirname}/data/`);
  }
});
