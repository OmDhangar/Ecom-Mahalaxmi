import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from '../../../api/axiosInstance';

const initialState = {
  isLoading: false,
  productList: [],
};

export const addNewProduct = createAsyncThunk(
  "/products/addnewproduct",
  async (formData, { rejectWithValue }) => {
    try {
      const result = await api.post("/api/admin/products/add", formData);
      return result?.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchAllProducts = createAsyncThunk(
  "adminProducts/fetchAllProducts",
  async (filterParams = {}, { rejectWithValue }) => {
    try {
      const queryString = new URLSearchParams(filterParams).toString();
      const url = `/api/admin/products/get${queryString ? `?${queryString}` : ""}`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const editProduct = createAsyncThunk(
  "/products/editProduct",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const result = await api.put(`/api/admin/products/edit/${id}`, formData);
      return result?.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteProduct = createAsyncThunk(
  "/products/deleteProduct",
  async (id, { rejectWithValue }) => {
    try {
      const result = await api.delete(`/api/admin/products/delete/${id}`);
      return result?.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const AdminProductsSlice = createSlice({
  name: "adminProducts",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllProducts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAllProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update to store data and pagination separately
        state.productList = {
          data: action.payload.data,
          pagination: action.payload.pagination,
        };
      })
      .addCase(fetchAllProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.productList = { data: [], pagination: null }; // Reset productList on error
      })
      .addCase(addNewProduct.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addNewProduct.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(addNewProduct.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(editProduct.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(editProduct.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(editProduct.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(deleteProduct.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteProduct.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(deleteProduct.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export default AdminProductsSlice.reducer;
