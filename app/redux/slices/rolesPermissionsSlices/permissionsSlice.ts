import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the structure for a permission object
interface Permission {
  id?: string;
  domain?: string;
  description?: string;
  actions?: string;
  instance?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Define the structure for a domain object
interface Domain {
  id?: string;
  title?: string;
  description?: string;
  status?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Define the initial state structure
interface PermissionsState {
  permissionsData: Permission[];
  domainsData: Domain[];
  loading: boolean;
  error: string | null;
}

// Define the initial state
const initialState: PermissionsState = {
  permissionsData: [],
  domainsData: [],
  loading: false,
  error: null,
};

// Create the permissions slice
const permissionsSlice = createSlice({
  name: "permissions",
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
    setPermissionsData: (state, action: PayloadAction<Permission[]>) => {
      state.permissionsData = action.payload;
      state.loading = false;
      state.error = null;
    },

    // Set domains data
    setDomainsData: (state, action: PayloadAction<Domain[]>) => {
      state.domainsData = action.payload;
      state.loading = false;
      state.error = null;
    },

    // Add a single permission
    addPermission: (state, action: PayloadAction<Permission>) => {
      state.permissionsData.push(action.payload);
    },

    // Add a single domain
    addDomain: (state, action: PayloadAction<Domain>) => {
      state.domainsData.push(action.payload);
    },

    // Update a permission
    updatePermission: (state, action: PayloadAction<Permission>) => {
      const index = state.permissionsData.findIndex(
        (permission) => permission.id === action.payload.id
      );
      if (index !== -1) {
        state.permissionsData[index] = action.payload;
      }
    },

    // Update a domain
    updateDomain: (state, action: PayloadAction<Domain>) => {
      const index = state.domainsData.findIndex(
        (domain) => domain.id === action.payload.id
      );
      if (index !== -1) {
        state.domainsData[index] = action.payload;
      }
    },

    // Delete a permission
    deletePermission: (state, action: PayloadAction<string>) => {
      state.permissionsData = state.permissionsData.filter(
        (permission) => permission.id !== action.payload
      );
    },

    // Delete a domain
    deleteDomain: (state, action: PayloadAction<string>) => {
      state.domainsData = state.domainsData.filter(
        (domain) => domain.id !== action.payload
      );
    },

    // Reset the entire state to initial values
    resetPermissionsState: (state) => {
      state.permissionsData = [];
      state.domainsData = [];
      state.loading = false;
      state.error = null;
    },

    // Reset only permissions data
    resetPermissionsData: (state) => {
      state.permissionsData = [];
    },

    // Reset only domains data
    resetDomainsData: (state) => {
      state.domainsData = [];
    },
  },
});

// Export actions
export const {
  setLoading,
  setError,
  setPermissionsData,
  setDomainsData,
  addPermission,
  addDomain,
  updatePermission,
  updateDomain,
  deletePermission,
  deleteDomain,
  resetPermissionsState,
  resetPermissionsData,
  resetDomainsData,
} = permissionsSlice.actions;

// Export reducer
export default permissionsSlice.reducer;

// Export types for use in components
export type { Permission, Domain, PermissionsState };
