import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isLoading: false,
  productList: [],
  productDetails: null,
  featuredList: [],
};

export const fetchAllFilteredProducts = createAsyncThunk(
  "/products/fetchAllProducts",
  async ({ filterParams = {}, sortParams } = {}) => {
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

    // Safe check for sorting
    if (sortParams) {
      query.append("sortBy", sortParams);
    }

    const queryString = query.toString();
    const url = `/api/shop/products/get${queryString ? `?${queryString}` : ""}`;

    const result = await axios.get(url);
    return result?.data.data;
  }
);

export const fetchFeaturedProducts = createAsyncThunk(
  "products/fetchFeaturedProducts",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get("/api/shop/products/featured");
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch featured products"
      );
    }
  }
);

export const markAsFeatured = createAsyncThunk(
  "products/markAsFeatured",
  async ({ id, isFeatured, featuredDescription }) => {
    const response = await axios.post(`/api/shop/products/${id}/feature`, {
      isFeatured,
      featuredDescription,
    });
    return response.data.data;
  }
);

export const fetchProductDetails = createAsyncThunk(
  "/products/fetchProductDetails",
  async (id) => {
    const result = await axios.get(`/api/shop/products/get/${id}`);
    return result?.data.data;
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
        state.productList = action.payload || [];
      })
      .addCase(fetchAllFilteredProducts.rejected, (state) => {
        state.isLoading = false;
        state.productList = [];
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
