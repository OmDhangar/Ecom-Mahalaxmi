import axios from "axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const initialState = {
  cartItems: { items: [] }, // Initialize with proper cart structure
  isLoading: false,
};

// Add to Cart with optional size
export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ userId, productId, quantity, size, color }) => {
    if (!userId) {
      return rejectWithValue({
        success: false,
        message: "Authentication required"
      });
    }
    
    // Build request body conditionally
    const requestBody = {
      userId,
      productId,
      quantity,
    };
    
    // Only add size if it's provided
    if (size) {
      requestBody.size = size;
    }
    
    // Only add color if it's provided
    if (color) {
      requestBody.color = color;
    }
    
    const response = await axios.post(
      "/api/shop/cart/add",
      requestBody
    );

    return response.data;
  }
);

// Fetch Cart Items
export const fetchCartItems = createAsyncThunk(
  "cart/fetchCartItems",
  async (userId) => {
    const response = await axios.get(
      `/api/shop/cart/get/${userId}`
    );

    return response.data;
  }
);

// Delete Cart Item
export const deleteCartItem = createAsyncThunk(
  "cart/deleteCartItem",
  async ({ userId, productId, size, color }) => {
    // Build query params for size and color
    const params = new URLSearchParams();
    if (size) params.append('size', size);
    if (color) params.append('color', color);
    
    const url = params.toString() 
      ? `/api/shop/cart/${userId}/${productId}?${params.toString()}`
      : `/api/shop/cart/${userId}/${productId}`;

    const response = await axios.delete(url);

    return response.data;
  }
);
export const clearUserCart = createAsyncThunk(
  "cart/clearCart",
  async (userId) => {
    const response = await axios.delete(
      `/api/shop/cart/clear/${userId}`
    );
    return response.data;
  }
);

// Update Cart Quantity (with optional size)
export const updateCartQuantity = createAsyncThunk(
  "cart/updateCartQuantity",
  async ({ userId, productId, quantity, size, color }) => {
    // Build request body conditionally
    const requestBody = {
      userId,
      productId,
      quantity,
    };
    
    // Only add size if it's provided
    if (size) {
      requestBody.size = size;
    }
    
    // Only add color if it's provided
    if (color) {
      requestBody.color = color;
    }
    
    const response = await axios.put(
      "/api/shop/cart/update-cart",
      requestBody
    );

    return response.data;
  }
);

const shoppingCartSlice = createSlice({
  name: "shoppingCart",
  initialState,
  reducers: {
    resetCart: (state) => {
      state.cartItems = { items: [] };
      state.isLoading = false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(addToCart.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartItems = action.payload.data; // Store the full cart object
      })
      .addCase(addToCart.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(fetchCartItems.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCartItems.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartItems = action.payload.data; // Store the full cart object
      })
      .addCase(fetchCartItems.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(updateCartQuantity.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateCartQuantity.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartItems = action.payload.data; // Store the full cart object
      })
      .addCase(updateCartQuantity.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(deleteCartItem.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteCartItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartItems = action.payload.data; // Store the full cart object
      })
      .addCase(deleteCartItem.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(clearUserCart.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(clearUserCart.fulfilled, (state) => {
        state.isLoading = false;
        state.cartItems = { items: [] };
      })
      .addCase(clearUserCart.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export default shoppingCartSlice.reducer;
