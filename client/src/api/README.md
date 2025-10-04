# Centralized Axios Instance Documentation

## Overview

This centralized Axios instance provides a unified way to handle all API requests across the React + Redux Toolkit application. It includes automatic token management, global error handling, and consistent request/response interceptors.

## Features

- ✅ **Automatic JWT Token Attachment**: Automatically adds `Authorization: Bearer <token>` header to all requests
- ✅ **Global Error Handling**: Handles 401, 403, 404, 5xx errors consistently across the app
- ✅ **Automatic Token Cleanup**: Clears invalid tokens and redirects to login on 401 errors
- ✅ **Network Error Handling**: Provides user-friendly messages for network issues
- ✅ **Toast Notifications**: Integrates with toast libraries for user feedback
- ✅ **Environment Configuration**: Uses environment variables for different deployment environments
- ✅ **Request/Response Logging**: Built-in logging for debugging (disable in production)

## Setup

### 1. Install Dependencies

```bash
npm install react-toastify
```

### 2. Environment Configuration

Create a `.env.local` file in your project root:

```env
VITE_API_BASE_URL=https://yoursiteurl
VITE_API_TIMEOUT=10000
VITE_ENABLE_API_LOGGING=true
```

### 3. Initialize Toast Notifications

In your main `App.js` or `App.tsx`:

```javascript
import React, { useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import { initializeToastNotifications, toastConfig } from './utils/toastConfig';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  useEffect(() => {
    // Initialize toast notifications for global error handling
    initializeToastNotifications();
  }, []);

  return (
    <div className="App">
      {/* Your app content */}
      
      {/* Toast container for notifications */}
      <ToastContainer {...toastConfig} />
    </div>
  );
}

export default App;
```

## Usage in Redux Slices

### Before (Repetitive Axios Setup)

```javascript
import axios from 'axios';

// Repeated in every slice
const api = axios.create({
  baseURL: "https://api.shrimahalaxmimobile.in",
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const fetchData = createAsyncThunk(
  'slice/fetchData',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/api/data');
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);
```

### After (Centralized Instance)

```javascript
import api from '../../api/axiosInstance';

export const fetchData = createAsyncThunk(
  'slice/fetchData',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/api/data');
      return data.data;
    } catch (error) {
      // Error handling is now done globally by interceptors
      return rejectWithValue(error.message);
    }
  }
);
```

## Usage in Components

You can also use the centralized instance directly in components:

```javascript
import React, { useState, useEffect } from 'react';
import api from '../api/axiosInstance';

const MyComponent = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await api.get('/api/some-endpoint');
        setData(response.data);
      } catch (error) {
        // Error is already handled by interceptors
        console.error('Failed to fetch data:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      {loading ? 'Loading...' : JSON.stringify(data)}
    </div>
  );
};
```

## Error Handling

The centralized instance handles various error scenarios:

### 401 Unauthorized
- Automatically clears invalid token from localStorage
- Shows "Session expired" toast notification
- Redirects to `/auth/login` page

### 403 Forbidden
- Shows "Access denied" toast notification
- Logs the error for debugging

### 404 Not Found
- Logs the error (no user notification by default)

### 422 Validation Error
- Logs validation errors for debugging

### 429 Too Many Requests
- Shows "Too many requests" toast notification

### 5xx Server Errors
- Shows "Server error" toast notification
- Logs detailed error information

### Network Errors
- Shows "Network error" toast notification
- Handles timeout and connection issues

## Helper Functions

The instance exports several helper functions:

```javascript
import api, { 
  clearAuthData, 
  isAuthenticated, 
  getCurrentUser 
} from '../api/axiosInstance';

// Check if user is authenticated
if (isAuthenticated()) {
  console.log('User is logged in');
}

// Get current user data
const user = getCurrentUser();
console.log('Current user:', user);

// Manually clear auth data (useful for logout)
clearAuthData();
```

## Migration Guide

To migrate existing Redux slices:

1. **Remove local Axios instances**: Delete the local `axios.create()` calls and interceptors
2. **Import centralized instance**: Add `import api from '../../api/axiosInstance';`
3. **Simplify error handling**: Remove complex error handling logic, use `rejectWithValue(error.message)`
4. **Update async thunks**: Use the imported `api` instance instead of local axios

### Example Migration

**Before:**
```javascript
import axios from 'axios';

const api = axios.create({ /* config */ });
api.interceptors.request.use(/* interceptor */);

export const fetchData = createAsyncThunk(
  'slice/fetchData',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/api/data');
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);
```

**After:**
```javascript
import api from '../../api/axiosInstance';

export const fetchData = createAsyncThunk(
  'slice/fetchData',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/api/data');
      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
```

## Best Practices

1. **Always use the centralized instance**: Never create local Axios instances
2. **Let interceptors handle errors**: Don't duplicate error handling logic in thunks
3. **Use environment variables**: Configure different base URLs for different environments
4. **Enable logging in development**: Use `VITE_ENABLE_API_LOGGING=true` for debugging
5. **Disable logging in production**: Set `VITE_ENABLE_API_LOGGING=false` in production
6. **Handle loading states**: Use Redux loading states for UI feedback
7. **Test error scenarios**: Ensure your app handles network errors gracefully

## Extending the Instance

To add new features like refresh token logic:

```javascript
// In axiosInstance.js
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Add to response interceptor
if (status === 401 && !originalRequest._retry) {
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    }).then(token => {
      originalRequest.headers.Authorization = `Bearer ${token}`;
      return api(originalRequest);
    }).catch(err => {
      return Promise.reject(err);
    });
  }

  originalRequest._retry = true;
  isRefreshing = true;

  return new Promise((resolve, reject) => {
    // Implement refresh token logic here
    refreshToken()
      .then(({ token }) => {
        localStorage.setItem('token', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        originalRequest.headers.Authorization = `Bearer ${token}`;
        processQueue(null, token);
        resolve(api(originalRequest));
      })
      .catch((err) => {
        processQueue(err, null);
        clearAuthData();
        window.location.href = '/auth/login';
        reject(err);
      })
      .finally(() => {
        isRefreshing = false;
      });
  });
}
```
