import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  orderList: [],
  orderDetails: null,
  shippingFailedOrders: [],
  isLoading: false,
};

// ✅ Get all orders (date filtered)
export const getAllOrdersForAdmin = createAsyncThunk(
  "/order/getAllOrdersForAdmin",
  async ({ fromDate, toDate }) => {
    const response = await axios.get(
      `/api/admin/orders/get?fromDate=${fromDate}&toDate=${toDate}`
    );
    return response.data;
  }
);

// ✅ Get single order details
export const getOrderDetailsForAdmin = createAsyncThunk(
  "/order/getOrderDetailsForAdmin",
  async (id) => {
    const response = await axios.get(
      `/api/admin/orders/details/${id}`
    );
    return response.data;
  }
);

// ✅ Update order status
export const updateOrderStatus = createAsyncThunk(
  "/order/updateOrderStatus",
  async ({ id, orderStatus, paymentStatus }) => {
    const response = await axios.put(
      `/api/admin/orders/update/${id}`,
      {
        orderStatus,
        ...(paymentStatus && { paymentStatus }),
      }
    );
    return response.data;
  }
);

// ✅ Get orders with shipping errors
export const getShippingFailedOrders = createAsyncThunk(
  "/order/getShippingFailedOrders",
  async () => {
    const response = await axios.get(
      "/api/admin/orders/shipping-failed"
    );
    return response.data;
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
