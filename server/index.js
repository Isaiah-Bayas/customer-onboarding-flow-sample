require('dotenv').config();
const express = require('express');
const admin = require('firebase-admin');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const serviceAccount = require(process.env.SERVICE_ACCOUNT_PATH || './serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// GET all users for /data table
app.get('/data', async (req, res) => {
  try {
    const snap = await db.collection('users').get();
    const users = [];
    snap.forEach(doc => {
      users.push({ id: doc.id, ...doc.data() });
    });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch data for HTML table' });
  }
});

// Admin pages: get config for page (page2, page3 etc)
app.get('/admin/pages/:pageId', async (req, res) => {
  try {
    const pageId = req.params.pageId;
    const doc = await db.collection('pages').doc(pageId).get();
    if (!doc.exists) {
      // return default config: one component
      const defaultConfig = { components: [ { key: 'about', type: 'textarea', label: 'About Me' } ] };
      return res.json(defaultConfig);
    }
    res.json(doc.data());
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch page config' });
  }
});

// Save page config
app.post('/admin/pages/:pageId', async (req, res) => {
  try {
    const pageId = req.params.pageId;
    const data = req.body;
    await db.collection('pages').doc(pageId).set(data, { merge: true });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save page config' });
  }
});

// Upsert user data. Expect body: { uid, profile: {...}, data: {...} }
app.post('/users', async (req, res) => {
  try {
    const { uid, profile, data } = req.body;
    if (!uid) return res.status(400).json({ error: 'Missing uid' });
    const docRef = db.collection('users').doc(uid);
    const existing = (await docRef.get()).data() || {};
    await docRef.set({ ...existing, uid, profile: { ...(existing.profile||{}), ...(profile||{}) }, data: { ...(existing.data||{}), ...(data||{}) } }, { merge: true });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save user' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API running on ${PORT}`));