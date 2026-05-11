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

const allowedOrigins = new Set([
    process.env.SITE_DOMAIN,
    'http://localhost:5173',
    'http://localhost:5174'
].filter(Boolean));

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.has(origin)) {
            return callback(null, true);
        }

        callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true
};

// middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));

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
let usersCollection;

async function run() {
    try {
        await client.connect();
        console.log("✅ Connected to MongoDB");

        const db = client.db("zep_shift_db");
        usersCollection = db.collection("users");
        parcelsCollection = db.collection("parcels");
        paymentsCollection = db.collection("payments");
        riderCollection = db.collection("rider");

        // ✅ Create UNIQUE index on transactionId to prevent duplicate payments
        // Use sparse index to handle null values, and ignore if index already exists
        try {
            await paymentsCollection.createIndex({ transactionId: 1 }, { unique: true, sparse: true });
            console.log("✅ Unique index created on payments.transactionId");
        } catch (indexError) {
            if (indexError.codeName === 'DuplicateKey' || indexError.code === 11000) {
                console.log("⚠️  Unique index creation skipped - duplicates exist in collection");
                console.log("📝 Note: Running cleanup to remove duplicate payments...");

                // ✅ Remove duplicate payments (keep first occurrence)
                const duplicates = await paymentsCollection.aggregate([
                    { $group: { _id: "$transactionId", count: { $sum: 1 }, ids: { $push: "$_id" } } },
                    { $match: { count: { $gt: 1 } } }
                ]).toArray();

                let deletedCount = 0;
                for (const dup of duplicates) {
                    // Keep first id, delete rest
                    const idsToDelete = dup.ids.slice(1);
                    const deleteResult = await paymentsCollection.deleteMany({ _id: { $in: idsToDelete } });
                    deletedCount += deleteResult.deletedCount;
                }
                console.log(`✅ Removed ${deletedCount} duplicate payment records`);

                // Now try creating the index again
                try {
                    await paymentsCollection.createIndex({ transactionId: 1 }, { unique: true, sparse: true });
                    console.log("✅ Unique index created on payments.transactionId after cleanup");
                } catch (retryError) {
                    console.error("⚠️  Could not create unique index. Continuing without it.", retryError.message);
                }
            } else {
                console.error("⚠️  Index creation error (non-duplicate):", indexError.message);
            }
        }

        // ✅ Create index on parcelId and customerEmail for faster queries
        await paymentsCollection.createIndex({ parcelId: 1, customerEmail: 1 });
        console.log("✅ Index created on payments.parcelId and customerEmail");

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
        const authHeader = req.headers.authorization;
        const headerToken = authHeader ? authHeader.split(' ')[1] : null;
        const token = cookieToken || headerToken;

        if (!token) {
            console.log('🔴 [JWT Verify] No token found for:', req.path);
            console.log('   Cookies:', Object.keys(req.cookies));
            console.log('   Auth Header:', authHeader ? 'present' : 'missing');
            return res.status(401).send({ message: 'Unauthorized: No token provided' });
        }

        const tokenSource = cookieToken ? 'cookie' : 'header';
        console.log(`🟢 [JWT Verify] Token found in ${tokenSource} for ${req.path}`);
        // console.log('📝 [JWT Token] Full token:', token);

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

// 🔐 Admin Role Verification Middleware
// Apply after verifyJWT to check if user has admin role
const verifyAdmin = async(req, res, next) => {
    try {
        if (!req.user || !req.user.email) {
            console.log('🔴 [Admin Verify] No user in request');
            return res.status(401).send({ message: 'Unauthorized: No user' });
        }

        // Check if user has admin role in database
        const user = await usersCollection.findOne({ email: req.user.email });

        if (!user) {
            console.log('🔴 [Admin Verify] User not found in database:', req.user.email);
            return res.status(401).send({ message: 'Unauthorized: User not found' });
        }

        if (user.role !== 'admin') {
            console.log('🔴 [Admin Verify] Access denied - user role:', user.role, 'for:', req.user.email);
            return res.status(403).send({ message: 'Forbidden: Admin access required' });
        }

        // Attach user role to request for logging
        req.user.role = user.role;
        console.log('✅ [Admin Verify] Admin access granted for:', req.user.email);
        next();
    } catch (error) {
        console.error('🔴 [Admin Verify] Admin verification error:', error.message);
        res.status(500).send({ message: 'Error verifying admin status', error: error.message });
    }
};

// 🔐 Verify Rider Middleware
const verifyRider = async(req, res, next) => {
    try {
        if (!req.user || !req.user.email) {
            console.log('🔴 [Rider Verify] No user in request');
            return res.status(401).send({ message: 'Unauthorized: No user' });
        }

        // Check if user has rider role in database
        const user = await usersCollection.findOne({ email: req.user.email });

        if (!user) {
            console.log('🔴 [Rider Verify] User not found in database:', req.user.email);
            return res.status(401).send({ message: 'Unauthorized: User not found' });
        }

        if (user.role !== 'rider') {
            console.log('🔴 [Rider Verify] Access denied - user role:', user.role, 'for:', req.user.email);
            return res.status(403).send({ message: 'Forbidden: Rider access required' });
        }

        // Attach user role to request for logging
        req.user.role = user.role;
        console.log('✅ [Rider Verify] Rider access granted for:', req.user.email);
        next();
    } catch (error) {
        console.error('🔴 [Rider Verify] Rider verification error:', error.message);
        res.status(500).send({ message: 'Error verifying rider status', error: error.message });
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
            origin: Array.from(allowedOrigins),
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
            expectedOrigin: Array.from(allowedOrigins)
        }
    });
});

//user related apis
app.get('/user', verifyJWT, async (req, res) => {
    try {
        const user = await usersCollection.findOne({ email: req.user.email });
        if (user) {
            res.send({ success: true, user });
        } else {
            res.status(404).send({ success: false, message: 'User not found' });
        }
    } catch (error) {
        res.status(500).send({ success: false, message: 'Server error' });
    }
});

app.post('/save-social-user', async(req, res) => {
    const user = req.body;
    const existingUser = await usersCollection.findOne({ email: user.email });
    if (!existingUser) {
        user.role = 'user';
        user.createdAt = new Date();
        const result = await usersCollection.insertOne(user);
        res.send(result);
    } else {
        res.send({ message: 'User already exists', insertedId: null });
    }
});

app.post('/users', async(req, res) => {
    const user = req.body;
    user.role = 'user';
    user.createdAt = new Date();
    const result = await usersCollection.insertOne(user);
    res.send(result);
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

// GET /parcels/assigned - Get rider's assigned parcels
app.get('/parcels/assigned', verifyJWT, async(req, res) => {
    try {
        const query = { riderEmail: req.user.email };
        const cursor = parcelsCollection.find(query).sort({ updatedAt: -1, createdAt: -1 });
        const result = await cursor.toArray();
        res.send(result);
    } catch (error) {
        console.error('Error fetching assigned parcels:', error.message);
        res.status(500).send({ message: 'Error fetching assigned parcels' });
    }
});

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
        const cursor = parcelsCollection.find(query).sort({ createdAt: -1, _id: -1 });
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
        // Default statuses for newly created parcels
        parcel.paymentStatus = parcel.paymentStatus || 'unpaid';
        parcel.deliveryStatus = parcel.deliveryStatus || 'awaiting-payment';

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

// GET /payments - Get user's payment history (latest first)
app.get('/payments', verifyJWT, async(req, res) => {
    try {
        const query = { customerEmail: req.user.email };
        const cursor = paymentsCollection.find(query).sort({ paidAt: -1 });
        let payments = await cursor.toArray();

        // Enrich payment data with parcel info if missing
        payments = await Promise.all(payments.map(async(payment) => {
            if (!payment.receiverName || payment.receiverName === 'N/A') {
                try {
                    const parcel = await parcelsCollection.findOne({ _id: new ObjectId(payment.parcelId) });
                    if (parcel) {
                        payment.receiverName = parcel.receiverName || 'N/A';
                        payment.receiverPhone = parcel.receiverPhone || 'N/A';
                        payment.receiverAddress = parcel.receiverAddress || 'N/A';
                        payment.parcelType = parcel.parcelType || 'N/A';
                        payment.totalPrice = parcel.totalPrice || payment.amount || 0;
                        payment.trackingId = parcel.trackingId || payment.trackingId || 'N/A';
                    }
                } catch (err) {
                    console.log('Error enriching payment data:', err);
                }
            }
            return payment;
        }));

        res.send(payments);
    } catch (error) {
        console.error('Error fetching payments:', error.message);
        res.status(500).send({ message: 'Error fetching payments' });
    }
});

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

// PATCH /payment-success - Verify payment and update parcel status (ATOMIC)
app.patch('/payment-success', verifyJWT, async(req, res) => {
    try {
        const sessionId = req.query.session_id;
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        const transactionId = session.payment_intent;

        // ✅ Verify user email matches the payment
        if (session.customer_email !== req.user.email) {
            return res.status(403).send({ message: 'Forbidden: User email mismatch' });
        }

        // ✅ Only process paid sessions
        if (session.payment_status !== 'paid') {
            return res.send({ success: false, message: 'Payment not completed' });
        }

        const parcelId = session.metadata.parcelId;

        // ✅ Double-check parcel ownership
        const parcel = await parcelsCollection.findOne({ _id: new ObjectId(parcelId) });
        if (!parcel || parcel.senderEmail !== req.user.email) {
            return res.status(403).send({ message: 'Forbidden: Cannot complete this payment' });
        }

        // ✅ Use ATOMIC findOneAndUpdate with upsert to prevent race condition
        // This ensures only ONE payment is created per transactionId
        const trackingId = parcel.trackingId || generateTrackingId();
        const paymentData = {
            amount: session.amount_total / 100,
            currency: session.currency,
            customerEmail: session.customer_email,
            parcelId: parcelId,
            parcelName: session.metadata.parcelName,
            transactionId: transactionId,
            paymentStatus: session.payment_status,
            paidAt: new Date(),
            trackingId: trackingId,
            receiverName: parcel.receiverName || 'N/A',
            receiverPhone: parcel.receiverPhone || 'N/A',
            receiverAddress: parcel.receiverAddress || 'N/A',
            parcelType: parcel.parcelType || 'N/A',
            totalPrice: parcel.totalPrice || 0
        };

        // ✅ Atomic operation: findOneAndUpdate with upsert
        // Only the FIRST request will insert; subsequent requests will find existing record
        const resultPayment = await paymentsCollection.findOneAndUpdate({ transactionId: transactionId }, // Filter by unique transactionId
            { $setOnInsert: paymentData }, // Only set data if inserting
            {
                upsert: true, // Insert if doesn't exist
                returnDocument: 'after' // Return the document after operation
            }
        );

        // ✅ Update parcel status to paid (idempotent operation)
        const parcelUpdate = await parcelsCollection.updateOne({ _id: new ObjectId(parcelId) }, {
            $set: {
                paymentStatus: 'paid',
                deliveryStatus: 'pending-pickup',
                trackingId: trackingId,
                paidAt: new Date()
            }
        });

        // Return payment data
        const finalPaymentData = resultPayment.value || paymentData;
        return res.send({
            success: true,
            trackingId: finalPaymentData.trackingId,
            transactionId: transactionId,
            totalPrice: finalPaymentData.totalPrice,
            amount: finalPaymentData.amount,
            currency: finalPaymentData.currency,
            message: 'Payment processed successfully'
        });

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

// ============ 🔍 PUBLIC TRACKING ROUTE ============
// GET /track/:trackingId - Public, no auth required
app.get('/track/:trackingId', async(req, res) => {
    try {
        const { trackingId } = req.params;
        if (!trackingId) return res.status(400).send({ success: false, message: 'Tracking ID required' });

        const parcel = await parcelsCollection.findOne({ trackingId });

        if (!parcel) {
            return res.status(404).send({ success: false, message: 'No parcel found with this tracking ID' });
        }

        // Return parcel info (omit sensitive internal fields)
        res.send({
            success: true,
            parcel: {
                _id: parcel._id,
                parcelName: parcel.parcelName,
                parcelType: parcel.parcelType,
                parcelDescription: parcel.parcelDescription,
                trackingId: parcel.trackingId,
                deliveryStatus: parcel.deliveryStatus,
                paymentStatus: parcel.paymentStatus,
                totalPrice: parcel.totalPrice,
                deliveryType: parcel.deliveryType,
                // Sender (partial)
                senderName: parcel.senderName,
                senderDistrict: parcel.senderDistrict,
                senderAddress: parcel.senderAddress,
                // Receiver
                receiverName: parcel.receiverName,
                receiverPhone: parcel.receiverPhone,
                receiverAddress: parcel.receiverAddress,
                receiverDistrict: parcel.receiverDistrict,
                // Rider info (if assigned)
                riderName: parcel.riderName || null,
                riderEmail: parcel.riderEmail || null,
                // Timestamps
                createdAt: parcel.createdAt,
                updatedAt: parcel.updatedAt,
                paidAt: parcel.paidAt,
                estimatedDelivery: parcel.estimatedDelivery || null,
                // Activity log
                activityLog: parcel.activityLog || []
            }
        });
    } catch (error) {
        console.error('❌ Track parcel error:', error.message);
        res.status(500).send({ success: false, message: 'Error fetching tracking data' });
    }
});

// PATCH /parcels/:id - Update parcel (assign rider, update status, log activity)
app.patch('/parcels/:id', verifyJWT, async(req, res) => {
    try {
        const id = req.params.id;
        const { riderId, riderName, riderEmail, deliveryStatus, clearRider, ...rest } = req.body;

        console.log('📦 PATCH /parcels/:id received:', { riderId, riderName, riderEmail, deliveryStatus });

        const filter = { _id: new ObjectId(id) };

        // Build $set explicitly
        const setFields = {
            ...rest,
            updatedAt: new Date()
        };

        if (deliveryStatus) setFields.deliveryStatus = deliveryStatus;

        if (riderId) {
            setFields.riderId = riderId;
            setFields.riderName = riderName || '';
            setFields.riderEmail = riderEmail || '';
        }

        // If clearRider (rejection)
        if (clearRider) {
            setFields.riderId = null;
            setFields.riderName = '';
            setFields.riderEmail = '';
        }

        const updateOp = { $set: setFields };

        // ✅ Push activity log when status changes
        if (deliveryStatus) {
            const logEntry = {
                status: deliveryStatus,
                timestamp: new Date(),
                updatedBy: req.user?.email || 'system',
                role: req.user?.role || 'unknown'
            };
            updateOp.$push = { activityLog: logEntry };
        }

        const result = await parcelsCollection.updateOne(filter, updateOp);

        // Update rider workStatus
        if (riderId) {
            await riderCollection.updateOne(
                { _id: new ObjectId(riderId) },
                { $set: { workStatus: 'in_delivery', updatedAt: new Date() } }
            );
            console.log(`✅ Rider ${riderId} (${riderName}) workStatus set to 'in_delivery'`);
        }

        // If delivered/cancelled, set rider back to available
        if (['delivered', 'cancelled', 'delivery_failed'].includes(deliveryStatus)) {
            const parcel = await parcelsCollection.findOne(filter);
            if (parcel?.riderId) {
                try {
                    await riderCollection.updateOne(
                        { _id: new ObjectId(parcel.riderId) },
                        { $set: { workStatus: 'available', updatedAt: new Date() } }
                    );
                } catch(_) {}
            }
        }

        res.send(result);
    } catch (error) {
        console.error('❌ Update parcel error:', error.message);
        res.status(500).send({ message: 'Error updating parcel', error: error.message });
    }
});

//rider related apis
// POST /riders - Submit rider application (JWT Protected)
app.post('/riders', verifyJWT, async(req, res) => {
    try {
        const riderData = req.body;

        // ✅ Validate required fields
        const requiredFields = ['name', 'email', 'phoneNumber', 'nidNo', 'drivingLicense', 'region', 'district', 'bikeBrand', 'bikeRegistration', 'aboutYourself', 'photo'];
        const missingFields = requiredFields.filter(field => !riderData[field]);

        if (missingFields.length > 0) {
            return res.status(400).send({ message: `Missing required fields: ${missingFields.join(', ')}` });
        }

        // ✅ Enforce rider email from token
        riderData.email = req.user.email;
        riderData.uid = req.user.uid;
        riderData.status = 'Pending';
        riderData.createdAt = new Date();

        // ✅ Check if rider already applied
        const existingRider = await riderCollection.findOne({ email: req.user.email });
        if (existingRider) {
            return res.status(409).send({ message: 'You have already submitted a rider application. Please wait for our response.' });
        }

        const result = await riderCollection.insertOne(riderData);

        console.log(`✅ Rider application submitted: ${riderData.email} with photo: ${riderData.photo}`);
        res.send({
            success: true,
            message: 'Application submitted successfully! We will review and get back to you soon.',
            insertedId: result.insertedId,
            status: 'Pending'
        });
    } catch (error) {
        console.error('❌ Rider application error:', error.message);
        res.status(500).send({ message: 'Error submitting rider application', error: error.message });
    }
});

// GET /riders/:email - Get rider application status (JWT Protected)
app.get('/riders/:email', verifyJWT, async(req, res) => {
    try {
        const email = req.params.email;

        // ✅ Verify user is checking their own data
        if (email !== req.user.email) {
            return res.status(403).send({ message: 'Forbidden: Cannot access other riders data' });
        }

        const rider = await riderCollection.findOne({ email: email });

        if (!rider) {
            return res.status(404).send({ message: 'No application found for this email' });
        }

        res.send({
            success: true,
            rider: rider
        });
    } catch (error) {
        console.error('❌ Get rider error:', error.message);
        res.status(500).send({ message: 'Error fetching rider data', error: error.message });
    }
});

// PATCH /riders/:id - Update rider status (Admin) OR update rider profile (User)
app.patch('/riders/:id', verifyJWT, async(req, res) => {
    try {
        const riderId = req.params.id;
        const rider = await riderCollection.findOne({ _id: new ObjectId(riderId) });

        if (!rider) {
            return res.status(404).send({ message: 'Rider not found' });
        }

        // ✅ Check if this is an admin status update
        if (req.body.status) {
            // Admin-only endpoint for updating rider status
            // Check if user is admin
            const user = await usersCollection.findOne({ email: req.user.email });
            if (!user || user.role !== 'admin') {
                return res.status(403).send({ message: 'Forbidden: Only admins can update rider status' });
            }

            const { status } = req.body;
            const validStatuses = ['Approved', 'Rejected', 'Pending'];
            if (!validStatuses.includes(status)) {
                return res.status(400).send({ message: 'Invalid status. Must be Approved, Rejected, or Pending' });
            }

            // ✅ Update rider status
            const filter = { _id: new ObjectId(riderId) };
            const updateDoc = {
                $set: {
                    status: status,
                    workStatus: 'Available',
                    updatedAt: new Date()
                }
            };

            const result = await riderCollection.updateOne(filter, updateDoc);

            // ✅ If approved, update user role to 'rider'
            if (status === 'Approved') {
                await usersCollection.updateOne({ email: rider.email }, { $set: { role: 'rider' } });
                console.log(`✅ User ${rider.email} role updated to 'rider'`);
            }

            console.log(`✅ Rider ${riderId} status updated to ${status}`);
            return res.send({
                success: true,
                message: `Rider status updated to ${status}`,
                modifiedCount: result.modifiedCount,
                status: status
            });
        }

        // ✅ Otherwise, this is a user profile edit request
        const { name, email, nidNo, drivingLicense, phoneNumber, bikeBrand, bikeRegistration, aboutYourself, region } = req.body;

        // ✅ Verify ownership - user can only edit their own profile
        if (rider.email !== req.user.email) {
            return res.status(403).send({ message: 'Forbidden: Cannot edit other riders profile' });
        }

        // ✅ Prevent editing if already approved or rejected
        if (rider.status !== 'Pending') {
            return res.status(400).send({ message: `Cannot edit profile after application is ${rider.status}` });
        }

        // ✅ Update rider profile details
        const filter = { _id: new ObjectId(riderId) };
        const updateDoc = {
            $set: {
                name: name || rider.name,
                email: email || rider.email,
                nidNo: nidNo || rider.nidNo,
                drivingLicense: drivingLicense || rider.drivingLicense,
                phoneNumber: phoneNumber || rider.phoneNumber,
                bikeBrand: bikeBrand || rider.bikeBrand,
                bikeRegistration: bikeRegistration || rider.bikeRegistration,
                aboutYourself: aboutYourself || rider.aboutYourself,
                region: region || rider.region,
                updatedAt: new Date()
            }
        };

        const result = await riderCollection.updateOne(filter, updateDoc);

        // ✅ Fetch updated rider data to return
        const updatedRider = await riderCollection.findOne({ _id: new ObjectId(riderId) });

        console.log(`✅ Rider ${riderId} profile updated by ${req.user.email}`);
        res.send({
            success: true,
            message: 'Profile updated successfully',
            rider: updatedRider,
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        console.error('❌ Update rider error:', error.message);
        res.status(500).send({ message: 'Error updating rider', error: error.message });
    }
});

// ============ RIDER DASHBOARD APIs (Protected + Rider Role) ============

// Helper: approximate coordinates for Bangladesh districts/areas
const districtCoords = {
    'Dhaka': [23.8103, 90.4125],
    'Mirpur': [23.8223, 90.3654],
    'Banani': [23.7936, 90.4065],
    'Gulshan': [23.7925, 90.4078],
    'Dhanmondi': [23.7465, 90.3760],
    'Uttara': [23.8740, 90.3944],
    'Mohammadpur': [23.7572, 90.3613],
    'Bashundhara': [23.8191, 90.4526],
    'Khilgaon': [23.7490, 90.4840],
    'Rampura': [23.7570, 90.4910],
    'Chittagong': [22.3569, 91.7832],
    'Sylhet': [24.9045, 91.8611],
    'Rajshahi': [24.3745, 88.6042],
    'Khulna': [22.8456, 89.5403],
    'Barishal': [22.7010, 90.3535],
    'Rangpur': [25.7460, 89.2500],
    'Mymensingh': [24.7530, 90.4070],
    'Narayanganj': [23.6238, 90.5000],
    'Gazipur': [23.9999, 90.4203]
};

const getCoords = (districtName) => {
    if (!districtName) return [23.8103, 90.4125]; // default Dhaka
    const key = Object.keys(districtCoords).find(k =>
        districtName.toLowerCase().includes(k.toLowerCase())
    );
    return key ? districtCoords[key] : [23.8103, 90.4125];
};

// GET /rider/dashboard-stats - Rider dashboard statistics
app.get('/rider/dashboard-stats', verifyJWT, verifyRider, async(req, res) => {
    try {
        const riderEmail = req.user.email;
        const rider = await riderCollection.findOne({ email: riderEmail });
        const riderId = rider ? rider._id.toString() : '';

        // Start of today in local time (approximate with UTC+6 for Bangladesh)
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);

        const assignedQuery = {
            riderEmail: riderEmail,
            deliveryStatus: { $in: ['driver_assigned', 'driver_accepted', 'picked_up', 'on_the_way'] }
        };
        const assignedCount = await parcelsCollection.countDocuments(assignedQuery);

        const pendingQuery = {
            riderEmail: riderEmail,
            deliveryStatus: { $in: ['driver_accepted', 'picked_up'] }
        };
        const pendingPickups = await parcelsCollection.countDocuments(pendingQuery);

        const completedQuery = {
            riderEmail: riderEmail,
            deliveryStatus: 'delivered',
            updatedAt: { $gte: startOfToday, $lt: endOfToday }
        };
        const completedToday = await parcelsCollection.countDocuments(completedQuery);

        // Calculate today's earnings: 70% commission on delivered parcels today
        const completedTodayParcels = await parcelsCollection.find(completedQuery).toArray();
        const todayEarnings = completedTodayParcels.reduce((sum, p) => sum + (p.totalPrice || 0) * 0.7, 0);

        res.send({
            success: true,
            stats: {
                assignedCount,
                pendingPickups,
                completedToday,
                todayEarnings: Math.round(todayEarnings)
            }
        });
    } catch (error) {
        console.error('❌ Get rider dashboard stats error:', error.message);
        res.status(500).send({ message: 'Error fetching dashboard stats', error: error.message });
    }
});

// GET /rider/assigned-deliveries - Get rider's assigned deliveries
app.get('/rider/assigned-deliveries', verifyJWT, verifyRider, async(req, res) => {
    try {
        const riderEmail = req.user.email;
        const query = {
            riderEmail: riderEmail,
            deliveryStatus: { $in: ['driver_assigned', 'driver_accepted', 'picked_up', 'on_the_way'] }
        };
        const parcels = await parcelsCollection.find(query).sort({ updatedAt: -1, createdAt: -1 }).toArray();

        // Map to dashboard-friendly format
        const deliveries = parcels.map(p => ({
            id: p._id.toString(),
            name: p.parcelName || 'Unnamed Parcel',
            category: p.parcelType === 'document' ? 'Documents' : 'Electronics',
            weight: `${p.parcelWeight || 1} kg`,
            pickup: `${p.senderDistrict || 'Unknown'}`,
            pickupAddress: p.senderAddress || '',
            delivery: `${p.receiverDistrict || 'Unknown'}`,
            deliveryAddress: p.receiverAddress || '',
            trackingId: p.trackingId || `ZS-${new Date(p.createdAt).getFullYear()}-${p._id.toString().slice(-4)}`,
            status: mapDeliveryStatus(p.deliveryStatus),
            statusRaw: p.deliveryStatus,
            totalPrice: p.totalPrice || 0,
            paymentStatus: p.paymentStatus || 'unpaid',
            senderName: p.senderName || '',
            senderPhone: p.senderPhone || '',
            receiverName: p.receiverName || '',
            receiverPhone: p.receiverPhone || ''
        }));

        res.send({ success: true, deliveries });
    } catch (error) {
        console.error('❌ Get rider assigned deliveries error:', error.message);
        res.status(500).send({ message: 'Error fetching assigned deliveries', error: error.message });
    }
});

// Helper to map internal status to UI status
function mapDeliveryStatus(status) {
    const map = {
        'driver_assigned': 'Assigned',
        'driver_accepted': 'Pickup Ready',
        'picked_up': 'On The Way',
        'on_the_way': 'On The Way',
        'delivered': 'Delivered',
        'pending-pickup': 'Pending'
    };
    return map[status] || 'Assigned';
}

// GET /rider/active-delivery - Get rider's most recent active delivery with route
app.get('/rider/active-delivery', verifyJWT, verifyRider, async(req, res) => {
    try {
        const riderEmail = req.user.email;
        const query = {
            riderEmail: riderEmail,
            deliveryStatus: { $in: ['driver_accepted', 'picked_up', 'on_the_way'] }
        };
        const parcel = await parcelsCollection.findOne(query, { sort: { updatedAt: -1 } });

        if (!parcel) {
            return res.send({ success: true, activeDelivery: null });
        }

        const pickupCoords = getCoords(parcel.senderDistrict);
        const dropCoords = getCoords(parcel.receiverDistrict);
        // Rider position slightly offset from pickup
        const riderCoords = [pickupCoords[0] + 0.003, pickupCoords[1] + 0.003];

        const activeDelivery = {
            id: parcel._id.toString(),
            name: parcel.parcelName || 'Unnamed Parcel',
            trackingId: parcel.trackingId || `ZS-${new Date(parcel.createdAt).getFullYear()}-${parcel._id.toString().slice(-4)}`,
            status: mapDeliveryStatus(parcel.deliveryStatus),
            statusRaw: parcel.deliveryStatus,
            pickup: {
                location: `${parcel.senderDistrict || 'Unknown'}`,
                address: parcel.senderAddress || '',
                coords: pickupCoords
            },
            drop: {
                location: `${parcel.receiverDistrict || 'Unknown'}`,
                address: parcel.receiverAddress || '',
                coords: dropCoords
            },
            route: [riderCoords, pickupCoords, dropCoords],
            senderName: parcel.senderName || '',
            senderPhone: parcel.senderPhone || '',
            receiverName: parcel.receiverName || '',
            receiverPhone: parcel.receiverPhone || ''
        };

        res.send({ success: true, activeDelivery });
    } catch (error) {
        console.error('❌ Get rider active delivery error:', error.message);
        res.status(500).send({ message: 'Error fetching active delivery', error: error.message });
    }
});

// GET /rider/weekly-earnings - Get last 7 days earnings
app.get('/rider/weekly-earnings', verifyJWT, verifyRider, async(req, res) => {
    try {
        const riderEmail = req.user.email;
        const now = new Date();
        const days = [];
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        for (let i = 6; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
            const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
            const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);

            const query = {
                riderEmail: riderEmail,
                deliveryStatus: 'delivered',
                updatedAt: { $gte: start, $lt: end }
            };
            const parcels = await parcelsCollection.find(query).toArray();
            const earnings = parcels.reduce((sum, p) => sum + (p.totalPrice || 0) * 0.7, 0);

            days.push({
                day: dayNames[d.getDay()],
                earnings: Math.round(earnings),
                deliveries: parcels.length,
                isToday: i === 0
            });
        }

        res.send({ success: true, weeklyEarnings: days });
    } catch (error) {
        console.error('❌ Get rider weekly earnings error:', error.message);
        res.status(500).send({ message: 'Error fetching weekly earnings', error: error.message });
    }
});

// PATCH /rider/status - Toggle rider online/offline status
app.patch('/rider/status', verifyJWT, verifyRider, async(req, res) => {
    try {
        const riderEmail = req.user.email;
        const { isOnline } = req.body;

        if (typeof isOnline !== 'boolean') {
            return res.status(400).send({ message: 'isOnline boolean is required' });
        }

        const rider = await riderCollection.findOne({ email: riderEmail });
        if (!rider) {
            return res.status(404).send({ message: 'Rider not found' });
        }

        // Determine workStatus based on online state and current delivery status
        let workStatus = rider.workStatus || 'Available';
        const hasActiveDelivery = await parcelsCollection.countDocuments({
            riderEmail: riderEmail,
            deliveryStatus: { $in: ['driver_accepted', 'picked_up', 'on_the_way'] }
        }) > 0;

        if (isOnline) {
            workStatus = hasActiveDelivery ? 'in_delivery' : 'Available';
        } else {
            workStatus = 'Unavailable';
        }

        await riderCollection.updateOne(
            { email: riderEmail },
            { $set: { isOnline, workStatus, updatedAt: new Date() } }
        );

        console.log(`✅ Rider ${riderEmail} status updated: isOnline=${isOnline}, workStatus=${workStatus}`);
        res.send({
            success: true,
            message: `Rider is now ${isOnline ? 'online' : 'offline'}`,
            isOnline,
            workStatus
        });
    } catch (error) {
        console.error('❌ Update rider status error:', error.message);
        res.status(500).send({ message: 'Error updating rider status', error: error.message });
    }
});

// GET /rider/status - Get rider current status
app.get('/rider/status', verifyJWT, verifyRider, async(req, res) => {
    try {
        const riderEmail = req.user.email;
        const rider = await riderCollection.findOne({ email: riderEmail });
        if (!rider) {
            return res.status(404).send({ message: 'Rider not found' });
        }

        res.send({
            success: true,
            isOnline: rider.isOnline !== false, // default true for backwards compat
            workStatus: rider.workStatus || 'Available'
        });
    } catch (error) {
        console.error('❌ Get rider status error:', error.message);
        res.status(500).send({ message: 'Error fetching rider status', error: error.message });
    }
});

// PATCH /rider/delivery/:id/status - Update delivery status by rider
app.patch('/rider/delivery/:id/status', verifyJWT, verifyRider, async(req, res) => {
    try {
        const parcelId = req.params.id;
        const { deliveryStatus } = req.body;
        const riderEmail = req.user.email;

        if (!ObjectId.isValid(parcelId)) {
            return res.status(400).send({ message: 'Invalid parcel ID' });
        }

        const validStatuses = ['driver_accepted', 'picked_up', 'on_the_way', 'delivered'];
        if (!validStatuses.includes(deliveryStatus)) {
            return res.status(400).send({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
        }

        const parcel = await parcelsCollection.findOne({ _id: new ObjectId(parcelId) });
        if (!parcel) {
            return res.status(404).send({ message: 'Parcel not found' });
        }
        if (parcel.riderEmail !== riderEmail) {
            return res.status(403).send({ message: 'Forbidden: This delivery is not assigned to you' });
        }

        const setFields = {
            deliveryStatus,
            updatedAt: new Date()
        };

        // If delivered, also set deliveredAt
        if (deliveryStatus === 'delivered') {
            setFields.deliveredAt = new Date();
        }

        const result = await parcelsCollection.updateOne(
            { _id: new ObjectId(parcelId) },
            { $set: setFields }
        );

        // Update rider workStatus based on remaining active deliveries
        const hasActiveDelivery = await parcelsCollection.countDocuments({
            riderEmail: riderEmail,
            deliveryStatus: { $in: ['driver_accepted', 'picked_up', 'on_the_way'] }
        }) > 0;

        const rider = await riderCollection.findOne({ email: riderEmail });
        if (rider && rider.isOnline !== false) {
            await riderCollection.updateOne(
                { email: riderEmail },
                { $set: { workStatus: hasActiveDelivery ? 'in_delivery' : 'Available', updatedAt: new Date() } }
            );
        }

        console.log(`✅ Delivery ${parcelId} status updated to ${deliveryStatus} by ${riderEmail}`);
        res.send({
            success: true,
            message: `Delivery status updated to ${deliveryStatus}`,
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        console.error('❌ Update delivery status error:', error.message);
        res.status(500).send({ message: 'Error updating delivery status', error: error.message });
    }
});

// GET /rider/delivery-history - Get rider's complete delivery history with filters & pagination
app.get('/rider/delivery-history', verifyJWT, verifyRider, async(req, res) => {
    try {
        const riderEmail = req.user.email;
        const {
            page = 1,
            limit = 10,
            search = '',
            status = 'all',
            fromDate,
            toDate
        } = req.query;

        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.max(1, Math.min(100, parseInt(limit)));
        const skip = (pageNum - 1) * limitNum;

        // Base query: all parcels ever assigned to this rider (not just active)
        const baseQuery = { riderEmail: riderEmail };

        // Status filter mapping
        const statusMap = {
            'delivered': ['delivered'],
            'in-transit': ['driver_accepted', 'picked_up', 'on_the_way'],
            'cancelled': ['pending-pickup'],
            'all': ['driver_assigned', 'driver_accepted', 'picked_up', 'on_the_way', 'delivered', 'pending-pickup']
        };

        if (status !== 'all' && statusMap[status]) {
            baseQuery.deliveryStatus = { $in: statusMap[status] };
        }

        // Date range filter (use deliveredAt for delivered, updatedAt for others)
        const dateFilter = {};
        if (fromDate || toDate) {
            dateFilter.$or = [];
            if (fromDate) {
                const from = new Date(fromDate);
                if (!isNaN(from)) {
                    dateFilter.$or.push({ deliveredAt: { $gte: from } });
                    dateFilter.$or.push({ updatedAt: { $gte: from } });
                }
            }
            if (toDate) {
                const to = new Date(toDate);
                to.setDate(to.getDate() + 1); // include full day
                if (!isNaN(to)) {
                    dateFilter.$or.push({ deliveredAt: { $lt: to } });
                    dateFilter.$or.push({ updatedAt: { $lt: to } });
                }
            }
        }

        // Build final query
        const query = { ...baseQuery };
        if (dateFilter.$or) {
            query.$and = [baseQuery, dateFilter];
        }

        // Search by trackingId, receiverName, or parcelName
        let searchQuery = {};
        if (search.trim()) {
            const regex = { $regex: search.trim(), $options: 'i' };
            searchQuery = {
                $or: [
                    { trackingId: regex },
                    { receiverName: regex },
                    { parcelName: regex },
                    { senderName: regex }
                ]
            };
            if (query.$and) {
                query.$and.push(searchQuery);
            } else if (Object.keys(query).length > 0) {
                query.$and = [baseQuery, searchQuery];
                delete query.riderEmail;
            } else {
                Object.assign(query, searchQuery);
            }
        }

        // Stats (count on baseQuery without search)
        const totalDeliveries = await parcelsCollection.countDocuments({ riderEmail: riderEmail });
        const completedCount = await parcelsCollection.countDocuments({ riderEmail: riderEmail, deliveryStatus: 'delivered' });
        const inTransitCount = await parcelsCollection.countDocuments({
            riderEmail: riderEmail,
            deliveryStatus: { $in: ['driver_accepted', 'picked_up', 'on_the_way'] }
        });
        const cancelledCount = await parcelsCollection.countDocuments({ riderEmail: riderEmail, deliveryStatus: 'pending-pickup' });

        // Total matching records for pagination
        const totalRecords = await parcelsCollection.countDocuments(query);
        const totalPages = Math.ceil(totalRecords / limitNum);

        // Fetch data
        const parcels = await parcelsCollection
            .find(query)
            .sort({ updatedAt: -1, createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .toArray();

        const deliveries = parcels.map(p => {
            const isDelivered = p.deliveryStatus === 'delivered';
            const isCancelled = p.deliveryStatus === 'pending-pickup';
            const earning = isDelivered ? Math.round((p.totalPrice || 0) * 0.7) : 0;

            const deliveredDate = p.deliveredAt
                ? new Date(p.deliveredAt)
                : (isDelivered ? new Date(p.updatedAt) : null);

            return {
                id: p._id.toString(),
                trackingId: p.trackingId || `ZS-${new Date(p.createdAt).getFullYear()}-${p._id.toString().slice(-4)}`,
                parcelName: p.parcelName || 'Unnamed Parcel',
                category: p.parcelType === 'document' ? 'Documents' : 'Electronics',
                weight: `${p.parcelWeight || 1} kg`,
                pickup: `${p.senderDistrict || 'Unknown'}`,
                pickupAddress: p.senderAddress || '',
                delivery: `${p.receiverDistrict || 'Unknown'}`,
                deliveryAddress: p.receiverAddress || '',
                receiverName: p.receiverName || '',
                senderName: p.senderName || '',
                status: mapDeliveryStatus(p.deliveryStatus),
                statusRaw: p.deliveryStatus,
                deliveredDate: deliveredDate ? deliveredDate.toISOString() : null,
                deliveredDateFormatted: deliveredDate
                    ? deliveredDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                    : '—',
                deliveredTimeFormatted: deliveredDate
                    ? deliveredDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                    : '',
                earning,
                earningFormatted: `৳${earning}`,
                totalPrice: p.totalPrice || 0
            };
        });

        res.send({
            success: true,
            stats: {
                totalDeliveries,
                completed: completedCount,
                inTransit: inTransitCount,
                cancelled: cancelledCount,
                successRate: totalDeliveries > 0 ? Math.round((completedCount / totalDeliveries) * 100) : 0,
                cancelledRate: totalDeliveries > 0 ? Math.round((cancelledCount / totalDeliveries) * 100) : 0
            },
            pagination: {
                page: pageNum,
                limit: limitNum,
                totalRecords,
                totalPages,
                hasNextPage: pageNum < totalPages,
                hasPrevPage: pageNum > 1
            },
            deliveries
        });
    } catch (error) {
        console.error('❌ Get rider delivery history error:', error.message);
        res.status(500).send({ message: 'Error fetching delivery history', error: error.message });
    }
});

// ============ USER ROUTES (Protected) ============

// POST /user - Save or update user info during registration (JWT Protected)
app.post('/user', verifyJWT, async(req, res) => {
    try {
        const userInfo = req.body;
        const email = userInfo.email;

        if (!email) {
            return res.status(400).send({ message: 'Email is required' });
        }

        // ✅ Verify user is registering their own email (security check)
        if (email !== req.user.email) {
            return res.status(403).send({ message: 'Forbidden: Cannot register other users' });
        }

        // ✅ Determine role: admin for default admin email, user for everyone else
        const isDefaultAdmin = email === 'mkmahfujkhanms@gmail.com';
        const userRole = isDefaultAdmin ? 'admin' : 'user';

        // ✅ Use upsert to prevent duplicates - only creates if doesn't exist
        const result = await usersCollection.updateOne({ email: email }, {
            $setOnInsert: {
                email: email,
                displayName: userInfo.displayName || 'User',
                photoURL: userInfo.photoURL || null,
                createdAt: new Date(),
                role: userRole
            },
            $set: {
                lastUpdated: new Date()
            }
        }, { upsert: true });

        console.log(`✅ User saved/updated: ${email} with role: ${userRole}`);
        res.send({
            success: true,
            message: 'User registered successfully',
            matchedCount: result.matchedCount,
            upsertedCount: result.upsertedCount,
            modifiedCount: result.modifiedCount,
            role: userRole
        });
    } catch (error) {
        console.error('❌ User registration error:', error.message);
        res.status(500).send({ message: 'Error saving user', error: error.message });
    }
});

// GET /user - Get current user info (Protected)
app.get('/user', verifyJWT, async(req, res) => {
    try {
        const email = req.user.email;
        const user = await usersCollection.findOne({ email: email });

        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }

        res.send({
            success: true,
            user: {
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                role: user.role || 'user',
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error('❌ Get user error:', error.message);
        res.status(500).send({ message: 'Error fetching user', error: error.message });
    }
});

// PATCH /user - Update user profile (Protected)
app.patch('/user', verifyJWT, async(req, res) => {
    try {
        const email = req.user.email;
        const updateData = req.body;

        // ✅ Only allow updating own profile
        if (updateData.email && updateData.email !== email) {
            return res.status(403).send({ message: 'Forbidden: Cannot modify email' });
        }

        // Prepare update object
        const updateDoc = {
            $set: {
                ...updateData,
                lastUpdated: new Date()
            }
        };

        const result = await usersCollection.updateOne({ email: email },
            updateDoc
        );

        if (result.matchedCount === 0) {
            return res.status(404).send({ message: 'User not found' });
        }

        // ✅ If user has a rider application and photo is being updated, update rider photo
        if (updateData.photoURL) {
            const rider = await riderCollection.findOne({ email: email });
            if (rider) {
                const riderUpdateResult = await riderCollection.updateOne({ email: email }, { $set: { photo: updateData.photoURL, updatedAt: new Date() } });
                console.log(`✅ Rider photo automatically updated for ${email}`);
            }
        }

        console.log(`✅ User updated: ${email}`);
        res.send({
            success: true,
            message: 'User profile updated successfully',
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        console.error('❌ Update user error:', error.message);
        res.status(500).send({ message: 'Error updating user', error: error.message });
    }
});

// POST /save-social-user - Save or update social user data (Google, Facebook, etc.) (Protected)
app.post('/save-social-user', verifyJWT, async(req, res) => {
    try {
        const socialUserData = req.body;
        const email = socialUserData.email;

        if (!email) {
            return res.status(400).send({ message: 'Email is required' });
        }

        // ✅ Verify user is saving their own data
        if (email !== req.user.email) {
            return res.status(403).send({ message: 'Forbidden: Cannot save other users data' });
        }

        // ✅ Check if user exists
        const existingUser = await usersCollection.findOne({ email: email });

        if (existingUser) {
            // User exists - update their data
            const updateResult = await usersCollection.updateOne({ email: email }, {
                $set: {
                    displayName: socialUserData.displayName || 'User',
                    photoURL: socialUserData.photoURL || null,
                    lastLogin: new Date(),
                    lastUpdated: new Date()
                },
                $addToSet: {
                    providers: socialUserData.provider || 'firebase'
                }
            });

            console.log(`✅ Social user updated: ${email} (provider: ${socialUserData.provider || 'firebase'})`);
            res.send({
                success: true,
                message: 'Social user data updated successfully',
                email: email,
                provider: socialUserData.provider || 'firebase'
            });
        } else {
            // New user - create record
            const newUserData = {
                email: email,
                displayName: socialUserData.displayName || 'User',
                photoURL: socialUserData.photoURL || null,
                uid: socialUserData.uid,
                role: 'user',
                providers: [socialUserData.provider || 'firebase'],
                createdAt: new Date(),
                lastLogin: new Date(),
                lastUpdated: new Date()
            };

            const insertResult = await usersCollection.insertOne(newUserData);

            console.log(`✅ New social user created: ${email} (provider: ${socialUserData.provider || 'firebase'})`);
            res.send({
                success: true,
                message: 'Social user data saved successfully',
                insertedId: insertResult.insertedId,
                email: email,
                provider: socialUserData.provider || 'firebase'
            });
        }
    } catch (error) {
        console.error('❌ Save social user error:', error.message);
        console.error('❌ Full error:', error);
        res.status(500).send({ message: 'Error saving social user data', error: error.message });
    }
});

// GET /admin/stats - Get admin dashboard statistics (Admin only)
app.get('/admin/stats', verifyJWT, verifyAdmin, async(req, res) => {
    try {
        const totalUsers = await usersCollection.countDocuments({});
        const totalRiders = await riderCollection.countDocuments({});
        const totalParcels = await parcelsCollection.countDocuments({});
        const pendingRiders = await riderCollection.countDocuments({ status: 'Pending' });
        const approvedRiders = await riderCollection.countDocuments({ status: 'Approved' });
        const rejectedRiders = await riderCollection.countDocuments({ status: 'Rejected' });

        console.log(`✅ Admin stats retrieved`);
        res.send({
            success: true,
            stats: {
                totalUsers,
                totalRiders,
                totalParcels,
                riderStats: {
                    pending: pendingRiders,
                    approved: approvedRiders,
                    rejected: rejectedRiders
                }
            }
        });
    } catch (error) {
        console.error('❌ Get admin stats error:', error.message);
        res.status(500).send({ message: 'Error fetching statistics', error: error.message });
    }
});

// GET /riders - Get rider applications with optional filters (Admin only)
// Query params: ?status=approved&district=Dhaka&workStatus=available
app.get('/riders', verifyJWT, verifyAdmin, async(req, res) => {
    try {
        const { status, district, workStatus } = req.query;

        const query = {};

        if (status) {
            // Support case-insensitive match: 'approved' -> 'Approved'
            query.status = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
        }

        if (district) {
            // Case-insensitive district match
            query.district = { $regex: new RegExp(`^${district}$`, 'i') };
        }

        if (workStatus) {
            // Support case-insensitive match: 'available' -> 'Available'
            query.workStatus = workStatus.charAt(0).toUpperCase() + workStatus.slice(1).toLowerCase();
        }

        const riders = await riderCollection.find(query).sort({ createdAt: -1 }).toArray();

        res.send({
            success: true,
            total: riders.length,
            riders: riders
        });
    } catch (error) {
        console.error('❌ Get riders error:', error.message);
        res.status(500).send({ message: 'Error fetching riders', error: error.message });
    }
});

// PATCH /user/role - Update user role (Admin only)
app.patch('/user/role', verifyJWT, verifyAdmin, async(req, res) => {
    try {
        const { email, userId, role } = req.body;
        const adminEmail = req.user.email;

        // ✅ Validate required fields
        if (!email || !userId || !role) {
            return res.status(400).send({ message: 'Email, userId, and role are required' });
        }

        // ✅ Validate role value
        const validRoles = ['user', 'rider', 'admin'];
        if (!validRoles.includes(role)) {
            return res.status(400).send({ message: `Invalid role. Must be one of: ${validRoles.join(', ')}` });
        }

        // ✅ Prevent admin from demoting themselves
        if (adminEmail === email && role === 'user') {
            return res.status(403).send({ message: 'Forbidden: Cannot demote yourself from admin' });
        }

        // ✅ Find user and verify exists
        const user = await usersCollection.findOne({
            $and: [
                { email: email },
                { _id: new ObjectId(userId) }
            ]
        });

        if (!user) {
            return res.status(404).send({ message: 'User not found. Email and ID do not match.' });
        }

        // ✅ Update user role
        const result = await usersCollection.updateOne({ _id: new ObjectId(userId) }, { $set: { role: role, lastUpdated: new Date() } });

        if (result.modifiedCount === 0) {
            return res.status(500).send({ message: 'Failed to update user role' });
        }

        console.log(`✅ Admin ${adminEmail} updated role for ${email} (ID: ${userId}) to '${role}'`);
        res.send({
            success: true,
            message: `User role updated to '${role}' successfully`,
            email: email,
            userId: userId,
            role: role,
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        console.error('❌ Update user role error:', error.message);
        res.status(500).send({ message: 'Error updating user role', error: error.message });
    }
});

// GET /users - Get paginated users (Admin only)
app.get('/users', verifyJWT, verifyAdmin, async(req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const search = req.query.search || '';
        const role = req.query.role || 'all';

        const skip = (page - 1) * limit;

        let query = {};

        if (role !== 'all') {
            query.role = role;
        }

        if (search) {
            query.$or = [
                { displayName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const cursor = usersCollection.find(query).sort({ createdAt: -1 });
        const allUsers = await cursor.skip(skip).limit(limit).toArray();
        const totalDocuments = await usersCollection.countDocuments(query);
        const totalPages = Math.ceil(totalDocuments / limit);

        console.log(`✅ Retrieved ${allUsers.length} users (Page ${page}/${totalPages})`);
        res.send({
            success: true,
            message: 'Users retrieved successfully',
            users: allUsers,
            total: totalDocuments,
            totalPages: totalPages,
            currentPage: page
        });
    } catch (error) {
        console.error('❌ Get users error:', error.message);
        res.status(500).send({ message: 'Error fetching users', error: error.message });
    }
});

// DELETE /user/:id - Delete a user (Admin only)
app.delete('/user/:id', verifyJWT, verifyAdmin, async(req, res) => {
    try {
        const userId = req.params.id;

        // ✅ Validate user ID
        if (!ObjectId.isValid(userId)) {
            return res.status(400).send({ message: 'Invalid user ID' });
        }

        // ✅ Prevent deleting the logged-in user
        const userToDelete = await usersCollection.findOne({ _id: new ObjectId(userId) });
        if (!userToDelete) {
            return res.status(404).send({ message: 'User not found' });
        }

        if (userToDelete.email === req.user.email) {
            return res.status(403).send({ message: 'Forbidden: Cannot delete your own account' });
        }

        // ✅ Delete the user
        const result = await usersCollection.deleteOne({ _id: new ObjectId(userId) });

        if (result.deletedCount === 0) {
            return res.status(404).send({ message: 'User not found' });
        }

        console.log(`✅ User ${userToDelete.email} (ID: ${userId}) deleted`);
        res.send({
            success: true,
            message: 'User deleted successfully',
            deletedUser: userToDelete.email,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error('❌ Delete user error:', error.message);
        res.status(500).send({ message: 'Error deleting user', error: error.message });
    }
});

// GET /admin/payments - Get all payments from all users (Admin only)
app.get('/admin/payments', verifyJWT, verifyAdmin, async(req, res) => {
    try {
        let allPayments = await paymentsCollection.find({}).sort({ paidAt: -1 }).toArray();

        // Enrich each payment with parcel details if any fields are missing
        allPayments = await Promise.all(allPayments.map(async(payment) => {
            if (!payment.receiverName || payment.receiverName === 'N/A' ||
                !payment.parcelType || !payment.totalPrice) {
                try {
                    const parcel = await parcelsCollection.findOne({ _id: new ObjectId(payment.parcelId) });
                    if (parcel) {
                        payment.receiverName = payment.receiverName || parcel.receiverName || 'N/A';
                        payment.receiverPhone = payment.receiverPhone || parcel.receiverPhone || 'N/A';
                        payment.receiverAddress = payment.receiverAddress || parcel.receiverAddress || 'N/A';
                        payment.parcelName = payment.parcelName || parcel.parcelName || 'N/A';
                        payment.parcelType = payment.parcelType || parcel.parcelType || 'N/A';
                        payment.totalPrice = payment.totalPrice || parcel.totalPrice || payment.amount || 0;
                        payment.trackingId = payment.trackingId || parcel.trackingId || 'N/A';
                    }
                } catch (err) {
                    console.log('⚠️ Error enriching admin payment data:', err.message);
                }
            }
            return payment;
        }));

        console.log(`✅ Retrieved ${allPayments.length} payments for admin`);
        res.send({
            success: true,
            message: 'All payments retrieved successfully',
            payments: allPayments,
            total: allPayments.length
        });
    } catch (error) {
        console.error('❌ Get admin payments error:', error.message);
        res.status(500).send({ message: 'Error fetching payments', error: error.message });
    }
});

// GET /admin/parcels - Get all parcels (Admin only)
app.get('/admin/parcels', verifyJWT, verifyAdmin, async(req, res) => {
    try {
        const allParcels = await parcelsCollection.find({}).toArray();

        console.log(`✅ Retrieved ${allParcels.length} parcels for admin`);
        res.send({
            success: true,
            message: 'All parcels retrieved successfully',
            parcels: allParcels,
            total: allParcels.length
        });
    } catch (error) {
        console.error('❌ Get admin parcels error:', error.message);
        res.status(500).send({ message: 'Error fetching parcels', error: error.message });
    }
});