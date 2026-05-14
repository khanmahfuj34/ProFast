Looking at your three documents (folder structure, requirements spec, and backend code), here's the full detailed PRD:

---

# ZepShift — Product Requirements Document (PRD)
**Version:** 1.0.0 | **Date:** May 2025 | **Author:** Mahfuj | **Status:** Active Development

---

## 1. Project Overview

ZepShift is a full-stack home and office parcel pickup-and-delivery web application built for the Bangladesh market. It provides end-to-end logistics management — from booking and payment to real-time tracking and digital proof of delivery — targeting businesses and individuals who need reliable, transparent courier services.

The platform is built around three coordinated roles (User, Admin, Rider) whose combined workflows create a seamless door-to-door delivery experience across Bangladesh's districts and service centers.

### 1.1 Project Identity

| Field | Details |
|---|---|
| Platform Name | ZepShift |
| Type | B2C Parcel Delivery Web Application |
| Target Market | Bangladesh (Dhaka + major districts) |
| Frontend | React 18 + Vite, Tailwind CSS, DaisyUI, React Router v6, Recharts, Firebase Auth |
| Backend | Node.js / Express.js, MongoDB Atlas, Firebase Admin SDK, Stripe, Socket.IO |
| Auth | Firebase Authentication (Email/Password + Google OAuth) |
| Real-time | Socket.IO (live status + rider events) |
| Payments | Stripe Checkout (card-based, USD) |
| Image Hosting | imgBB via useImageUpload hook |

### 1.2 Project Goals

- Provide door-to-door parcel delivery across Bangladesh districts with same-city and inter-district flows.
- Give users real-time visibility into parcel status throughout the full delivery lifecycle.
- Enable admins to manage riders, parcels, and routing from a single dashboard.
- Allow riders to accept, pick up, and confirm deliveries with per-event earning tracking.
- Integrate secure card-based payments using Stripe Checkout with atomic idempotency.
- Push real-time dashboard updates via Socket.IO on key events (payment, status change, rider toggle).

---

## 2. User Roles & Permissions

ZepShift has three distinct roles. Each gets its own dashboard layout with role-specific navigation and pages.

### 2.1 User (Customer)

Registered users who initiate parcel deliveries. Their capabilities:

- Create and submit parcel booking forms with pickup and delivery details.
- Pay for parcels using Stripe card-based checkout.
- Receive a unique tracking ID after successful payment.
- Track parcels in real-time using the tracking ID.
- View, delete (if unpaid), and manage their parcels.
- View full payment history.
- Apply to become a rider via the BeRider page.
- Update profile (name, photo, password) from Settings.

### 2.2 Admin

System operators managing the entire logistics operation. Their capabilities:

- Approve or reject rider applications (with full rider profile detail view).
- Assign pickup and delivery riders to parcels via service-center-aware modal.
- Manage the full parcel delivery routing pipeline (confirm received, ship, assign delivery).
- View all users and manage their roles (promote to Admin / demote to User).
- Access comprehensive analytics: revenue charts, delivery trends, parcel status distribution.
- View all payments across all users (enriched with parcel data).
- Monitor real-time rider and parcel status updates via Socket.IO events.
- Access parcel oversight with status filters and search by tracking number.

### 2.3 Rider

Field operatives responsible for physical parcel pickup and delivery. Their capabilities:

- Must be approved by Admin before gaining Rider role access.
- View assigned pickup and delivery tasks on the rider dashboard.
- Confirm parcel pickup (updates status, earns ৳20, triggers activityLog entry).
- Confirm parcel delivery (updates status, earns ৳20, triggers activityLog entry).
- Toggle online/offline status (auto-sets workStatus).
- View weekly earnings, delivery history with filters, and performance analytics.

---

## 3. Frontend Architecture

### 3.1 Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite (ESM build) |
| Styling | Tailwind CSS + DaisyUI |
| Routing | React Router v6 (defined in router/router.jsx) |
| Auth | Firebase Authentication |
| State | React Context API — AuthContext + ParcelContext |
| HTTP | Axios with secure interceptors (useAxiosSecure hook) |
| Charts | Recharts (PieChart, BarChart) |
| Forms | react-hook-form with validation |
| Notifications | react-hot-toast |
| Image Upload | Custom useImageUpload hook (imgBB CDN) |
| Marquee | react-fast-marquee (client logo section) |

### 3.2 Folder Structure (src/)

```
src/
├── assets/                        Static assets
├── components/                    Shared UI components
│   ├── AdminSidebar.jsx
│   ├── LogoutConfirmModal.jsx
│   ├── ProfileDropdown.jsx
│   └── ProfileModal.jsx
├── contexts/
│   ├── AuthContext/               AuthContext.jsx + AuthProvider.jsx
│   └── ParcelContext.jsx
├── data/
│   ├── coverage-data.js           Coverage zone data
│   └── districts.js              District list for form selects
├── firebase/
│   └── firebase.init.js          Firebase app initialization
├── hooks/
│   ├── useAuth.jsx               Exposes currentUser, loading, role
│   ├── useAxiosSecure.jsx        Axios instance with token interceptor
│   ├── useImageUpload.jsx        imgBB upload helper
│   ├── useLogout.jsx             Clears cookie + Firebase signOut
│   └── useParcel.jsx             Parcel data fetch + mutation
├── layouts/
│   ├── AdminLayout.jsx           AdminSidebar + AdminTopNavbar + content
│   ├── AuthLayout.jsx            Centered card for Login/Register
│   ├── DashboardLayout.jsx       Left sidebar + right content
│   └── Rootlayout.jsx            Navbar + Footer for public pages
├── pages/                        Feature pages by domain (see 3.3)
├── router/router.jsx             Full route tree definition
├── routes/
│   ├── AdminRoute.jsx            role === 'admin' guard
│   └── PrivateRoute.jsx          Authenticated user guard
└── utils/
    ├── pricingCalculator.js      Dynamic cost calculation logic
    └── receiptGenerator.js       Payment receipt generator
```

### 3.3 Page Inventory

**Public Pages (RootLayout):**

| Page | Purpose |
|---|---|
| Home | Landing page: Banner, Services, HowItWorks, Features, ClientLogo, CustomerReviews, MerchantBanner, FAQ |
| Coverage / CoverageMap | Interactive coverage zone map for Bangladesh |
| Pricing | Dynamic pricing display |
| TrackParcel | Public parcel tracking by tracking ID (no auth required) |
| About | Platform info |
| Login / Register | Firebase auth forms (AuthLayout) |
| BeRider / RiderStatus | Rider application form and status page |
| Forbidden / Unauthorized | Role/auth violation error pages |

**User Dashboard Pages (DashboardLayout + PrivateRoute):**

| Page | Purpose |
|---|---|
| User Home | Parcel status stats, Pie chart, User profile card |
| SendParcel | Multi-section parcel booking form |
| ParcelConfirmation | Toast with cost confirmation before final submit |
| MyParcels | Table of unpaid parcels with Pay/Delete/View actions |
| Payment | Stripe Checkout integration |
| PaymentSuccess / PaymentFailed | Post-payment result with tracking number |
| PaymentHistory | Full payment history table |
| DeliveryHistory | All parcels management — Track modal + View details |
| Settings | Update profile photo, name, password |

**Admin Dashboard Pages (AdminLayout + AdminRoute):**

| Page | Purpose |
|---|---|
| AdminDashboard | Overview cards, analytics charts, activity feed, top riders |
| ManageUsers | Paginated users with role toggle, search, filter |
| ApproveRiders / RiderDetailPage | Rider application list with Approve/Reject |
| ManageRiders | All riders table with status management |
| ParcelOversight | Full parcel management with status filter + tracking search |
| AssignRider | Step-by-step delivery route assignment UI |
| AllPayments / AdminPaymentHistory | All platform payments enriched with parcel data |
| ZoneManager | Service center zone management |
| LiveTracking | Real-time map of active deliveries |
| Reports | Revenue charts, delivery trends |
| Notifications | Platform-wide notification feed |
| SupportTickets | Customer support management |
| Settings | Admin settings |

**Rider Dashboard Pages (DashboardLayout + Rider role check):**

| Page / Component | Purpose |
|---|---|
| RiderDashboard | Overview cards, Pie chart, profile card, current tasks |
| RiderOverviewCards | Today's earnings, parcels to deliver/pickup |
| RiderActiveDeliveries | Map + active delivery card |
| RiderPerformance | Success rate, delivery counts, average rating |
| RiderAnalytics | Weekly earnings bar chart |
| RiderActivityFeed | Live activity log with status icons |
| AssignedDeliveries | Table of currently assigned parcels |
| DeliveryHistory | Paginated history with search, status filter, date range |

### 3.4 Route Guards

**PrivateRoute** — Wraps all dashboard routes. Unauthenticated users are redirected to /login.

**AdminRoute** — Checks `user.role === 'admin'` from AuthContext. Non-admins redirected to /forbidden.

Rider-only pages do role checking inside the component itself, redirecting to /unauthorized if `role !== 'rider'`.

### 3.5 Layouts

| Layout | Used For |
|---|---|
| RootLayout | Navbar + Footer wrapper for all public pages |
| AuthLayout | Centered card layout for Login/Register |
| DashboardLayout | Left sidebar + right content for User and Rider dashboards |
| AdminLayout | AdminSidebar + AdminTopNavbar + content for Admin pages |

---

## 4. Parcel Lifecycle & Status Model

Every parcel moves through a defined status pipeline. Transitions are validated on the backend and reflected in real-time via Socket.IO. The status is stored in `deliveryStatus` on the parcel document.

### 4.1 Delivery Status Pipeline

| Status | Description & Trigger |
|---|---|
| `unpaid` | Initial state. Parcel created, payment not yet made. |
| `paid` / `pending-pickup` | Stripe payment successful. Tracking ID assigned. Awaiting admin pickup rider assignment. |
| `ready-to-pickup` | Admin assigned pickup rider. Rider notified. |
| `in-transit` | Rider confirmed pickup. Parcel moving to origin service center (inter-district only). |
| `reached-service-center` | Admin confirmed parcel received at origin service center. |
| `shipped` | Admin shipped parcel toward destination service center. |
| `ready-for-delivery` | Admin assigned delivery rider at destination. For same-district: set directly after pickup confirmation. |
| `delivered` | Delivery rider confirmed delivery to receiver. |

### 4.2 Same-District vs Inter-District Flow

The system checks if `senderServiceCenter !== receiverServiceCenter` to determine the routing path.

**Same-District (Short Flow):**
1. Parcel created → paid → Admin assigns pickup rider → `ready-to-pickup`
2. Rider confirms pickup → status jumps directly to `ready-for-delivery`
3. Admin assigns delivery rider → Rider confirms delivery → `delivered`

**Inter-District (Full Flow):**
1. Parcel created → paid → Admin assigns pickup rider → `ready-to-pickup`
2. Rider confirms pickup → `in-transit`
3. Admin confirms received at service center → `reached-service-center`
4. Admin ships → `shipped` → Admin assigns delivery rider → `ready-for-delivery`
5. Delivery rider confirms → `delivered`

### 4.3 Rider Earning Events

- Pickup confirmation → Rider earns ৳20, `workStatus` → `in_delivery`
- Delivery confirmation → Rider earns ৳20, `workStatus` → `Available` (if no other active delivery)

---

## 5. Feature Requirements

### 5.1 Authentication & Authorization

**Registration:**
- Email/password or Google OAuth via Firebase Auth.
- On successful auth, user record upserted in MongoDB `users` collection via `POST /user`.
- Default role = `"user"`. Seed admin email (`mkmahfujkhanms@gmail.com`) auto-gets `"admin"` role.
- Firebase ID token stored as httpOnly cookie via `POST /jwt`.

**Login:**
- Email/password or Google OAuth.
- Token stored in httpOnly cookie on success.
- `useAuth` hook exposes `currentUser`, `loading`, `role` to all components via AuthContext.

**Logout:**
- `LogoutConfirmModal` shows a confirmation dialog before proceeding.
- `POST /logout` clears the httpOnly cookie on the backend.
- `Firebase signOut()` called on the frontend side.

### 5.2 Parcel Booking (SendParcel)

A multi-section form divided into three sub-sections:

**Section 1 — Parcel Info:**
- Parcel type: Document or Non-Document (changes weight field visibility)
- Parcel title (required)
- Parcel weight in kg (required only when type = Non-Document)

**Section 2 — Sender Info (6 fields):**
- Name (pre-filled from user profile), contact number
- Region (select from `districts.js` data)
- Service Center (dynamically loaded based on selected region)
- Pickup address, pickup instructions

**Section 3 — Receiver Info (6 fields):**
- Receiver name, contact number
- Region, Service Center (same dynamic logic)
- Delivery address, delivery instructions

**Cost Calculation** (`pricingCalculator.js`):
- Computed from parcel type + origin/destination service centers + weight.
- On submit: display Toast with calculated cost and a Confirm button.
- On confirm: `POST /parcels` saves parcel to DB with `paymentStatus = "unpaid"`, `deliveryStatus = "awaiting-payment"`.

### 5.3 Payment System

**Parcel To Pay Page (MyParcels):**
- Lists all user parcels where `paymentStatus = "unpaid"`.
- Search bar to find parcel by receiver phone number.
- Actions per row: Pay (→ `/pay/:parcelId`), Delete (with confirmation dialog), View details.

**Payment Page:**
- `POST /create-payment-intent` creates a Stripe Checkout Session (verifies parcel ownership from token).
- User redirected to Stripe-hosted checkout page.
- On success: redirect to `/dashboard/payment-success?session_id=...`
- `PaymentSuccess` page calls `PATCH /payment-success` with session ID.
- Backend atomically: verifies Stripe session → upserts payment record (`$setOnInsert` + upsert) → updates parcel status to `"paid"` + assigns tracking ID.
- Socket.IO emits `payment_received` and `dashboard_stats_updated` events.
- UI shows success alert with tracking number and transaction ID.

**Payment History Page:**
- `GET /payments` returns all payments for authenticated user (sorted latest first).
- Table shows: parcel name, receiver info, amount, date (relative), tracking ID.
- Each record is enriched with parcel data at query time if fields are missing.

### 5.4 Parcel Tracking

- Public endpoint `GET /track/:trackingId` — no auth required.
- Returns sanitized parcel data: status, sender/receiver districts, timestamps, `activityLog`.
- TrackParcel page shows current status badge, origin/destination, and a timeline from `activityLog`.
- `activityLog` array on the parcel document stores timestamped entries `{status, timestamp, updatedBy, role}`.

### 5.5 Admin Dashboard Features

**Admin Home:**
- Overview cards: Total Users, Total Riders, Parcels Delivered, Revenue, Active Riders.
- Bar chart: Revenue by day (last 7 days) from `GET /admin/analytics`.
- Pie chart: Parcel status distribution (Delivered / On Way / Pending / Cancelled).
- Recent payments notification feed.
- Top performing riders card.
- Activity feed with recent system events.

**Manage Users:**
- Paginated user table (`GET /users` with `page`, `limit`, `search`, `role` params).
- Search by name or email. Filter dropdown by role.
- Role toggle per row: "Make Admin" if user, "Make User" if admin.
- `PATCH /user/role` — Admin only. Validation: cannot demote own account.
- `DELETE /user/:id` — Cannot delete own account; email + ID must match.

**Approve Riders:**
- `GET /riders` lists all applications, filterable by `status`, `district`, `workStatus`.
- `RiderDetailPage` shows full rider profile: NID, license, bike details, region, photo.
- Approve: `PATCH /riders/:id` sets `status = "Approved"` → updates `users` collection role to `"rider"`.
- Reject: `PATCH /riders/:id` sets `status = "Rejected"` → reverts user role to `"user"`.

**Parcel Oversight:**
- `GET /admin/parcels` returns all parcels.
- Filter by `deliveryStatus`. Search by `tracking_no`.
- View button → parcel details. Manage button → delivery route page (disabled when `status = "unpaid"`).

**Assign Rider Flow (Ordered List UI on AssignRider page):**

1. **Assign Parcel for Pickup** — enabled when `status = "paid"`. Modal shows service center info and available riders filtered by that center. On assign: `pickupRider` set, status → `ready-to-pickup`, activityLog entry created.
2. **Parcel Received by Rider Card** — displayed when `status = "ready-to-pickup"` (informational).
3. **Confirm Parcel Received** — shown only if service centers differ, enabled when `status = "in-transit"`. On click: status → `reached-service-center`, activityLog entry.
4. **Ship Parcel** — shown if service centers differ, enabled when `status = "reached-service-center"`. On click: status → `shipped`, activityLog entry.
5. **Assign Parcel for Delivery** — shown if service centers differ, enabled when `status = "shipped"`. Modal shows destination-district riders. On assign: `deliveryRider` set, status → `ready-for-delivery`, activityLog entry.
6. **Parcel Delivery by Rider Card** — displayed when `status = "ready-for-delivery"` (informational).
7. **Parcel Delivered Card** — displayed when `status = "delivered"` (informational).

### 5.6 Rider Dashboard Features

**Rider Home:**
- Overview cards: Today's Earnings, Parcels to Deliver (`ready-for-delivery`), Parcels to Pickup (`ready-to-pickup`).
- Left: Rider profile card (name, email, photo, edit button → Settings).
- Right: Pie chart of parcel state counts.
- Current Tasks feed: tracking entries where rider email matches and status is `ready-to-pickup` or `ready-for-delivery`.

**Assigned Deliveries:**
- `GET /rider/assigned-deliveries` — parcels with statuses `driver_assigned`, `driver_accepted`, `picked_up`, `on_the_way`.
- Table: parcel name, pickup/delivery district, tracking ID, status badge.
- Status update buttons per delivery row (Accept → Picked Up → On The Way → Delivered).

**Delivery History (Rider):**
- `GET /rider/delivery-history` with pagination (`page`, `limit`), `search` (tracking ID/name), `status` filter (all/delivered/in-transit/cancelled), `fromDate`/`toDate` range.
- Stats panel: total, completed, in-transit, cancelled counts, success rate, cancel rate.
- Table: tracking ID, parcel name, pickup/delivery district, receiver name, status, delivered date, earning (৳).

**Online/Offline Toggle:**
- `PATCH /rider/status` — toggles `isOnline` boolean.
- `workStatus` auto-set: online + active delivery → `"in_delivery"`; online + no active → `"Available"`; offline → `"Unavailable"`.
- Socket.IO emits `rider_status_changed` to all connected clients.

**Analytics & Performance:**
- `GET /rider/analytics` — delivery stats for selectable range (7d, 30d, 3m, 1y): total, delivered, cancelled, pending, success rate.
- `GET /rider/performance` — total/completed/cancelled counts, success rate, cancel rate, weekly delivery count, average rating (placeholder 4.8 — not yet implemented).
- `GET /rider/weekly-earnings` — last 7 days earnings: `{day, earnings, deliveries, isToday}` array.

---

## 6. Backend API Reference

Base URL: `http://localhost:3000` (dev) | `https://api.zepshift.com` (prod)

All protected routes accept a valid Firebase ID token as either an httpOnly cookie named `token` or as `Authorization: Bearer <token>` header.

### 6.1 Auth Routes

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /jwt | Public | Store Firebase token as httpOnly cookie |
| POST | /logout | Public | Clear auth cookie |
| GET | /health | Public | Server health check |
| POST | /users | Public | Register new email/password user |
| POST | /save-social-user | JWT | Upsert social OAuth user record |
| POST | /user | JWT | Register/upsert user with role assignment |
| GET | /user | JWT | Get current authenticated user profile |
| PATCH | /user | JWT | Update user profile (name, photoURL, etc.) |

### 6.2 Parcel Routes

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | /parcels | JWT | Get user's own parcels (senderEmail from token) |
| POST | /parcels | JWT | Create new parcel |
| GET | /parcels/:id | Public | Get single parcel by MongoDB _id |
| PATCH | /parcels/:id | JWT | Update parcel: rider assignment, status, activityLog |
| DELETE | /parcels/:id | JWT | Delete parcel (ownership verified) |
| GET | /parcels/assigned | JWT | Get parcels where riderEmail = authenticated user |
| GET | /track/:trackingId | Public | Public tracking (sanitized response) |

### 6.3 Payment Routes

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /create-payment-intent | JWT | Create Stripe Checkout Session (verifies parcel ownership) |
| PATCH | /payment-success | JWT | Verify session, atomic upsert payment, update parcel |
| GET | /payments | JWT | User's payment history (enriched with parcel data) |

### 6.4 Rider Routes

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /riders | JWT | Submit rider application |
| GET | /riders/:email | JWT | Get own rider application status |
| PATCH | /riders/:id | JWT | Update rider status (Admin) or profile (own, Pending only) |
| GET | /riders | JWT + Admin | List all riders with optional filters |

### 6.5 Rider Dashboard Routes

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | /rider/dashboard-stats | JWT + Rider | Assigned count, pending pickups, today completions, earnings |
| GET | /rider/assigned-deliveries | JWT + Rider | Active assigned parcels (mapped delivery info) |
| GET | /rider/deliveries | JWT + Rider | Alias for assigned-deliveries (frontend compatibility) |
| GET | /rider/active-delivery | JWT + Rider | Most recent active delivery with route coordinates |
| GET | /rider/weekly-earnings | JWT + Rider | Last 7 days earnings by day |
| GET | /rider/delivery-history | JWT + Rider | Paginated history: search, status, date filters |
| GET | /rider/activity-feed | JWT + Rider | Recent parcel activities as activity log |
| GET | /rider/analytics | JWT + Rider | Delivery stats for configurable date range |
| GET | /rider/performance | JWT + Rider | Performance metrics (success rate, weekly count) |
| GET | /rider/status | JWT + Rider | Get rider isOnline + workStatus |
| PATCH | /rider/status | JWT + Rider | Toggle isOnline; auto-set workStatus |
| PATCH | /rider/delivery/:id/status | JWT + Rider | Update status (accepted/picked_up/on_way/delivered) |

### 6.6 Admin Routes

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | /admin/stats | JWT + Admin | Total users, riders, parcels, rider approval breakdown |
| GET | /admin/dashboard-stats | JWT + Admin | Comprehensive stats: parcels, revenue, riders, users |
| GET | /admin/parcels | JWT + Admin | All parcels in the system |
| GET | /admin/payments | JWT + Admin | All payments enriched with parcel data |
| GET | /admin/analytics | JWT + Admin | Delivery trend, status pie, revenue by day (range param) |
| GET | /users | JWT + Admin | Paginated users: search + role filter |
| DELETE | /user/:id | JWT + Admin | Delete user (cannot delete self) |
| PATCH | /user/role | JWT + Admin | Update user role; cannot demote self |

---

## 7. Database Schema

MongoDB Atlas — Database: `zep_shift_db` — 4 collections.

### 7.1 `users` Collection

| Field | Type | Description |
|---|---|---|
| _id | ObjectId | Auto-generated PK |
| email | String | Unique Firebase email |
| displayName | String | User's display name |
| photoURL | String\|null | Profile photo URL |
| uid | String | Firebase UID |
| role | String | "user" \| "rider" \| "admin" |
| providers | Array | OAuth providers (e.g., ["google", "password"]) |
| createdAt | Date | Account creation timestamp |
| lastLogin | Date | Last login timestamp |
| lastUpdated | Date | Last profile update timestamp |

### 7.2 `parcels` Collection

| Field | Type | Description |
|---|---|---|
| _id | ObjectId | Auto-generated PK |
| senderEmail | String | Enforced from Firebase token |
| senderName | String | Sender full name |
| senderPhone | String | Sender contact |
| senderDistrict | String | Sender region |
| senderAddress | String | Full pickup address |
| senderServiceCenter | String | Origin service center |
| receiverName | String | Receiver full name |
| receiverPhone | String | Receiver contact |
| receiverDistrict | String | Receiver region |
| receiverAddress | String | Full delivery address |
| receiverServiceCenter | String | Destination service center |
| parcelType | String | "document" \| "non-document" |
| parcelName | String | Parcel title |
| parcelWeight | Number | Weight in kg (non-document only) |
| totalPrice | Number | Calculated delivery cost (BDT) |
| deliveryStatus | String | Current lifecycle status |
| paymentStatus | String | "unpaid" \| "paid" |
| trackingId | String\|null | Assigned at payment (TRK-{ts}-{rand}) |
| pickupRider | String\|null | Pickup rider email |
| deliveryRider | String\|null | Delivery rider email |
| riderId | ObjectId\|null | Current assigned rider _id |
| riderName | String\|null | Current assigned rider name |
| riderEmail | String\|null | Current assigned rider email |
| activityLog | Array | [{status, timestamp, updatedBy, role}] |
| createdAt | Date | Parcel creation time |
| updatedAt | Date | Last modification time |
| paidAt | Date\|null | Payment completion time |
| deliveredAt | Date\|null | Delivery completion time |

### 7.3 `payments` Collection

Unique sparse index on `transactionId`. Compound index on `{parcelId, customerEmail}`.

| Field | Type | Description |
|---|---|---|
| _id | ObjectId | Auto-generated PK |
| transactionId | String | Stripe payment_intent ID (UNIQUE — idempotency key) |
| parcelId | String | Related parcel _id (string) |
| customerEmail | String | Verified payer email from Stripe |
| parcelName | String | Parcel name at time of payment |
| amount | Number | Charged amount in USD |
| currency | String | "usd" |
| paymentStatus | String | Stripe payment_status (e.g., "paid") |
| trackingId | String | Tracking ID assigned at payment |
| receiverName | String | Enriched from parcel at payment time |
| receiverPhone | String | Enriched from parcel |
| receiverAddress | String | Enriched from parcel |
| parcelType | String | Enriched from parcel |
| totalPrice | Number | BDT price from parcel document |
| paidAt | Date | Payment completion timestamp |

### 7.4 `rider` Collection

| Field | Type | Description |
|---|---|---|
| _id | ObjectId | Auto-generated PK |
| email | String | Rider email (unique, from JWT token) |
| uid | String | Firebase UID |
| name | String | Rider full name |
| phoneNumber | String | Contact number |
| nidNo | String | National ID number |
| drivingLicense | String | Driving license number |
| region | String | Operating region |
| district | String | Operating district |
| bikeBrand | String | Motorcycle brand |
| bikeRegistration | String | Bike plate number |
| aboutYourself | String | Self-description |
| photo | String | Rider photo URL |
| status | String | "Pending" \| "Approved" \| "Rejected" |
| workStatus | String | "Available" \| "in_delivery" \| "Unavailable" |
| isOnline | Boolean | Online toggle (default: true) |
| createdAt | Date | Application submission time |
| updatedAt | Date | Last update time |

---

## 8. Real-Time Events (Socket.IO)

The backend runs Socket.IO on the same HTTP server. All events are global broadcasts (`io.emit`).

| Event | Triggered By | Payload |
|---|---|---|
| `payment_received` | PATCH /payment-success success | `{transactionId, parcelId, amount, timestamp}` |
| `dashboard_stats_updated` | Payment success or rider status change | `{event, timestamp}` |
| `parcel_status_updated` | PATCH /parcels/:id (status change) | `{parcelId, status, timestamp}` |
| `parcel_rider_assigned` | PATCH /parcels/:id (riderId set) | `{parcelId, riderId, riderName, timestamp}` |
| `rider_status_changed` | PATCH /rider/status or delivery complete | `{riderId, riderEmail, isOnline, workStatus, timestamp}` |

---

## 9. Security Model

### 9.1 Authentication Flow

1. User logs in via Firebase Auth.
2. Firebase issues an ID token (JWT) to the frontend.
3. Frontend sends token to `POST /jwt`; backend verifies via Firebase Admin SDK.
4. Token stored as httpOnly, `sameSite=lax` cookie (`secure=true` in production).
5. All protected API calls: backend reads cookie or Authorization header and verifies via `admin.auth().verifyIdToken()`.

### 9.2 Middleware Chain

**verifyJWT** — Extracts and verifies Firebase ID token. Attaches decoded user to `req.user`. Returns 401 if missing/invalid.

**verifyAdmin** — Applied after verifyJWT. Queries `usersCollection` for `role === "admin"`. Returns 403 if not.

**verifyRider** — Applied after verifyJWT. Queries `usersCollection` for `role === "rider"`. Returns 403 if not.

### 9.3 Key Authorization Rules

- **Parcel creation/deletion:** `senderEmail` enforced from token — frontend cannot spoof another user's identity.
- **Payment:** Parcel ownership verified before Stripe session creation AND before processing payment success.
- **Rider application:** Email enforced from token; one application per email (409 Conflict on duplicate).
- **Admin role change:** Admins cannot demote their own account (prevents self-lockout).
- **User deletion:** Cannot delete own account; ID + email must both match (prevents mismatch attacks).
- **Rider profile edit:** Only allowed while `status === "Pending"` — approved/rejected riders cannot self-modify.

### 9.4 Payment Idempotency

The `PATCH /payment-success` endpoint uses `findOneAndUpdate` with `$setOnInsert` and `upsert: true` — ensuring only ONE payment document is ever created per `transactionId`, even under concurrent requests. The unique sparse index on `payments.transactionId` acts as a secondary database-level guard.

---

## 10. Non-Functional Requirements

### 10.1 Performance

- API response target: < 500ms for standard reads, < 1s for paginated list queries.
- MongoDB indexes: `payments.transactionId` (unique sparse), `payments.{parcelId, customerEmail}`, `parcels.senderEmail`, `parcels.riderEmail`, `parcels.trackingId`.
- Frontend code-split by route via Vite lazy loading.

### 10.2 Scalability

- MongoDB Atlas for horizontal DB scaling (M10+ cluster for production).
- Stateless Express server — horizontally scalable behind a load balancer.
- Socket.IO: a Redis adapter is required for multi-instance deployment (not in v1 scope).

### 10.3 Reliability

- `process.exit(1)` on failed MongoDB initial connection prevents silent startup failures.
- Atomic payment upsert prevents revenue leakage from duplicate processing.
- Stripe webhook verification is recommended for v2 (v1 uses redirect-based confirmation).

### 10.4 Usability

- Fully responsive — Tailwind CSS + DaisyUI mobile-first breakpoints.
- Dark/light mode support for rider dashboard.
- Toast notifications for all async operations.
- Loading states on all data-fetching operations.
- Empty state UI when tables/lists return no data.

### 10.5 Maintainability

- Two-file component pattern throughout: data parent + presentational child (e.g., `Services.jsx` + `ServiceCard.jsx`, `HowItWorks.jsx` + `HowItWorksCard.jsx`).
- Custom hooks abstract all API calls, keeping components lean.
- Composable middleware chain (verifyJWT → verifyAdmin/verifyRider) keeps route handlers clean.

---

## 11. Known Gaps & Future Scope

### 11.1 Known Gaps in v1

- **Rating system:** `/rider/performance` returns hardcoded `averageRating: 4.8` — no actual rating collection or user-facing review flow implemented.
- **Tracking collection:** Requirements spec mentions a separate `tracking_collection`, but current implementation merges tracking history into `parcel.activityLog`. This creates a structural mismatch with the spec.
- **Stripe webhook:** Payment confirmation relies on success URL redirect — if user closes the tab before redirect, payment is processed in Stripe but not captured by the backend.
- **Socket.IO targeting:** All events use global `io.emit` — admin-only events (e.g., `dashboard_stats_updated`) are visible to all connected sockets, including riders and regular users.
- **ManageUsers page:** Folder exists in the file structure but implementation file is not listed in the directory — may be incomplete or merged into another file.
- **Rider earning history:** Earning increments (৳20) are tracked conceptually but there is no dedicated earning history collection or per-transaction earning record in the DB.
- **receiptGenerator.js:** Exists in `utils/` but no backend integration point is defined.
- **Parcel weight in same-district short flow:** The status jump from `in-transit` to `ready-for-delivery` is rider-triggered in the spec, but the condition check (same service center) lives on the rider's frontend — not enforced on the backend.

### 11.2 Recommended v2 Features

- Stripe webhook endpoint for reliable payment confirmation.
- Socket.IO room-based targeting (admin room, rider room, user-specific).
- Separate `tracking_events` collection for immutable, append-only status history.
- Firebase Cloud Messaging (FCM) push notifications for riders.
- Redis adapter for Socket.IO (multi-instance deployment support).
- Full rider rating system: users rate deliveries post-completion.
- SSLCommerz / bKash for local Bangladesh payment methods.
- Bengali (বাংলা) i18n support for rider-facing pages.
- Bulk parcel import via CSV for merchant customers.
- Full CRUD for Admin Zone Manager (service centers and coverage zones).

---

## 12. Environment & Deployment

### 12.1 Frontend (.env)

| Variable | Description |
|---|---|
| VITE_API_BASE_URL | Backend base URL |
| VITE_FIREBASE_API_KEY | Firebase Web API key |
| VITE_FIREBASE_AUTH_DOMAIN | Firebase Auth domain |
| VITE_FIREBASE_PROJECT_ID | Firebase project ID |
| VITE_FIREBASE_STORAGE_BUCKET | Firebase storage bucket |
| VITE_FIREBASE_MESSAGING_SENDER_ID | Firebase sender ID |
| VITE_FIREBASE_APP_ID | Firebase App ID |
| VITE_IMGBB_API_KEY | imgBB API key for image upload |

### 12.2 Backend (.env)

| Variable | Description |
|---|---|
| PORT | Express server port (default: 3000) |
| DB_USER | MongoDB Atlas username |
| DB_PASS | MongoDB Atlas password |
| STRIPE_SECRET | Stripe secret key (sk_live_... / sk_test_...) |
| SITE_DOMAIN | Allowed frontend domain for CORS + Stripe redirect URLs |
| NODE_ENV | "production" enables secure cookies |

### 12.3 Firebase Admin SDK

- Service account JSON: `zep-shift-8dd9f-firebase-adminsdk-fbsvc-e1c130ae1d.json`
- Loaded via `require()` at server startup — must be present in backend root.
- Used only server-side for token verification via `admin.auth().verifyIdToken()`.

---

## 13. Glossary

| Term | Definition |
|---|---|
| Tracking ID | Unique parcel identifier (format: `TRK-{timestamp}-{random}`) assigned at payment. |
| Service Center | District-level logistics hub acting as origin/destination for parcels. |
| workStatus | Rider availability state: `"Available"`, `"in_delivery"`, `"Unavailable"`. |
| activityLog | Append-only array on parcel storing `{status, timestamp, updatedBy, role}` history. |
| verifyJWT | Backend middleware extracting and verifying Firebase ID token. |
| verifyAdmin | Middleware checking `role === "admin"` in DB after JWT verification. |
| verifyRider | Middleware checking `role === "rider"` in DB after JWT verification. |
| httpOnly Cookie | Cookie inaccessible to JavaScript — prevents XSS token theft. |
| Atomic Upsert | `findOneAndUpdate` with `$setOnInsert` + upsert — insert only if key does not exist. |
| Socket.IO | WebSocket library for real-time bidirectional server-client communication. |
| Stripe Session | A Stripe Checkout Session representing a pending or completed payment. |
| PRD | Product Requirements Document — this document. |

---

*End of Document — ZepShift PRD v1.0.0 | Prepared by Mahfuj — Daffodil International University — May 2025*