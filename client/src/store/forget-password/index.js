import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isLoading: false,
  otpSent: false,
  otpVerified: false,
  resetToken: null,
  userEmail: null,
};

// Send OTP for password reset
export const sendPasswordResetOTP = createAsyncThunk(
  "auth/sendPasswordResetOTP",
  async (formData) => {
    const response = await axios.post(
      "/api/auth/forgot-password",
      formData,
      {
        withCredentials: true,
      }
    );
    return response.data;
  }
);

// Verify OTP
export const verifyPasswordResetOTP = createAsyncThunk(
  "auth/verifyPasswordResetOTP",
  async (formData) => {
    const response = await axios.post(
      "/api/auth/verify-otp",
      formData,
      {
        withCredentials: true,
      }
    );
    return response.data;
  }
);

// Reset password
export const resetUserPassword = createAsyncThunk(
  "auth/resetUserPassword",
  async (formData) => {
    const response = await axios.post(
      "/api/auth/reset-password",
      formData,
      {
        withCredentials: true,
      }
    );
    return response.data;
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
    }
  },
  extraReducers: (builder) => {
    builder
      // Send OTP
      .addCase(sendPasswordResetOTP.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(sendPasswordResetOTP.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.success) {
          state.otpSent = true;
          state.userEmail = action.payload.email;
        }
      })
      .addCase(sendPasswordResetOTP.rejected, (state) => {
        state.isLoading = false;
        state.otpSent = false;
      })
      
      // Verify OTP
      .addCase(verifyPasswordResetOTP.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(verifyPasswordResetOTP.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.success) {
          state.otpVerified = true;
          state.resetToken = action.payload.resetToken;
        }
      })
      .addCase(verifyPasswordResetOTP.rejected, (state) => {
        state.isLoading = false;
        state.otpVerified = false;
      })
      
      // Reset Password
      .addCase(resetUserPassword.pending, (state) => {
        state.isLoading = true;
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
      .addCase(resetUserPassword.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export const { resetForgotPasswordState, clearResetToken } = forgotPasswordSlice.actions;

export default forgotPasswordSlice.reducer;