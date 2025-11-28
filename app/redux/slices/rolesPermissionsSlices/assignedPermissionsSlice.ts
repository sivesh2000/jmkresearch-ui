import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the structure for a permission object
interface AssignedPermission {
  id?: string;
  domain?: string;
  description?: string;
  actions?: string;
  instance?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}


// Define the initial state structure
interface AssignedPermissionsState {
  assignedPermissionsData: AssignedPermission[];
  loading: boolean;
  error: string | null;
}

// Define the initial state
const initialState: AssignedPermissionsState = {
  assignedPermissionsData: [],
  loading: false,
  error: null,
};

// Create the permissions slice
const assignedPermissionsSlice = createSlice({
  name: "assignedPermissions",
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

    // Set permissions data
    setAssignedPermissionsData: (state, action: PayloadAction<AssignedPermission[]>) => {
      state.assignedPermissionsData = action.payload;
      state.loading = false;
      state.error = null;
    },


    // Add a single permission
    addAssignedPermission: (state, action: PayloadAction<AssignedPermission>) => {
      state.assignedPermissionsData.push(action.payload);
    },



    // Update a permission
    updateAssignedPermission: (state, action: PayloadAction<AssignedPermission>) => {
      const index = state.assignedPermissionsData.findIndex(
        (permission) => permission.id === action.payload.id
      );
      if (index !== -1) {
        state.assignedPermissionsData[index] = action.payload;
      }
    },

  
    // Delete a permission
    deleteAssignedPermission: (state, action: PayloadAction<string>) => {
      state.assignedPermissionsData = state.assignedPermissionsData.filter(
        (permission) => permission.id !== action.payload
      );
    },

    

    // Reset the entire state to initial values
    resetAssignedPermissionsState: (state) => {
      state.assignedPermissionsData = [];
      state.loading = false;
      state.error = null;
    },

    // Reset only permissions data
    resetAssignedPermissionsData: (state) => {
      state.assignedPermissionsData = [];
    },
  },
});

// Export actions
export const {
  setLoading,
  setError,
  setAssignedPermissionsData,
  addAssignedPermission,
  updateAssignedPermission,
  deleteAssignedPermission,
  resetAssignedPermissionsState,
  resetAssignedPermissionsData,
} = assignedPermissionsSlice.actions;

// Export reducer
export default assignedPermissionsSlice.reducer;

// Export types for use in components
export type { AssignedPermission, AssignedPermissionsState };
