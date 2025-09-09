// server/seed.js
const admin = require('firebase-admin');
const fs = require('fs');

const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || './serviceAccountKey.json';
const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function seed() {
  // default page configs (page1 and page2)
  const pages = [
    {
      id: 'page1',
      title: 'About',
      slug: 'page1',
      components: [
        { key: 'fullName', type: 'text', label: 'Full name', order: 1, required: true },
        { key: 'birthdate', type: 'date', label: 'Birthdate', order: 2, required: false },
        { key: 'about', type: 'textarea', label: 'About me', order: 3 }
      ]
    },
    {
      id: 'page2',
      title: 'Address',
      slug: 'page2',
      components: [
        { key: 'address_line1', type: 'text', label: 'Address line 1', order: 1 },
        { key: 'city', type: 'text', label: 'City', order: 2 },
        { key: 'state', type: 'text', label: 'State', order: 3 },
        { key: 'zip', type: 'text', label: 'Zip', order: 4 }
      ]
    }
  ];

  for (const p of pages) {
    await db.collection('pages').doc(p.id).set({
      title: p.title,
      slug: p.slug,
      components: p.components
    });
    console.log(`seeded page ${p.id}`);
  }

  // sample user documents (mock)
  const users = [
    { uid: 'mock-user-1', profile: { email: 'alice@example.com', displayName: 'Alice' }, data: { fullName: 'Alice A', about: 'Hi—Alice here', birthdate: '1990-01-01', city: 'Atlanta' } },
    { uid: 'mock-user-2', profile: { email: 'bob@example.com', displayName: 'Bob' }, data: { fullName: 'Bob B', about: 'Bob here', birthdate: '1985-05-05', city: 'NYC' } }
  ];

  for (const u of users) {
    await db.collection('users').doc(u.uid).set(u);
    console.log(`seeded user ${u.uid}`);
  }

  console.log('Seeding done.');
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
