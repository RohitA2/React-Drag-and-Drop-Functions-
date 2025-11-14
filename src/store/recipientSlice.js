// src/redux/slices/recipientSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

// ✅ Base API URL
const API_URL = import.meta.env.VITE_API_URL; // change if needed

// 🔹 Async Thunks
export const createRecipient = createAsyncThunk(
  "recipients/create",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/api/create`, payload);
      const resData = response.data;

      if (resData.success) {
        toast.success("Recipient created successfully ✅");
        return resData.data; // This contains the recipient object
      } else {
        toast.error(resData.message || "Failed to create recipient ❌");
        return rejectWithValue(resData.message);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Something went wrong ❌";
      toast.error(errorMsg);
      return rejectWithValue(errorMsg);
    }
  }
);

export const fetchRecipients = createAsyncThunk(
  "recipients/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_URL}/api/recipients`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const updateRecipient = createAsyncThunk(
  "recipients/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`${API_URL}/api/recipients/${id}`, data);
      if (res.data.success) {
        return res.data.data; // ✅ only return the recipient object
      } else {
        return rejectWithValue(res.data.message);
      }
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const deleteRecipient = createAsyncThunk(
  "recipients/delete",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// 🔹 Slice
const recipientSlice = createSlice({
  name: "recipients",
  initialState: {
    list: [],
    loading: false,
    error: null,
    success: null,
  },
  reducers: {
    clearStatus: (state) => {
      state.error = null;
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create
      .addCase(createRecipient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRecipient.fulfilled, (state, action) => {
        state.loading = false;
        state.list.push(action.payload.data);
        state.success = action.payload.message;
      })
      .addCase(createRecipient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch
      .addCase(fetchRecipients.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRecipients.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.data;
      })
      .addCase(fetchRecipients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update
      .addCase(updateRecipient.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.list.findIndex((r) => r.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload; // ✅ replace with updated object
        }
        state.success = "Recipient updated successfully ✅";
      })

      // Delete
      .addCase(deleteRecipient.fulfilled, (state, action) => {
        state.list = state.list.filter((r) => r.id !== action.payload);
      });
  },
});

export const { clearStatus } = recipientSlice.actions;
export default recipientSlice.reducer;
