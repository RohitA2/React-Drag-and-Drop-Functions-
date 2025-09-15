import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// 🔹 Login Thunk
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password,
      });
      toast.success("Login successful.");
      return {
        token: data.token,
        user: data.user,
      };
    } catch (err) {
      return rejectWithValue(
        toast.error(
          err.response?.data?.message || "Login failed. Please try again."
        )
      );
    }
  }
);

// 🔹 Update User Profile Thunk
export const updateUserProfile = createAsyncThunk(
  "auth/updateProfile",
  async (userData, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token || localStorage.getItem("token"); // fallback

      const { data } = await axios.post(
        `${API_URL}/api/auth/updateProfile`,
        userData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Profile updated successfully.");
      return data.user;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Profile update failed."
      );
    }
  }
);

// ✅ Safe JSON parse for user
let savedUser = null;
try {
  const raw = localStorage.getItem("user");
  if (raw && raw !== "undefined" && raw !== "null") {
    savedUser = JSON.parse(raw);
  }
} catch {
  savedUser = null;
}

const initialState = {
  user: savedUser,
  token: localStorage.getItem("token") || null,
  loading: false,
  error: null,
  success: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.error = null;
      state.success = null;
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      delete axios.defaults.headers.common["Authorization"];
    },
    clearAuthMessages(state) {
      state.error = null;
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // 🔹 Login Cases
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        const { token, user } = action.payload;

        state.user = user;
        state.token = token;
        state.success = "Logged in successfully.";

        // Save in localStorage
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("token", token);

        // Attach token to axios for future requests
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Login failed.";
      })

      // 🔹 Update Profile Cases
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.success = "Profile updated successfully.";
        localStorage.setItem("user", JSON.stringify(action.payload));
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// 🔹 Selectors
export const selectUser = (state) => state.auth.user;
export const selectToken = (state) => state.auth.token;
export const selectLoading = (state) => state.auth.loading;
export const selectError = (state) => state.auth.error;
export const selectSuccess = (state) => state.auth.success;

// 🔹 Additional Selectors
export const selectUserFullName = (state) =>
  state.auth.user
    ? `${state.auth.user.firstName} ${state.auth.user.lastName}`
    : "";

export const selectUserEmail = (state) =>
  state.auth.user ? state.auth.user.email : "";

export const selectedUserId = (state) =>
  state.auth.user ? state.auth.user.id : "";

export const { logout, clearAuthMessages } = authSlice.actions;
export default authSlice.reducer;
