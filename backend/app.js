const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const { pool, initializeDatabase, query } = require('./db');

dotenv.config();

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'hef-portal-secret-key';

// Pesapal Configuration
const PESAPAL_CONFIG = {
  consumerKey: 'pfx_0b781505379f3b0735972d867e2d66027639bd2e',
  consumerSecret: process.env.PESAPAL_CONSUMER_SECRET || 'your_consumer_secret',
  apiUrl: 'https://pay.pesapal.com/v3/api',
  businessId: '272',
  callbackUrl: process.env.PESAPAL_CALLBACK_URL || '',
  notificationId: process.env.PESAPAL_NOTIFICATION_ID || ''
};

const getCallbackUrl = (req) =>
  PESAPAL_CONFIG.callbackUrl || `${req.protocol}://${req.get('host')}/api/payment/callback`;

app.use(cors());
app.use(express.json());

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Pesapal Authentication
async function getPesapalToken() {
  try {
    const response = await axios.post(`${PESAPAL_CONFIG.apiUrl}/Auth/RequestToken`, {
      consumer_key: PESAPAL_CONFIG.consumerKey,
      consumer_secret: PESAPAL_CONFIG.consumerSecret
    }, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data.token;
  } catch (error) {
    console.error('Pesapal auth error:', error.response?.data || error.message);
    throw new Error('Failed to authenticate with Pesapal');
  }
}

// Register IPN (Instant Payment Notification) URL
async function registerIPN(token, callbackUrl) {
  try {
    const response = await axios.post(`${PESAPAL_CONFIG.apiUrl}/URLSetup/RegisterIPN`, {
      url: callbackUrl,
      ipn_notification_type: 'GET'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data.ipn_id;
  } catch (error) {
    console.error('IPN registration error:', error.response?.data || error.message);
    throw new Error('Failed to register IPN');
  }
}

// Submit Order Request for STK Push
async function submitOrderRequest(token, orderData) {
  try {
    const response = await axios.post(`${PESAPAL_CONFIG.apiUrl}/Transactions/SubmitOrderRequest`, orderData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Order request error:', error.response?.data || error.message);
    throw new Error('Failed to submit order request');
  }
}

app.post('/api/auth/login', async (req, res) => {
  try {
    const { identifier, password, rememberMe } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ message: 'Email/ID and password are required' });
    }

    const result = await query(
      'SELECT * FROM users WHERE email = $1 OR id_number = $1',
      [identifier]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: rememberMe ? '30d' : '1d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        idNumber: user.id_number
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { fullName, email, idNumber, password, userType } = req.body;

    if (!fullName || !email || !idNumber || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const existingUser = await query(
      'SELECT * FROM users WHERE email = $1 OR id_number = $2',
      [email, idNumber]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: Date.now().toString(),
      fullName,
      email,
      idNumber,
      password: hashedPassword,
      userType: userType || 'applicant',
      createdAt: new Date().toISOString()
    };

    await query(
      `INSERT INTO users (id, email, id_number, full_name, password, user_type, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [newUser.id, newUser.email, newUser.idNumber, newUser.fullName, newUser.password, newUser.userType, newUser.createdAt]
    );

    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.fullName,
        idNumber: newUser.idNumber
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Password reset link sent to email' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'HEF Portal API' });
});

app.post('/api/appeals', authMiddleware, async (req, res) => {
  try {
    const { institution, course, yearOfStudy, admissionNumber, appealReason, supportingDocuments } = req.body;

    if (!institution || !course || !yearOfStudy || !admissionNumber || !appealReason) {
      return res.status(400).json({ message: 'All required fields must be filled' });
    }

    const userResult = await query('SELECT * FROM users WHERE id = $1', [req.userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const newAppeal = {
      id: Date.now().toString(),
      userId: req.userId,
      institution,
      course,
      yearOfStudy,
      admissionNumber,
      appealReason,
      supportingDocuments: supportingDocuments || [],
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    await query(
      `INSERT INTO appeals (id, user_id, institution, course, year_of_study, admission_number, appeal_reason, supporting_documents, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [newAppeal.id, newAppeal.userId, newAppeal.institution, newAppeal.course, newAppeal.yearOfStudy,
       newAppeal.admissionNumber, newAppeal.appealReason, JSON.stringify(newAppeal.supportingDocuments),
       newAppeal.status, newAppeal.createdAt]
    );

    res.status(201).json({
      message: 'Appeal submitted successfully',
      appeal: newAppeal
    });
  } catch (error) {
    console.error('Appeal submission error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/appeals', authMiddleware, async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM appeals WHERE user_id = $1 ORDER BY created_at DESC',
      [req.userId]
    );

    const appeals = result.rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      institution: row.institution,
      course: row.course,
      yearOfStudy: row.year_of_study,
      admissionNumber: row.admission_number,
      appealReason: row.appeal_reason,
      supportingDocuments: row.supporting_documents,
      status: row.status,
      createdAt: row.created_at
    }));

    res.json({ appeals });
  } catch (error) {
    console.error('Get appeals error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Payment Endpoints
app.post('/api/payment/initiate', async (req, res) => {
  try {
    const { fullName, email, idNumber, phoneNumber, amount, accountNumber, userType } = req.body;

    if (!fullName || !email || !idNumber || !phoneNumber) {
      return res.status(400).json({ message: 'Missing required payment information' });
    }

    const token = await getPesapalToken();

    if (!PESAPAL_CONFIG.notificationId) {
      const ipnId = await registerIPN(token, getCallbackUrl(req));
      PESAPAL_CONFIG.notificationId = ipnId;
    }

    const orderData = {
      id: `ORDER-${Date.now()}`,
      currency: 'KES',
      amount: amount || 1000,
      description: `HEF Portal Registration Fee - ${fullName}`,
      callback_url: getCallbackUrl(req),
      notification_id: PESAPAL_CONFIG.notificationId,
      billing_address: {
        email_address: email,
        phone_number: phoneNumber,
        country_code: 'KE',
        first_name: fullName.split(' ')[0],
        last_name: fullName.split(' ').slice(1).join(' ') || '',
        line_1: 'HEF Portal Registration',
        city: 'Nairobi',
        state: 'Nairobi',
        postal_code: '00100',
        zip_code: '00100'
      },
      items: [
        {
          name: 'HEF Portal Registration Fee',
          description: `Account verification for ${fullName}`,
          quantity: 1,
          unit_cost: amount || 1000,
          sub_total: amount || 1000
        }
      ]
    };

    const response = await submitOrderRequest(token, orderData);

    await query(
      `INSERT INTO pending_registrations (order_tracking_id, full_name, email, id_number, user_type, amount, account_number, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (order_tracking_id) DO UPDATE SET
         full_name = EXCLUDED.full_name,
         email = EXCLUDED.email,
         id_number = EXCLUDED.id_number,
         user_type = EXCLUDED.user_type,
         amount = EXCLUDED.amount,
         account_number = EXCLUDED.account_number`,
      [response.order_tracking_id, fullName, email, idNumber, userType || 'applicant', amount || 1000, accountNumber || '0085060049062', new Date().toISOString()]
    );

    res.json({
      order_tracking_id: response.order_tracking_id,
      merchant_reference: response.merchant_reference,
      redirect_url: response.redirect_url,
      status: response.status
    });
  } catch (error) {
    console.error('Payment initiation error:', error);
    res.status(500).json({ message: error.message || 'Failed to initiate payment' });
  }
});

app.get('/api/payment/status/:orderTrackingId', async (req, res) => {
  try {
    const { orderTrackingId } = req.params;
    const token = await getPesapalToken();

    const response = await axios.get(`${PESAPAL_CONFIG.apiUrl}/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    res.json({
      status: response.data.payment_status_description,
      payment_method: response.data.payment_method,
      amount: response.data.amount,
      created_date: response.data.created_date,
      confirmation_code: response.data.confirmation_code
    });
  } catch (error) {
    console.error('Payment status check error:', error);
    res.status(500).json({ message: 'Failed to check payment status' });
  }
});

app.get('/api/payment/callback', async (req, res) => {
  try {
    const { OrderTrackingId, OrderMerchantReference, OrderNotificationType } = req.query;

    console.log('Payment callback received:', req.query);

    if (OrderTrackingId) {
      const token = await getPesapalToken();

      const response = await axios.get(`${PESAPAL_CONFIG.apiUrl}/Transactions/GetTransactionStatus?orderTrackingId=${OrderTrackingId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const paymentStatus = response.data.payment_status_description;

      if (paymentStatus === 'Completed') {
        const pendingResult = await query(
          'SELECT * FROM pending_registrations WHERE order_tracking_id = $1',
          [OrderTrackingId]
        );

        if (pendingResult.rows.length > 0) {
          const registrationData = pendingResult.rows[0];

          const existingUser = await query(
            'SELECT * FROM users WHERE email = $1 OR id_number = $2',
            [registrationData.email, registrationData.id_number]
          );

          if (existingUser.rows.length === 0) {
            const hashedPassword = await bcrypt.hash(registrationData.id_number.slice(-6), 10);
            const newUserId = Date.now().toString();

            await query(
              `INSERT INTO users (id, email, id_number, full_name, password, user_type, payment_completed, payment_reference, created_at)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
              [newUserId, registrationData.email, registrationData.id_number, registrationData.full_name,
               hashedPassword, registrationData.user_type || 'applicant', true, OrderTrackingId, new Date().toISOString()]
            );
          }

          await query(
            'DELETE FROM pending_registrations WHERE order_tracking_id = $1',
            [OrderTrackingId]
          );
        }
      }
    }

    const frontendUrl = process.env.FRONTEND_URL || `${req.protocol}://${req.get('host')}`;
    res.redirect(`${frontendUrl}/?payment=completed`);
  } catch (error) {
    console.error('Payment callback error:', error);
    const frontendUrl = process.env.FRONTEND_URL || `${req.protocol}://${req.get('host')}`;
    res.redirect(`${frontendUrl}/?payment=failed`);
  }
});

app.post('/api/payment/ipn', async (req, res) => {
  try {
    const { id, type } = req.body;

    console.log('IPN received:', req.body);

    if (id && type === 'TRANSACTION') {
      const token = await getPesapalToken();

      const response = await axios.get(`${PESAPAL_CONFIG.apiUrl}/Transactions/GetTransactionStatus?orderTrackingId=${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const paymentStatus = response.data.payment_status_description;

      if (paymentStatus === 'Completed') {
        const pendingResult = await query(
          'SELECT * FROM pending_registrations WHERE order_tracking_id = $1',
          [id]
        );

        if (pendingResult.rows.length > 0) {
          const registrationData = pendingResult.rows[0];

          const existingUser = await query(
            'SELECT * FROM users WHERE email = $1 OR id_number = $2',
            [registrationData.email, registrationData.id_number]
          );

          if (existingUser.rows.length === 0) {
            const hashedPassword = await bcrypt.hash(registrationData.id_number.slice(-6), 10);
            const newUserId = Date.now().toString();

            await query(
              `INSERT INTO users (id, email, id_number, full_name, password, user_type, payment_completed, payment_reference, created_at)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
              [newUserId, registrationData.email, registrationData.id_number, registrationData.full_name,
               hashedPassword, registrationData.user_type || 'applicant', true, id, new Date().toISOString()]
            );
          }

          await query(
            'DELETE FROM pending_registrations WHERE order_tracking_id = $1',
            [id]
          );
        }
      }
    }

    res.status(200).json({ message: 'IPN received' });
  } catch (error) {
    console.error('IPN error:', error);
    res.status(500).json({ message: 'IPN processing failed' });
  }
});

initializeDatabase().catch(console.error);

module.exports = app;