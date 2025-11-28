import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the interface for make item
interface MakeItem {
  id: number;
  name: string;
  isActive: boolean;
}

// Define the slice state interface
interface MakeSliceState {
  activeMakes: MakeItem[];
  isLoading: boolean;
  error: string | null;
}

// Define the initial state
const initialState: MakeSliceState = {
  activeMakes: [],
  isLoading: false,
  error: null,
};

const makeSlice = createSlice({
  name: "activeMakes",
  initialState,
  reducers: {
    // Set makes array from API
    setMakes: (state, action: PayloadAction<MakeItem[]>) => {
      state.activeMakes = action.payload;
    },
    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    // Set error state
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

// Actions
export const { 
  setMakes,
  setLoading,
  setError 
} = makeSlice.actions;

// Reducer
export default makeSlice.reducer;
