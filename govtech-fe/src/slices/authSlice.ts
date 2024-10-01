// redux/authSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  token: string | null; // Define the type for the token state
}

const initialState: AuthState = {
  token: null, // Initial state for the token
};

// Create the slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setToken(state, action: PayloadAction<string | null>) {
      state.token = action.payload; // Update the token state
    },
    clearToken(state) {
      state.token = null; // Clear the token state
    },
  },
});

// Export actions for dispatching
export const { setToken, clearToken } = authSlice.actions;

// Export the reducer for use in the store
export default authSlice.reducer;
