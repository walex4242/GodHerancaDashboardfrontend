import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface InitialStateTypes {
  isSidebarCollapsed: boolean;
  isSidebarVisible: boolean; // Add this property
  isDarkMode: boolean;
}

const initialState: InitialStateTypes = {
  isSidebarCollapsed: false,
  isSidebarVisible: false, // Initialize visibility to `false`
  isDarkMode: false,
};

export const globalSlice = createSlice({
  name: 'global',
  initialState,
  reducers: {
    setIsSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.isSidebarCollapsed = action.payload;
    },
    setIsSidebarVisible: (state, action: PayloadAction<boolean>) => {
      state.isSidebarVisible = action.payload; // Add reducer for sidebar visibility
    },
    setIsDarkMode: (state, action: PayloadAction<boolean>) => {
      state.isDarkMode = action.payload;
    },
  },
});

export const {
  setIsSidebarCollapsed,
  setIsSidebarVisible,
  setIsDarkMode,
} = globalSlice.actions;

export default globalSlice.reducer;
