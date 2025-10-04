import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../../api/axiosInstance';
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
      
      // Check if we have fresh cached data AND it's not empty
      if (lastFetched && isCacheFresh(lastFetched, 'CAROUSEL') && 
          state.shopCarousel.activeSlides && 
          state.shopCarousel.activeSlides.length > 0) {
        console.log('Using cached carousel data');
        return { data: state.shopCarousel.activeSlides, fromCache: true };
      }
      
      // Check localStorage cache only if it has data
      const localCached = localCache.get('carousel-slides', 'CAROUSEL');
      if (localCached && !localCached.isStale && 
          localCached.data && localCached.data.length > 0) {
        console.log('Using localStorage cached carousel');
        return { data: localCached.data, fromCache: true, fromLocalStorage: true };
      }
      
      console.log('Fetching carousel data from database');
      const response = await api.get('/api/shop/carousel/active');

      const slides = Array.isArray(response.data.data) ? response.data.data : [];
      
      console.log('Carousel data fetched:', slides.length, 'slides');
      
      // Save to localStorage only if we have data
      if (slides.length > 0) {
        localCache.set('carousel-slides', slides, 'CAROUSEL');
      }
      
      return { data: slides, fromCache: false };
    } catch (error) {
      console.error('Error fetching carousel data:', error.message);
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
      console.log('Carousel cache invalidated');
    },
    markCarouselStale: (state) => {
      state.isStale = true;
    },
    forceFreshFetch: (state) => {
      state.lastFetched = null;
      state.isStale = true;
      state.activeSlides = [];
      localCache.remove('carousel-slides');
      console.log('Forcing fresh carousel fetch');
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
        
        // Ensure data is always an array
        state.activeSlides = Array.isArray(data) ? data : [];
        
        // Update timestamps and staleness
        if (!fromCache) {
          state.lastFetched = Date.now();
          state.isStale = false;
          console.log('Fresh carousel data saved to state:', state.activeSlides.length, 'slides');
        } else {
          console.log('Using cached carousel data:', state.activeSlides.length, 'slides');
        }
        
        // Clear error on successful fetch
        state.error = null;
      })
      .addCase(fetchActiveCarouselSlides.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const { invalidateCarouselCache, markCarouselStale, forceFreshFetch } = shopCarouselSlice.actions;

export default shopCarouselSlice.reducer;
