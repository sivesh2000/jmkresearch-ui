import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the interface for company item
interface SubCategoryItem {
  id: number;
  // categoryName: string;
  name: string;
  isActive: boolean;
}

// Define the slice state interface
interface SubCategorySliceState {
  // activeCategories: String[];
  activeSubCategories: SubCategoryItem[];
  isLoading: boolean;
  error: string | null;
  players: String[];
}

// Define the initial state
const initialState: SubCategorySliceState = {
  // activeCategories: [],
  activeSubCategories: [],
  isLoading: false,
  error: null,
  players: []
};


const subCategorySlice = createSlice({
  name: "activeSubCategories",
  initialState,
  reducers: {
    // Set sub category array from API
    setSubCategories: (state, action: PayloadAction<SubCategoryItem[]>) => {
      state.activeSubCategories = action.payload;
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
  setSubCategories,
  setLoading,
  setError,
  setFilterPlayers
} = subCategorySlice.actions;

// Reducer
export default subCategorySlice.reducer;
