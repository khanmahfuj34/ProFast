const express = require('express');
const cors = require('cors');
require('dotenv').config(); // ✅ MUST load before anything that reads process.env
const app = express();
const stripe = require('stripe')(process.env.STRIPE_SECRET); // ✅ Now STRIPE_SECRET is defined

const {
    MongoClient,
    ServerApiVersion,
    ObjectId
} = require('mongodb');

const port = process.env.PORT || 3000;

// middleware
app.use(express.json());
app.use(cors());

// 🔥 এখানে URI বানানো হচ্ছে
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ttnzsdq.mongodb.net/?retryWrites=true&w=majority`;

// MongoClient
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
    tls: true,
    tlsAllowInvalidCertificates: true
});

let parcelsCollection;

async function run() {
    try {
        await client.connect();
        console.log("✅ Connected to MongoDB");

        const db = client.db("zep_shift_db"); // 👉 database name (তুমি change করতে পারো)
        parcelsCollection = db.collection("parcels"); // 👉 collection

    } catch (error) {
        console.log(error);
    }
}
run();
//parcel api
app.get('/parcels', async(req, res) => {
    const query = {};
    const {
        email
    } = req.query;
    if (email) {
        query.senderEmail = email;
    }
    const cursor = parcelsCollection.find(query);
    const result = await cursor.toArray();
    res.send(result);
});
app.post('/parcels', async(req, res) => {
    const parcel = req.body;
    parcel.createdAt = new Date();
    const result = await parcelsCollection.insertOne(parcel);
    res.send(result)
})
app.delete('/parcels/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await parcelsCollection.deleteOne(query);
    res.send(result);
});

//payment related api
app.post('/create-payment-intent', async (req, res) => {
    const paymentInfo = req.body;
     const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        // Provide the exact Price ID (for example, price_1234) of the product you want to sell
        price_data:{
          currency: 'usd',
          product_data:{
            name: paymentInfo.parcelName,
          },
          unit_amount: paymentInfo.price
        },
        
        quantity: 1,
      },
    ],
    customer_email: paymentInfo.senderEmail,
     mode: 'payment',
    success_url: `${process.env.SITE_DOMAIN}/dashboard/payment-success`,
  });

    res.send({ url: session.url }); // ✅ Fixed: session is the correct variable
});

// get single parcel by id
app.get('/parcels/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await parcelsCollection.findOne(query);
    res.send(result);
});


// update parcel (status / fields)
app.patch('/parcels/:id', async (req, res) => {
    const id = req.params.id;
    const updatedData = req.body;
    const filter = { _id: new ObjectId(id) };
    const updateDoc = {
        $set: updatedData,
    };
    const result = await parcelsCollection.updateOne(filter, updateDoc);
    res.send(result);
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});