const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI ||
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ttnzsdq.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const db = client.db('zep_shift_db');
    const usersCollection = db.collection('users');
    
    const users = await usersCollection.find({ role: 'rider' }).limit(5).toArray();
    console.log('--- RIDERS ---');
    users.forEach(u => {
      console.log(`Email: ${u.email}, Name: ${u.displayName}, Role: ${u.role}`);
    });

    const allUsers = await usersCollection.find({ role: 'user' }).limit(5).toArray();
    console.log('--- REGULAR USERS ---');
    allUsers.forEach(u => {
      console.log(`Email: ${u.email}, Name: ${u.displayName}, Role: ${u.role}`);
    });
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

run();
