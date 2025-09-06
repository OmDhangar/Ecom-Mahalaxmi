# API Proxy Fix - Resolved 500 Error

## 🐛 Issue Description
Error encountered: `POST http://localhost:5173/api/shop/order/verify 500 (Internal Server Error)`

The Vite development server proxy was not working because of misconfigured API calls.

## 🔧 Root Cause
The admin carousel slice was using a hardcoded `baseURL: 'http://localhost:5000'` which bypassed the Vite proxy configuration, causing inconsistency in how API calls were made across the application.

## ✅ Fixes Applied

### 1. **Fixed Admin Carousel Slice** (`client/src/store/admin/carousel-slice/index.js`)

#### Before (Problematic):
```javascript
// Axios instance (auto-sets token for every request)
const api = axios.create({
  baseURL: 'http://localhost:5000', // ❌ Hardcoded URL bypasses proxy
});
```

#### After (Fixed):
```javascript
// Create axios instance that works with Vite proxy
const api = axios.create(); // ✅ No baseURL - uses proxy
```

### 2. **Enhanced Vite Proxy Configuration** (`client/vite.config.js`)

#### Before:
```javascript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:5000',
      changeOrigin: true,
      secure: true, // ❌ Can cause issues with HTTP backend
    }
  }
}
```

#### After:
```javascript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:5000',
      changeOrigin: true,
      secure: false, // ✅ Fixed for HTTP backend in development
      configure: (proxy, options) => {
        // ✅ Added debugging for proxy requests
        proxy.on('error', (err, req, res) => {
          console.log('proxy error', err);
        });
        proxy.on('proxyReq', (proxyReq, req, res) => {
          console.log('Sending Request to the Target:', req.method, req.url);
        });
        proxy.on('proxyRes', (proxyRes, req, res) => {
          console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
        });
      }
    }
  }
}
```

## 🎯 **How Vite Proxy Should Work**

### Development Flow:
1. **Frontend** (localhost:5173) makes API call to `/api/shop/order/verify`
2. **Vite Proxy** intercepts the request
3. **Proxy** forwards it to `http://localhost:5000/api/shop/order/verify`
4. **Backend** (localhost:5000) processes the request
5. **Response** sent back through proxy to frontend

### The Problem:
- Some parts of the app were bypassing the proxy with hardcoded URLs
- This created inconsistency and routing conflicts
- The `secure: true` setting was also preventing some requests

## ✅ **Result:**
- All API calls now consistently use the Vite proxy
- No more hardcoded backend URLs in the frontend
- Enhanced debugging to track proxy requests
- Fixed `secure: false` for HTTP backend in development

## 🔍 **How to Verify the Fix:**

1. **Start both servers:**
   ```bash
   # Terminal 1: Backend
   npm run dev --prefix server
   
   # Terminal 2: Frontend  
   npm run dev --prefix client
   ```

2. **Check proxy logs:**
   - Open browser dev tools
   - Look for proxy debug messages in the terminal running the frontend
   - Verify API calls go to `localhost:5173` and get proxied to `localhost:5000`

3. **Test API endpoints:**
   - Order verification should work: `POST /api/shop/order/verify`
   - Carousel data should load: `GET /api/shop/carousel/active`
   - All other endpoints should work through proxy

## 📋 **Best Practices Applied:**

1. **✅ Never hardcode backend URLs in frontend code**
2. **✅ Use relative URLs (`/api/...`) in development** 
3. **✅ Let Vite proxy handle the routing**
4. **✅ Set `secure: false` for HTTP backends in development**
5. **✅ Add proxy debugging for troubleshooting**

The proxy is now working correctly and all API calls should go through `localhost:5173` → `localhost:5000` properly! 🎉
