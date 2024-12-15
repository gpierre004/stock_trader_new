import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';  
import authService from './authService';  

// Helper function to get initial auth state
const getInitialState = () => {
  const token = localStorage.getItem('token');
  return {
    user: null,
    token: token,
    isAuthenticated: !!token,
    isLoading: false,
    error: null
  };
};

export const login = createAsyncThunk('auth/login', async (userData, thunkAPI) => {  
  try {  
    return await authService.login(userData);  
  } catch (error) {  
    const message = error.response?.data?.error || 
                   error.response?.data?.message || 
                   error.message || 
                   'An error occurred during login';
    return thunkAPI.rejectWithValue({ error: message });  
  }  
});  

const authSlice = createSlice({  
  name: 'auth',  
  initialState: getInitialState(),
  reducers: {  
    logout: (state) => {  
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      authService.logout(); // This will handle both API call and localStorage cleanup
    },
    // Add a reducer to handle token expiration or invalid token
    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('token');
    }
  },  
  extraReducers: (builder) => {  
    builder  
      .addCase(login.pending, (state) => {  
        state.isLoading = true;
        state.error = null;
      })  
      .addCase(login.fulfilled, (state, action) => {  
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })  
      .addCase(login.rejected, (state, action) => {  
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.payload?.error || 'Login failed';
      });  
  },  
});  

export const { logout, clearAuth } = authSlice.actions;  
export default authSlice.reducer;
