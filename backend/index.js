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

// MongoDB URI
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

        const db = client.db("zep_shift_db");
        parcelsCollection = db.collection("parcels");

        // Start server AFTER MongoDB connects
        app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });

    } catch (error) {
        console.log(error);
        process.exit(1); // Exit if connection fails
    }
}
run();

// parcel api
app.get('/parcels', async(req, res) => {
    const query = {};
    const { email } = req.query;
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
    res.send(result);
});

app.delete('/parcels/:id', async(req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await parcelsCollection.deleteOne(query);
    res.send(result);
});

// payment related api
app.post('/create-payment-intent', async(req, res) => {
    try {
        const paymentInfo = req.body;
        // totalPrice is in BDT (Taka), convert to smallest unit (paisa)
        // Stripe needs amount in cents → use USD conversion or charge as-is in cents
        const amount = Math.round(parseFloat(paymentInfo.cost) * 100);

        if (!amount || amount <= 0) {
            return res.status(400).send({ error: 'Invalid payment amount' });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: paymentInfo.parcelName || 'Parcel Delivery',
                    },
                    unit_amount: amount,
                },
                quantity: 1,
            }, ],
            customer_email: paymentInfo.senderEmail,
            mode: 'payment',
            metadata: {
                parcelId: paymentInfo.parcelId,
            },
            success_url: `${process.env.SITE_DOMAIN}?payment=success`,
            cancel_url: `${process.env.SITE_DOMAIN}?payment=failed`,
        });

        res.send({ url: session.url });
    } catch (error) {
        console.error('Stripe error:', error.message);
        res.status(500).send({ error: error.message });
    }
});

// get single parcel by id
app.get('/parcels/:id', async(req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await parcelsCollection.findOne(query);
    res.send(result);
});

// update parcel (status / fields)
app.patch('/parcels/:id', async(req, res) => {
    const id = req.params.id;
    const updatedData = req.body;
    const filter = { _id: new ObjectId(id) };
    const updateDoc = {
        $set: updatedData,
    };
    const result = await parcelsCollection.updateOne(filter, updateDoc);
    res.send(result);
});