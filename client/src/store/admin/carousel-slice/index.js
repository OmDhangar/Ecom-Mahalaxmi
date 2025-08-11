import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

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
      const response = await fetch('http://localhost:5000/api/admin/carousel', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch carousel slides');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createCarouselSlide = createAsyncThunk(
  'adminCarousel/createCarouselSlide',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/carousel', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData // FormData object with image and other fields
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create carousel slide');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateCarouselSlide = createAsyncThunk(
  'adminCarousel/updateCarouselSlide',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/carousel/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update carousel slide');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteCarouselSlide = createAsyncThunk(
  'adminCarousel/deleteCarouselSlide',
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/carousel/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete carousel slide');
      }

      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const reorderCarouselSlides = createAsyncThunk(
  'adminCarousel/reorderCarouselSlides',
  async (slideOrders, { rejectWithValue }) => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/carousel/reorder', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ slideOrders })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to reorder carousel slides');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
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