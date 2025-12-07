import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the interface for tender item
interface TenderItem {
  id: number;
  name: string;
  isActive: boolean;
}

// Define the slice state interface
interface TenderSliceState {
  activeTenders: TenderItem[];
  isLoading: boolean;
  error: string | null;
  players: String[];
}

// Define the initial state
const initialState: TenderSliceState = {
  activeTenders: [],
  isLoading: false,
  error: null,
  players: []
};


const tenderSlice = createSlice({
  name: "activeTenders",
  initialState,
  reducers: {
    // Set tenders array from API
    setTenders: (state, action: PayloadAction<TenderItem[]>) => {
      state.activeTenders = action.payload;
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
  setTenders,
  setLoading,
  setError,
  setFilterPlayers
} = tenderSlice.actions;

// Reducer
export default tenderSlice.reducer;
