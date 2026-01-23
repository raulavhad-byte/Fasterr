const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'fasterr.db'));

// Create Products Table
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    title TEXT,
    price REAL,
    description TEXT,
    category TEXT,
    condition TEXT,
    image TEXT,
    images TEXT,
    sellerId TEXT,
    sellerName TEXT,
    createdAt INTEGER,
    location TEXT,
    status TEXT
  );
`);

// Create Users Table (Simple version)
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT,
    password TEXT
  );
`);

console.log("Database initialized");

module.exports = db;