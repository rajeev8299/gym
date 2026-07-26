const { MongoClient, Binary } = require('mongodb');

let client = null;
let db = null;

async function connectDB() {
  if (db) return db;
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not set. Add it to your .env file.');
  }
  client = new MongoClient(uri);
  await client.connect();
  db = client.db();
  return db;
}

function getDb() {
  if (!db) throw new Error('Database not connected. Call connectDB() first.');
  return db;
}

const SITE_DATA_ID = 'main';

async function getSiteData() {
  const doc = await getDb().collection('sitedata').findOne({ _id: SITE_DATA_ID });
  if (!doc) return null;
  const { _id, ...data } = doc;
  return data;
}

async function saveSiteData(data) {
  await getDb().collection('sitedata').replaceOne(
    { _id: SITE_DATA_ID },
    { _id: SITE_DATA_ID, ...data },
    { upsert: true }
  );
}

const AUTH_ID = 'admin';

async function getAuthDoc() {
  const doc = await getDb().collection('auth').findOne({ _id: AUTH_ID });
  if (!doc) return null;
  const { _id, ...auth } = doc;
  return auth;
}

async function saveAuthDoc(auth) {
  await getDb().collection('auth').replaceOne(
    { _id: AUTH_ID },
    { _id: AUTH_ID, ...auth },
    { upsert: true }
  );
}

async function saveUploadFile({ filename, contentType, buffer }) {
  await getDb().collection('uploads').insertOne({
    _id: filename,
    contentType,
    data: new Binary(buffer)
  });
  return filename;
}

async function getUploadFile(filename) {
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
