const fs = require('fs');
const path = require('path');
const { MongoClient, Binary } = require('mongodb');

let client = null;
let db = null;
let mongoEnabled = false;

// Fallback local storage, used only when MONGODB_URI is not set (e.g. quick demo deploys).
// Note: on hosts with ephemeral disks (like Render's free tier), this data does not
// survive restarts/redeploys. Set MONGODB_URI for real persistence.
const DATA_DIR = path.join(__dirname, 'data');
const DATA_PATH = path.join(DATA_DIR, 'foods.json');
const AUTH_PATH = path.join(DATA_DIR, 'auth.json');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

const CONTENT_TYPES = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml'
};

function ensureLocalDirs() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    ensureLocalDirs();
    console.warn('MONGODB_URI not set — using local file storage. Data will NOT survive restarts/redeploys on hosts with ephemeral disks (e.g. Render free tier). Set MONGODB_URI for real persistence.');
    mongoEnabled = false;
    return null;
  }
  client = new MongoClient(uri);
  await client.connect();
  db = client.db();
  mongoEnabled = true;
  return db;
}

function getDb() {
  if (!db) throw new Error('Database not connected. Call connectDB() first.');
  return db;
}

const SITE_DATA_ID = 'main';

async function getSiteData() {
  if (!mongoEnabled) {
    if (!fs.existsSync(DATA_PATH)) return null;
    return JSON.parse(fs.readFileSync(DATA_PATH));
  }
  const doc = await getDb().collection('sitedata').findOne({ _id: SITE_DATA_ID });
  if (!doc) return null;
  const { _id, ...data } = doc;
  return data;
}

async function saveSiteData(data) {
  if (!mongoEnabled) {
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
    return;
  }
  await getDb().collection('sitedata').replaceOne(
    { _id: SITE_DATA_ID },
    { _id: SITE_DATA_ID, ...data },
    { upsert: true }
  );
}

const AUTH_ID = 'admin';

async function getAuthDoc() {
  if (!mongoEnabled) {
    if (!fs.existsSync(AUTH_PATH)) return null;
    return JSON.parse(fs.readFileSync(AUTH_PATH));
  }
  const doc = await getDb().collection('auth').findOne({ _id: AUTH_ID });
  if (!doc) return null;
  const { _id, ...auth } = doc;
  return auth;
}

async function saveAuthDoc(auth) {
  if (!mongoEnabled) {
    fs.writeFileSync(AUTH_PATH, JSON.stringify(auth, null, 2));
    return;
  }
  await getDb().collection('auth').replaceOne(
    { _id: AUTH_ID },
    { _id: AUTH_ID, ...auth },
    { upsert: true }
  );
}

async function saveUploadFile({ filename, contentType, buffer }) {
  if (!mongoEnabled) {
    ensureLocalDirs();
    fs.writeFileSync(path.join(UPLOADS_DIR, filename), buffer);
    return filename;
  }
  await getDb().collection('uploads').insertOne({
    _id: filename,
    contentType,
    data: new Binary(buffer)
  });
  return filename;
}

async function getUploadFile(filename) {
  if (!mongoEnabled) {
    const filePath = path.join(UPLOADS_DIR, filename);
    if (!fs.existsSync(filePath)) return null;
    const ext = path.extname(filename).toLowerCase();
    return { contentType: CONTENT_TYPES[ext] || 'application/octet-stream', buffer: fs.readFileSync(filePath) };
  }
  const doc = await getDb().collection('uploads').findOne({ _id: filename });
  if (!doc) return null;
  return { contentType: doc.contentType, buffer: doc.data.buffer };
}

module.exports = {
  connectDB,
  getSiteData,
  saveSiteData,
  getAuthDoc,
  saveAuthDoc,
  saveUploadFile,
  getUploadFile
};
