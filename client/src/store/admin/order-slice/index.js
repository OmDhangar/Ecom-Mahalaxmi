import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from '../../../api/axiosInstance';

const initialState = {
  orderList: [],
  orderDetails: null,
  shippingFailedOrders: [],
  isLoading: false,
};

// ✅ Get all orders (date filtered)
export const getAllOrdersForAdmin = createAsyncThunk(
  "/order/getAllOrdersForAdmin",
  async ({ fromDate, toDate }, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/api/admin/orders/get?fromDate=${fromDate}&toDate=${toDate}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ✅ Get single order details
export const getOrderDetailsForAdmin = createAsyncThunk(
  "/order/getOrderDetailsForAdmin",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/admin/orders/details/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ✅ Update order status
export const updateOrderStatus = createAsyncThunk(
  "/order/updateOrderStatus",
  async ({ id, orderStatus, paymentStatus }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/admin/orders/update/${id}`, {
        orderStatus,
        ...(paymentStatus && { paymentStatus }),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ✅ Get orders with shipping errors
export const getShippingFailedOrders = createAsyncThunk(
  "/order/getShippingFailedOrders",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/admin/orders/shipping-failed");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const adminOrderSlice = createSlice({
  name: "adminOrderSlice",
  initialState,
  reducers: {
    resetOrderDetails: (state) => {
      state.orderDetails = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // GET ALL ORDERS
      .addCase(getAllOrdersForAdmin.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllOrdersForAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orderList = action.payload.data;
      })
      .addCase(getAllOrdersForAdmin.rejected, (state) => {
        state.isLoading = false;
        state.orderList = [];
      })

      // GET ORDER DETAILS
      .addCase(getOrderDetailsForAdmin.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getOrderDetailsForAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orderDetails = action.payload.data;
      })
      .addCase(getOrderDetailsForAdmin.rejected, (state) => {
        state.isLoading = false;
        state.orderDetails = null;
      })

      // GET SHIPPING FAILED ORDERS
      .addCase(getShippingFailedOrders.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getShippingFailedOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.shippingFailedOrders = action.payload.data;
      })
      .addCase(getShippingFailedOrders.rejected, (state) => {
        state.isLoading = false;
        state.shippingFailedOrders = [];
      });
  },
});

export const { resetOrderDetails } = adminOrderSlice.actions;
export default adminOrderSlice.reducer;
