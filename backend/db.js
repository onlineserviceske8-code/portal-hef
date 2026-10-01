const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

async function initializeDatabase() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        id_number TEXT UNIQUE NOT NULL,
        full_name TEXT NOT NULL,
        password TEXT NOT NULL,
        user_type TEXT DEFAULT 'applicant',
        payment_completed BOOLEAN DEFAULT FALSE,
        payment_reference TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS appeals (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        institution TEXT NOT NULL,
        course TEXT NOT NULL,
        year_of_study TEXT NOT NULL,
        admission_number TEXT NOT NULL,
        appeal_reason TEXT NOT NULL,
        supporting_documents JSONB DEFAULT '[]'::jsonb,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS pending_registrations (
        order_tracking_id TEXT PRIMARY KEY,
        full_name TEXT NOT NULL,
        email TEXT NOT NULL,
        id_number TEXT NOT NULL,
        user_type TEXT DEFAULT 'applicant',
        amount INTEGER DEFAULT 1000,
        account_number TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_id_number ON users(id_number);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_appeals_user_id ON appeals(user_id);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_pending_registrations_email ON pending_registrations(email);
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  pool,
  initializeDatabase,
  query: (text, params) => pool.query(text, params),
};