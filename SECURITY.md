# ZEP-SHIFT SECURITY DOCUMENTATION

**Project:** ZEP-Shift MERN Delivery Application  
**Document:** Public User Experience & Security Architecture  
**Last Updated:** May 5, 2026  
**Status:** Production Ready

---

## TABLE OF CONTENTS

1. [Security Overview](#security-overview)
2. [Authentication Architecture](#authentication-architecture)
3. [Authorization System](#authorization-system)
4. [Public vs Private Routes](#public-vs-private-routes)
5. [Frontend Security Implementation](#frontend-security-implementation)
6. [Backend Security Implementation](#backend-security-implementation)
7. [API Endpoint Security Matrix](#api-endpoint-security-matrix)
8. [Cookie & CORS Configuration](#cookie--cors-configuration)
9. [Security Best Practices](#security-best-practices)
10. [Common Attack Prevention](#common-attack-prevention)
11. [Troubleshooting & Logs](#troubleshooting--logs)

---

## SECURITY OVERVIEW

### Key Principles

✅ **Defense in Depth:** Multiple layers of security (frontend, backend, middleware)  
✅ **Never Trust Client:** All validation done on backend  
✅ **Principle of Least Privilege:** Users only access what they need  
✅ **Role-Based Access Control (RBAC):** Three roles (user, rider, admin)  
✅ **Token-Based Authentication:** JWT with Firebase integration  
✅ **Secure Cookie Storage:** httpOnly, secure, sameSite flags  

### User Roles & Permissions

| Role | Permissions | Access |
|------|-------------|--------|
| **Public** | View public pages | Home, Pricing, Coverage, About, Services, Auth pages |
| **User** | Send parcels, make payments, become rider | Dashboard, Send Parcel, Payment, Be Rider |
| **Rider** | Track deliveries, manage orders | Dashboard + Rider-specific features |
| **Admin** | Approve riders, manage users, system oversight | Everything + Admin dashboards |

---

## AUTHENTICATION ARCHITECTURE

### 1. Firebase Authentication

**Frontend (React):**
```
User Registration/Login → Firebase Auth → Firebase ID Token
```

**Features:**
- Email/password authentication
- Social authentication (Google, Facebook, etc.)
- Email verification requirement
- Token refresh on expiry

**File Location:** `frontend/src/contexts/AuthContext/AuthProvider.jsx`

### 2. JWT Token Flow

```
                    ┌─────────────────┐
                    │  Firebase Auth  │
                    └────────┬────────┘
                             │ (Firebase ID Token)
                             ↓
                    ┌─────────────────┐
                    │  AuthProvider   │ (React)
                    └────────┬────────┘
                             │ (sendTokenToBackend)
                             ↓
                    ┌─────────────────┐
                    │  POST /jwt      │
                    │  (Backend)      │
                    └────────┬────────┘
                             │ (httpOnly Cookie Set)
                             ↓
                    ┌─────────────────┐
                    │  Browser Cookie │
                    │  (token)        │
                    └─────────────────┘
```

### 3. Token Lifecycle

**Creation:**
1. User logs in via Firebase
2. Firebase Admin SDK verifies credentials
3. Firebase ID token issued
4. Token sent to `POST /jwt` endpoint
5. Backend stores in httpOnly cookie

**Verification:**
1. Every protected request includes token
2. Token extracted from cookie or Authorization header
3. Firebase Admin SDK verifies signature
4. User info attached to request object
5. Middleware passes to route handler

**Expiration:**
- Token expires after 24 hours
- Browser cookie also expires at 24 hours
- User must re-authenticate after expiry
- Refresh token flow handled by Firebase

---

## AUTHORIZATION SYSTEM

### Role-Based Access Control

**Three Middleware Layers:**

```javascript
// Layer 1: JWT Verification
verifyJWT → Extract & verify token, attach user to request

// Layer 2: Admin Verification (applied when needed)
verifyAdmin → Check user.role === 'admin' in database

// Layer 3: Route Guards (Frontend)
PrivateRoute → Redirect unauthenticated to /auth/login
```

### Authorization Flow

```
Request → verifyJWT (401 if no token)
         → verifyAdmin (403 if not admin)
         → Email validation (403 if doesn't match)
         → Resource access (200 if allowed)
```

---

## PUBLIC VS PRIVATE ROUTES

### Public Pages (No Authentication Required)

✅ **Accessible to Everyone:**

| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | Home | Landing page, services overview |
| `/about` | About | Company information |
| `/pricing` | Pricing | Service pricing display |
| `/coverage` | Coverage | Delivery coverage areas |
| `/service` | Services | Service details |
| `/auth/login` | Login | User login form |
| `/auth/register` | Register | User registration form |
| `/401` | Unauthorized | Auth required error page |
| `/403` | Forbidden | Permission denied error page |
| `/404` | NotFound | Page not found error page |

**Public API Endpoints:**

```
POST   /jwt              Generate JWT token
POST   /logout           Clear auth cookie
GET    /health           Health check
GET    /parcels/:id      Track parcel (public tracking)
PATCH  /parcels/:id      Update parcel status
POST   /users            Create user on first login
POST   /save-social-user Save social auth user
```

### Protected Routes (Authentication Required)

🔐 **Require JWT Token:**

| Route | Component | Role Required | Purpose |
|-------|-----------|---|---------|
| `/send-parcel` | SendParcel | User | Send new parcel |
| `/parcel-confirmation` | ParcelConfirmation | User | Confirm parcel |
| `/be-rider` | BeRider | User | Apply as rider |
| `/dashboard/*` | Dashboard | User | User dashboard |
| `/dashboard/ApproveRiders` | ApproveRiders | Admin | Approve riders |
| `/dashboard/ManageUsers` | ManageUsers | Admin | Manage users |

**Protected API Endpoints:**

```
// All endpoints below require: verifyJWT middleware

// Parcel endpoints
GET    /parcels          Get user's parcels
POST   /parcels          Create parcel
DELETE /parcels/:id      Delete parcel

// Payment endpoints
POST   /create-payment-intent  Create payment
PATCH  /payment-success        Mark payment done
GET    /payments               Get payment history

// Rider endpoints
POST   /riders           Submit rider application
GET    /riders/:email    Get rider status by email

// Admin-only endpoints (require: verifyJWT + verifyAdmin)
GET    /riders           Get all riders (Admin)
PATCH  /riders/:id       Approve/reject rider (Admin)
GET    /users            Get all users (Admin)
PATCH  /user/role        Update user role (Admin)
DELETE /user/:id         Delete user (Admin)

// User endpoints
GET    /user             Get user profile
PATCH  /user             Update user profile
```

---

## FRONTEND SECURITY IMPLEMENTATION

### 1. PrivateRoute Component

**Location:** `frontend/src/routes/PrivateRoute.jsx`

**Features:**
- Checks user authentication state
- Shows loading spinner while verifying
- Preserves intended route in `location.state`
- Redirects to `/auth/login` if not authenticated
- Supports post-login redirect to intended destination

**Code Example:**
```jsx
const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();
    
    if (loading) return <LoadingSpinner />;
    if (!user) return <Navigate to="/auth/login" state={{ from: location }} />;
    
    return children;
};
```

### 2. Navbar Role-Based Display

**Location:** `frontend/src/pages/Home/shared/Navbar/Navbar.jsx`

**Features:**
- Public users: Show Home, Services, Pricing, Coverage, Login, Sign Up
- Authenticated users: + Send Parcel, Be Rider, My Parcels
- Admins: + Approve Riders, Manage Users admin panels
- Shows user role badge (👤 User, 🏍️ Rider, 👑 Admin)

**Conditional Logic:**
```jsx
// Public navigation (all users can see)
const publicNavItems = <>...</>;

// User navigation (authenticated users)
const userNavItems = <>...publicNavItems...userFeatures...</>;

// Admin navigation (admin users)
const adminNavItems = <>...userNavItems...adminFeatures...</>;

// Select based on role
const navItems = user ? 
  (user.role === 'admin' ? adminNavItems : userNavItems) : 
  publicNavItems;
```

### 3. AuthContext Error Handling

**Location:** `frontend/src/contexts/AuthContext/AuthProvider.jsx`

**Features:**
- Tracks authentication errors
- Email verification requirement enforcement
- Token refresh mechanism
- Social authentication support
- Secure token transmission to backend

**Key Methods:**
- `createUser()` - Register new user
- `signIn()` - Login user
- `logOut()` - Logout and clear token
- `updateUserProfilePhoto()` - Update photo
- `resendVerificationEmail()` - Resend verification

### 4. useAxiosSecure Hook

**Purpose:** Automatically includes JWT in API requests

**Features:**
- Adds Authorization header
- Includes credentials (httpOnly cookie)
- Handles 401 responses (token refresh)
- Logs all requests in development

**Usage:**
```jsx
const { axiosSecure } = useAxiosSecure();
const { data } = await axiosSecure.get('/protected-route');
```

### 5. Error Pages

**401 Unauthorized:** `/frontend/src/pages/Unauthorized/Unauthorized.jsx`
- Displayed when accessing protected route without auth
- Offers Sign In and Sign Up buttons
- Shows helpful message

**403 Forbidden:** `/frontend/src/pages/Forbidden/Forbidden.jsx`
- Displayed when lacking permission
- Offers return options
- Shows helpful message

---

## BACKEND SECURITY IMPLEMENTATION

### 1. JWT Verification Middleware

**Location:** `backend/index.js` (lines ~130-150)

**Features:**
- Extracts token from cookies (priority) or Authorization header
- Verifies using Firebase Admin SDK
- Logs all verification attempts
- Returns 401 if token missing or invalid

**Code Flow:**
```javascript
const verifyJWT = async (req, res, next) => {
    // Extract token from cookies or header
    const token = req.cookies.token || authHeader?.split(' ')[1];
    
    if (!token) return res.status(401).send('No token');
    
    try {
        const decodedUser = await admin.auth().verifyIdToken(token);
        req.user = decodedUser; // Attach to request
        next();
    } catch (error) {
        return res.status(401).send('Invalid token');
    }
};
```

### 2. Admin Verification Middleware

**Location:** `backend/index.js` (lines ~150-185)

**Features:**
- Requires verifyJWT to run first
- Checks user.role in database
- Returns 403 if not admin
- Logs admin access attempts

**Code Flow:**
```javascript
const verifyAdmin = async (req, res, next) => {
    if (!req.user?.email) return res.status(401).send('No user');
    
    const user = await usersCollection.findOne({ email: req.user.email });
    
    if (user?.role !== 'admin') {
        return res.status(403).send('Admin access required');
    }
    
    next();
};
```

### 3. Endpoint Protection

**Middleware Application:**

```javascript
// Public endpoint (no middleware)
app.get('/health', (req, res) => {...});

// Protected endpoint (JWT only)
app.post('/parcels', verifyJWT, async (req, res) => {...});

// Admin endpoint (JWT + Admin)
app.get('/users', verifyJWT, verifyAdmin, async (req, res) => {...});
```

### 4. Cookie Security Configuration

**JWT Endpoint:** `POST /jwt`

```javascript
res.cookie('token', token, {
    httpOnly: true,           // JavaScript cannot access
    secure: process.env.NODE_ENV === 'production',  // HTTPS only in prod
    sameSite: 'lax',          // CSRF protection
    maxAge: 24 * 60 * 60 * 1000  // 24 hour expiration
});
```

### 5. CORS Configuration

**Location:** `backend/index.js` (lines ~28-32)

```javascript
app.use(cors({
    origin: process.env.SITE_DOMAIN || 'http://localhost:5173',
    credentials: true  // Allow cookies
}));
```

**Security:**
- Whitelist only trusted origins
- Enable credentials for cookie transmission
- Prevent cross-site requests

---

## API ENDPOINT SECURITY MATRIX

### Authentication Endpoints

| Method | Endpoint | Auth | Public | Purpose |
|--------|----------|------|--------|---------|
| POST | /jwt | - | ✅ | Generate JWT token |
| POST | /logout | - | ✅ | Clear auth cookie |
| GET | /health | - | ✅ | Health check |

### Parcel Endpoints

| Method | Endpoint | verifyJWT | verifyAdmin | Email Check |
|--------|----------|-----------|------------|-------------|
| GET | /parcels | ✅ | - | ✅ |
| POST | /parcels | ✅ | - | ✅ |
| DELETE | /parcels/:id | ✅ | - | ✅ |
| GET | /parcels/:id | - | - | - |
| PATCH | /parcels/:id | - | - | - |

### Payment Endpoints

| Method | Endpoint | verifyJWT | verifyAdmin | Email Check |
|--------|----------|-----------|------------|-------------|
| POST | /create-payment-intent | ✅ | - | ✅ |
| PATCH | /payment-success | ✅ | - | ✅ |
| GET | /payments | ✅ | - | ✅ |

### Rider Endpoints

| Method | Endpoint | verifyJWT | verifyAdmin | Email Check |
|--------|----------|-----------|------------|-------------|
| POST | /riders | ✅ | - | ✅ |
| GET | /riders/:email | ✅ | - | ✅ |
| GET | /riders | ✅ | ✅ | - |
| PATCH | /riders/:id | ✅ | ✅ | - |

### User Endpoints

| Method | Endpoint | verifyJWT | verifyAdmin | Email Check |
|--------|----------|-----------|------------|-------------|
| POST | /users | - | - | - |
| GET | /user | ✅ | - | ✅ |
| PATCH | /user | ✅ | - | ✅ |
| GET | /users | ✅ | ✅ | - |
| PATCH | /user/role | ✅ | ✅ | ✅ |
| DELETE | /user/:id | ✅ | ✅ | ✅ |
| POST | /save-social-user | ✅ | - | ✅ |

---

## COOKIE & CORS CONFIGURATION

### Cookie Security Flags

**httpOnly:** 
- Prevents JavaScript access to cookie
- Protection against XSS attacks
- Backend can still read from request

**Secure:** 
- Only transmitted over HTTPS
- Prevents man-in-the-middle attacks
- Enabled in production only

**SameSite:** 
- Options: Strict, Lax, None
- Current: Lax
- Protects against CSRF attacks
- Allows top-level navigation

**MaxAge:** 
- Token valid for 24 hours
- Forces re-authentication after expiry
- Can be refreshed on demand

### CORS Policy

**Allowed Origins:**
- Production: Configured via `SITE_DOMAIN` env var
- Development: `http://localhost:5173`

**Credentials:** 
- Enabled to allow cookie transmission
- Preflight requests handled automatically
- Credentials sent in all cross-origin requests

---

## SECURITY BEST PRACTICES

### ✅ DO's

1. **Always verify on backend** - Never trust frontend auth state
2. **Use httpOnly cookies** - Store tokens securely
3. **Check JWT on every protected request** - Don't rely on single verification
4. **Validate all inputs** - Even if validated on frontend
5. **Check user role for admin routes** - Prevent privilege escalation
6. **Log security events** - Track auth attempts and failures
7. **Use HTTPS in production** - Encrypt all data in transit
8. **Refresh tokens regularly** - Reduce token hijacking window
9. **Show loading states** - Prevent duplicate submissions
10. **Handle errors gracefully** - Don't expose sensitive info

### ❌ DON'Ts

1. **Don't trust user.role from JWT alone** - Always verify in database
2. **Don't store tokens in localStorage** - Use httpOnly cookies
3. **Don't expose error details** - Use generic error messages
4. **Don't allow direct role changes** - Only admins can update roles
5. **Don't skip email verification** - Verify before granting access
6. **Don't allow self-demotion** - Prevent admin from removing own admin status
7. **Don't accept tokens without HTTPS** - In production, always use secure connections
8. **Don't log sensitive data** - Never log passwords or full tokens
9. **Don't allow CORS from all origins** - Whitelist specific domains
10. **Don't mix public and private data** - Separate by endpoint design

---

## COMMON ATTACK PREVENTION

### 1. Cross-Site Scripting (XSS)

**Attack:** Inject malicious JavaScript to steal tokens

**Prevention:**
- httpOnly cookies cannot be accessed by JavaScript
- Input sanitization on backend
- React's built-in XSS protection
- Content Security Policy headers

### 2. Cross-Site Request Forgery (CSRF)

**Attack:** Trick user into making unintended requests

**Prevention:**
- SameSite cookie attribute set to 'lax'
- JWT verification on backend
- CORS whitelist configuration
- Credentials not sent unless explicitly allowed

### 3. Privilege Escalation

**Attack:** Change role directly in JWT or database

**Prevention:**
- Admin verification middleware checks database, not JWT
- Only admins can call role-change endpoint
- Prevents self-demotion (admin cannot change own role to user)
- Logging of all role changes

### 4. Token Hijacking

**Attack:** Steal token and impersonate user

**Prevention:**
- httpOnly cookies prevent JavaScript theft
- Token expires after 24 hours
- HTTPS encryption in production
- Token tied to Firebase UID
- Logout clears cookie immediately

### 5. Unauthorized Access

**Attack:** Access protected resources without auth

**Prevention:**
- verifyJWT middleware on all protected routes
- 401 errors for missing/invalid tokens
- PrivateRoute guards on frontend
- Email validation ensures user owns data

### 6. Admin Bypass

**Attack:** Directly call admin-only endpoints

**Prevention:**
- verifyAdmin middleware checks user.role in database
- Not based on JWT claims (which client could modify)
- 403 Forbidden for non-admin users
- All admin endpoints protected

---

## TROUBLESHOOTING & LOGS

### Common Issues

#### Issue: "Unauthorized: No token provided"
**Cause:** Browser not sending httpOnly cookie

**Solution:**
1. Check `withCredentials: true` in axios config
2. Verify CORS `credentials: true` in backend
3. Check cookie domain and path settings
4. Ensure HTTPS in production

#### Issue: "Forbidden: Admin access required"
**Cause:** User is not admin in database

**Solution:**
1. Verify user role in database collection
2. Check if role was properly set during registration
3. Admin should be set only by another admin
4. Check admin middleware is applied

#### Issue: User redirected to login after every page refresh
**Cause:** Auth state not persisting

**Solution:**
1. Verify Firebase config is correct
2. Check `onAuthStateChanged` is running
3. Ensure token is sent to `/jwt` endpoint
4. Check httpOnly cookie is being set

#### Issue: "Token verification failed"
**Cause:** Invalid or expired token

**Solution:**
1. Token expires after 24 hours - user needs to login again
2. Check Firebase Admin SDK is initialized
3. Verify `FIREBASE_CONFIG` env variables are set
4. Clear browser cookies and try again

### Logging & Monitoring

**Backend Logs Format:**

```
🔐 [JWT Verify] Token found in cookie for /parcels
✅ [JWT Verify] Token verified for user: user@example.com
🔴 [JWT Verify] Token verification failed: Unauthorized
✅ [Admin Verify] Admin access granted for: admin@example.com
🔴 [Admin Verify] Access denied - user role: user
```

**Log Levels:**
- `✅` - Success (green)
- `🟢` - Info (info messages)
- `🔴` - Error (critical issues)
- `⚠️` - Warning (non-critical)
- `📝` - Note (debug info)

### Debug Endpoint

**GET /debug/cookies** - Returns all cookies sent with request

```bash
curl http://localhost:3000/debug/cookies --include --cookie "token=yourtoken"
```

---

## DEPLOYMENT CHECKLIST

- [ ] Set `NODE_ENV=production` in .env
- [ ] Enable `secure: true` for cookies (HTTPS only)
- [ ] Set `SITE_DOMAIN` to production domain
- [ ] Update CORS origin to production URL
- [ ] Configure MongoDB Atlas IP whitelist
- [ ] Set Firebase production config
- [ ] Enable HTTPS on frontend and backend
- [ ] Set strong environment variable values
- [ ] Test login/logout flow on production
- [ ] Test admin functions work correctly
- [ ] Monitor server logs for errors
- [ ] Test PrivateRoute redirects work
- [ ] Verify 401/403 error pages display
- [ ] Check cookies are httpOnly in production

---

## MAINTENANCE & UPDATES

### Regular Security Tasks

**Daily:**
- Monitor error logs for suspicious activity
- Check admin role changes
- Verify no unauthorized access attempts

**Weekly:**
- Review failed login attempts
- Audit new admin assignments
- Check for security updates

**Monthly:**
- Test authentication flow end-to-end
- Verify CORS policy still correct
- Update dependencies for security patches
- Review and rotate security credentials

---

## SUMMARY

ZEP-Shift implements a **multi-layered security architecture** that:

✅ **Protects Public Users:** Clear separation between public and private pages  
✅ **Secures Authentication:** JWT tokens with Firebase integration  
✅ **Enforces Authorization:** Role-based access control with database verification  
✅ **Prevents Attacks:** XSS, CSRF, token hijacking protections  
✅ **Logs Security Events:** Detailed logging for audit trails  
✅ **Follows Best Practices:** Industry-standard security patterns  

This document should be reviewed regularly and updated as security threats evolve.

---

*For questions or security concerns, contact the development team immediately.*

