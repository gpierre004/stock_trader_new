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
  initialState: { user: null, isLoading: false, error: null },  
  reducers: {  
    logout: (state) => {  
      state.user = null;  
    },  
  },  
  extraReducers: (builder) => {  
    builder  
      .addCase(login.pending, (state) => {  
        state.isLoading = true;  
      })  
      .addCase(login.fulfilled, (state, action) => {  
        state.isLoading = false;  
        state.user = action.payload;  
      })  
      .addCase(login.rejected, (state, action) => {  
        state.isLoading = false;  
        state.error = action.payload;  
      });  
  },  
});  

export const { logout } = authSlice.actions;  
export default authSlice.reducer;  