import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface State {
  id: number;
  name: string;
  code: string;
}

export interface StateSliceState {
  states: State[];
  loading: boolean;
  error: string | null;
}

const initialState: StateSliceState = {
  states: [],
  loading: false,
  error: null,
};

const stateSlice = createSlice({
  name: 'state',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setStates: (state, action: PayloadAction<State[]>) => {
      state.states = action.payload;
    },
    addState: (state, action: PayloadAction<State>) => {
      state.states.push(action.payload);
    },
    updateState: (state, action: PayloadAction<State>) => {
      const index = state.states.findIndex(st => st.id === action.payload.id);
      if (index !== -1) {
        state.states[index] = action.payload;
      }
    },
    deleteState: (state, action: PayloadAction<number>) => {
      state.states = state.states.filter(st => st.id !== action.payload);
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setLoading,
  setStates,
  addState,
  updateState,
  deleteState,
  setError,
  clearError
} = stateSlice.actions;

export default stateSlice.reducer;