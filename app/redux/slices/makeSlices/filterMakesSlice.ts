import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface FilterMake {
  _id: string;
  name: string;
  code: string;
}

interface FilterMakesState {
  filterMakes: FilterMake[];
  loading: boolean;
  error: string | null;
}

const initialState: FilterMakesState = {
  filterMakes: [],
  loading: false,
  error: null,
};

const filterMakesSlice = createSlice({
  name: 'filterMakes',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setFilterMakes: (state, action: PayloadAction<FilterMake[]>) => {
      state.filterMakes = action.payload;
      state.loading = false;
      state.error = null;
    },
    addFilterMake: (state, action: PayloadAction<FilterMake>) => {
      state.filterMakes.push(action.payload);
    },
    updateFilterMake: (state, action: PayloadAction<FilterMake>) => {
      const index = state.filterMakes.findIndex(item => item._id === action.payload._id);
      if (index !== -1) {
        state.filterMakes[index] = action.payload;
      }
    },
    deleteFilterMake: (state, action: PayloadAction<string>) => {
      state.filterMakes = state.filterMakes.filter(item => item._id !== action.payload);
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setLoading,
  setFilterMakes,
  addFilterMake,
  updateFilterMake,
  deleteFilterMake,
  setError,
  clearError,
} = filterMakesSlice.actions;

export default filterMakesSlice.reducer;