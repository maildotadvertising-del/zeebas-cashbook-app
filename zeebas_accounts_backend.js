require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'zeebas_super_secret_key_2025';

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static('.'));

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use('/api/', limiter);

// File upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/receipts';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });
app.use('/uploads', express.static('uploads'));

// DB Pool
let pool;
async function getDB() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'zeebas_cashbook',
      waitForConnections: true,
      connectionLimit: 10
    });
  }
  return pool;
}

// Auth middleware
const auth = async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Audit log helper
async function auditLog(db, userId, action, details) {
  try {
    await db.execute(
      'INSERT INTO audit_logs (user_id, action, details, created_at) VALUES (?, ?, ?, NOW())',
      [userId, action, JSON.stringify(details)]
    );
  } catch {}
}

// ============ AUTH ============
app.post('/api/auth/login', async (req, res) => {
  const { mobile, password } = req.body;
  try {
    const db = await getDB();
    const [rows] = await db.execute('SELECT * FROM users WHERE mobile = ?', [mobile]);
    if (!rows.length) return res.status(401).json({ error: 'Invalid credentials' });
    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, mobile: user.mobile, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
    await db.execute('INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 30 DAY))', [user.id, token]);
    await auditLog(db, user.id, 'LOGIN', { mobile });
    res.json({ token, user: { id: user.id, name: user.name, mobile: user.mobile, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/logout', auth, async (req, res) => {
  try {
    const db = await getDB();
    await db.execute('DELETE FROM sessions WHERE user_id = ?', [req.user.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/auth/me', auth, async (req, res) => {
  try {
    const db = await getDB();
    const [rows] = await db.execute('SELECT id, name, mobile, email, role FROM users WHERE id = ?', [req.user.id]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ BUSINESSES ============
app.get('/api/businesses', auth, async (req, res) => {
  try {
    const db = await getDB();
    const [rows] = await db.execute(
      'SELECT b.* FROM businesses b JOIN business_members bm ON b.id = bm.business_id WHERE bm.user_id = ? ORDER BY b.name',
      [req.user.id]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/businesses', auth, async (req, res) => {
  const { name, address, gstin, category, type, registration_type, email, mobile } = req.body;
  try {
    const db = await getDB();
    const [result] = await db.execute(
      'INSERT INTO businesses (name, address, gstin, category, type, registration_type, email, mobile, created_by) VALUES (?,?,?,?,?,?,?,?,?)',
      [name, address, gstin, category, type, registration_type, email, mobile, req.user.id]
    );
    await db.execute('INSERT INTO business_members (business_id, user_id, role) VALUES (?,?,?)', [result.insertId, req.user.id, 'primary_admin']);
    await auditLog(db, req.user.id, 'CREATE_BUSINESS', { name });
    res.json({ id: result.insertId });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/businesses/:id', auth, async (req, res) => {
  const { name, address, gstin, category, type, registration_type, email, mobile, staff_size } = req.body;
  try {
    const db = await getDB();
    await db.execute(
      'UPDATE businesses SET name=?, address=?, gstin=?, category=?, type=?, registration_type=?, email=?, mobile=?, staff_size=? WHERE id=?',
      [name, address, gstin, category, type, registration_type, email, mobile, staff_size, req.params.id]
    );
    await auditLog(db, req.user.id, 'UPDATE_BUSINESS', { id: req.params.id });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/businesses/:id', auth, async (req, res) => {
  try {
    const db = await getDB();
    await db.execute('DELETE FROM businesses WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ============ BOOKS ============
app.get('/api/books', auth, async (req, res) => {
  const { business_id } = req.query;
  try {
    const db = await getDB();
    const [rows] = await db.execute(
      `SELECT bk.*,
        (SELECT COUNT(*) FROM book_members WHERE book_id = bk.id) as member_count,
        (SELECT COALESCE(SUM(CASE WHEN type='in' THEN amount ELSE -amount END),0) FROM transactions WHERE book_id = bk.id) as balance
       FROM books bk WHERE bk.business_id = ? ORDER BY bk.updated_at DESC`,
      [business_id]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/books', auth, async (req, res) => {
  const { business_id, name, template_type, opening_balance } = req.body;
  try {
    const db = await getDB();
    const [result] = await db.execute(
      'INSERT INTO books (business_id, name, template_type, opening_balance, created_by) VALUES (?,?,?,?,?)',
      [business_id, name, template_type, opening_balance || 0, req.user.id]
    );
    await db.execute('INSERT INTO book_members (book_id, user_id, role) VALUES (?,?,?)', [result.insertId, req.user.id, 'admin']);
    await auditLog(db, req.user.id, 'CREATE_BOOK', { name });
    res.json({ id: result.insertId });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/books/:id', auth, async (req, res) => {
  const { name, opening_balance } = req.body;
  try {
    const db = await getDB();
    await db.execute('UPDATE books SET name=?, opening_balance=?, updated_at=NOW() WHERE id=?', [name, opening_balance, req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/books/:id', auth, async (req, res) => {
  try {
    const db = await getDB();
    await db.execute('DELETE FROM books WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ============ TRANSACTIONS ============
app.get('/api/transactions', auth, async (req, res) => {
  const { book_id, start_date, end_date, category_id, payment_mode, search } = req.query;
  try {
    const db = await getDB();
    let query = 'SELECT t.*, c.name as category_name, c.icon as category_icon FROM transactions t LEFT JOIN categories c ON t.category_id = c.id WHERE t.book_id = ?';
    const params = [book_id];
    if (start_date) { query += ' AND t.date >= ?'; params.push(start_date); }
    if (end_date) { query += ' AND t.date <= ?'; params.push(end_date); }
    if (category_id) { query += ' AND t.category_id = ?'; params.push(category_id); }
    if (payment_mode) { query += ' AND t.payment_mode = ?'; params.push(payment_mode); }
    if (search) { query += ' AND (t.note LIKE ? OR t.party LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
    query += ' ORDER BY t.date DESC, t.created_at DESC';
    const [rows] = await db.execute(query, params);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/transactions', auth, async (req, res) => {
  const { book_id, type, amount, category_id, payment_mode, note, party, date } = req.body;
  try {
    const db = await getDB();
    const [result] = await db.execute(
      'INSERT INTO transactions (book_id, type, amount, category_id, payment_mode, note, party, date, created_by) VALUES (?,?,?,?,?,?,?,?,?)',
      [book_id, type, amount, category_id, payment_mode, note, party, date, req.user.id]
    );
    await db.execute('UPDATE books SET updated_at=NOW() WHERE id=?', [book_id]);
    await auditLog(db, req.user.id, 'ADD_TRANSACTION', { book_id, type, amount, party });
    res.json({ id: result.insertId });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/transactions/:id', auth, async (req, res) => {
  const { type, amount, category_id, payment_mode, note, party, date } = req.body;
  try {
    const db = await getDB();
    await db.execute(
      'UPDATE transactions SET type=?, amount=?, category_id=?, payment_mode=?, note=?, party=?, date=? WHERE id=?',
      [type, amount, category_id, payment_mode, note, party, date, req.params.id]
    );
    await auditLog(db, req.user.id, 'EDIT_TRANSACTION', { id: req.params.id });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/transactions/:id', auth, async (req, res) => {
  try {
    const db = await getDB();
    await db.execute('DELETE FROM transactions WHERE id = ?', [req.params.id]);
    await auditLog(db, req.user.id, 'DELETE_TRANSACTION', { id: req.params.id });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ============ CATEGORIES ============
app.get('/api/categories', auth, async (req, res) => {
  const { book_id } = req.query;
  try {
    const db = await getDB();
    const [rows] = await db.execute('SELECT * FROM categories WHERE book_id = ? OR book_id IS NULL ORDER BY name', [book_id]);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/categories', auth, async (req, res) => {
  const { book_id, name, icon, color } = req.body;
  try {
    const db = await getDB();
    const [result] = await db.execute('INSERT INTO categories (book_id, name, icon, color) VALUES (?,?,?,?)', [book_id, name, icon, color]);
    res.json({ id: result.insertId });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/categories/:id', auth, async (req, res) => {
  const { name, icon, color } = req.body;
  try {
    const db = await getDB();
    await db.execute('UPDATE categories SET name=?, icon=?, color=? WHERE id=?', [name, icon, color, req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/categories/:id', auth, async (req, res) => {
  try {
    const db = await getDB();
    await db.execute('DELETE FROM categories WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ============ ACCOUNTS ============
app.get('/api/accounts', auth, async (req, res) => {
  const { business_id } = req.query;
  try {
    const db = await getDB();
    const [rows] = await db.execute('SELECT * FROM accounts WHERE business_id = ?', [business_id]);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/accounts', auth, async (req, res) => {
  const { business_id, name, type, balance } = req.body;
  try {
    const db = await getDB();
    const [result] = await db.execute('INSERT INTO accounts (business_id, name, type, balance) VALUES (?,?,?,?)', [business_id, name, type, balance || 0]);
    res.json({ id: result.insertId });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ============ TEAM ============
app.get('/api/team', auth, async (req, res) => {
  const { business_id } = req.query;
  try {
    const db = await getDB();
    const [rows] = await db.execute(
      `SELECT u.id, u.name, u.mobile, u.email, bm.role, bm.employee_id, bm.department, bm.title, bm.location, bm.store,
        (SELECT u2.name FROM users u2 JOIN business_members bm2 ON u2.id = bm2.user_id WHERE bm2.id = bm.reports_to LIMIT 1) as reports_to_name
       FROM users u JOIN business_members bm ON u.id = bm.user_id WHERE bm.business_id = ?`,
      [business_id]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/team/invite', auth, async (req, res) => {
  const { business_id, mobile, name, role, employee_id, department, title, location } = req.body;
  try {
    const db = await getDB();
    let [users] = await db.execute('SELECT id FROM users WHERE mobile = ?', [mobile]);
    let userId;
    if (!users.length) {
      const hash = await bcrypt.hash('zeebas123', 10);
      const [result] = await db.execute('INSERT INTO users (name, mobile, password, role) VALUES (?,?,?,?)', [name, mobile, hash, 'employee']);
      userId = result.insertId;
    } else {
      userId = users[0].id;
    }
    await db.execute(
      'INSERT INTO business_members (business_id, user_id, role, employee_id, department, title, location) VALUES (?,?,?,?,?,?,?)',
      [business_id, userId, role, employee_id, department, title, location]
    );
    await auditLog(db, req.user.id, 'INVITE_MEMBER', { mobile, name });
    res.json({ success: true, userId });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/team/:id', auth, async (req, res) => {
  const { role, employee_id, department, title, location, store } = req.body;
  try {
    const db = await getDB();
    await db.execute('UPDATE business_members SET role=?, employee_id=?, department=?, title=?, location=?, store=? WHERE id=?',
      [role, employee_id, department, title, location, store, req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/team/:id', auth, async (req, res) => {
  try {
    const db = await getDB();
    await db.execute('DELETE FROM business_members WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ============ KHATA ============
app.get('/api/khata', auth, async (req, res) => {
  const { business_id, type } = req.query;
  try {
    const db = await getDB();
    let query = 'SELECT * FROM khata_entries WHERE business_id = ?';
    const params = [business_id];
    if (type) { query += ' AND type = ?'; params.push(type); }
    query += ' ORDER BY created_at DESC';
    const [rows] = await db.execute(query, params);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/khata', auth, async (req, res) => {
  const { business_id, type, party_name, amount, note, due_date } = req.body;
  try {
    const db = await getDB();
    const [result] = await db.execute(
      'INSERT INTO khata_entries (business_id, type, party_name, amount, remaining_amount, note, due_date, created_by) VALUES (?,?,?,?,?,?,?,?)',
      [business_id, type, party_name, amount, amount, note, due_date, req.user.id]
    );
    res.json({ id: result.insertId });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/khata/:id/settle', auth, async (req, res) => {
  const { settle_amount } = req.body;
  try {
    const db = await getDB();
    await db.execute(
      'UPDATE khata_entries SET remaining_amount = GREATEST(0, remaining_amount - ?), settled_at = IF(remaining_amount - ? <= 0, NOW(), settled_at) WHERE id = ?',
      [settle_amount, settle_amount, req.params.id]
    );
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/khata/:id', auth, async (req, res) => {
  try {
    const db = await getDB();
    await db.execute('DELETE FROM khata_entries WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ============ RECURRING ============
app.get('/api/recurring', auth, async (req, res) => {
  const { book_id } = req.query;
  try {
    const db = await getDB();
    const [rows] = await db.execute('SELECT * FROM recurring_transactions WHERE book_id = ?', [book_id]);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/recurring', auth, async (req, res) => {
  const { book_id, type, amount, category_id, payment_mode, note, party, frequency, next_date } = req.body;
  try {
    const db = await getDB();
    const [result] = await db.execute(
      'INSERT INTO recurring_transactions (book_id, type, amount, category_id, payment_mode, note, party, frequency, next_date, created_by) VALUES (?,?,?,?,?,?,?,?,?,?)',
      [book_id, type, amount, category_id, payment_mode, note, party, frequency, next_date, req.user.id]
    );
    res.json({ id: result.insertId });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/recurring/:id', auth, async (req, res) => {
  try {
    const db = await getDB();
    await db.execute('DELETE FROM recurring_transactions WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ============ REPORTS ============
app.post('/api/reports/generate', auth, async (req, res) => {
  const { business_id, book_id, type, start_date, end_date } = req.body;
  try {
    const db = await getDB();
    let data = {};
    const [summary] = await db.execute(
      `SELECT
        SUM(CASE WHEN type='in' THEN amount ELSE 0 END) as total_in,
        SUM(CASE WHEN type='out' THEN amount ELSE 0 END) as total_out,
        COUNT(*) as count
       FROM transactions WHERE book_id = ? AND date BETWEEN ? AND ?`,
      [book_id, start_date, end_date]
    );
    const [byCategory] = await db.execute(
      `SELECT c.name, SUM(t.amount) as total, t.type
       FROM transactions t JOIN categories c ON t.category_id = c.id
       WHERE t.book_id = ? AND t.date BETWEEN ? AND ?
       GROUP BY c.id, t.type ORDER BY total DESC`,
      [book_id, start_date, end_date]
    );
    data = { summary: summary[0], by_category: byCategory };
    const [result] = await db.execute(
      'INSERT INTO reports (business_id, generated_by, type, data, start_date, end_date) VALUES (?,?,?,?,?,?)',
      [business_id, req.user.id, type, JSON.stringify(data), start_date, end_date]
    );
    res.json({ id: result.insertId, data });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/reports', auth, async (req, res) => {
  const { business_id } = req.query;
  try {
    const db = await getDB();
    const [rows] = await db.execute(
      'SELECT r.*, u.name as generated_by_name FROM reports r JOIN users u ON r.generated_by = u.id WHERE r.business_id = ? ORDER BY r.created_at DESC',
      [business_id]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ============ AUDIT LOGS ============
app.get('/api/audit-logs', auth, async (req, res) => {
  const { business_id, limit = 50 } = req.query;
  try {
    const db = await getDB();
    const [rows] = await db.execute(
      `SELECT al.*, u.name as user_name FROM audit_logs al
       JOIN users u ON al.user_id = u.id
       ORDER BY al.created_at DESC LIMIT ?`,
      [parseInt(limit)]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ============ NOTIFICATIONS ============
app.get('/api/notifications', auth, async (req, res) => {
  try {
    const db = await getDB();
    const [rows] = await db.execute(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
      [req.user.id]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/notifications/:id/read', auth, async (req, res) => {
  try {
    const db = await getDB();
    await db.execute('UPDATE notifications SET is_read = 1 WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ============ FILE UPLOAD ============
app.post('/api/upload', auth, upload.single('receipt'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file' });
  res.json({ path: `/uploads/receipts/${req.file.filename}` });
});

// ============ BACKUP & RESTORE ============
app.get('/api/backup', auth, async (req, res) => {
  const { business_id } = req.query;
  try {
    const db = await getDB();
    const [businesses] = await db.execute('SELECT * FROM businesses WHERE id = ?', [business_id]);
    const [books] = await db.execute('SELECT * FROM books WHERE business_id = ?', [business_id]);
    const bookIds = books.map(b => b.id);
    let transactions = [], categories = [];
    if (bookIds.length) {
      [transactions] = await db.execute(`SELECT * FROM transactions WHERE book_id IN (${bookIds.map(() => '?').join(',')})`, bookIds);
      [categories] = await db.execute(`SELECT * FROM categories WHERE book_id IN (${bookIds.map(() => '?').join(',')})`, bookIds);
    }
    const [team] = await db.execute('SELECT * FROM business_members WHERE business_id = ?', [business_id]);
    const backup = { version: '1.0', exported_at: new Date().toISOString(), businesses, books, transactions, categories, team };
    res.json(backup);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/restore', auth, async (req, res) => {
  res.json({ success: true, message: 'Restore functionality - import the backup JSON to restore data' });
});

// ============ DB SETUP ============
async function setupDB() {
  try {
    const db = await getDB();
    const tables = [
      `CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), mobile VARCHAR(20) UNIQUE,
        email VARCHAR(255), password VARCHAR(255), role ENUM('primary_admin','accountant','employee') DEFAULT 'employee',
        pin VARCHAR(10), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`,
      `CREATE TABLE IF NOT EXISTS businesses (
        id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), address TEXT, gstin VARCHAR(20),
        category VARCHAR(100), subcategory VARCHAR(100), type VARCHAR(100), registration_type VARCHAR(100),
        staff_size VARCHAR(50), email VARCHAR(255), mobile VARCHAR(20), logo VARCHAR(500),
        created_by INT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`,
      `CREATE TABLE IF NOT EXISTS business_members (
        id INT AUTO_INCREMENT PRIMARY KEY, business_id INT, user_id INT, role VARCHAR(50),
        employee_id VARCHAR(100), department VARCHAR(100), title VARCHAR(100), location VARCHAR(255),
        store VARCHAR(255), reports_to INT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`,
      `CREATE TABLE IF NOT EXISTS books (
        id INT AUTO_INCREMENT PRIMARY KEY, business_id INT, name VARCHAR(255), template_type VARCHAR(100),
        opening_balance DECIMAL(15,2) DEFAULT 0, created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)`,
      `CREATE TABLE IF NOT EXISTS book_members (
        id INT AUTO_INCREMENT PRIMARY KEY, book_id INT, user_id INT, role VARCHAR(50))`,
      `CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY, book_id INT, name VARCHAR(255), icon VARCHAR(50), color VARCHAR(20))`,
      `CREATE TABLE IF NOT EXISTS transactions (
        id INT AUTO_INCREMENT PRIMARY KEY, book_id INT, type ENUM('in','out'), amount DECIMAL(15,2),
        category_id INT, payment_mode ENUM('cash','bank','upi') DEFAULT 'cash', note TEXT, party VARCHAR(255),
        date DATE, receipt_path VARCHAR(500), created_by INT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`,
      `CREATE TABLE IF NOT EXISTS attachments (
        id INT AUTO_INCREMENT PRIMARY KEY, transaction_id INT, file_path VARCHAR(500), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`,
      `CREATE TABLE IF NOT EXISTS accounts (
        id INT AUTO_INCREMENT PRIMARY KEY, business_id INT, name VARCHAR(255),
        type ENUM('cash','bank','upi'), balance DECIMAL(15,2) DEFAULT 0)`,
      `CREATE TABLE IF NOT EXISTS khata_entries (
        id INT AUTO_INCREMENT PRIMARY KEY, business_id INT, type ENUM('receivable','payable'),
        party_name VARCHAR(255), amount DECIMAL(15,2), remaining_amount DECIMAL(15,2),
        note TEXT, due_date DATE, settled_at TIMESTAMP, created_by INT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`,
      `CREATE TABLE IF NOT EXISTS recurring_transactions (
        id INT AUTO_INCREMENT PRIMARY KEY, book_id INT, type ENUM('in','out'), amount DECIMAL(15,2),
        category_id INT, payment_mode VARCHAR(20), note TEXT, party VARCHAR(255),
        frequency ENUM('daily','weekly','monthly'), next_date DATE, created_by INT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`,
      `CREATE TABLE IF NOT EXISTS reports (
        id INT AUTO_INCREMENT PRIMARY KEY, business_id INT, generated_by INT, type VARCHAR(50),
        data LONGTEXT, start_date DATE, end_date DATE, file_path VARCHAR(500), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`,
      `CREATE TABLE IF NOT EXISTS audit_logs (
        id INT AUTO_INCREMENT PRIMARY KEY, user_id INT, action VARCHAR(100), details TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`,
      `CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY, user_id INT, title VARCHAR(255), message TEXT,
        type VARCHAR(50), is_read TINYINT DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`,
      `CREATE TABLE IF NOT EXISTS sessions (
        id INT AUTO_INCREMENT PRIMARY KEY, user_id INT, token TEXT, expires_at TIMESTAMP)`
    ];
    for (const sql of tables) await db.execute(sql);

    // Seed demo data
    const [existing] = await db.execute('SELECT id FROM users WHERE mobile = ?', ['9688187700']);
    if (!existing.length) {
      const hash = await bcrypt.hash('zeebas123', 10);
      const [u] = await db.execute('INSERT INTO users (name, mobile, email, password, role) VALUES (?,?,?,?,?)',
        ['Sabeez', '9688187700', 'mail@dotad.agency', hash, 'primary_admin']);
      const [b] = await db.execute('INSERT INTO businesses (name, address, gstin, category, type, registration_type, email, mobile, staff_size, created_by) VALUES (?,?,?,?,?,?,?,?,?,?)',
        ['DOT Advertising', 'NO.159, MAHADHANA STREET, MAYILADUTHURAI TALUK, Mayiladuthurai, Tamil Nadu, 609001',
         '33CTNPR8742L1ZV', 'Other', 'Service Provider', 'LLP', 'mail@dotad.agency', '9688187700', '1-10', u.insertId]);
      await db.execute('INSERT INTO business_members (business_id, user_id, role) VALUES (?,?,?)', [b.insertId, u.insertId, 'primary_admin']);
      const [bk1] = await db.execute('INSERT INTO books (business_id, name, opening_balance, created_by) VALUES (?,?,?,?)', [b.insertId, 'DOT Advertising 2025', 50000, u.insertId]);
      const [bk2] = await db.execute('INSERT INTO books (business_id, name, opening_balance, created_by) VALUES (?,?,?,?)', [b.insertId, 'DOT Advertising 2024', 20000, u.insertId]);
      const cats = [
        ['Salary', 'fa-money-bill', '#10b981'], ['Rent', 'fa-home', '#ef4444'],
        ['Marketing', 'fa-bullhorn', '#6366f1'], ['Travel', 'fa-car', '#f59e0b'],
        ['Food', 'fa-utensils', '#f97316'], ['Office Supplies', 'fa-box', '#8b5cf6'],
        ['Utilities', 'fa-bolt', '#06b6d4'], ['Fuel', 'fa-gas-pump', '#84cc16'],
        ['Maintenance', 'fa-tools', '#ec4899'], ['Miscellaneous', 'fa-ellipsis', '#94a3b8']
      ];
      const catIds = [];
      for (const [name, icon, color] of cats) {
        const [c] = await db.execute('INSERT INTO categories (book_id, name, icon, color) VALUES (?,?,?,?)', [bk1.insertId, name, icon, color]);
        catIds.push(c.insertId);
      }
      const txns = [
        [bk1.insertId, 'in', 45000, catIds[0], 'bank', 'Monthly Salary - June 2025', 'DOT Advertising Client', '2025-06-01'],
        [bk1.insertId, 'in', 12000, catIds[2], 'bank', 'Facebook Ads Revenue', 'Meta Platforms', '2025-06-05'],
        [bk1.insertId, 'out', 8000, catIds[1], 'bank', 'Office Rent June', 'Building Owner', '2025-06-01'],
        [bk1.insertId, 'out', 3500, catIds[2], 'upi', 'Google Ads Campaign', 'Google LLC', '2025-06-03'],
        [bk1.insertId, 'out', 1200, catIds[4], 'cash', 'Team Lunch', 'Hotel Saravana Bhavan', '2025-06-07'],
        [bk1.insertId, 'in', 18000, catIds[2], 'bank', 'Social Media Management Fee', 'Retail Client', '2025-06-10'],
        [bk1.insertId, 'out', 2500, catIds[3], 'cash', 'Client Meeting Travel', 'Uber', '2025-06-10'],
        [bk1.insertId, 'out', 4500, catIds[6], 'bank', 'Internet + Electricity', 'BSNL & TNEB', '2025-06-05'],
        [bk1.insertId, 'in', 9000, catIds[2], 'upi', 'Logo Design Project', 'Startup Client', '2025-06-12'],
        [bk1.insertId, 'out', 1800, catIds[5], 'cash', 'Printer Cartridge & Paper', 'Stationery Shop', '2025-06-08'],
        [bk1.insertId, 'out', 3000, catIds[3], 'bank', 'Chennai Trip Expenses', 'TNSTC Bus', '2025-06-14'],
        [bk1.insertId, 'in', 25000, catIds[2], 'bank', 'Annual Contract Payment', 'Manufacturing Client', '2025-06-15'],
        [bk1.insertId, 'out', 600, catIds[7], 'cash', 'Bike Fuel', 'HP Petrol Bunk', '2025-06-09'],
        [bk1.insertId, 'out', 1500, catIds[9], 'cash', 'Miscellaneous Expenses', 'Various', '2025-06-11'],
        [bk1.insertId, 'in', 6000, catIds[2], 'upi', 'Brochure Design', 'Local Business', '2025-06-13']
      ];
      for (const t of txns) {
        await db.execute('INSERT INTO transactions (book_id, type, amount, category_id, payment_mode, note, party, date, created_by) VALUES (?,?,?,?,?,?,?,?,?)',
          [...t, u.insertId]);
      }
      await db.execute('INSERT INTO accounts (business_id, name, type, balance) VALUES (?,?,?,?)', [b.insertId, 'Cash', 'cash', 15000]);
      await db.execute('INSERT INTO accounts (business_id, name, type, balance) VALUES (?,?,?,?)', [b.insertId, 'HDFC Bank', 'bank', 62050]);
      await db.execute('INSERT INTO accounts (business_id, name, type, balance) VALUES (?,?,?,?)', [b.insertId, 'GPay UPI', 'upi', 8500]);
      const hash2 = await bcrypt.hash('zeebas123', 10);
      const [u2] = await db.execute('INSERT INTO users (name, mobile, password, role) VALUES (?,?,?,?)', ['Zeer0 Tv', '9786187700', hash2, 'employee']);
      await db.execute('INSERT INTO business_members (business_id, user_id, role) VALUES (?,?,?)', [b.insertId, u2.insertId, 'employee']);
      await db.execute('INSERT INTO khata_entries (business_id, type, party_name, amount, remaining_amount, note, due_date, created_by) VALUES (?,?,?,?,?,?,?,?)',
        [b.insertId, 'receivable', 'Retail Client', 15000, 15000, 'Pending invoice payment', '2025-06-30', u.insertId]);
      await db.execute('INSERT INTO khata_entries (business_id, type, party_name, amount, remaining_amount, note, due_date, created_by) VALUES (?,?,?,?,?,?,?,?)',
        [b.insertId, 'payable', 'Printing Vendor', 5000, 5000, 'Flex printing work', '2025-06-20', u.insertId]);
      await db.execute('INSERT INTO notifications (user_id, title, message, type) VALUES (?,?,?,?)',
        [u.insertId, 'Welcome to Zeebas CashBook!', 'Your account is ready. Start adding your transactions.', 'info']);
      console.log('✅ Demo data seeded successfully');
    }
    console.log('✅ Database tables ready');
  } catch (err) {
    console.warn('⚠️  Database not connected (running without DB):', err.message);
  }
}

// Serve HTML files
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'zeebas_accounts_app.html')));
app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, 'zeebas_accounts_dashboard.html')));

app.listen(PORT, async () => {
  console.log(`🚀 Zeebas CashBook running on port ${PORT}`);
  await setupDB();
});
