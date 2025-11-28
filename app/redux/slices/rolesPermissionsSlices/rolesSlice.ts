import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define the structure for a role object
interface Role {
  id: string;
  title: string;
  description?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Define the initial state structure
interface RolesState {
  rolesData: Role[];
  loading: boolean;
  error: string | null;
}

// Define the initial state
const initialState: RolesState = {
  rolesData: [],
  loading: false,
  error: null,
};

// Create the roles slice
const rolesSlice = createSlice({
  name: 'roles',
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

    // Set roles data
    setRolesData: (state, action: PayloadAction<Role[]>) => {
      state.rolesData = action.payload;
      state.loading = false;
      state.error = null;
    },

    // Add a single role
    addRole: (state, action: PayloadAction<Role>) => {
      state.rolesData.push(action.payload);
    },

    // Update a role
    updateRole: (state, action: PayloadAction<Role>) => {
      const index = state.rolesData.findIndex(role => role.id === action.payload.id);
      if (index !== -1) {
        state.rolesData[index] = action.payload;
      }
    },

    // Delete a role
    deleteRole: (state, action: PayloadAction<string>) => {
      state.rolesData = state.rolesData.filter(role => role.id !== action.payload);
    },

    // Reset the entire state to initial values
    resetRolesState: (state) => {
      state.rolesData = [];
      state.loading = false;
      state.error = null;
    },

    // Reset only roles data
    resetRolesData: (state) => {
      state.rolesData = [];
    },
  },
});

// Export actions
export const {
  setLoading,
  setError,
  setRolesData,
  addRole,
  updateRole,
  deleteRole,
  resetRolesState,
  resetRolesData,
} = rolesSlice.actions;

// Export reducer
export default rolesSlice.reducer;
