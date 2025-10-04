import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from '../../../api/axiosInstance';

const initialState = {
  isLoading: false,
  addressList: [],
};

export const addNewAddress = createAsyncThunk(
  "/addresses/addNewAddress",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/shop/address/add", formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchAllAddresses = createAsyncThunk(
  "/addresses/fetchAllAddresses",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/shop/address/get/${userId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const editaAddress = createAsyncThunk(
  "/addresses/editaAddress",
  async ({ userId, addressId, formData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/shop/address/update/${userId}/${addressId}`, formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteAddress = createAsyncThunk(
  "/addresses/deleteAddress",
  async ({ userId, addressId }, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/api/shop/address/delete/${userId}/${addressId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const addressSlice = createSlice({
  name: "address",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(addNewAddress.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addNewAddress.fulfilled, (state, action) => {
        state.isLoading = false;
      })
      .addCase(addNewAddress.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(fetchAllAddresses.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAllAddresses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.addressList = action.payload.data;
      })
      .addCase(fetchAllAddresses.rejected, (state) => {
        state.isLoading = false;
        state.addressList = [];
      });
  },
});

export default addressSlice.reducer;
