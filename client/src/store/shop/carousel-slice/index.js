import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  activeSlides: [],
  isLoading: false,
  error: null
};

export const fetchActiveCarouselSlides = createAsyncThunk(
  'shopCarousel/fetchActiveCarouselSlides',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/shop/carousel/active');


      if (response.status !== 200) {
        throw new Error(response.data?.message || 'Failed to fetch carousel slides');
      }

      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const shopCarouselSlice = createSlice({
  name: 'shopCarousel',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchActiveCarouselSlides.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchActiveCarouselSlides.fulfilled, (state, action) => {
        state.isLoading = false;
        state.activeSlides = action.payload;
      })
      .addCase(fetchActiveCarouselSlides.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export default shopCarouselSlice.reducer;
