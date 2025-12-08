import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the interface for company item
interface CompanyItem {
  id: number;
  name: string;
  isActive: boolean;
}

// Define the slice state interface
interface CompanySliceState {
  activeCompanies: CompanyItem[];
  isLoading: boolean;
  error: string | null;
  players: String[];
}

// Define the initial state
const initialState: CompanySliceState = {
  activeCompanies: [],
  isLoading: false,
  error: null,
  players: []
};


const companySlice = createSlice({
  name: "activeCompanies",
  initialState,
  reducers: {
    // Set companys array from API
    setCompanies: (state, action: PayloadAction<CompanyItem[]>) => {
      state.activeCompanies = action.payload;
    },
    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    // Set error state
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setFilterPlayers: (state, action: PayloadAction<String[]>) => {
      state.players = action.payload;
      state.isLoading = false;
      state.error = null;
    },
  },
});

// Actions
export const {
  setCompanies,
  setLoading,
  setError,
  setFilterPlayers
} = companySlice.actions;

// Reducer
export default companySlice.reducer;
