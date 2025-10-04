import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from '../../../api/axiosInstance';

const initialState = {
  productList: { data: [], pagination: null },
  productDetails: null,
  isLoading: false,
  error: null,
  featuredList: [],
};

export const fetchAllFilteredProducts = createAsyncThunk(
  "/products/fetchAllProducts",
  async ({ filterParams = {}, sortParams } = {}, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams();

      // Safe check for category
      if (filterParams.category) {
        const categoryValue = Array.isArray(filterParams.category)
          ? filterParams.category.join(",")
          : filterParams.category;
        query.append("category", categoryValue);
      }

      // Safe check for brand
      if (filterParams.brand && filterParams.brand.length > 0) {
        query.append("brand", filterParams.brand.join(","));
      }

      // Add page and limit to query parameters
      if (filterParams.page) {
        query.append("page", filterParams.page);
      }
      if (filterParams.limit) {
        query.append("limit", filterParams.limit);
      }

      // Safe check for sorting
      if (sortParams) {
        query.append("sortBy", sortParams);
      }

      const queryString = query.toString();
      const url = `/api/shop/products/get${queryString ? `?${queryString}` : ""}`;

      const result = await api.get(url);
      return result?.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchFeaturedProducts = createAsyncThunk(
  "products/fetchFeaturedProducts",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/api/shop/products/featured");
      return res.data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const markAsFeatured = createAsyncThunk(
  "products/markAsFeatured",
  async ({ id, isFeatured, featuredDescription }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/api/shop/products/${id}/feature`, {
        isFeatured,
        featuredDescription,
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchProductDetails = createAsyncThunk(
  "/products/fetchProductDetails",
  async (id, { rejectWithValue }) => {
    try {
      const result = await api.get(`/api/shop/products/get/${id}`);
      return result?.data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const shoppingProductSlice = createSlice({
  name: "shoppingProducts",
  initialState,
  reducers: {
    setProductDetails: (state) => {
      state.productDetails = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllFilteredProducts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAllFilteredProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        // Fix: Use action.payload.data and action.payload.pagination
        state.productList = {
          data: action.payload.data, // array of products
          pagination: action.payload.pagination // pagination info
        };
      })
      .addCase(fetchAllFilteredProducts.rejected, (state) => {
          state.isLoading = false;
          state.productList = { data: [], pagination: null };
      })
      .addCase(fetchProductDetails.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchProductDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.productDetails = action.payload;
      })
      .addCase(fetchProductDetails.rejected, (state) => {
        state.isLoading = false;
        state.productDetails = null;
      })
      .addCase(fetchFeaturedProducts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.featuredList = action.payload || [];
      })
      .addCase(fetchFeaturedProducts.rejected, (state) => {
        state.isLoading = false;
        state.featuredList = [];
      });
  },
});

export const { setProductDetails } = shoppingProductSlice.actions;

export default shoppingProductSlice.reducer;
