# 🚚 ProFast — Smart Logistics & Parcel Delivery Platform

<div align="center">

### Modern Full-Stack Parcel Delivery & Rider Management System

Built with React, Node.js, MongoDB, Firebase Authentication, Socket.IO and Stripe

[Live Demo](https://pro-fast-three.vercel.app) • [Frontend](https://pro-fast-three.vercel.app) • [Backend API](https://profast-production.up.railway.app)

</div>

---

# 📖 Overview

ProFast is a production-ready logistics and parcel delivery platform designed to streamline parcel booking, rider assignment, real-time delivery tracking, payment processing, and administrative operations.

The platform supports three different user roles:

* 👤 User
* 🏍️ Rider
* 🛡️ Admin

Each role receives a dedicated dashboard with role-specific features and permissions.

---

# ✨ Key Features

## 👤 User Features

* Secure Registration & Login
* Firebase Authentication
* Google Sign-In
* Parcel Booking
* Delivery Tracking
* Delivery History
* Real-Time Notifications
* Profile Management
* Stripe Payment Integration

---

## 🏍️ Rider Features

* Rider Dashboard
* Assigned Deliveries
* Pickup Management
* Delivery Status Updates
* Earnings Overview
* Delivery Analytics
* Real-Time Notifications
* Rider Profile Management

---

## 🛡️ Admin Features

* User Management
* Rider Management
* Parcel Management
* Delivery Control Center
* Coverage Area Management
* Notification Management
* Security Management
* Analytics Dashboard
* System Monitoring

---

# 🔐 Authentication & Security

### Authentication

* Firebase Email/Password Authentication
* Google OAuth Authentication
* Firebase Admin SDK Verification
* Protected Routes
* Role-Based Access Control (RBAC)

### Security

* HTTP Only Cookies
* JWT Verification Middleware
* Route Protection
* Role Validation
* Secure API Access
* Environment Variable Protection

---

# ⚡ Real-Time System

Powered by Socket.IO

### Features

* Instant Notifications
* Live Delivery Updates
* Rider Assignment Updates
* Admin Broadcast System
* Real-Time Dashboard Updates

---

# 💳 Payment System

Integrated with Stripe

### Capabilities

* Secure Checkout
* Payment Verification
* Transaction Tracking
* Parcel Payment Processing

---

# 🗺️ Coverage System

* Division Coverage
* District Coverage
* Service Area Management
* Dynamic Coverage Validation

---

# 📊 Dashboard Modules

## Admin Dashboard

* Platform Analytics
* User Statistics
* Rider Statistics
* Delivery Metrics
* Activity Feed
* Notification Center

## Rider Dashboard

* Active Deliveries
* Assigned Parcels
* Earnings
* Delivery Performance
* Notification Center

## User Dashboard

* Parcel History
* Tracking Status
* Payment Status
* Profile Settings

---

# 🏗️ Tech Stack

## Frontend

* React 19
* Vite
* Tailwind CSS
* React Router
* Axios
* React Query
* Framer Motion
* Recharts
* Socket.IO Client
* React Hook Form
* SweetAlert2
* Swiper
* Leaflet Maps

---

## Backend

* Node.js
* Express.js
* MongoDB
* Firebase Admin SDK
* Socket.IO
* Stripe
* Cookie Parser
* CORS

---

# 🗄️ Database Collections

### Core Collections

* users
* parcels
* riders
* notifications
* payments
* coverage_data
* rider_settings
* notification_settings

---

# 📁 Project Structure

```bash
ProFast/
│
├── frontend/
│   ├── src/
│   ├── pages/
│   ├── layouts/
│   ├── components/
│   ├── hooks/
│   ├── contexts/
│   └── firebase/
│
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   ├── socket/
│   ├── models/
│   ├── data/
│   └── utils/
│
└── README.md
```

---

# 🚀 Installation

## Frontend

```bash
cd frontend
npm install
npm run dev
```

## Backend

```bash
cd backend
npm install
npm run dev
```

---


## Frontend

```env
VITE_API_URL=
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

## Backend

```env
PORT=
MONGODB_URI=
STRIPE_SECRET=
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=
```

---

# 🚀 Deployment

### Frontend

* Vercel

### Backend

* Railway

### Database

* MongoDB Atlas

---

# 🎯 Architecture

```text
React Frontend
       │
       ▼
Firebase Authentication
       │
       ▼
Express API Server
       │
 ┌─────┼─────┐
 ▼     ▼     ▼
MongoDB Stripe Socket.IO
```

---

# 📈 Future Improvements

* Live GPS Tracking
* Rider Mobile Application
* Push Notifications
* AI Delivery Optimization
* Route Prediction System
* Multi-Vendor Support
* Advanced Reporting

---

# 👨‍💻 Developer

Mahfuj Khan

Full Stack Web Developer

### Core Expertise

* React.js
* Node.js
* Express.js
* MongoDB
* Firebase
* REST APIs
* Socket.IO
* Stripe Integration

---

# ⭐ Project Status

Production Ready

Actively Maintained

Enterprise Scalable Architecture


