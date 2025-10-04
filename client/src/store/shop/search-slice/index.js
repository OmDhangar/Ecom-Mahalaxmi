import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from '../../../api/axiosInstance';

const initialState = {
  isLoading: false,
  searchResults: [],
};

export const getSearchResults = createAsyncThunk(
  "/order/getSearchResults",
  async (keyword, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/shop/search/${keyword}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const searchSlice = createSlice({
  name: "searchSlice",
  initialState,
  reducers: {
    resetSearchResults: (state) => {
      state.searchResults = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getSearchResults.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getSearchResults.fulfilled, (state, action) => {
        state.isLoading = false;
        state.searchResults = action.payload.data;
      })
      .addCase(getSearchResults.rejected, (state) => {
        state.isLoading = false;
        state.searchResults = [];
      });
  },
});

export const { resetSearchResults } = searchSlice.actions;

export default searchSlice.reducer;
