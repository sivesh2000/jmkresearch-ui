import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the initial state interface
interface HelpDeskMappingState {
  helpdeskMappingData: any; // Store the whole response object
  loading: boolean;
  error: string | null;
}

// Define the initial state
const initialState: HelpDeskMappingState = {
  helpdeskMappingData: null,
  loading: false,
  error: null,
};

// Create the slice
const helpDeskMappingSlice = createSlice({
  name: "helpDeskMapping",
  initialState,
  reducers: {
    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    // Set error state
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    // Set help desk mapping data (store whole response object)
    setHelpdeskMappingData: (state, action: PayloadAction<any>) => {
      state.helpdeskMappingData = action.payload;
      state.error = null;
    },

    // Reset help desk mapping data
    resetHelpdeskMappingData: (state) => {
      state.helpdeskMappingData = null;
      state.error = null;
    },

    // Reset entire state to initial state
    resetHelpDeskMappingState: (state) => {
      state.helpdeskMappingData = null;
      state.loading = false;
      state.error = null;
    },
  },
});

// Export actions
export const {
  setLoading,
  setError,
  setHelpdeskMappingData,
  resetHelpdeskMappingData,
  resetHelpDeskMappingState,
} = helpDeskMappingSlice.actions;

// Export reducer
export default helpDeskMappingSlice.reducer;

// Export types for use in components
export type { HelpDeskMappingState };

