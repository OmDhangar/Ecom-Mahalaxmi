import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/axiosInstance";

const initialState = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
};

// Refactored async thunks using centralized Axios instance
export const registerUser = createAsyncThunk(
  "/auth/register",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/auth/register", formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const loginUser = createAsyncThunk(
  "/auth/login",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/auth/login", formData);
      
      // Store token and user data in localStorage for persistence
      if (response.data.success && response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  "/auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/auth/logout", {});
      
      // Clear local storage on successful logout
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      return response.data;
    } catch (error) {
      // Even if server logout fails, clear local data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return rejectWithValue(error.message);
    }
  }
);

export const checkAuth = createAsyncThunk(
  "/auth/checkauth",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/auth/check-auth", {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      });
      
      // Update user data in localStorage if auth check is successful
      if (response.data.success && response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      // Clear invalid auth data on failed check
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return rejectWithValue(error.message);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    clearAuth: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.success ? action.payload.user : null;
        state.isAuthenticated = action.payload.success;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(checkAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.success ? action.payload.user : null;
        state.isAuthenticated = action.payload.success;
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(logoutUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      });
  },
});

export const { setUser, clearAuth } = authSlice.actions;
export default authSlice.reducer;
