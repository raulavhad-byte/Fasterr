const express = require('express');
const cors = require('cors');
const db = require('./db');
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased limit for base64 images

// GET all products
app.get('/api/products', (req, res) => {
  try {
    const products = db.prepare('SELECT * FROM products ORDER BY createdAt DESC').all();
    const formatted = products.map(p => ({
        ...p,
        images: JSON.parse(p.images),
        price: Number(p.price),
        createdAt: Number(p.createdAt),
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET product by ID
app.get('/api/products/:id', (req, res) => {
    try {
        const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
        if (product) {
            product.images = JSON.parse(product.images);
            product.price = Number(product.price);
            product.createdAt = Number(product.createdAt);
            res.json(product);
        } else {
            res.status(404).json({ error: "Product not found" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// CREATE product
app.post('/api/products', (req, res) => {
    try {
        const { title, price, description, category, condition, image, images, sellerId, sellerName, location } = req.body;
        const id = Date.now().toString();
        const stmt = db.prepare(`
            INSERT INTO products (id, title, price, description, category, condition, image, images, sellerId, sellerName, createdAt, location, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        stmt.run(id, title, price, description, category, condition, image, JSON.stringify(images), sellerId, sellerName, Date.now(), location, 'active');
        res.json({ success: true, id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
  console.log(`Fasterr API Server running on http://localhost:${PORT}`);
});