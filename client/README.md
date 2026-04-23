# Shri Mahalaxmi Mobile - Frontend

A modern React + Vite frontend for the Shri Mahalaxmi Mobile ecommerce platform. This client-side application provides a responsive shopping experience, secure authentication, and a comprehensive admin dashboard for managing products, orders, and store operations.

## Frontend Overview

The frontend is a single-page application (SPA) built with React 18 and Vite, designed for performance and maintainability. It communicates with a Node.js/Express backend API, uses Redux Toolkit for state management, and implements advanced caching strategies to minimize API calls and improve user experience.

### Key Characteristics

- **Framework**: React 18 with Vite for fast development and optimized production builds
- **State Management**: Redux Toolkit for centralized app state and API data
- **Styling**: Tailwind CSS with PostCSS for utility-first design
- **Routing**: React Router DOM for client-side navigation
- **API Communication**: Centralized Axios instance with interceptors and error handling
- **Internationalization**: i18next for multi-language support (English, Hindi, Marathi)
- **Performance**: Code splitting, lazy loading, image optimization, and client-side caching

---

## Frontend Architecture

### 1. Directory Structure

```
client/src/
├── api/                           # API communication layer
│   ├── axiosInstance.js           # Centralized Axios with interceptors
│   └── README.md                  # API documentation
├── components/                    # Reusable UI components
│   ├── admin-view/                # Admin dashboard components
│   │   ├── header.jsx             # Admin header/navigation
│   │   ├── sidebar.jsx            # Admin sidebar menu
│   │   ├── layout.jsx             # Admin layout wrapper
│   │   ├── image-upload.jsx       # Product image upload
│   │   ├── product-tile.jsx       # Admin product card
│   │   ├── orders.jsx             # Admin orders management
│   │   └── order-details.jsx      # Order detail view
│   ├── auth/                      # Authentication components
│   │   ├── layout.jsx             # Auth page layout
│   │   ├── ForgotPasswordForm.jsx # Forgot password form
│   │   ├── OTPVerificationForm.jsx # OTP verification
│   │   └── PasswordResetForm.jsx  # Password reset form
│   ├── shopping-view/             # Customer shopping components
│   │   ├── header.jsx             # Shop header/navbar
│   │   ├── layout.jsx             # Shop layout wrapper
│   │   ├── filter.jsx             # Product filters
│   │   ├── product-details.jsx    # Product detail page
│   │   ├── product-tile.jsx       # Product card component
│   │   ├── ProductCard.jsx        # Enhanced product card
│   │   ├── cart-wrapper.jsx       # Cart container
│   │   ├── cart-items-content.jsx # Cart items list
│   │   ├── address.jsx            # Address management
│   │   ├── address-card.jsx       # Address display card
│   │   ├── orders.jsx             # Customer orders view
│   │   ├── order-details.jsx      # Order detail view
│   │   └── OrderTracking.jsx      # Order tracking status
│   ├── common/                    # Shared components
│   │   ├── check-auth.jsx         # Auth check wrapper
│   │   ├── with-auth.jsx          # Auth HOC component
│   │   ├── NavigationHandler.jsx  # Global navigation handler
│   │   ├── LanguageSwitcher.jsx   # Language switcher
│   │   ├── scrollToTop.jsx        # Scroll to top component
│   │   ├── form.jsx               # Reusable form component
│   │   ├── star-rating.jsx        # Star rating display
│   │   └── SEO.jsx                # SEO/Meta tag component
│   └── ui/                        # Radix UI based components
│       ├── avatar.jsx             # User avatar
│       ├── badge.jsx              # Badge component
│       ├── button.jsx             # Button variants
│       ├── card.jsx               # Card container
│       ├── dialog.jsx             # Modal dialog
│       ├── input.jsx              # Form input
│       ├── dropdown-menu.jsx      # Dropdown menu
│       ├── select.jsx             # Select dropdown
│       ├── tabs.jsx               # Tab navigation
│       ├── table.jsx              # Data table
│       ├── OptimizedImage.jsx     # Performance-optimized image
│       ├── OfferCarousel.jsx      # Promotional carousel
│       ├── PremiumCarousel.jsx    # Premium product carousel
│       ├── CustomerTestimonials.jsx # Testimonials section
│       ├── OwnerSocialPresence.jsx  # Social media links
│       ├── SocialUpdates.jsx      # Social updates section
│       ├── Footer.jsx             # Footer component
│       ├── loading-spinner.jsx    # Loading indicator
│       ├── toast.jsx              # Toast notifications
│       ├── Swatch.jsx             # Product swatch/variant selector
│       └── use-toast.js           # Toast hook utility
├── config/                        # Configuration files
│   └── index.js                   # App configuration
├── hooks/                         # Custom React hooks
│   ├── useBackNavigation.js       # Custom back navigation
│   ├── useDynamicTranslation.js   # Lazy translation loading
│   ├── useSmartFetch.js           # Smart data fetching
│   └── useSmartFetchFixed.js      # Fixed smart fetch
├── i18n/                          # Internationalization
│   ├── i18n.js                    # i18next configuration
│   ├── en.json                    # English translations
│   ├── hi.json                    # Hindi translations
│   └── mr.json                    # Marathi translations
├── lib/                           # Utility functions
│   └── utils.js                   # Common utilities
├── pages/                         # Page-level components
│   ├── admin-view/                # Admin pages
│   │   ├── dashboard.jsx          # Admin dashboard
│   │   ├── products.jsx           # Product management
│   │   ├── orders.jsx             # Order management
│   │   └── carousel.jsx           # Carousel management
│   ├── auth/                      # Authentication pages
│   │   ├── login.jsx              # Login page
│   │   ├── register.jsx           # Registration page
│   │   └── forgot-password.jsx    # Forgot password page
│   ├── shopping-view/             # Customer pages
│   │   ├── home.jsx               # Home page
│   │   ├── listing.jsx            # Product listing
│   │   ├── product-details.jsx    # Product detail
│   │   ├── cart.jsx               # Shopping cart
│   │   ├── checkout.jsx           # Checkout page
│   │   └── orders.jsx             # Order history
│   ├── static/                    # Static pages
│   │   ├── about.jsx              # About page
│   │   └── contact.jsx            # Contact page
│   └── unauth-page/               # Unauthorized page
├── services/                      # Service utilities
│   ├── imageOptimizationService.js # Image optimization
│   ├── testimonialService.js      # Testimonials API
│   └── translationService.js      # Translation helpers
├── store/                         # Redux state management
│   ├── store.js                   # Redux store configuration
│   ├── admin/                     # Admin slices
│   │   ├── carousel-slice/        # Carousel state
│   │   ├── products-slice/        # Admin products state
│   │   └── order-slice/           # Admin orders state
│   ├── shop/                      # Shop slices
│   │   ├── products-slice/        # Shop products state
│   │   ├── carousel-slice/        # Shop carousel state
│   │   ├── cart-slice/            # Shopping cart state
│   │   ├── order-slice/           # Customer orders state
│   │   ├── address-slice/         # Addresses state
│   │   ├── review-slice/          # Reviews state
│   │   └── search-slice/          # Search state
│   ├── auth-slice/                # Authentication state
│   ├── common-slice/              # Common state
│   └── forget-password/           # Password reset state
├── utils/                         # Utility functions
│   └── cacheUtils.js              # Caching helpers
├── App.jsx                        # Main app component
├── App.css                        # App styles
├── main.jsx                       # React entry point
└── index.css                      # Global styles
```

### 2. Component Architecture

#### Feature-Based Organization

Components are organized by feature domain (auth, shopping-view, admin-view) rather than by component type. Each feature has:

- **Views**: Full-page components (`pages/`)
- **Components**: Reusable parts of views (`components/<feature>/`)
- **State Management**: Redux slices in `store/<feature>/`

#### UI Component Library

Reusable UI components (`components/ui/`) are built on top of Radix UI primitives and styled with Tailwind CSS. This ensures consistency and maintainability across the app.

### 3. State Management (Redux Toolkit)

```javascript
// Example store structure
store.js configures slices:
- admin.carousel-slice          // Admin carousel page state
- admin.products-slice          // Admin products management
- admin.order-slice             // Admin order management
- shop.products-slice           // Customer product browsing
- shop.cart-slice               // Shopping cart
- shop.order-slice              // Customer orders
- auth                          // User authentication
- common                        // Application-wide settings
- forgetPassword                // Password reset flow
```

Each slice handles:
- Initial state definition
- Reducers for synchronous state updates
- Async thunks for API calls
- Cache metadata and timestamps

### 4. API Communication

All API requests go through a **centralized Axios instance** (`client/src/api/axiosInstance.js`):

```javascript
// Request interceptor:
- Attaches Authorization header with JWT token
- Sets content type and credentials

// Response interceptor:
- Handles 401 errors (invalid tokens) with auto-logout
- Handles 403 errors (forbidden access)
- Logs validation errors (422)
- Shows rate limit warnings (429)
- Global error toasts for user feedback
```

### 5. Caching Strategy

#### Multi-Layer Caching

1. **Redux Store Cache**: In-memory cache of API data with TTL
2. **localStorage Cache**: Persistent cache for critical data
3. **Browser Cache**: HTTP caching via headers from backend

#### Cache Utilities

`client/src/utils/cacheUtils.js` provides:

```javascript
localCache.set(key, data, type)       // Save with TTL
localCache.get(key, type)              // Retrieve with validation
localCache.isExpired(key, type)        // Check expiration
localCache.clear(key)                  // Manual cleanup
```

TTL Examples:
- Products list: 15 minutes
- Product details: 10 minutes
- Featured products: 30 minutes
- Carousel: 1 hour

---

## Setup & Installation

### Prerequisites

- **Node.js**: v16.0 or higher (LTS recommended)
- **npm**: v8.0 or higher (or use yarn)
- **Backend Server**: Running on `http://localhost:5000`
- **Environment Variables**: `.env` file configured

### Step 1: Install Dependencies

```bash
cd client
npm install
```

This installs all packages listed in `package.json` including React, Vite, Redux Toolkit, Tailwind CSS, and other dependencies.

### Step 2: Environment Configuration

Create a `.env.local` file in the `client/` directory:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:5000
VITE_API_TIMEOUT=10000

# Feature Flags
VITE_ENABLE_API_LOGGING=true
VITE_ENABLE_PERFORMANCE_TRACKING=false

# Cloudinary (for image preview in forms, optional)
VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_name

# Analytics (optional)
VITE_ANALYTICS_ID=your_analytics_id
```

### Step 3: Start Development Server

```bash
npm run dev
```

This starts the Vite development server at `http://localhost:5173` with:
- Hot Module Replacement (HMR) for instant code updates
- Built-in ESLint checking
- Development debugging tools

### Step 4: Access the Application

- **Frontend**: http://localhost:5173
- **Admin Dashboard**: http://localhost:5173/admin/dashboard
- **Shop Home**: http://localhost:5173/
- **Login**: http://localhost:5173/auth/login

---

## Development Workflow

### Available Scripts

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Run ESLint to check code quality
npm run lint
```

### Hot Module Replacement (HMR)

Vite provides automatic hot module replacement during development. When you save a file:

1. Vite detects the change
2. Only the affected module is reloaded
3. Component state is preserved (when possible)
4. Browser automatically reflects changes

### Debugging

#### Browser DevTools

1. Open DevTools (F12 or Cmd+Opt+I)
2. Use **React Developer Tools** extension for component inspection
3. Use **Redux DevTools** for state debugging
4. Check Console for API logs and errors

#### Redux DevTools

Install the Redux DevTools browser extension to:
- Time-travel through state changes
- Dispatch actions manually
- View action payload and diff
- Export/import state for debugging

#### Network Inspection

1. Open DevTools > Network tab
2. Check API calls to `/api/*`
3. Verify request headers (Authorization, Content-Type)
4. Compare request/response payloads

---

## Building for Production

### Production Build

```bash
npm run build
```

This creates an optimized production build in `dist/` directory:

- **JavaScript**: Minified and code-split into chunks
- **CSS**: Purged of unused styles via Tailwind
- **Images**: Optimized by Cloudinary
- **Assets**: Hash-based cache busting

### Build Output

The `dist/` folder contains:

```
dist/
├── index.html           # Entry HTML file
├── assets/
│   ├── index.js         # Main JavaScript bundle
│   ├── vendor.js        # Third-party dependencies
│   ├── react-vendor.js  # React and related libs
│   ├── style.css        # Global styles
│   └── images/          # Optimized images
└── ...
```

### Performance Metrics

The build includes these optimizations:

- **Code Splitting**: Routes split into separate chunks, loaded on-demand
- **Vendor Splitting**: Separate bundles for react, redux, ui libraries
- **Lazy Loading**: Routes and components loaded asynchronously
- **Tree Shaking**: Unused code removed during minification
- **CSS Purging**: Unused Tailwind classes removed
- **Image Optimization**: Images hosted on Cloudinary with auto optimization

### Deployment

To deploy the production build:

1. Build the app: `npm run build`
2. Upload `dist/` folder to your hosting service
3. Configure server to serve `index.html` for all routes (SPA fallback)
4. Example Nginx configuration:

```nginx
location / {
  try_files $uri $uri/ /index.html;
  # Caching headers
  add_header Cache-Control "public, max-age=3600";
}

location ~/assets/.*\.js$ {
  # Long cache for versioned JS files
  add_header Cache-Control "public, max-age=31536000, immutable";
}
```

---

## Feature Deep Dives

### Authentication Flow

1. User enters email/phone and password on login page
2. Frontend makes `POST /api/auth/login` request
3. Backend validates credentials and sets `httpOnly` cookies
4. Axios interceptor confirms auth with `GET /api/auth/check-auth`
5. User data stored in Redux `auth-slice`
6. Redirect to previous page or home

### Forgot Password Flow

1. User clicks "Forgot Password" on login page
2. Enters email/phone, requests OTP via form
3. Verifies 6-digit OTP from email
4. Sets new password with reset token
5. Returns to login page

### Shopping Cart

- Add/remove items: Update `cart-slice` in Redux
- Persist cart: Saved in localStorage for recovery
- Checkout: Cart sent to backend as order data
- Backend validates stock and processes payment

### Caching Example: Product Details

```javascript
// On product detail page load:
1. Check Redux store for cached product
2. Check if cache is still valid (not expired)
3. If valid, display cached product
4. If expired, fetch fresh from API
5. Update Redux store with new TTL timestamp
6. Display fetched product
```

---

## Common Issues & Troubleshooting

### Issue: API calls returning 404

**Solution**: Ensure backend is running on port 5000:

```bash
# Terminal 1: Backend
cd server
npm run dev
```

### Issue: CORS errors in browser console

**Solution**: Verify `.env.local` has correct `VITE_API_BASE_URL`:

```env
VITE_API_BASE_URL=http://localhost:5000  # Correct
```

### Issue: Hot reload not working

**Solution**: Restart Vite dev server:

```bash
npm run dev
```

### Issue: Redux state not updating

**Solution**: Check Redux DevTools extension:

1. Install Redux DevTools browser extension
2. Open DevTools > Redux tab
3. Verify actions are dispatched
4. Check action payload for errors

### Issue: Images not loading from Cloudinary

**Solution**: Verify Cloudinary configuration and check network tab for 404 errors.

---

## Performance Optimization Tips

### Component Optimization

- Use `React.memo()` for expensive components
- Implement `useCallback` for event handlers
- Use `useMemo` for expensive calculations

### State Management

- Keep Redux state flat and normalized
- Use selectors to avoid unnecessary re-renders
- Split large slices into smaller ones

### Code Splitting

- Routes are already lazy-loaded
- Consider splitting large components at logical boundaries
- Monitor bundle size: `npm run preview`

### Image Optimization

- Use `<OptimizedImage />` component for all product images
- Store images on Cloudinary (automatic optimization)
- Use WebP format via fallback
- Add loading placeholders (`skeleton.jsx`)

---

## Internationalization (i18n)

### Supported Languages

- English (en)
- Hindi (hi)
- Marathi (mr)

### Using Translations

```javascript
// In components:
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t, i18n } = useTranslation();
  
  return <h1>{t('welcome_message')}</h1>;
}
```

### Adding New Translations

1. Edit translation JSON files in `client/src/i18n/`
2. Add new key-value pairs
3. Use in components with `t('key_name')`

---

## Related Resources

- **Main README**: See `README.md` for full project architecture
- **Backend Setup**: See `server/` directory for backend configuration
- **Tailwind CSS**: https://tailwindcss.com/docs
- **React Router**: https://reactrouter.com/
- **Redux Toolkit**: https://redux-toolkit.js.org/
- **Vite**: https://vitejs.dev/
- **React**: https://react.dev/
