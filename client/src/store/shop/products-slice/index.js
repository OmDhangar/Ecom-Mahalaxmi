import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { isCacheFresh, generateCacheKey, localCache } from "@/utils/cacheUtils";

const initialState = {
  isLoading: false,
  productList: [],
  productDetails: null,
  featuredList: [],
  // Cache management
  lastFetched: {
    products: null,
    featured: null,
    details: {}
  },
  cacheKeys: {
    products: null,
    featured: 'featured-products'
  },
  isStale: {
    products: false,
    featured: false
  }
};

export const fetchAllFilteredProducts = createAsyncThunk(
  "/products/fetchAllProducts",
  async ({ filterParams = {}, sortParams } = {}, { getState }) => {
    const state = getState();
    const currentCacheKey = generateCacheKey(filterParams, sortParams);
    
    // Check if we have fresh cached data for this specific query
    const lastFetched = state.shopProducts.lastFetched.products;
    const cachedKey = state.shopProducts.cacheKeys.products;
    
    if (lastFetched && 
        cachedKey === currentCacheKey && 
        isCacheFresh(lastFetched, 'PRODUCTS')) {
      console.log('Using cached products data');
      return { data: state.shopProducts.productList, fromCache: true };
    }
    
    // Check localStorage cache as backup
    const localCached = localCache.get(`products_${currentCacheKey}`, 'PRODUCTS');
    if (localCached && !localCached.isStale) {
      console.log('Using localStorage cached products');
      return { data: localCached.data, fromCache: true, fromLocalStorage: true };
    }
    
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

    // Build the URL with optional query
    const queryString = query.toString();
    const url = `/api/shop/products/get${queryString ? `?${queryString}` : ""}`;

    const result = await axios.get(url);
    const products = result?.data.data;
    
    // Save to localStorage
    localCache.set(`products_${currentCacheKey}`, products, 'PRODUCTS');
    
    return { data: products, cacheKey: currentCacheKey, fromCache: false };
  }
);

export const fetchFeaturedProducts = createAsyncThunk(
  "products/fetchFeaturedProducts",
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const lastFetched = state.shopProducts.lastFetched.featured;
      
      // Check if we have fresh cached data
      if (lastFetched && isCacheFresh(lastFetched, 'FEATURED')) {
        console.log('Using cached featured products data');
        return { data: state.shopProducts.featuredList, fromCache: true };
      }
      
      // Check localStorage cache
      const localCached = localCache.get('featured-products', 'FEATURED');
      if (localCached && !localCached.isStale) {
        console.log('Using localStorage cached featured products');
        return { data: localCached.data, fromCache: true, fromLocalStorage: true };
      }
      
      const res = await axios.get("/api/shop/products/featured");
      const featuredProducts = res.data.data;
      
      // Save to localStorage
      localCache.set('featured-products', featuredProducts, 'FEATURED');
      
      return { data: featuredProducts, fromCache: false };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch featured products");
    }
  }
);


export const markAsFeatured = createAsyncThunk("products/markAsFeatured", async ( {id, isFeatured, featuredDescription} ) => {
  const response = await axios.post(`/api/shop/products/${id}/feature`, { 
    isFeatured,
    featuredDescription,
   });
  return response.data.data;
});

export const fetchProductDetails = createAsyncThunk(
  "/products/fetchProductDetails",
  async (id) => {
    const result = await axios.get(
      `/api/shop/products/get/${id}`
    );

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
    invalidateProductsCache: (state) => {
      state.lastFetched.products = null;
      state.cacheKeys.products = null;
      state.isStale.products = true;
      localCache.remove(`products_${state.cacheKeys.products}`);
    },
    invalidateFeaturedCache: (state) => {
      state.lastFetched.featured = null;
      state.isStale.featured = true;
      localCache.remove('featured-products');
    },
    invalidateAllCache: (state) => {
      state.lastFetched = { products: null, featured: null, details: {} };
      state.cacheKeys.products = null;
      state.isStale = { products: true, featured: true };
      localCache.clear();
    },
    markStale: (state, action) => {
      const { type } = action.payload;
      if (type === 'products' || type === 'all') {
        state.isStale.products = true;
      }
      if (type === 'featured' || type === 'all') {
        state.isStale.featured = true;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllFilteredProducts.pending, (state, action) => {
        state.isLoading = true;
      })
      .addCase(fetchAllFilteredProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        const { data, cacheKey, fromCache } = action.payload;
        state.productList = data;
        
        if (!fromCache) {
          state.lastFetched.products = Date.now();
          state.cacheKeys.products = cacheKey;
          state.isStale.products = false;
        }
      })
      .addCase(fetchAllFilteredProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.productList = [];
      })
      .addCase(fetchProductDetails.pending, (state, action) => {
        state.isLoading = true;
      })
      .addCase(fetchProductDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.productDetails = action.payload;
      })
      .addCase(fetchProductDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.productDetails = null;
      })
      .addCase(fetchFeaturedProducts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        const { data, fromCache } = action.payload;
        state.featuredList = data;
        
        if (!fromCache) {
          state.lastFetched.featured = Date.now();
          state.isStale.featured = false;
        }
      })
      .addCase(fetchFeaturedProducts.rejected, (state) => {
        state.isLoading = false;
        state.featuredList = [];
      })
      
  },
});

export const { 
  setProductDetails, 
  invalidateProductsCache, 
  invalidateFeaturedCache, 
  invalidateAllCache, 
  markStale 
} = shoppingProductSlice.actions;

export default shoppingProductSlice.reducer;
