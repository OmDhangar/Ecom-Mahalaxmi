import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from '../../../api/axiosInstance';

const initialState = {
  cartItems: { items: [] }, // Initialize with proper cart structure
  isLoading: false,
};

// Add to Cart with optional size
export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ userId, productId, quantity, size }, { rejectWithValue }) => {
    try {
      if (!userId) {
        return rejectWithValue({
          success: false,
          message: "Authentication required"
        });
      }
      const response = await api.post("/api/shop/cart/add", {
        userId,
        productId,
        quantity,
        size, // include size for fashion products
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch Cart Items
export const fetchCartItems = createAsyncThunk(
  "cart/fetchCartItems",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/shop/cart/get/${userId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Delete Cart Item
export const deleteCartItem = createAsyncThunk(
  "cart/deleteCartItem",
  async ({ userId, productId, size }, { rejectWithValue }) => {
    try {
      // Send size as query param for fashion products
      const url = size
        ? `/api/shop/cart/${userId}/${productId}?size=${size}`
        : `/api/shop/cart/${userId}/${productId}`;

      const response = await api.delete(url);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
export const clearUserCart = createAsyncThunk(
  "cart/clearCart",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/api/shop/cart/clear/${userId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Update Cart Quantity (with optional size)
export const updateCartQuantity = createAsyncThunk(
  "cart/updateCartQuantity",
  async ({ userId, productId, quantity, size }, { rejectWithValue }) => {
    try {
      const response = await api.put("/api/shop/cart/update-cart", {
        userId,
        productId,
        quantity,
        size, // include size for fashion products
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
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
