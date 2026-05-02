const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config(); // ✅ MUST load before anything that reads process.env

// 🔐 Firebase Admin SDK initialization
const admin = require('firebase-admin');
const serviceAccount = require('./zep-shift-8dd9f-firebase-adminsdk-fbsvc-e1c130ae1d.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

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
app.use(cookieParser());
app.use(cors({
    origin: process.env.SITE_DOMAIN || 'http://localhost:5173',
    credentials: true
}));

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
let paymentsCollection;

async function run() {
    try {
        await client.connect();
        console.log("✅ Connected to MongoDB");

        const db = client.db("zep_shift_db");
        parcelsCollection = db.collection("parcels");
        paymentsCollection = db.collection("payments");

        // Start server AFTER MongoDB connects
        app.listen(port, () => {
            console.log(`
╔════════════════════════════════════════════╗
║  🔐 Secure Auth Server Running             ║
║  Port: ${port}                               ║
║  JWT Verification: ACTIVE                  ║
║  Firebase Admin SDK: INITIALIZED            ║
╚════════════════════════════════════════════╝
            `);
        });

    } catch (error) {
        console.log(error);
        process.exit(1); // Exit if connection fails
    }
}
run();

// 🔐 JWT Verification Middleware
const verifyJWT = async(req, res, next) => {
    try {
        // Extract token from cookies first, then from Authorization header
        const cookieToken = req.cookies.token;
        const headerToken = req.headers.authorization ? req.headers.authorization.split(' ')[1] : null;
        const token = cookieToken || headerToken;

        if (!token) {
            console.log('🔴 [JWT Verify] No token found for:', req.path);
            console.log('   Cookies available:', Object.keys(req.cookies));
            console.log('   Authorization header:', req.headers.authorization ? 'present' : 'missing');
            return res.status(401).send({ message: 'Unauthorized: No token provided' });
        }

        const tokenSource = cookieToken ? 'cookie' : 'header';
        console.log(`🟢 [JWT Verify] Token found in ${tokenSource} for ${req.path}`);

        // Verify token using Firebase Admin SDK
        const decodedUser = await admin.auth().verifyIdToken(token);
        console.log('✅ [JWT Verify] Token verified for user:', decodedUser.email);
        req.user = decodedUser; // Attach user info to request
        next();
    } catch (error) {
        console.error('🔴 [JWT Verify] Token verification failed:', error.message);
        res.status(401).send({ message: 'Unauthorized: Invalid token', error: error.message });
    }
};

// 🔐 Generate unique tracking ID
function generateTrackingId() {
    return 'TRK-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
}

// ============ 🔐 AUTH ROUTES ============

// POST /jwt - Store Firebase token in httpOnly cookie
app.post('/jwt', async(req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).send({ message: 'Token is required' });
        }

        // Verify the token first
        const decodedToken = await admin.auth().verifyIdToken(token);

        // Set secure httpOnly cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // HTTPS only in production
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        res.send({
            message: 'Token stored successfully',
            user: {
                email: decodedToken.email,
                uid: decodedToken.uid,
                displayName: decodedToken.name
            }
        });
    } catch (error) {
        console.error('🔐 JWT Error:', error.message);
        res.status(401).send({ message: 'Invalid token', error: error.message });
    }
});

// Health check endpoint (no JWT required)
app.get('/health', (req, res) => {
    res.send({
        status: 'ok',
        timestamp: new Date().toISOString(),
        message: '✅ Server is running with secure auth enabled',
        cors: {
            origin: process.env.SITE_DOMAIN || 'http://localhost:5173',
            credentials: true
        }
    });
});

// Debug endpoint - Check cookie status (no JWT required, for debugging)
app.get('/debug/cookies', (req, res) => {
    const hasCookie = !!req.cookies.token;
    const cookieValue = req.cookies.token ? `${req.cookies.token.substring(0, 20)}...` : 'no token';

    res.send({
        debug: 'Cookie Debug Info',
        timestamp: new Date().toISOString(),
        cookies: {
            hasCookie: hasCookie,
            tokenPreview: hasCookie ? cookieValue : 'not set',
            allCookies: Object.keys(req.cookies)
        },
        headers: {
            origin: req.headers.origin,
            referer: req.headers.referer,
            userAgent: req.headers['user-agent'] ? req.headers['user-agent'].substring(0, 50) + '...' : 'unknown'
        },
        frontend: {
            expectedOrigin: process.env.SITE_DOMAIN || 'http://localhost:5173'
        }
    });
});

// POST /logout - Clear cookie
app.post('/logout', (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    });
    res.send({ message: 'Logged out successfully' });
});

// ============ PARCEL ROUTES (Protected) ============

// GET /parcels - Get user's parcels
app.get('/parcels', verifyJWT, async(req, res) => {
    try {
        const query = {};
        const { email } = req.query;

        // ✅ Always use verified token email, not trusting frontend
        // If email query param is provided, verify it matches the token
        if (email && email !== req.user.email) {
            return res.status(403).send({ message: 'Forbidden: Email mismatch' });
        }

        query.senderEmail = req.user.email; // Use verified email from token
        const cursor = parcelsCollection.find(query);
        const result = await cursor.toArray();
        res.send(result);
    } catch (error) {
        console.error('Error fetching parcels:', error.message);
        res.status(500).send({ message: 'Error fetching parcels' });
    }
});

// POST /parcels - Create new parcel
app.post('/parcels', verifyJWT, async(req, res) => {
    try {
        const parcel = req.body;
        parcel.createdAt = new Date();
        // ✅ Enforce sender email from token
        parcel.senderEmail = req.user.email;

        const result = await parcelsCollection.insertOne(parcel);
        res.send(result);
    } catch (error) {
        console.error('Error creating parcel:', error.message);
        res.status(500).send({ message: 'Error creating parcel' });
    }
});

// DELETE /parcels/:id - Delete parcel
app.delete('/parcels/:id', verifyJWT, async(req, res) => {
    try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };

        // ✅ Verify ownership before deleting
        const parcel = await parcelsCollection.findOne(query);
        if (!parcel || parcel.senderEmail !== req.user.email) {
            return res.status(403).send({ message: 'Forbidden: Cannot delete this parcel' });
        }

        const result = await parcelsCollection.deleteOne(query);
        res.send(result);
    } catch (error) {
        console.error('Error deleting parcel:', error.message);
        res.status(500).send({ message: 'Error deleting parcel' });
    }
});

// ============ PAYMENT ROUTES (Protected) ============

// POST /create-payment-intent - Create Stripe session
app.post('/create-payment-intent', verifyJWT, async(req, res) => {
    try {
        const paymentInfo = req.body;

        // ✅ Verify ownership of parcel before creating payment
        const parcel = await parcelsCollection.findOne({
            _id: new ObjectId(paymentInfo.parcelId)
        });

        if (!parcel || parcel.senderEmail !== req.user.email) {
            return res.status(403).send({ message: 'Forbidden: Cannot pay for this parcel' });
        }

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
            customer_email: req.user.email, // ✅ Use verified email from token
            mode: 'payment',
            metadata: {
                parcelId: paymentInfo.parcelId,
                parcelName: paymentInfo.parcelName,
            },
            success_url: `${process.env.SITE_DOMAIN}/dashboard/payment-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.SITE_DOMAIN}/dashboard/payment-failed?session_id={CHECKOUT_SESSION_ID}`,
        });

        res.send({ url: session.url, sessionId: session.id });
    } catch (error) {
        console.error('Stripe error:', error.message);
        res.status(500).send({ error: error.message });
    }
});

// PATCH /payment-success - Verify payment and update parcel status
app.patch('/payment-success', verifyJWT, async(req, res) => {
    try {
        const sessionId = req.query.session_id;
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        //console.log('Payment success session details:', session);
        const transactionId = session.payment_intent;

        // ✅ Verify user email matches the payment
        if (session.customer_email !== req.user.email) {
            return res.status(403).send({ message: 'Forbidden: User email mismatch' });
        }

        const query = { transactionId: transactionId };
        const paymentExists = await paymentsCollection.findOne(query);
        if (paymentExists) {
            return res.send({ message: 'Payment already processed', transactionId: transactionId }); // Payment already processed
        }

        if (session.payment_status === 'paid') {
            const parcelId = session.metadata.parcelId;

            // ✅ Double-check parcel ownership
            const parcel = await parcelsCollection.findOne({ _id: new ObjectId(parcelId) });
            if (!parcel || parcel.senderEmail !== req.user.email) {
                return res.status(403).send({ message: 'Forbidden: Cannot complete this payment' });
            }

            const trackingId = generateTrackingId();
            const query = { _id: new ObjectId(parcelId) };
            const update = {
                $set: {
                    paymentStatus: 'paid',
                    trackingId: trackingId,
                    paidAt: new Date()
                }
            };
            const result = await parcelsCollection.updateOne(query, update);
            const payment = {
                amount: session.amount_total / 100,
                currency: session.currency,
                customerEmail: session.customer_email,
                parcelId: session.metadata.parcelId,
                parcelName: session.metadata.parcelName,
                transactionId: session.payment_intent,
                paymentStatus: session.payment_status,
                paidAt: new Date()
            };
            if (session.payment_status === 'paid') {
                const resultPayment = await paymentsCollection.insertOne(payment);
                return res.send({
                    success: true,
                    trackingId: trackingId,
                    transactionId: session.payment_intent,
                    modifyParcel: result,
                    paymentInfo: resultPayment
                });
            }
        }
        return res.send({ success: false, message: 'Payment not completed' });
    } catch (error) {
        console.error('Payment success error:', error);
        res.status(500).send({ success: false, error: error.message });
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