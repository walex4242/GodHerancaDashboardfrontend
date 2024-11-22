import { configureStore } from '@reduxjs/toolkit';
import rootReducer from '../state'; // Adjust the path as needed
import authReducer from '../state/authSlice'; // Import the authReducer


export const store = configureStore({
  reducer: {
    global: rootReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()// Add the API middleware
});

// Export types for use in components
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
