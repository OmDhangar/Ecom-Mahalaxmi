import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/axiosInstance";

const initialState = {
  isLoading: false,
  featureImageList: [],
};

export const getFeatureImages = createAsyncThunk(
  "/order/getFeatureImages",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/common/feature/get`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addFeatureImage = createAsyncThunk(
  "/order/addFeatureImage",
  async (image, { rejectWithValue }) => {
    try {
      const response = await api.post(`/api/common/feature/add`, { image, title, description });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const commonSlice = createSlice({
  name: "commonSlice",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getFeatureImages.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getFeatureImages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.featureImageList = action.payload.data;
      })
      .addCase(getFeatureImages.rejected, (state) => {
        state.isLoading = false;
        state.featureImageList = [];
      });
  },
});

export default commonSlice.reducer;
