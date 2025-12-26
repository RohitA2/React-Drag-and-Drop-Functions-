// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import { toast } from "react-toastify";
// import axios from "axios";

// const API_URL = import.meta.env.VITE_API_URL;

// // 🔹 Login Thunk
// export const loginUser = createAsyncThunk(
//   "auth/loginUser",
//   async ({ email, password }, { rejectWithValue }) => {
//     try {
//       const { data } = await axios.post(`${API_URL}/api/auth/login`, {
//         email,
//         password,
//       });
//       toast.success("Login successful.");
//       return {
//         token: data.token,
//         user: data.user,
//       };
//     } catch (err) {
//       return rejectWithValue(
//         toast.error(
//           err.response?.data?.message || "Login failed. Please try again."
//         )
//       );
//     }
//   }
// );

// // 🔹 Update User Profile Thunk
// export const updateUserProfile = createAsyncThunk(
//   "auth/updateProfile",
//   async (userData, { rejectWithValue, getState }) => {
//     try {
//       const token = getState().auth.token || localStorage.getItem("token"); // fallback

//       const { data } = await axios.post(
//         `${API_URL}/api/auth/updateProfile`,
//         userData,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       toast.success("Profile updated successfully.");
//       return data.user;
//     } catch (err) {
//       return rejectWithValue(
//         err.response?.data?.message || "Profile update failed."
//       );
//     }
//   }
// );

// // ✅ Safe JSON parse for user
// let savedUser = null;
// try {
//   const raw = localStorage.getItem("user");
//   if (raw && raw !== "undefined" && raw !== "null") {
//     savedUser = JSON.parse(raw);
//   }
// } catch {
//   savedUser = null;
// }

// const initialState = {
//   user: savedUser,
//   token: localStorage.getItem("token") || null,
//   loading: false,
//   error: null,
//   success: null,
// };

// const authSlice = createSlice({
//   name: "auth",
//   initialState,
//   reducers: {
//     logout(state) {
//       state.user = null;
//       state.token = null;
//       state.error = null;
//       state.success = null;
//       localStorage.removeItem("user");
//       localStorage.removeItem("token");
//       delete axios.defaults.headers.common["Authorization"];
//     },
//     clearAuthMessages(state) {
//       state.error = null;
//       state.success = null;
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       // 🔹 Login Cases
//       .addCase(loginUser.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(loginUser.fulfilled, (state, action) => {
//         state.loading = false;
//         const { token, user } = action.payload;

//         state.user = user;
//         state.token = token;
//         state.success = "Logged in successfully.";

//         // Save in localStorage
//         localStorage.setItem("user", JSON.stringify(user));
//         localStorage.setItem("token", token);
//         localStorage.setItem("role", user.role);
//         localStorage.setItem("companyId", user.companyId);

//         // Attach token to axios for future requests
//         axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
//       })
//       .addCase(loginUser.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload || "Login failed.";
//       })

//       // 🔹 Update Profile Cases
//       .addCase(updateUserProfile.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(updateUserProfile.fulfilled, (state, action) => {
//         state.loading = false;
//         state.user = action.payload;
//         state.success = "Profile updated successfully.";
//         localStorage.setItem("user", JSON.stringify(action.payload));
//       })
//       .addCase(updateUserProfile.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       });
//   },
// });

// // 🔹 Selectors
// export const selectUser = (state) => state.auth.user;
// export const selectToken = (state) => state.auth.token;
// export const selectLoading = (state) => state.auth.loading;
// export const selectError = (state) => state.auth.error;
// export const selectSuccess = (state) => state.auth.success;

// // 🔹 Additional Selectors
// export const selectUserFullName = (state) =>
//   state.auth.user
//     ? `${state.auth.user.firstName} ${state.auth.user.lastName}`
//     : "";

// export const selectUserEmail = (state) =>
//   state.auth.user ? state.auth.user.email : "";

// export const selectedUserId = (state) =>
//   state.auth.user ? state.auth.user.id : "";

// export const { logout, clearAuthMessages } = authSlice.actions;
// export default authSlice.reducer;


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
        companyId: data.user?.companyId || null,
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
      return {
        user: data.user,
        companyId: data.user?.companyId || null,
      };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Profile update failed."
      );
    }
  }
);

// 🔹 Update Company ID (for scenarios where company changes)
export const updateCompanyId = createAsyncThunk(
  "auth/updateCompanyId",
  async (companyId, { rejectWithValue }) => {
    try {
      // You might want to save this to backend in some cases
      // For now, we'll just update Redux and localStorage
      return { companyId };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to update company ID."
      );
    }
  }
);

// ✅ Safe JSON parse for user and companyId
let savedUser = null;
let savedCompanyId = null;
try {
  const raw = localStorage.getItem("user");
  if (raw && raw !== "undefined" && raw !== "null") {
    savedUser = JSON.parse(raw);
    savedCompanyId = savedUser?.companyId || localStorage.getItem("companyId") || null;
  }
} catch {
  savedUser = null;
  savedCompanyId = null;
}

const initialState = {
  user: savedUser,
  token: localStorage.getItem("token") || null,
  companyId: savedCompanyId,
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
      state.companyId = null;
      state.error = null;
      state.success = null;
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("companyId");
      localStorage.removeItem("role");
      delete axios.defaults.headers.common["Authorization"];
    },
    clearAuthMessages(state) {
      state.error = null;
      state.success = null;
    },
    // Manual update of company ID if needed
    setCompanyId(state, action) {
      state.companyId = action.payload;
      localStorage.setItem("companyId", action.payload);
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
        const { token, user, companyId } = action.payload;

        state.user = user;
        state.token = token;
        state.companyId = companyId;
        state.success = "Logged in successfully.";

        // Save in localStorage
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("token", token);
        localStorage.setItem("companyId", companyId);
        localStorage.setItem("role", user.role);

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
        state.user = action.payload.user;
        state.companyId = action.payload.companyId;
        state.success = "Profile updated successfully.";
        localStorage.setItem("user", JSON.stringify(action.payload.user));
        localStorage.setItem("companyId", action.payload.companyId);
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 🔹 Update Company ID Cases
      .addCase(updateCompanyId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCompanyId.fulfilled, (state, action) => {
        state.loading = false;
        state.companyId = action.payload.companyId;
        localStorage.setItem("companyId", action.payload.companyId);
        state.success = "Company ID updated.";
      })
      .addCase(updateCompanyId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// 🔹 Selectors
export const selectUser = (state) => state.auth.user;
export const selectToken = (state) => state.auth.token;
export const selectCompanyId = (state) => state.auth.companyId;
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

// 🔹 Combined selectors
export const selectAuth = (state) => ({
  user: state.auth.user,
  token: state.auth.token,
  companyId: state.auth.companyId,
  loading: state.auth.loading,
  error: state.auth.error,
  success: state.auth.success,
});

// 🔹 Check if user has company ID
export const selectHasCompanyId = (state) => !!state.auth.companyId;

export const { logout, clearAuthMessages, setCompanyId } = authSlice.actions;
export default authSlice.reducer;