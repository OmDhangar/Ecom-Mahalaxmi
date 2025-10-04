import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from '../../api/axiosInstance';

const initialState = {
  isLoading: false,
  otpSent: false,
  otpVerified: false,
  resetToken: null,
  userEmail: null,
  maskedEmail: null,
  error: null,
};

// Send OTP for password reset
export const sendPasswordResetOTP = createAsyncThunk(
  "auth/sendPasswordResetOTP",
  async (formData, { rejectWithValue }) => {
    try {
      // Validate input
      if (!formData.emailOrPhone || !formData.emailOrPhone.trim()) {
        throw new Error('Please provide an email or phone number');
      }

      const response = await api.post("/api/auth/forgot-password", {
        emailOrPhone: formData.emailOrPhone.trim()
      });
      
      // Check if the response indicates failure
      if (!response.data.success) {
        return rejectWithValue(response.data.message);
      }
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Verify OTP
export const verifyPasswordResetOTP = createAsyncThunk(
  "auth/verifyPasswordResetOTP",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/auth/verify-otp", {
        emailOrPhone: formData.emailOrPhone,
        otp: formData.otp
      });
      
      // Check if the response indicates failure
      if (!response.data.success) {
        return rejectWithValue(response.data.message);
      }
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Reset password
export const resetUserPassword = createAsyncThunk(
  "auth/resetUserPassword",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/auth/reset-password", {
        resetToken: formData.resetToken,
        newPassword: formData.newPassword
      });
      
      // Check if the response indicates failure
      if (!response.data.success) {
        return rejectWithValue(response.data.message);
      }
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const forgotPasswordSlice = createSlice({
  name: "forgotPassword",
  initialState,
  reducers: {
    resetForgotPasswordState: (state) => {
      state.isLoading = false;
      state.otpSent = false;
      state.otpVerified = false;
      state.resetToken = null;
      state.userEmail = null;
    },
    clearResetToken: (state) => {
      state.resetToken = null;
      state.otpVerified = false;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Send OTP
      .addCase(sendPasswordResetOTP.pending, (state) => {
        state.isLoading = true;
        state.error = null; // Clear previous errors
      })
      .addCase(sendPasswordResetOTP.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        if (action.payload.success) {
          state.otpSent = true;
          state.maskedEmail = action.payload.email;
        }
      })
      .addCase(sendPasswordResetOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.otpSent = false;
        state.error = action.payload;
      })
      
      // Verify OTP
      .addCase(verifyPasswordResetOTP.pending, (state) => {
        state.isLoading = true;
        state.error = null; // Clear previous errors
      })
      .addCase(verifyPasswordResetOTP.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.success) {
          state.otpVerified = true;
          state.resetToken = action.payload.resetToken;
        }
      })
      .addCase(verifyPasswordResetOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.otpVerified = false;
        state.error = action.payload;
      })
      
      // Reset Password
      .addCase(resetUserPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null; // Clear previous errors
      })
      .addCase(resetUserPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.success) {
          state.otpSent = false;
          state.otpVerified = false;
          state.resetToken = null;
          state.userEmail = null;
        }
      })
      .addCase(resetUserPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { resetForgotPasswordState, clearResetToken, clearError } = forgotPasswordSlice.actions;

export default forgotPasswordSlice.reducer;