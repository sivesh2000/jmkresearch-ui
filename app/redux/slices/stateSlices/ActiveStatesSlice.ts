import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the interface for state item
interface StateItem {
  id: number;
  name: string;
  isActive: boolean;
}

// Define the slice state interface
interface StateSliceState {
  activeStates: StateItem[];
  isLoading: boolean;
  error: string | null;
  players: String[];
}

// Define the initial state
const initialState: StateSliceState = {
  activeStates: [],
  isLoading: false,
  error: null,
  players: []
};


const stateSlice = createSlice({
  name: "activeStates",
  initialState,
  reducers: {
    // Set companys array from API
    setStates: (state, action: PayloadAction<StateItem[]>) => {
      state.activeStates = action.payload;
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
  setStates,
  setLoading,
  setError,
  setFilterPlayers
} = stateSlice.actions;

// Reducer
export default stateSlice.reducer;
