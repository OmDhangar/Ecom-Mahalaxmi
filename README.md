# Shri Mahalaxmi Mobile

## Project Overview

**Shri Mahalaxmi Mobile** is a MERN ecommerce platform built to support a mobile and accessories storefront with admin management, shopping experience, order processing, and operational performance improvements. The application is structured as a React + Vite frontend and an Express + MongoDB backend, with a focus on secure cookie-based authentication, efficient API handling, and responsive shopping flows.


---

## Architecture Summary

### 1. Technology Stack

- Frontend: React 18, Vite, Tailwind CSS, React Router DOM, Redux Toolkit
- Backend: Node.js, Express, MongoDB via Mongoose
- Authentication: JWT + httpOnly cookies
- File Uploads: Cloudinary + Multer
- Caching: Node in-memory cache + client-side caching utilities
- Performance: Gzip compression, cache headers, code splitting, optimized image handling
- Internationalization: i18next

### 2. System Layers

- **Client**: `client/src`
  - Componentized UI across auth, shopping-view, admin-view, common, and UI utilities
  - Global state and caching using Redux Toolkit slices
  - Centralized API access from `client/src/api/axiosInstance.js`

- **Server**: `server`
  - Express entrypoint: `server/server.js`
  - Route grouping by functional domain: `auth`, `admin`, `shop`, `common`, `Google`
  - Controller business logic under `server/controllers`
  - Models under `server/models`
  - Helpers for Cloudinary, email, PayPal, and sitemap generation
  - Middleware and services for caching and stock-awareness

---

## Frontend Design

### 1. Core Frontend Modules

- `client/src/App.jsx`: Main route configuration, lazy loading, route wrappers, and layout integration
- `client/src/store/store.js`: Redux store configuration and slice integration
- `client/src/api/axiosInstance.js`: Centralized Axios instance with interceptors and error handling
- `client/src/utils/cacheUtils.js`: Shared caching helpers for localStorage persistence and TTL validation
- `client/src/i18n/i18n.js`: Internationalization setup for English, Hindi, Marathi

### 2. Key UI Patterns

- **Reusable components** in `client/src/components/ui` for avatar, badge, button, card, dialog, input, toast, etc.
- **Shop-specific views** in `client/src/components/shopping-view` and `client/src/pages/shopping-view`
- **Admin-dashboard UI** in `client/src/components/admin-view` and `client/src/pages/admin-view`
- **Auth flow** using dedicated forms and pages in `client/src/components/auth` and `client/src/pages/auth`
- **Navigation support** via `client/src/hooks/useBackNavigation.js` and `client/src/components/common/NavigationHandler.jsx`

### 3. Important Frontend Features

- Centralized API usage and environment configuration to avoid hardcoded URLs
- Vite proxy usage for `/api` in development while keeping production API configuration separate
- Lazy-loaded routes and manual chunking to reduce initial bundle size
- Responsive image support with optimized image-handling components
- Cookie-based authentication flow and secure token management

---

## Backend Design

### 1. Main Server Setup

- `server/server.js` configures:
  - Express app and JSON parsing
  - CORS policy with credentials support
  - cookie-parser for secure cookie authentication
  - Gzip compression for text assets
  - Static file caching strategy for HTML, JS/CSS, images, and fonts
  - API route mounting for auth, shop, admin, shipping, common feature, and sitemap endpoints

### 2. Routing and Controllers

- `server/routes/auth/auth-routes.js` → authentication and password reset
- `server/routes/admin/*` → product, carousel, and order administration
- `server/routes/shop/*` → product listing, cart, address, order, search, review, shipping calculations
- `server/routes/common/feature-routes.js` → shared feature data
- `server/routes/Google/sitemap-routes.js` → sitemap generation endpoint

### 3. Data Models

- `User`, `UserSecurityFields`, `Product`, `Cart`, `Order`, `Address`, `Review`, `Carousel`, `Feature`
- Models support ecommerce domains such as inventory, reviews, orders, shipping, and site features

### 4. Middleware and Services

- `server/middleware/stockChangeMiddleware.js`: Tracks inventory changes and invalidates caches when stock or order state changes
- `server/services/cacheService.js`: In-memory cache for faster API responses and reduced DB load
- `server/services/stockAwareCacheService.js`: Separates static and dynamic product fields to prevent overselling

---

## Authentication & Security

### Cookie-Based Authentication

- Secure `httpOnly` tokens are issued by the backend and automatically sent by the browser
- Token refresh flow is handled server-side, avoiding token persistence in localStorage
- Login/logout and auth checks rely on `/api/auth` endpoints and cookies with `SameSite` controls

### Forgot Password Flow

Implemented as a secure 3-step process:

1. User submits email/phone via `POST /api/auth/forgot-password`
2. User verifies OTP via `POST /api/auth/verify-otp`
3. User resets password via `POST /api/auth/reset-password`

### API Error Handling

- Centralized Axios error handling for network, 401, 403, 404, 422, 429, and 5xx responses
- Global interceptor based logout and token cleanup for invalid authentication

---

## Caching & Performance Strategy

### 1. Server Performance

- `compression` middleware for Gzip/Brotli-style compression at level 6
- Static asset headers in `server/server.js`:
  - HTML: 5-minute cache
  - JS/CSS: 1 year immutable
  - Images: 30 days
  - Fonts: 1 year immutable
- Express static asset serving with ETag and Last-Modified support

### 2. Caching Architecture

- In-memory server cache via `server/services/cacheService.js`
- Stock-aware caching via `server/services/stockAwareCacheService.js`
- Cache invalidation on inventory and order state changes
- Client-side cache helpers in `client/src/utils/cacheUtils.js` for localStorage persistence and TTL logic

### 3. Stock-Aware Cache Design

Static data can be cached safely:
- product title, description, images, brand, metadata

Dynamic data is always fresh:
- price, stock, availability, variants, totalSold, discounts

This prevents stale stock displays and overselling while still enabling cached list views for static product attributes.

### 4. Frontend Optimization

- `client/src/components/ui/OptimizedImage.jsx` for efficient image rendering and fallback handling
- Removed heavy image transformation logic for simpler, faster loading
- Added critical image loading hints for LCP improvement
- Lazy-loaded routes in `client/src/App.jsx` to reduce initial payload
- Vite build optimization with chunk splitting and vendor separation

---

## Key User Flows

### Shopping Experience

- Home and listing pages with featured products and carousel offers
- Product detail page with add-to-cart, reviews, and stock awareness
- Cart flow with quantity management and secure checkout
- Address management and shipping calculation
- Order placement and tracking

### Admin Experience

- Admin product management and carousel configuration
- Image upload integration for products and offers
- Order review and fulfillment workflows
- Secure admin-only endpoints under `/api/admin`

### Navigation & Usability

- Custom back-navigation hook in `client/src/hooks/useBackNavigation.js`
- `NavigationHandler` wrapper for browser/phone back button integration
- Consistent route conventions and safe fallback routes

---

## Setup & Installation Guide

### Prerequisites

- **Node.js**: v16.0 or higher (LTS recommended)
- **npm**: v8.0 or higher
- **MongoDB**: Local or Atlas cloud instance
- **Cloudinary Account**: For image hosting
- **Git**: For version control
- **Postman** (optional): For API testing

Check your Node version:

```bash
node --version
npm --version
```

### Project Structure Setup

1. Clone or navigate to the project directory:

```bash
cd d:\Projects\Ecom-Mahalaxmi
```

The project contains two main directories:
- `client/` - React + Vite frontend
- `server/` - Express + MongoDB backend

---

## Backend Setup

### Step 1: Install Backend Dependencies

```bash
cd server
npm install
```

This installs packages including:
- Express (web framework)
- Mongoose (MongoDB ODM)
- JWT & bcryptjs (authentication)
- Cloudinary & Multer (file uploads)
- nodemailer (email service)
- node-cache (in-memory caching)

### Step 2: Configure Environment Variables

Create a `.env` file in the `server/` directory:

```env
# BASIC CONFIG
PORT=5000
NODE_ENV=development

# DATABASE
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net

# JWT AUTHENTICATION
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long
JWT_EXPIRE=7d

# CLOUDINARY (Image Hosting)
CLOUDINARY_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# EMAIL SERVICE (Gmail or other SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_specific_password
ADMIN_EMAIL=admin@shrimahalaxmimobile.in

# PAYMENT GATEWAY (Razorpay)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# EXTERNAL APIS
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_secret

# FRONTEND URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

#### Environment Variables Explanation

| Variable | Purpose | Example |
|----------|---------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/ecommerce` |
| `JWT_SECRET` | Secret key for signing JWTs | Generate with: `openssl rand -base64 32` |
| `CLOUDINARY_*` | Image hosting credentials | Get from Cloudinary dashboard |
| `SMTP_*` | Email service configuration | Gmail requires app-specific password |
| `RAZORPAY_*` | Payment processing API | Get from Razorpay merchant account |

### Step 3: Set Up MongoDB

#### Option A: MongoDB Atlas (Cloud)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account and cluster
3. Add your IP to whitelist
4. Create database user with username and password
5. Get connection string: `mongodb+srv://user:password@cluster.mongodb.net/ecommerce`

#### Option B: Local MongoDB

1. Install MongoDB Community Edition
2. Start MongoDB service:

```bash
# Windows
net start MongoDB

# macOS (with Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

3. Connection string: `mongodb://localhost:27017/ecommerce`

### Step 4: Test Backend Connection

```bash
cd server
npm run dev
```

You should see:

```
MongoDB connected
Server is now running on port 5000
```

### Backend API Testing

Test the backend with curl or Postman:

```bash
# Health check
GET http://localhost:5000/

# Check carousel (public endpoint)
GET http://localhost:5000/api/shop/carousel/active

# Check auth status (should fail if not logged in)
GET http://localhost:5000/api/auth/check-auth
```

---

## Frontend Setup

### Step 1: Install Frontend Dependencies

```bash
cd client
npm install
```

This installs packages including:
- React 18 (UI library)
- Vite (build tool)
- Tailwind CSS (styling)
- Redux Toolkit (state management)
- React Router (navigation)
- Axios (HTTP client)
- i18next (translations)

### Step 2: Configure Environment Variables

Create a `.env.local` file in the `client/` directory:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:5000
VITE_API_TIMEOUT=10000

# Feature Flags
VITE_ENABLE_API_LOGGING=true
VITE_ENABLE_PERFORMANCE_TRACKING=false

# Cloudinary (optional, for image upload preview)
VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_name

# Analytics (optional)
VITE_ANALYTICS_ID=your_analytics_id

# App Settings
VITE_APP_NAME=Shri Mahalaxmi Mobile
VITE_APP_VERSION=1.0.0
```

### Step 3: Start Development Server

```bash
npm run dev
```

You should see:

```
  VITE v5.4.19  ready in 456 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h + enter to show help
```

### Step 4: Access Frontend

Open browser and navigate to:

- **Home**: http://localhost:5173/
- **Shop**: http://localhost:5173/listing
- **Login**: http://localhost:5173/auth/login
- **Admin**: http://localhost:5173/admin/dashboard

---

## Running Both Frontend and Backend

### Terminal Setup (Recommended)

Open TWO terminal windows:

**Terminal 1 - Backend:**

```bash
cd d:\Projects\Ecom-Mahalaxmi\server
npm run dev
```

Wait for message: `Server is now running on port 5000`

**Terminal 2 - Frontend:**

```bash
cd d:\Projects\Ecom-Mahalaxmi\client
npm run dev
```

Wait for message: `Local: http://localhost:5173/`

### Testing the Connection

1. Open http://localhost:5173 in browser
2. Check browser console (F12) for errors
3. Try logging in with test credentials
4. Verify API calls appear in Network tab

### Using npm-run-all (Single Terminal)

Alternatively, run both servers from root with single command:

```bash
# Install npm-run-all globally
npm install -g npm-run-all

# From project root, create package.json:
{
  "scripts": {
    "dev": "npm-run-all --parallel dev:server dev:client",
    "dev:server": "npm --prefix server run dev",
    "dev:client": "npm --prefix client run dev",
    "build": "npm --prefix server run build && npm --prefix client run build"
  }
}

# Then run:
npm run dev
```

---

## Building for Production

### Frontend Production Build

```bash
cd client
npm run build
```

Creates optimized build in `client/dist/` directory with:
- Minified JavaScript
- Optimized CSS
- Code splitting by route
- Hash-based cache busting

### Backend Production Setup

```bash
cd server
npm install --production  # Install only production dependencies
npm start                 # Start production server
```

### Deployment to Hosting

#### Option 1: Vercel (Frontend)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy frontend
cd client
vercel
```

#### Option 2: Render or Heroku (Backend)

1. Create account on Render.com or Heroku
2. Connect GitHub repository
3. Set environment variables in dashboard
4. Deploy from branch (auto-deploys on push)

#### Option 3: Self-Hosted Server

```bash
# Build frontend
cd client && npm run build

# Copy dist/ to web server
scp -r dist/ user@your-server:/var/www/shrimahalaxmimobile/

# Build and start backend
cd server && npm run dev
```

---

## Troubleshooting

### Issue: `Error: Cannot find module 'express'`

**Solution**: Install dependencies:

```bash
cd server
npm install
```

### Issue: `MongooseError: Cannot connect to MongoDB at mongodb+srv://...`

**Solution**: Check `.env` file:
- Verify `MONGO_URI` is correct
- Ensure IP whitelist includes your machine
- Check database user credentials

### Issue: `CORS error: Access-Control-Allow-Origin`

**Solution**: Verify frontend `.env`:

```bash
VITE_API_BASE_URL=http://localhost:5000
```

And backend is running on port 5000.

### Issue: `Port 5000 already in use`

**Solution**: Kill process on port 5000:

```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :5000
kill -9 <PID>
```

### Issue: `npm run dev` fails with permission error

**Solution**: Clear npm cache:

```bash
npm cache clean --force
npm install
npm run dev
```

### Issue: Images not loading on page

**Solution**: Check Cloudinary credentials in `.env` and verify images are uploaded to Cloudinary.

---

## Development Commands

### Frontend Commands

```bash
npm run dev       # Start development server on port 5173
npm run build     # Build for production
npm run preview   # Preview production build locally
npm run lint      # Check code with ESLint
```

### Backend Commands

```bash
npm run dev       # Start with nodemon (auto-restart on changes)
npm start         # Start production server
npm run test      # Run tests (if configured)
```

---

## Database Seed Data (Optional)

To populate the database with sample products:

```bash
cd server
node scripts/seed-data.js  # If seed script exists
```

Or manually insert sample data via MongoDB Compass or Atlas UI.

---

## API Documentation

### Authentication Endpoints

```
POST   /api/auth/register         - User registration
POST   /api/auth/login            - User login (sets cookies)
POST   /api/auth/logout           - User logout (clears cookies)
POST   /api/auth/forgot-password  - Request password reset
POST   /api/auth/verify-otp       - Verify OTP
POST   /api/auth/reset-password   - Reset password
GET    /api/auth/check-auth       - Verify current session
```

### Shop Endpoints

```
GET    /api/shop/products         - Get all products (with filters)
GET    /api/shop/products/:id     - Get product details
GET    /api/shop/carousel/active  - Get active carousel offers
POST   /api/shop/cart/add         - Add to cart
GET    /api/shop/cart             - Get cart contents
POST   /api/shop/order/place      - Place order
GET    /api/shop/order/:id        - Get order details
```

### Admin Endpoints

```
POST   /api/admin/products        - Create product
PUT    /api/admin/products/:id    - Update product
DELETE /api/admin/products/:id    - Delete product
GET    /api/admin/orders          - Get all orders
PUT    /api/admin/orders/:id      - Update order status
```

Full API documentation available in `server/routes/` directory.

---

## Interview-Focused Engineering Notes

### Design Decisions

- Chose a **centralized Axios instance** to eliminate request duplication, standardize error handling, and support env-driven base URLs.
- Kept **cookie-based auth** for safer token storage and stronger XSS resistance.
- Used a **stock-aware cache** to preserve performance without risking inventory accuracy.
- Adopted **React + Vite** for fast development iteration and build performance.
- Applied a **service/controller** separation on the backend for clearer domain boundaries.

### Tradeoffs

- In-memory server caching is simple and fast, but not distributed; it is ideal for a single-instance deployment and can later be replaced by Redis when scaling.
- Using browser cookies and `withCredentials` adds complexity to CORS but increases security compared to localStorage tokens.
- Image optimization was simplified to reduce implementation risk and improve reliability at the expense of more advanced transform logic.

### Areas for Future Improvement

- Add integration tests for auth, cart, and checkout flows
- Introduce Redis or distributed cache for multi-instance scaling
- Add server-side rendering or pre-rendering for SEO-critical pages
- Formalize role-based access control for admin and operator roles

---
## Conclusion
This MERN ecommerce application demonstrates a comprehensive approach to building a performant, secure, and user-friendly online store. The architecture supports both customer-facing shopping experiences and robust admin management, with thoughtful design decisions around authentication, caching, and performance optimization.

