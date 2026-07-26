// One-time migration: copy local data/foods.json, data/auth.json, and uploads/*
// into MongoDB so the site keeps its existing content after switching to Mongo.
// Usage: node scripts/migrate-to-mongo.js  (reads MONGODB_URI from .env)

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { MongoClient, Binary } = require('mongodb');

const ROOT = path.join(__dirname, '..');
const DATA_PATH = path.join(ROOT, 'data', 'foods.json');
const AUTH_PATH = path.join(ROOT, 'data', 'auth.json');
const UPLOADS_DIR = path.join(ROOT, 'uploads');

const CONTENT_TYPES = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml'
};

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is not set in .env. Add it first, then re-run this script.');
    process.exit(1);
  }

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();

  if (fs.existsSync(DATA_PATH)) {
    const data = JSON.parse(fs.readFileSync(DATA_PATH));
    await db.collection('sitedata').replaceOne({ _id: 'main' }, { _id: 'main', ...data }, { upsert: true });
    console.log('Migrated site data (categories, gallery, offers, pricing, settings, bookings).');
  } else {
    console.log('No local data/foods.json found, skipping site data migration.');
  }

  if (fs.existsSync(AUTH_PATH)) {
    const auth = JSON.parse(fs.readFileSync(AUTH_PATH));
    await db.collection('auth').replaceOne({ _id: 'admin' }, { _id: 'admin', ...auth }, { upsert: true });
    console.log('Migrated admin auth (username/password hash).');
  } else {
    console.log('No local data/auth.json found, skipping auth migration.');
  }

  if (fs.existsSync(UPLOADS_DIR)) {
    const files = fs.readdirSync(UPLOADS_DIR).filter(f => fs.statSync(path.join(UPLOADS_DIR, f)).isFile());
    let count = 0;
    for (const filename of files) {
      const buffer = fs.readFileSync(path.join(UPLOADS_DIR, filename));
      const ext = path.extname(filename).toLowerCase();
      const contentType = CONTENT_TYPES[ext] || 'application/octet-stream';
      await db.collection('uploads').replaceOne(
        { _id: filename },
        { _id: filename, contentType, data: new Binary(buffer) },
        { upsert: true }
      );
      count++;
    }
    console.log(`Migrated ${count} uploaded image(s).`);
  } else {
    console.log('No local uploads/ folder found, skipping image migration.');
  }

  await client.close();
  console.log('Migration complete.');
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
