import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the initial state interface
interface AllAssignRolesState {
  assignedRolesUserData: any; // Store the whole response object
  loading: boolean;
  error: string | null;
}

// Define the initial state
const initialState: AllAssignRolesState = {
  assignedRolesUserData: null,
  loading: false,
  error: null,
};

// Create the slice
const allAssignRolesSlice = createSlice({
  name: "allAssignRoles",
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

    // Set assigned roles user data (store whole response object)
    setAssignedRolesUserData: (state, action: PayloadAction<any>) => {
      state.assignedRolesUserData = action.payload;
      state.error = null;
    },

    // Reset assigned roles user data
    resetAssignedRolesUserData: (state) => {
      state.assignedRolesUserData = null;
      state.error = null;
    },

    // Reset entire state to initial state
    resetAllAssignRolesState: (state) => {
      state.assignedRolesUserData = null;
      state.loading = false;
      state.error = null;
    },
  },
});

// Export actions
export const {
  setLoading,
  setError,
  setAssignedRolesUserData,
  resetAssignedRolesUserData,
  resetAllAssignRolesState,
} = allAssignRolesSlice.actions;

// Export reducer
export default allAssignRolesSlice.reducer;

// Export types for use in components
export type { AllAssignRolesState };
