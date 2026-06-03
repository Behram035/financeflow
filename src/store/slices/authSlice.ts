import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Session } from 'next-auth';

interface AuthState {
  session: Session | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  session: null,
  isLoading: false,
  error: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setSession: (state, action: PayloadAction<Session | null>) => {
      state.session = action.payload;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearAuth: (state) => {
      state.session = null;
      state.error = null;
      state.isLoading = false;
    },
  },
});

export const { setSession, setLoading, setError, clearAuth } = authSlice.actions;
export default authSlice.reducer;
