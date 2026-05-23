const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ttnzsdq.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri);

async function findRider() {
    try {
        await client.connect();
        const db = client.db("zep_shift_db");
        const rider = await db.collection("rider").findOne({ status: 'Approved' });
        console.log('Rider found:', rider ? rider.email : 'None');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.close();
    }
}

findRider();
