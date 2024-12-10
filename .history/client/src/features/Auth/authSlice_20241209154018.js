import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';  
import authService from './authService';  

export const login = createAsyncThunk('auth/login', async (userData, thunkAPI) => {  
  try {  
    return await authService.login(userData);  
  } catch (error) {  
    return thunkAPI.rejectWithValue(error.response.data);  
  }  
});  

const authSlice = createSlice({  
  name: 'auth',  
  initialState: { 
    user: null, 
    token: null,
    isAuthenticated: false,
    isLoading: false, 
    error: null 
  },  
  reducers: {  
    logout: (state) => {  
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    },  
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
        state.error = action.payload;
      });  
  },  
});  

export const { logout } = authSlice.actions;  
export default authSlice.reducer;
