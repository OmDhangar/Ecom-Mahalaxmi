// store/shop/order-slice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  approvalURL: null,
  isLoading: false,
  orderId: null,
  orderList: [],
  orderDetails: null,
  razorpayOrder: null,
  trackingInfo: null,
};

// Create new order (supports both COD and Razorpay)
export const createNewOrder = createAsyncThunk(
  "order/createNewOrder",
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/shop/order/create",
        orderData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create order"
      );
    }
  }
);

// Verify Razorpay payment
export const verifyPayment = createAsyncThunk(
  "order/verifyPayment",
  async (paymentData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/shop/order/verify-payment",
        paymentData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Payment verification failed"
      );
    }
  }
);

// Get all orders for a user
export const getAllOrdersByUserId = createAsyncThunk(
  "order/getAllOrdersByUserId",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/shop/order/list/${userId}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch orders"
      );
    }
  }
);

// Get order details
export const getOrderDetails = createAsyncThunk(
  "order/getOrderDetails",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/shop/order/details/${id}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch order details"
      );
    }
  }
);

// Track order (new function for Shiprocket integration)
export const trackOrder = createAsyncThunk(
  "order/trackOrder",
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/shop/order/track/${orderId}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to track order"
      );
    }
  }
);

// Cancel order (new function)
export const cancelOrder = createAsyncThunk(
  "order/cancelOrder",
  async ({ orderId, reason }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/shop/order/update-status/${orderId}`,
        { 
          orderStatus: "cancelled",
          cancellationReason: reason 
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to cancel order"
      );
    }
  }
);

const shoppingOrderSlice = createSlice({
  name: "shoppingOrderSlice",
  initialState,
  reducers: {
    resetOrderDetails: (state) => {
      state.orderDetails = null;
    },
    resetRazorpayOrder: (state) => {
      state.razorpayOrder = null;
    },
    resetTrackingInfo: (state) => {
      state.trackingInfo = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create New Order
      .addCase(createNewOrder.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createNewOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.success) {
          state.approvalURL = action.payload.approvalURL;
          state.orderId = action.payload.orderId;
          
          // Handle different payment methods
          if (action.payload.paymentMethod === 'cod') {
            // For COD orders, store the order details
            state.orderDetails = action.payload.order;
          } else if (action.payload.razorpayOrderId) {
            // For Razorpay orders, store the razorpay data
            state.razorpayOrder = action.payload;
          }
        }
      })
      .addCase(createNewOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.approvalURL = null;
        state.orderId = null;
      })
      
      // Verify Payment
      .addCase(verifyPayment.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(verifyPayment.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.success) {
          state.orderDetails = action.payload.data;
          state.razorpayOrder = null; // Clear razorpay order after successful verification
        }
      })
      .addCase(verifyPayment.rejected, (state) => {
        state.isLoading = false;
      })
      
      // Get All Orders
      .addCase(getAllOrdersByUserId.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllOrdersByUserId.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orderList = action.payload.data;
      })
      .addCase(getAllOrdersByUserId.rejected, (state) => {
        state.isLoading = false;
        state.orderList = [];
      })
      
      // Get Order Details
      .addCase(getOrderDetails.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getOrderDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orderDetails = action.payload.data;
      })
      .addCase(getOrderDetails.rejected, (state) => {
        state.isLoading = false;
        state.orderDetails = null;
      })
      
      // Track Order
      .addCase(trackOrder.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(trackOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.trackingInfo = action.payload.data;
      })
      .addCase(trackOrder.rejected, (state) => {
        state.isLoading = false;
        state.trackingInfo = null;
      })
      
      // Cancel Order
      .addCase(cancelOrder.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update the order in the list if it exists
        const index = state.orderList.findIndex(
          order => order._id === action.payload.data._id
        );
        if (index !== -1) {
          state.orderList[index] = action.payload.data;
        }
        // Update order details if it's the same order
        if (state.orderDetails && state.orderDetails._id === action.payload.data._id) {
          state.orderDetails = action.payload.data;
        }
      })
      .addCase(cancelOrder.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export const { resetOrderDetails, resetRazorpayOrder, resetTrackingInfo } = shoppingOrderSlice.actions;

export default shoppingOrderSlice.reducer;