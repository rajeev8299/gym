require('dotenv').config();
const express = require('express');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const nodemailer = require('nodemailer');
const { connectDB, getSiteData, saveSiteData, getAuthDoc, saveAuthDoc, saveUploadFile, getUploadFile } = require('./db');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname)));

const ADMIN_USERNAME = 'admin';
const DEFAULT_ADMIN_PASSWORD = 'rAjeev@7393';

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[ch]));
}

function hashPassword(password, salt) {
  const useSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, useSalt, 64).toString('hex');
  return { salt: useSalt, hash };
}

function verifyPassword(password, salt, hash) {
  const attempt = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(attempt, 'hex'), Buffer.from(hash, 'hex'));
}

async function getAuth() {
  const existing = await getAuthDoc();
  if (existing) return existing;
  const { salt, hash } = hashPassword(DEFAULT_ADMIN_PASSWORD);
  const auth = { username: ADMIN_USERNAME, salt, hash };
  await saveAuthDoc(auth);
  return auth;
}

async function saveAuth(auth) {
  await saveAuthDoc(auth);
}

// In-memory token store (for demo; use DB/redis in production)
const validTokens = new Set();

// In-memory password-reset tokens: token -> expiry timestamp (ms)
const resetTokens = new Map();
const RESET_TOKEN_TTL_MS = 30 * 60 * 1000; // 30 minutes

// Generate a random token
function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Email transporter (Gmail SMTP via App Password)
let mailTransporter = null;
function getMailTransporter() {
  if (!mailTransporter) {
    mailTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
      }
    });
  }
  return mailTransporter;
}

// Middleware: require admin auth (used only on mutating admin routes)
function requireAdminAuth(req, res, next) {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token || !validTokens.has(token)) {
    return res.status(401).json({ error: 'Unauthorized. Please log in.' });
  }
  next();
}

// Login endpoint (public)
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body || {};
  const auth = await getAuth();
  if (username === auth.username && password && verifyPassword(password, auth.salt, auth.hash)) {
    const token = generateToken();
    validTokens.add(token);
    res.json({ success: true, token, message: 'Login successful' });
  } else {
    res.status(401).json({ error: 'Invalid username or password' });
  }
});

// Logout endpoint
app.post('/api/logout', (req, res) => {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (token) validTokens.delete(token);
  res.json({ success: true });
});

// Forgot password: request a reset link by email (public)
app.post('/api/forgot-password', async (req, res) => {
  const { email } = req.body || {};
  const genericMessage = { success: true, message: 'If that email is registered, a reset link has been sent.' };

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Email is required' });
  }

  const recoveryEmail = (process.env.ADMIN_RECOVERY_EMAIL || '').trim().toLowerCase();
  if (!recoveryEmail || email.trim().toLowerCase() !== recoveryEmail) {
    // Do not reveal whether the email matched
    return res.json(genericMessage);
  }

  const token = generateToken();
  resetTokens.set(token, Date.now() + RESET_TOKEN_TTL_MS);

  const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
  const resetLink = `${baseUrl}/reset-password.html?token=${token}`;

  try {
    await getMailTransporter().sendMail({
      from: `Bob's Gym Admin <${process.env.EMAIL_USER}>`,
      to: recoveryEmail,
      subject: "Reset your Bob's Gym admin password",
      html: `
        <p>We received a request to reset your admin panel password.</p>
        <p><a href="${resetLink}">Click here to reset your password</a></p>
        <p>This link expires in 30 minutes. If you did not request this, you can ignore this email.</p>
      `
    });
    res.json(genericMessage);
  } catch (err) {
    console.error('Failed to send reset email:', err.message);
    res.status(500).json({ error: 'Failed to send reset email. Please check server email configuration.' });
  }
});

// Reset password using a valid token (public)
app.post('/api/reset-password', async (req, res) => {
  const { token, newPassword } = req.body || {};
  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Token and new password are required' });
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long' });
  }

  const expiry = resetTokens.get(token);
  if (!expiry || expiry < Date.now()) {
    resetTokens.delete(token);
    return res.status(400).json({ error: 'Reset link is invalid or has expired. Please request a new one.' });
  }

  const auth = await getAuth();
  const { salt, hash } = hashPassword(newPassword);
  await saveAuth({ ...auth, salt, hash });

  resetTokens.delete(token);
  validTokens.clear(); // log out any existing sessions

  res.json({ success: true, message: 'Password updated successfully. Please log in with your new password.' });
});

// Multer storage config (files are kept in memory, then written to MongoDB)
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const allowed = /jpeg|jpg|png|gif|webp|svg/;
    const extOk = allowed.test(path.extname(file.originalname).toLowerCase());
    const mimeOk = allowed.test(file.mimetype);
    if (extOk && mimeOk) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (jpg, jpeg, png, gif, webp, svg) are allowed'));
    }
  }
});

const DEFAULT_CATEGORIES = [
  { id: 1, name: 'Protein (Veg)', items: ['Paneer', 'Tofu', 'Dal (Moong/Chana/Arhar)', 'Rajma', 'Chana', 'Soybean', 'Sprouts', 'Besan', 'Dahi', 'Milk', 'Sattu', 'Makhana'] },
  { id: 2, name: 'Protein (Non-Veg)', items: ['Ande (Eggs)', 'Chicken Breast', 'Murgi', 'Machli (Fish)', 'Mutton', 'Keema', 'Egg Whites', 'Chicken Soup'] },
  { id: 3, name: 'Healthy Carbs', items: ['Brown Rice', 'Chapati', 'Oats', 'Daliya', 'Ragi Roti', 'Jowar', 'Bajra', 'Sweet Potato', 'Poha', 'Upma', 'Idli', 'Daliya Khichdi'] },
  { id: 4, name: 'Healthy Fats', items: ['Badam (Almonds)', 'Akhrot (Walnuts)', 'Kaju', 'Peanut Butter', 'Desi Ghee (Limited)', 'Olive Oil', 'Coconut Oil', 'Flax Seeds', 'Chia Seeds'] },
  { id: 5, name: 'Seasonal Vegetables', items: ['Palak', 'Methi', 'Lauki', 'Tori', 'Karela', 'Gobhi', 'Matar', 'Bhindi', 'Kaddu', 'Baingan', 'Tamatar', 'Kheera', 'Gajar', 'Shimla Mirch'] },
  { id: 6, name: 'Seasonal Fruits', items: ['Banana', 'Apple', 'Santre', 'Amla', 'Papaya', 'Guava', 'Watermelon', 'Mousambi', 'Anar', 'Kiwi', 'Berries (Premium)', 'Ananas'] }
];

// Helper to read data
async function getData() {
  const data = await getSiteData();
  if (data) return data;
  const defaultData = { categories: DEFAULT_CATEGORIES };
  await saveSiteData(defaultData);
  return defaultData;
}

// Helper to write data
async function saveData(data) {
  await saveSiteData(data);
}


async function ensureDataIntegrity() {
  const data = await getData();
  let changed = false;

  if (!Array.isArray(data.gallery)) {
    data.gallery = [];
    changed = true;
  }
  if (!Array.isArray(data.offers)) {
    data.offers = [];
    changed = true;
  }
  if (!Array.isArray(data.bookings)) {
    data.bookings = [];
    changed = true;
  }
  if (!Array.isArray(data.pricingPlans)) {
    data.pricingPlans = [
      {
        id: 1,
        category: 'Individual',
        image: 'https://images.unsplash.com/photo-1571731956672-f2b94d7dd0cb?auto=format&fit=crop&w=800&q=80',
        rows: [
          { label: '1 day', price: '₹500' },
          { label: '1 week', price: '₹1,500' },
          { label: '1 month', price: '₹5,000' },
          { label: '3 months', price: '₹9,000' },
          { label: '6 months', price: '₹12,000' },
          { label: '12 months', price: '₹15,000' },
          { label: 'Renewal', price: '₹10,000' }
        ]
      },
      {
        id: 2,
        category: 'Couple / Partner',
        image: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=800&q=80',
        rows: [
          { label: '1 day', price: '₹800' },
          { label: '1 week', price: '₹2,500' },
          { label: '1 month', price: '₹8,000' },
          { label: '3 months', price: '₹14,000' },
          { label: '6 months', price: '₹19,000' },
          { label: '12 months', price: '₹24,000' },
          { label: 'Renewal', price: '₹16,000' }
        ]
      }
    ];
    changed = true;
  }
  if (!data.settings) {
    data.settings = {
      heroSlides: [
        "https://via.placeholder.com/1200x400?text=Hero+Slide+1",
        "https://via.placeholder.com/1200x400?text=Hero+Slide+2",
        "https://via.placeholder.com/1200x400?text=Hero+Slide+3"
      ],
      promoBanner: "https://via.placeholder.com/1200x200?text=Promo+Banner",
      galleryPlaceholder: "https://via.placeholder.com/400x300?text=Gallery+Image"
    };
    changed = true;
  }
  if (changed) {
    await saveData(data);
  }
}

// API Routes for categories
app.get('/api/categories', async (req, res) => {
  try {
    const data = await getData();
    // Return only id and name for categories
    const categories = data.categories.map(cat => ({ id: cat.id, name: cat.name }));
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read categories' });
  }
});

app.post('/api/categories', requireAdminAuth, async (req, res) => {
  try {
    const data = await getData();
    const { name } = req.body;
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Category name is required' });
    }
    const newCategory = {
      id: Date.now(), // Simple unique ID
      name: name.trim(),
      items: []
    };
    data.categories.push(newCategory);
    await saveData(data);
    res.status(201).json(newCategory);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add category' });
  }
});

app.put('/api/categories/:id', requireAdminAuth, async (req, res) => {
  try {
    const data = await getData();
    const { id } = req.params;
    const { name } = req.body;
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Category name is required' });
    }
    const category = data.categories.find(c => c.id === parseInt(id));
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    category.name = name.trim();
    await saveData(data);
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update category' });
  }
});

app.delete('/api/categories/:id', requireAdminAuth, async (req, res) => {
  try {
    const data = await getData();
    const { id } = req.params;
    const initialLength = data.categories.length;
    data.categories = data.categories.filter(c => c.id !== parseInt(id));
    if (data.categories.length === initialLength) {
      return res.status(404).json({ error: 'Category not found' });
    }
    await saveData(data);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// API Routes for items (existing)
app.get('/api/foods', async (req, res) => {
  try {
    const data = await getData();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read data' });
  }
});

app.post('/api/foods', requireAdminAuth, async (req, res) => {
  try {
    const data = await getData();
    const { categoryId, itemName } = req.body;
    if (!categoryId || !itemName) {
      return res.status(400).json({ error: 'categoryId and itemName required' });
    }
    const category = data.categories.find(c => c.id === parseInt(categoryId));
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    if (category.items.includes(itemName)) {
      return res.status(400).json({ error: 'Item already exists in this category' });
    }
    category.items.push(itemName);
    await saveData(data);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add item' });
  }
});

app.put('/api/foods', requireAdminAuth, async (req, res) => {
  try {
    const data = await getData();
    const { categoryId, oldItemName, newItemName } = req.body;
    if (!categoryId || !oldItemName || !newItemName) {
      return res.status(400).json({ error: 'categoryId, oldItemName, and newItemName required' });
    }
    const category = data.categories.find(c => c.id === parseInt(categoryId));
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    const idx = category.items.indexOf(oldItemName);
    if (idx === -1) {
      return res.status(400).json({ error: 'Item not found in this category' });
    }
    category.items[idx] = newItemName;
    await saveData(data);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update item' });
  }
});

app.delete('/api/foods', requireAdminAuth, async (req, res) => {
  try {
    const data = await getData();
    const { categoryId, itemName } = req.body;
    if (!categoryId || !itemName) {
      return res.status(400).json({ error: 'categoryId and itemName required' });
    }
    const category = data.categories.find(c => c.id === parseInt(categoryId));
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    const idx = category.items.indexOf(itemName);
    if (idx === -1) {
      return res.status(400).json({ error: 'Item not found in this category' });
    }
    category.items.splice(idx, 1);
    await saveData(data);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete item' });
  }
});


// API Routes for gallery
app.get('/api/gallery', async (req, res) => {
  try {
    const data = await getData();
    res.json({ gallery: data.gallery || [] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to read gallery' });
  }
});

app.post('/api/gallery', requireAdminAuth, async (req, res) => {
  try {
    const data = await getData();
    const { title, imageUrl } = req.body;
    if (!title || !imageUrl) {
      return res.status(400).json({ error: 'title and imageUrl required' });
    }
    const newItem = { id: Date.now(), title, imageUrl };
    data.gallery.push(newItem);
    await saveData(data);
    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add gallery item' });
  }
});

app.put('/api/gallery/:id', requireAdminAuth, async (req, res) => {
  try {
    const data = await getData();
    const { id } = req.params;
    const { title, imageUrl } = req.body;
    const itemIndex = data.gallery.findIndex(item => item.id === parseInt(id));
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Gallery item not found' });
    }
    if (title !== undefined) data.gallery[itemIndex].title = title;
    if (imageUrl !== undefined) data.gallery[itemIndex].imageUrl = imageUrl;
    await saveData(data);
    res.json(data.gallery[itemIndex]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update gallery item' });
  }
});

app.delete('/api/gallery/:id', requireAdminAuth, async (req, res) => {
  try {
    const data = await getData();
    const { id } = req.params;
    const initialLength = data.gallery.length;
    data.gallery = data.gallery.filter(item => item.id !== parseInt(id));
    if (data.gallery.length === initialLength) {
      return res.status(404).json({ error: 'Gallery item not found' });
    }
    await saveData(data);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete gallery item' });
  }
});

// API Routes for offers
app.get('/api/offers', async (req, res) => {
  try {
    const data = await getData();
    res.json({ offers: data.offers || [] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to read offers' });
  }
});

app.post('/api/offers', requireAdminAuth, async (req, res) => {
  try {
    const data = await getData();
    const { title, description, imageUrl } = req.body;
    if (!title || !description || !imageUrl) {
      return res.status(400).json({ error: 'title, description, and imageUrl required' });
    }
    const newOffer = { id: Date.now(), title, description, imageUrl };
    data.offers.push(newOffer);
    await saveData(data);
    res.status(201).json(newOffer);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add offer' });
  }
});

app.put('/api/offers/:id', requireAdminAuth, async (req, res) => {
  try {
    const data = await getData();
    const { id } = req.params;
    const { title, description, imageUrl } = req.body;
    const offerIndex = data.offers.findIndex(o => o.id === parseInt(id));
    if (offerIndex === -1) {
      return res.status(404).json({ error: 'Offer not found' });
    }
    if (title !== undefined) data.offers[offerIndex].title = title;
    if (description !== undefined) data.offers[offerIndex].description = description;
    if (imageUrl !== undefined) data.offers[offerIndex].imageUrl = imageUrl;
    await saveData(data);
    res.json(data.offers[offerIndex]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update offer' });
  }
});

app.delete('/api/offers/:id', requireAdminAuth, async (req, res) => {
  try {
    const data = await getData();
    const { id } = req.params;
    const initialLength = data.offers.length;
    data.offers = data.offers.filter(o => o.id !== parseInt(id));
    if (data.offers.length === initialLength) {
      return res.status(404).json({ error: 'Offer not found' });
    }
    await saveData(data);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete offer' });
  }
});

// API Routes for pricing plans
app.get('/api/pricing', async (req, res) => {
  try {
    const data = await getData();
    res.json({ plans: data.pricingPlans || [] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to read pricing plans' });
  }
});

app.post('/api/pricing', requireAdminAuth, async (req, res) => {
  try {
    const data = await getData();
    const { category, image, rows } = req.body || {};
    if (!category || !category.trim()) {
      return res.status(400).json({ error: 'Category name is required' });
    }
    const newPlan = {
      id: Date.now(),
      category: category.trim(),
      image: image || '',
      rows: Array.isArray(rows) ? rows : []
    };
    data.pricingPlans.push(newPlan);
    await saveData(data);
    res.status(201).json(newPlan);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add pricing plan' });
  }
});

app.put('/api/pricing/:id', requireAdminAuth, async (req, res) => {
  try {
    const data = await getData();
    const { id } = req.params;
    const { category, image, rows } = req.body || {};
    const plan = data.pricingPlans.find(p => p.id === parseInt(id));
    if (!plan) {
      return res.status(404).json({ error: 'Pricing plan not found' });
    }
    if (category !== undefined) {
      if (!category.trim()) {
        return res.status(400).json({ error: 'Category name is required' });
      }
      plan.category = category.trim();
    }
    if (image !== undefined) plan.image = image;
    if (rows !== undefined) plan.rows = Array.isArray(rows) ? rows : plan.rows;
    await saveData(data);
    res.json(plan);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update pricing plan' });
  }
});

app.delete('/api/pricing/:id', requireAdminAuth, async (req, res) => {
  try {
    const data = await getData();
    const { id } = req.params;
    const initialLength = data.pricingPlans.length;
    data.pricingPlans = data.pricingPlans.filter(p => p.id !== parseInt(id));
    if (data.pricingPlans.length === initialLength) {
      return res.status(404).json({ error: 'Pricing plan not found' });
    }
    await saveData(data);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete pricing plan' });
  }
});

// Booking requests from the pricing page "Book a Visit" form (public)
app.post('/api/bookings', async (req, res) => {
  try {
    const { name, phone, email, plan, preferredDate, message } = req.body || {};
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }
    if (!phone || typeof phone !== 'string' || phone.replace(/\D/g, '').length < 10) {
      return res.status(400).json({ error: 'A valid phone number is required' });
    }

    const data = await getData();
    const booking = {
      id: Date.now(),
      name: name.trim(),
      phone: phone.trim(),
      email: (email || '').trim(),
      plan: (plan || '').trim(),
      preferredDate: preferredDate || '',
      message: (message || '').trim(),
      createdAt: new Date().toISOString()
    };
    data.bookings.push(booking);
    await saveData(data);

    const recoveryEmail = (process.env.ADMIN_RECOVERY_EMAIL || '').trim();
    if (recoveryEmail && process.env.EMAIL_USER && process.env.EMAIL_APP_PASSWORD) {
      try {
        const planDisplay = booking.plan || 'Not specified';
        await getMailTransporter().sendMail({
          from: `Bob's Gym Website <${process.env.EMAIL_USER}>`,
          to: recoveryEmail,
          subject: `New booking request [${planDisplay}] — ${booking.name}`,
          html: `
            <p>A new "Book a Visit" request came in from the pricing page.</p>
            <p style="margin: 14px 0;">
              <span style="display:inline-block; background:#ff6b00; color:#fff; font-weight:700; font-size:16px; padding:8px 16px; border-radius:999px;">
                Plan booked: ${escapeHtml(planDisplay)}
              </span>
            </p>
            <ul>
              <li><strong>Name:</strong> ${escapeHtml(booking.name)}</li>
              <li><strong>Phone:</strong> ${escapeHtml(booking.phone)}</li>
              <li><strong>Email:</strong> ${escapeHtml(booking.email || '-')}</li>
              <li><strong>Plan:</strong> ${escapeHtml(planDisplay)}</li>
              <li><strong>Preferred date:</strong> ${escapeHtml(booking.preferredDate || '-')}</li>
              <li><strong>Message:</strong> ${escapeHtml(booking.message || '-')}</li>
            </ul>
          `
        });
      } catch (mailErr) {
        console.error('Failed to send booking notification email:', mailErr.message);
      }
    }

    res.status(201).json({ success: true, message: 'Booking request received' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit booking request' });
  }
});

// API Routes for settings
app.get('/api/settings', async (req, res) => {
  try {
    const data = await getData();
    res.json(data.settings || {});
  } catch (err) {
    res.status(500).json({ error: 'Failed to read settings' });
  }
});

app.put('/api/settings', requireAdminAuth, async (req, res) => {
  try {
    const data = await getData();
    data.settings = { ...(data.settings || {}), ...req.body };
    await saveData(data);
    res.json(data.settings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Serve uploaded images from MongoDB
app.get('/uploads/:filename', async (req, res) => {
  try {
    const file = await getUploadFile(req.params.filename);
    if (!file) return res.status(404).end();
    res.set('Content-Type', file.contentType);
    res.send(file.buffer);
  } catch (err) {
    res.status(500).end();
  }
});

// Image upload endpoint
app.post('/api/upload', requireAdminAuth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }
    const ext = path.extname(req.file.originalname).toLowerCase();
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    await saveUploadFile({ filename, contentType: req.file.mimetype, buffer: req.file.buffer });
    const imageUrl = `/uploads/${filename}`;
    res.status(201).json({ imageUrl, filename });
  } catch (err) {
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Serve admin panel
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// Start server
async function start() {
  await connectDB();
  await ensureDataIntegrity();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
