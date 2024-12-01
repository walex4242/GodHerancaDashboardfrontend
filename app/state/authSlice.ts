// state/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  _id: string;
  username: string;
  email: string;
  profile?: string;
  address: string | string[] | undefined;
  phone: string;
  supermarketId?: string;
  userType: string;
  profilePicture: string;
  isVerified: boolean;
  uid: string;
  authentication: {
    password: string;
    sessionToken?: string; // Optional
    salt?: string;
  };
  createdAt: string;
  updatedAt: string;
  __v?: number; // Optional
}

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: User  | null // Add this line
}

const initialState: AuthState = {
  isAuthenticated: false,
  token: null,
  user: null, // Initialize user as null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    clearUser(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.token = null;
    },
    setToken(state, action: PayloadAction<string>) {
      state.token = action.payload;
    },
    clearToken(state) {
      state.token = null;
    },
  },
});

export const { setUser, clearUser, setToken, clearToken } = authSlice.actions;
export default authSlice.reducer;
