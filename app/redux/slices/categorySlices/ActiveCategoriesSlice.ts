import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the interface for company item
interface CategoryItem {
  id: number;
  name: string;
  isActive: boolean;
}

// Define the slice state interface
interface CategorySliceState {
  activeCategories: CategoryItem[];
  isLoading: boolean;
  error: string | null;
  players: String[];
}

// Define the initial state
const initialState: CategorySliceState = {
  activeCategories: [],
  isLoading: false,
  error: null,
  players: []
};


const categorySlice = createSlice({
  name: "activeCategories",
  initialState,
  reducers: {
    // Set companys array from API
    setCategories: (state, action: PayloadAction<CategoryItem[]>) => {
      state.activeCategories = action.payload;
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
  setCategories,
  setLoading,
  setError,
  setFilterPlayers
} = categorySlice.actions;

// Reducer
export default categorySlice.reducer;
