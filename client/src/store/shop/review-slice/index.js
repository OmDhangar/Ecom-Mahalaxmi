import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from '../../../api/axiosInstance';

const initialState = {
  isLoading: false,
  reviews: [],
};

export const addReview = createAsyncThunk(
  "/order/addReview",
  async (formdata, { rejectWithValue }) => {
    try {
      const response = await api.post(`/api/shop/review/add`, formdata);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getReviews = createAsyncThunk(
  "/order/getReviews", 
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/shop/review/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const reviewSlice = createSlice({
  name: "reviewSlice",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getReviews.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getReviews.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reviews = action.payload.data;
      })
      .addCase(getReviews.rejected, (state) => {
        state.isLoading = false;
        state.reviews = [];
      });
  },
});

export default reviewSlice.reducer;
