# ZEP-SHIFT PROJECT DETAILS

**Project Name:** ZEP-Shift (ProFast Delivery Application)  
**Type:** Full-Stack MERN Application (MongoDB, Express.js, React, Node.js)  
**Purpose:** A comprehensive last-mile delivery platform connecting customers, merchants, and delivery riders

---

## TABLE OF CONTENTS
1. [Project Overview](#project-overview)
2. [Frontend Features](#frontend-features)
3. [Backend Features](#backend-features)
4. [Database Collections](#database-collections)
5. [Authentication System](#authentication-system)
6. [API Endpoints](#api-endpoints)
7. [Technology Stack](#technology-stack)
8. [File Structure](#file-structure)

---

## PROJECT OVERVIEW

ZEP-Shift is a full-featured delivery management platform built with React and Express.js that enables:
- **Customers:** Send parcels with real-time tracking and payment processing
- **Riders:** Apply to become delivery partners with profile management
- **Admins:** Manage users, approve riders, and oversee the delivery network
- **Merchants:** Access fulfillment solutions and business analytics

---

## FRONTEND FEATURES

### 1. **Authentication System**
- **Firebase Authentication Integration**
  - Email/password login and registration
  - Social authentication (Google, Facebook)
  - JWT token management with httpOnly cookies
  - Profile photo upload support
  - Role-based access control (User, Rider, Admin)

### 2. **Homepage (Publically Accessible)**
- **Banner Section:** Promotional hero section with call-to-action buttons
- **How It Works:** Step-by-step explanation of the delivery process
- **Services:** Display of offered services (Express, Standard, Nationwide delivery)
- **Client Logos:** Brand partnerships showcase
- **Features:** Live tracking, Safe delivery, 24/7 support highlights
- **Merchant Banner:** Special section for merchant partnerships
- **Customer Reviews:** Testimonials and ratings from satisfied customers
- **FAQ Section:** Frequently asked questions with expandable answers

### 3. **Send Parcel Page** (Private Route)
- **Form Fields:**
  - Sender information (name, email, phone)
  - Recipient details (name, email, phone, address)
  - Parcel information (weight, dimensions, description)
  - Coverage area selection (Region & District dropdown cascading)
  - Parcel type selection
  - Special instructions/notes
- **Dynamic District Selection:** Districts load based on selected region from coverage-data
- **Form Validation:** Real-time validation with error messages
- **Data Submission:** Posts parcel data to backend with JWT authentication
- **Confirmation:** Success/error alerts with SweetAlert2

### 4. **Parcel Confirmation Page** (Private Route)
- Displays submitted parcel details
- Shows tracking information
- Estimated delivery timeline
- Customer support options

### 5. **Pricing Page**
- Displays delivery pricing structure
- Regional pricing differences
- Service type pricing (Express, Standard, Nationwide)
- Cost calculator
- Featured pricing plans

### 6. **Coverage Map Page**
- Interactive map showing delivery coverage areas
- Regional service availability
- Coverage details and expansion plans
- Service timeline information

### 7. **About Us Page**
- Company mission and values
- Team overview
- Company achievements (stats: 50K+ parcels, 15K+ customers, 500+ riders)
- Safety and reliability features
- Express delivery highlights

### 8. **Be Rider Application Page** (Private Route)
- **Multi-Step Form:**
  - Personal Information (name, email, phone, NID)
  - Driving License Number
  - Region & District Selection (cascading dropdown)
  - Bike Details (Brand, Model, Year)
  - Bike Registration Number
  - **Profile Photo Upload** (with existing photo display if available)
  - About Yourself (textarea)
- **Features:**
  - Photo upload with instant update from user profile
  - Mandatory photo requirement before submission
  - Photo preview with confirmation status
  - Form validation and required fields check
  - Success/Error alerts with SweetAlert2
  - Prevents duplicate applications (409 Conflict)
  - Status tracking after submission

### 9. **Dashboard - My Parcels** (Private Route)
- View all submitted parcels by user
- Parcel status tracking (Pending, In Transit, Delivered)
- Parcel details display
- Edit/Delete parcel options
- Search and filter functionality
- Navigation to payment for unpaid parcels

### 10. **Dashboard - Payment** (Private Route)
- **Stripe Payment Integration**
  - Secure payment processing
  - Payment intent creation
  - Card payment handling
  - Multiple parcel payment support
- **Payment Details Display:**
  - Parcel information
  - Calculated cost breakdown
  - Payment amount display
  - Customer information confirmation

### 11. **Dashboard - Payment History** (Private Route)
- View all completed transactions
- Payment status (Completed, Failed, Pending)
- Payment date and amount
- Parcel reference information
- Transaction ID tracking

### 12. **Dashboard - Approve Riders** (Admin Feature)
- **Rider List View:**
  - Display all rider applications with profiles
  - Rider photos in profile pictures
  - Statistics dashboard (Pending, Approved, Rejected counts)
  - Search functionality (name, email, phone)
  - Filter by status (All, Pending, Approved, Rejected)
- **Rider Detail Page:**
  - Full application details display
  - Organized form sections with icons
  - Profile photo display
  - Personal information (name, email, phone, NID)
  - License & documents section
  - Region & location details
  - Bike information
  - Personal description
  - Approve/Reject buttons (conditional for Pending status)
  - Loading states during processing
  - Navigation back to list after action
- **Admin Actions:**
  - View full rider application
  - Approve rider (changes status to Approved, updates user role to "rider")
  - Reject rider (changes status to Rejected)
  - SweetAlert2 confirmation dialogs

### 13. **Dashboard - Manage Users** (Admin Feature - NEW)
- **User Management Interface:**
  - Display all system users
  - Total user count with breakdown (Regular Users, Riders, Admins)
  - Statistics cards showing user distribution
- **User List Table:**
  - Column #: Numbered list (1, 2, 3...) with circular badges
  - User: Profile photo + user name
  - Email: User email address
  - Role: Color-coded badges (👤 User, 🏍️ Rider, 👑 Admin)
  - Admin Action: Dynamic button based on role
    - ❌ **Remove Admin** (for admins) - Demotes to regular user
    - 👑 **Make Admin** (for non-admins) - Opens role selector
  - Other Action: ⚙️ **Actions** - View details or delete user
- **Features:**
  - Real-time search by name or email
  - Filter by role (All, User, Rider, Admin)
  - Change user roles via dropdown selector
  - Remove admin status with confirmation
  - View user details in modal with photo
  - Delete user with safety confirmation
  - Prevents deleting own account

---

## BACKEND FEATURES

### 1. **Authentication & Security**
- **JWT Token Management:**
  - Firebase Admin SDK for token verification
  - JWT verification middleware (verifyJWT)
  - Token extraction from cookies and Authorization headers
  - Email-based user validation from JWT claims
  - Console logging of token verification status

- **Security Features:**
  - CORS with credentials enabled
  - Cookie parser for httpOnly cookies
  - Email verification in all protected endpoints
  - Role-based access control
  - Prevention of privilege escalation

### 2. **Parcel Management Endpoints**

**GET /parcels** (Protected)
- Retrieves all parcels for authenticated user
- Filters by user email
- Returns parcel array with total count
- Includes parcel status and details

**POST /parcels** (Protected)
- Creates new parcel submission
- Required fields: sender info, recipient info, weight, parcel type, location, description
- Validates all required fields
- Enforces email from JWT token (prevents submission on behalf of others)
- Sets initial status to "Pending"
- Records creation timestamp
- Returns parcel ID and confirmation

**DELETE /parcels/:id** (Protected)
- Deletes parcel by ID
- Validates parcel ownership (email verification)
- Removes parcel from database
- Returns deletion confirmation
- Error handling for non-existent parcels

**GET /parcels/:id** (Public)
- Retrieves specific parcel details
- Returns parcel information with all fields
- Used for parcel tracking

**PATCH /parcels/:id** (Public)
- Updates parcel status
- Accepts: status, location, lastUpdate
- Used for real-time tracking updates
- Records update timestamp

### 3. **Payment Processing Endpoints**

**POST /create-payment-intent** (Protected)
- Stripe Payment Intent creation
- Accepts amount and description
- Returns client secret for frontend payment processing
- Handles Stripe API errors
- Validates payment amount

**PATCH /payment-success** (Protected)
- Marks payment as completed
- Updates parcel status to "Paid"
- Records payment timestamp
- Links parcel to payment record
- Returns success confirmation
- Prevents duplicate payment marking

**GET /payments** (Protected)
- Retrieves all payments for authenticated user
- Filters by user email
- Returns payment history with status
- Includes payment amount, date, parcel reference
- Supports payment filtering and sorting

### 4. **Rider Application Management Endpoints**

**POST /riders** (Protected)
- Creates new rider application
- Required fields: name, email, phone, NID, license, region, district, bike brand, registration, about, photo
- Validates all 10 required fields
- Enforces email from JWT token
- Sets status to "Pending"
- Checks for duplicate applications (prevents multiple applications from same email)
- Records creation timestamp
- Returns application ID and status
- Photo is mandatory field

**GET /riders/:email** (Protected)
- Retrieves rider application status by email
- Verifies email matches JWT token
- Returns rider details: name, email, status, dates
- 403 Forbidden if email doesn't match
- 404 Not Found if rider doesn't exist

**GET /riders** (Protected)
- Retrieves all rider applications
- Returns all applications sorted by creation date (descending)
- Includes total count
- Used by admin dashboard

**PATCH /riders/:id** (Protected)
- Updates rider application status
- Accepts: status (Approved, Rejected, Pending)
- Validates status against allowed values
- Records update timestamp
- **Auto-updates user role to "rider" when status is Approved**
- Returns modification count and confirmation

### 5. **User Management Endpoints**

**POST /users** (Public)
- Creates or updates user on first login
- Accepts: email, displayName, photoURL, uid, role (default: "user")
- Checks if user exists
- If new: creates user with provided info and metadata
- If exists: updates displayName and photoURL
- Returns user ID and confirmation

**GET /user** (Protected)
- Retrieves current authenticated user profile
- Returns: email, displayName, photoURL, role, createdAt
- Uses email from JWT token

**PATCH /user** (Protected)
- Updates user profile information
- Accepts: displayName, photoURL, phone, address, preferences
- Enforces email immutability (cannot change email)
- Records last update timestamp
- **Automatically updates rider photo if user has pending rider application**
- Returns modification count and confirmation

**GET /users** (Protected - Admin)
- Retrieves all users in the system
- Returns user array with total count
- Includes all user details: email, displayName, photoURL, role, dates
- No filtering (admin can view all)

**PATCH /user/role** (Protected - Admin)
- Updates user role via admin interface
- Verifies email and user ID match before update
- Accepts: email, userId, role (user, admin, rider)
- Security: Matches JWT email with request email
- Validates both email and ID match in database
- Returns success with updated role details

**DELETE /user/:id** (Protected - Admin)
- Deletes user from system
- Validates user ID format
- Prevents self-deletion (security check)
- Returns deleted user email and confirmation
- Used by admin for user management

**POST /save-social-user** (Protected)
- Saves/updates social authentication user data
- Accepts: email, displayName, photoURL, uid, provider, providers array
- Creates user on first social login
- Updates user on subsequent social logins
- Adds provider to providers array (tracks multiple auth methods)
- Records login timestamp

### 6. **Utility Endpoints**

**POST /jwt** (Public)
- Issues JWT token on user login
- Sets httpOnly cookie with JWT
- Token expires in 24 hours
- Returns token confirmation

**POST /logout** (Public)
- Clears JWT token cookie
- Logs user out securely

**GET /health** (Public)
- Health check endpoint
- Verifies server is running
- Used for monitoring

**GET /debug/cookies** (Public)
- Debug endpoint for cookie inspection
- Returns all cookies sent with request
- Useful for troubleshooting auth issues

---

## DATABASE COLLECTIONS

### 1. **users Collection**
```javascript
{
  _id: ObjectId,
  email: String (unique),
  displayName: String,
  photoURL: String,
  uid: String (Firebase UID),
  role: String (user, rider, admin),
  phone: String,
  address: String,
  providers: Array (auth providers: [firebase, google, etc]),
  createdAt: Date,
  lastUpdated: Date,
  lastLogin: Date
}
```

### 2. **parcels Collection**
```javascript
{
  _id: ObjectId,
  senderName: String,
  senderEmail: String,
  senderPhone: String,
  recipientName: String,
  recipientEmail: String,
  recipientPhone: String,
  recipientAddress: String,
  weight: Number,
  dimensions: Object {length, width, height},
  description: String,
  parcelType: String,
  region: String,
  district: String,
  status: String (Pending, In Transit, Delivered),
  trackingId: String (unique),
  cost: Number,
  paymentStatus: String (Pending, Paid),
  specialInstructions: String,
  riderId: ObjectId (assigned rider),
  createdAt: Date,
  updatedAt: Date,
  deliveredAt: Date
}
```

### 3. **payments Collection**
```javascript
{
  _id: ObjectId,
  email: String,
  transactionId: String (Stripe Transaction ID),
  amount: Number,
  currency: String (default: USD),
  status: String (Completed, Failed, Pending),
  paymentMethod: String (card type),
  parcelId: ObjectId (linked parcel),
  parcelWeight: Number,
  parcelDescription: String,
  createdAt: Date,
  completedAt: Date
}
```

### 4. **riders Collection**
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique, from JWT),
  phoneNumber: String,
  uid: String (Firebase UID),
  nidNo: String,
  drivingLicense: String,
  region: String,
  district: String,
  bikeBrand: String (brand, model, year),
  bikeRegistration: String,
  photo: String (photo URL),
  aboutYourself: String (personal description),
  status: String (Pending, Approved, Rejected),
  createdAt: Date,
  updatedAt: Date
}
```

---

## AUTHENTICATION SYSTEM

### Frontend Authentication Flow
1. **User Registration:**
   - Firebase creates user account with email/password
   - User profile photo uploaded to imgbb
   - AuthContext stores user information
   - User object saved to users collection via POST /users

2. **User Login:**
   - Firebase authenticates credentials
   - JWT token generated and stored in httpOnly cookie
   - AuthContext updated with user info
   - User data fetched and stored

3. **Social Authentication (Google/Facebook):**
   - User signs in with social provider
   - Firebase handles OAuth flow
   - POST /save-social-user saves provider info
   - User role defaults to "user"

4. **Protected Routes:**
   - PrivateRoute component checks user authentication
   - Redirects unauthenticated users to /auth/login
   - Loading spinner shown during auth verification

### Backend Authentication Flow
1. **JWT Verification Middleware (verifyJWT):**
   - Extracts JWT from cookies or Authorization header
   - Verifies token using Firebase Admin SDK
   - Decodes user information (email, uid)
   - Attaches user to request object (req.user)
   - Returns 401 if token missing or invalid

2. **Email Verification:**
   - All protected endpoints verify email from JWT
   - Prevents users from modifying others' data
   - Enforces permission-based access control

---

## API ENDPOINTS

### Authentication Endpoints
| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | /jwt | Public | Generate JWT token |
| POST | /logout | Public | Clear auth cookie |
| GET | /health | Public | Health check |

### Parcel Endpoints
| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | /parcels | JWT | Create parcel |
| GET | /parcels | JWT | Get user's parcels |
| GET | /parcels/:id | Public | Get parcel details |
| PATCH | /parcels/:id | Public | Update parcel status |
| DELETE | /parcels/:id | JWT | Delete parcel |

### Payment Endpoints
| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | /create-payment-intent | JWT | Create Stripe intent |
| PATCH | /payment-success | JWT | Mark payment complete |
| GET | /payments | JWT | Get payment history |

### Rider Endpoints
| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | /riders | JWT | Submit rider application |
| GET | /riders | JWT | Get all applications |
| GET | /riders/:email | JWT | Get rider by email |
| PATCH | /riders/:id | JWT | Update rider status |

### User Endpoints
| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | /users | Public | Create/update user |
| GET | /user | JWT | Get current user |
| PATCH | /user | JWT | Update user profile |
| GET | /users | JWT | Get all users (Admin) |
| PATCH | /user/role | JWT | Change user role (Admin) |
| DELETE | /user/:id | JWT | Delete user (Admin) |
| POST | /save-social-user | JWT | Save social auth user |

---

## TECHNOLOGY STACK

### Frontend
- **React 18:** UI library with hooks
- **React Router v6:** Client-side routing
- **Tailwind CSS:** Styling framework
- **DaisyUI:** Component library on top of Tailwind
- **React Hook Form:** Form state management
- **Axios:** HTTP client for API calls
- **SweetAlert2:** Beautiful alerts and modals
- **Stripe.js:** Payment processing (client-side)
- **Firebase Auth:** Authentication
- **AOS (Animate On Scroll):** Scroll animations
- **Vite:** Build tool and dev server
- **React Query:** Server state management
- **React Hot Toast:** Toast notifications

### Backend
- **Express.js:** Web framework
- **Node.js:** JavaScript runtime
- **MongoDB:** NoSQL database
- **Stripe API:** Payment processing
- **Firebase Admin SDK:** Token verification
- **CORS:** Cross-origin resource sharing
- **Cookie Parser:** Cookie handling
- **Dotenv:** Environment variables

### External Services
- **Firebase:** Authentication and token management
- **Stripe:** Payment processing
- **imgbb:** Image hosting for profile photos
- **MongoDB Cloud:** Cloud database hosting

---

## FILE STRUCTURE

### Frontend Structure
```
frontend/src/
├── contexts/
│   ├── AuthContext/
│   │   ├── AuthContext.jsx
│   │   └── AuthProvider.jsx
│   └── ParcelContext.jsx
├── hooks/
│   ├── useAuth.jsx
│   ├── useAxiosSecure.jsx
│   ├── useImageUpload.jsx
│   ├── useLogout.jsx
│   └── useParcel.jsx
├── layouts/
│   ├── AuthLayout.jsx
│   ├── DashboardLayout.jsx
│   └── Rootlayout.jsx
├── pages/
│   ├── About/
│   ├── Authentication/
│   │   ├── Login/
│   │   └── Register/
│   ├── BeRider/
│   ├── Coverage/
│   ├── Dashboard/
│   │   ├── ApproveRiders/
│   │   │   ├── ApproveRiders.jsx
│   │   │   └── RiderDetailPage.jsx
│   │   ├── ManageUsers/
│   │   │   └── ManageUsers.jsx
│   │   ├── MyParcels/
│   │   ├── Payment/
│   │   ├── PaymentHistory/
│   ├── Home/
│   ├── Pricing/
│   ├── SendParcel/
│   └── ParcelConfirmation/
├── router/
│   └── router.jsx
├── routes/
│   └── PrivateRoute.jsx
├── utils/
│   ├── pricingCalculator.js
│   └── receiptGenerator.js
├── firebase/
│   └── firebase.init.js
├── data/
│   ├── coverage-data.js
│   └── districts.js
└── assets/
    ├── brands/
    ├── banner/
    └── warehouses.json
```

### Backend Structure
```
backend/
├── index.js (All API endpoints and middleware)
├── package.json
├── .env (Environment variables)
└── zep-shift-*-firebase-adminsdk-*.json (Firebase credentials)
```

---

## KEY FEATURES SUMMARY

### 1. **Complete Order Management**
- Create, view, edit, delete parcels
- Real-time status tracking
- Delivery confirmation

### 2. **Integrated Payment System**
- Stripe payment processing
- Multiple parcel payments
- Payment history tracking
- Transaction management

### 3. **Rider Management System**
- Rider application with profile photo
- Admin approval workflow
- Role assignment (user → rider)
- Photo auto-sync between user profile and rider application
- Automatic user role update on approval

### 4. **User Management (Admin)**
- View all users with stats
- Search and filter functionality
- Role management (promote to admin, demote from admin)
- User deletion
- Profile photo display
- Total user tracking

### 5. **Authentication & Security**
- Firebase authentication
- JWT token verification
- Role-based access control
- httpOnly cookie storage
- Email verification
- Social authentication support

### 6. **Responsive Design**
- Mobile-first approach
- Tailwind CSS responsive utilities
- Tablet and desktop optimization
- Drawer sidebar for mobile
- Touch-friendly interfaces

### 7. **Enhanced UX/UI**
- Smooth animations with AOS
- Beautiful alerts with SweetAlert2
- Gradient backgrounds
- Hover effects and transitions
- Loading states and spinners
- Toast notifications
- Professional color schemes

---

## WORKFLOW EXAMPLES

### User Sending a Parcel
1. User logs in → Dashboard
2. Click "Send Parcel"
3. Fill form with parcel details
4. Submit → Parcel created (status: Pending)
5. View in "My Parcels"
6. Click "Pay" → Payment page
7. Enter card details → Stripe processes
8. Success → Parcel status updates to "Paid"
9. View payment history

### Becoming a Rider
1. User logs in
2. Click "Be Rider"
3. Fill application form with profile photo
4. Submit → Application created (status: Pending)
5. Admin reviews in "Approve Riders"
6. Click rider → View details
7. Click "Approve" → Confirmation dialog
8. Rider status: Approved
9. User role automatically changes to "rider"
10. Rider photo updated if user updates profile

### Admin Managing Users
1. Admin logs in
2. Go to "Manage Users" dashboard
3. See all users with statistics
4. Search by name/email or filter by role
5. For admin users: Click "Remove Admin" to demote
6. For non-admin: Click "Make Admin" to promote
7. Click "Actions" for more options
8. View user profile or delete user
9. All changes reflected immediately

---

## FUTURE ENHANCEMENTS

Potential features for expansion:
- Real-time GPS tracking
- Notification system (SMS/Email)
- Analytics dashboard
- Ratings and reviews system
- Multiple language support
- Mobile app (React Native)
- Advanced scheduling
- Bulk parcel uploads
- Insurance options
- Dispute resolution system
- Custom reporting

---

## NOTES

- All user interactions are logged with timestamps
- Photos are hosted on imgbb for reliability
- Payment processing handled securely via Stripe
- Database is MongoDB with Atlas hosting
- Backend runs on Express.js with Node.js
- Frontend built with React and Vite
- Responsive design works on all screen sizes
- Authentication tokens expire after 24 hours
- Cookies are secured with httpOnly flag

---

*Last Updated: May 5, 2026*
