import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../../api/axiosInstance';

const initialState = {
  carouselList: [],
  isLoading: false,
  error: null
};

// Async thunks
export const fetchAllCarouselSlides = createAsyncThunk(
  'adminCarousel/fetchAllCarouselSlides',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/api/admin/carousel');
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const createCarouselSlide = createAsyncThunk(
  'adminCarousel/createCarouselSlide',
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/api/admin/carousel', formData);
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateCarouselSlide = createAsyncThunk(
  'adminCarousel/updateCarouselSlide',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/api/admin/carousel/${id}`, formData);
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const deleteCarouselSlide = createAsyncThunk(
  'adminCarousel/deleteCarouselSlide',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/api/admin/carousel/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const reorderCarouselSlides = createAsyncThunk(
  'adminCarousel/reorderCarouselSlides',
  async (slideOrders, { rejectWithValue }) => {
    try {
      const { data } = await api.put('/api/admin/carousel/reorder', { slideOrders });
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const adminCarouselSlice = createSlice({
  name: 'adminCarousel',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all slides
      .addCase(fetchAllCarouselSlides.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllCarouselSlides.fulfilled, (state, action) => {
        state.isLoading = false;
        state.carouselList = action.payload;
      })
      .addCase(fetchAllCarouselSlides.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Create slide
      .addCase(createCarouselSlide.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createCarouselSlide.fulfilled, (state, action) => {
        state.isLoading = false;
        state.carouselList.push(action.payload);
      })
      .addCase(createCarouselSlide.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Update slide
      .addCase(updateCarouselSlide.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCarouselSlide.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.carouselList.findIndex(
          slide => slide._id === action.payload._id
        );
        if (index !== -1) {
          state.carouselList[index] = action.payload;
        }
      })
      .addCase(updateCarouselSlide.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Delete slide
      .addCase(deleteCarouselSlide.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteCarouselSlide.fulfilled, (state, action) => {
        state.isLoading = false;
        state.carouselList = state.carouselList.filter(
          slide => slide._id !== action.payload
        );
      })
      .addCase(deleteCarouselSlide.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Reorder slides
      .addCase(reorderCarouselSlides.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(reorderCarouselSlides.fulfilled, (state, action) => {
        state.isLoading = false;
        state.carouselList = action.payload;
      })
      .addCase(reorderCarouselSlides.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError } = adminCarouselSlice.actions;
export default adminCarouselSlice.reducer;
