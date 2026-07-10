const mysql = require('mysql2/promise');

let pool = null;

async function initDb() {
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'password', // Defaulting to 'password' or whatever user needs
  };

  // First connect without database to create it if it doesn't exist
  const initialConnection = await mysql.createConnection(dbConfig);

  await initialConnection.query('CREATE DATABASE IF NOT EXISTS agriqueue');
  await initialConnection.end();

  // Now create the pool connected to the database
  pool = mysql.createPool({
    ...dbConfig,
    database: process.env.DB_NAME || 'agriqueue',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  // Create tables
  await pool.query(`
    CREATE TABLE IF NOT EXISTS farmers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      mobile VARCHAR(20) UNIQUE NOT NULL,
      aadhaar_hash VARCHAR(255),
      farmer_id VARCHAR(50) UNIQUE,
      village VARCHAR(100),
      district VARCHAR(100),
      state VARCHAR(100) DEFAULT 'Telangana',
      land_size FLOAT DEFAULT 0,
      crop_types JSON,
      preferred_language VARCHAR(10) DEFAULT 'en',
      notification_prefs JSON,
      password_hash VARCHAR(255),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS procurement_centers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      address TEXT,
      district VARCHAR(100),
      state VARCHAR(100) DEFAULT 'Telangana',
      location_lat FLOAT NOT NULL,
      location_lng FLOAT NOT NULL,
      capacity_per_slot INT DEFAULT 20,
      operating_hours VARCHAR(50) DEFAULT '08:00-17:00',
      crops_accepted JSON,
      active_counters INT DEFAULT 2,
      is_open BOOLEAN DEFAULT 1,
      avg_processing_minutes FLOAT DEFAULT 8.0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS bookings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      farmer_id INT NOT NULL,
      center_id INT NOT NULL,
      slot_date DATE NOT NULL,
      slot_time VARCHAR(20) NOT NULL,
      crop_type VARCHAR(100),
      estimated_quantity FLOAT,
      status ENUM('booked','queued','in_progress','completed','cancelled','no_show') DEFAULT 'booked',
      queue_position INT,
      token_id INT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (farmer_id) REFERENCES farmers(id),
      FOREIGN KEY (center_id) REFERENCES procurement_centers(id)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS tokens (
      id INT AUTO_INCREMENT PRIMARY KEY,
      booking_id INT NOT NULL UNIQUE,
      token_code VARCHAR(50) UNIQUE NOT NULL,
      qr_data TEXT,
      issued_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      scanned_at DATETIME NULL,
      status ENUM('active','used','expired','cancelled') DEFAULT 'active',
      FOREIGN KEY (booking_id) REFERENCES bookings(id)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      farmer_id INT NOT NULL,
      type VARCHAR(50) NOT NULL,
      channel ENUM('in_app','sms','whatsapp','push') DEFAULT 'in_app',
      title VARCHAR(255),
      message TEXT NOT NULL,
      is_read BOOLEAN DEFAULT 0,
      sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      status ENUM('pending','sent','delivered','failed') DEFAULT 'sent',
      FOREIGN KEY (farmer_id) REFERENCES farmers(id)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS market_prices (
      id INT AUTO_INCREMENT PRIMARY KEY,
      crop_name VARCHAR(100) NOT NULL,
      crop_name_hi VARCHAR(100),
      crop_name_te VARCHAR(100),
      mandi_name VARCHAR(100) NOT NULL,
      state VARCHAR(100),
      price_per_quintal FLOAT NOT NULL,
      msp FLOAT,
      unit VARCHAR(50) DEFAULT 'INR/quintal',
      date_recorded DATE,
      trend ENUM('up','down','stable') DEFAULT 'stable'
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS schemes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      title_hi VARCHAR(255),
      title_te VARCHAR(255),
      description TEXT NOT NULL,
      description_hi TEXT,
      description_te TEXT,
      eligibility TEXT,
      eligibility_hi TEXT,
      eligibility_te TEXT,
      required_documents JSON,
      link VARCHAR(255),
      icon VARCHAR(50) DEFAULT 'info',
      is_active BOOLEAN DEFAULT 1
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      action VARCHAR(100) NOT NULL,
      entity_type VARCHAR(100) NOT NULL,
      entity_id INT,
      actor_id INT,
      actor_type VARCHAR(50) DEFAULT 'farmer',
      details JSON,
      ip_address VARCHAR(50),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS seeds (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      supplier VARCHAR(255) NOT NULL,
      price FLOAT NOT NULL,
      mrp FLOAT NOT NULL,
      rating FLOAT,
      reviews VARCHAR(20),
      stock INT DEFAULT 0,
      image VARCHAR(500)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS seed_orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      farmer_id INT NOT NULL,
      total_amount FLOAT NOT NULL,
      status ENUM('pending','completed','cancelled') DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (farmer_id) REFERENCES farmers(id)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS seed_order_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_id INT NOT NULL,
      seed_id INT NOT NULL,
      quantity INT NOT NULL DEFAULT 1,
      price FLOAT NOT NULL,
      FOREIGN KEY (order_id) REFERENCES seed_orders(id) ON DELETE CASCADE,
      FOREIGN KEY (seed_id) REFERENCES seeds(id)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS payments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_id INT NOT NULL,
      farmer_id INT NOT NULL,
      amount FLOAT NOT NULL,
      status ENUM('pending','completed','failed','cancelled') DEFAULT 'pending',
      payment_method VARCHAR(50),
      bank_name VARCHAR(100),
      transaction_id VARCHAR(100),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES seed_orders(id),
      FOREIGN KEY (farmer_id) REFERENCES farmers(id)
    )
  `);

  // Seed default items if empty
  const [seedRows] = await pool.query('SELECT COUNT(*) as count FROM seeds');
  if (seedRows[0].count === 0) {
    await pool.query(`
      INSERT INTO seeds (name, supplier, price, mrp, rating, reviews, stock, image) VALUES 
      ('High-Yield Wheat (Lok-1) | Premium Quality Seed | Drought Resistant | 10kg Bag', 'National Seeds Corp', 1200, 1450, 4.2, '8.9K', 50, 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=400&q=80'),
      ('Basmati Paddy (Pusa 1121) | Export Quality | High Germination Rate | 25kg Sack', 'State Agri Dept', 1500, 1800, 4.5, '12K', 25, 'https://images.unsplash.com/photo-1596547609652-9fc5d8d428ae?auto=format&fit=crop&w=400&q=80'),
      ('BT Cotton (Bollgard II) | Pest Resistant | Certified Hybrid Seed | 5kg Packet', 'Private Agri Ltd', 800, 950, 4.1, '4.2K', 100, 'https://images.unsplash.com/photo-1506509623273-03b22cfd84de?auto=format&fit=crop&w=400&q=80')
    `);
  }

  return pool;
}

async function getDb() {
  if (pool) return pool;
  return await initDb();
}

async function prepareGet(sql, params = []) {
  if (!pool) await getDb();
  const [rows] = await pool.execute(sql, params);
  return rows.length ? rows[0] : null;
}

async function prepareAll(sql, params = []) {
  if (!pool) await getDb();
  const [rows] = await pool.execute(sql, params);
  return rows;
}

async function prepareRun(sql, params = []) {
  if (!pool) await getDb();
  const [result] = await pool.execute(sql, params);
  return { lastInsertRowid: result.insertId, changes: result.affectedRows };
}

module.exports = { getDb, prepareGet, prepareAll, prepareRun, initDb };
