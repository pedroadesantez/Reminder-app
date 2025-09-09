import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI, saveAuthToken, loadAuthToken } from '../../services/api';

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await authAPI.login({ email, password });
      const { user, accessToken } = response.data;
      
      // Save token to storage
      await saveAuthToken(accessToken);
      
      return { user, accessToken };
    } catch (error) {
      const message = error.response?.data?.error || error.message;
      return rejectWithValue(message);
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async ({ email, password, name }, { rejectWithValue }) => {
    try {
      const response = await authAPI.register({ 
        email, 
        password, 
        name 
      });
      const { user, accessToken } = response.data;
      
      // Save token to storage
      await saveAuthToken(accessToken);
      
      return { user, accessToken };
    } catch (error) {
      const message = error.response?.data?.error || error.message;
      return rejectWithValue(message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { dispatch }) => {
    try {
      // Clear token from storage
      await saveAuthToken(null);
      return null;
    } catch (error) {
      console.error('Logout error:', error);
      return null;
    }
  }
);

export const loadStoredAuth = createAsyncThunk(
  'auth/loadStored',
  async (_, { rejectWithValue }) => {
    try {
      const token = await loadAuthToken();
      if (!token) {
        return rejectWithValue('No stored token');
      }
      
      // Verify token by fetching profile
      const response = await authAPI.getProfile();
      return { user: response.data.user, accessToken: token };
    } catch (error) {
      // Token invalid, clear it
      await saveAuthToken(null);
      return rejectWithValue('Invalid stored token');
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'auth/updateProfile',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authAPI.updateProfile(userData);
      return response.data.user;
    } catch (error) {
      const message = error.response?.data?.error || error.message;
      return rejectWithValue(message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    accessToken: null,
    isLoading: false,
    error: null,
    isInitialized: false,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setInitialized: (state) => {
      state.isInitialized = true;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.isInitialized = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isInitialized = true;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.isInitialized = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isInitialized = true;
      })
      // Load stored auth
      .addCase(loadStoredAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadStoredAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.isInitialized = true;
      })
      .addCase(loadStoredAuth.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.accessToken = null;
        state.isInitialized = true;
      })
      // Update profile
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.error = null;
      });
  },
});

export const { setUser, clearError, setInitialized } = authSlice.actions;
export default authSlice.reducer;