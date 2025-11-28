import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Make {
  _id: string;
  name: string;
  isActive: boolean;
}

interface ModelFilterState {
  makes: Make[];
  loading: boolean;
  error: string | null;
}

const initialState: ModelFilterState = {
  makes: [],
  loading: false,
  error: null,
};

const modelFilterSlice = createSlice({
  name: 'modelFilter',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setMakes: (state, action: PayloadAction<Make[]>) => {
      state.makes = action.payload;
      state.loading = false;
      state.error = null;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { setLoading, setMakes, setError } = modelFilterSlice.actions;
export default modelFilterSlice.reducer;