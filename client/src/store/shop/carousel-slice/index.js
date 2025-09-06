import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { isCacheFresh, localCache } from '@/utils/cacheUtils';

const initialState = {
  activeSlides: [],
  isLoading: false,
  error: null,
  lastFetched: null,
  isStale: false
};

export const fetchActiveCarouselSlides = createAsyncThunk(
  'shopCarousel/fetchActiveCarouselSlides',
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const lastFetched = state.shopCarousel.lastFetched;
      
      // Check if we have fresh cached data
      if (lastFetched && isCacheFresh(lastFetched, 'CAROUSEL')) {
        console.log('Using cached carousel data');
        return { data: state.shopCarousel.activeSlides, fromCache: true };
      }
      
      // Check localStorage cache
      const localCached = localCache.get('carousel-slides', 'CAROUSEL');
      if (localCached && !localCached.isStale) {
        console.log('Using localStorage cached carousel');
        return { data: localCached.data, fromCache: true, fromLocalStorage: true };
      }
      
      const response = await axios.get('/api/shop/carousel/active');

      if (response.status !== 200) {
        throw new Error(response.data?.message || 'Failed to fetch carousel slides');
      }

      const slides = response.data.data;
      
      // Save to localStorage
      localCache.set('carousel-slides', slides, 'CAROUSEL');
      
      return { data: slides, fromCache: false };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const shopCarouselSlice = createSlice({
  name: 'shopCarousel',
  initialState,
  reducers: {
    invalidateCarouselCache: (state) => {
      state.lastFetched = null;
      state.isStale = true;
      localCache.remove('carousel-slides');
    },
    markCarouselStale: (state) => {
      state.isStale = true;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchActiveCarouselSlides.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchActiveCarouselSlides.fulfilled, (state, action) => {
        state.isLoading = false;
        const { data, fromCache } = action.payload;
        state.activeSlides = data;
        
        if (!fromCache) {
          state.lastFetched = Date.now();
          state.isStale = false;
        }
      })
      .addCase(fetchActiveCarouselSlides.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const { invalidateCarouselCache, markCarouselStale } = shopCarouselSlice.actions;

export default shopCarouselSlice.reducer;
