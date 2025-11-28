import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface City {
  id: number;
  name: string;
  code: string;
  stateId: number;
}

export interface CitySliceState {
  cities: City[];
  loading: boolean;
  error: string | null;
}

const initialState: CitySliceState = {
  cities: [],
  loading: false,
  error: null,
};

const citySlice = createSlice({
  name: 'city',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setCities: (state, action: PayloadAction<City[]>) => {
      state.cities = action.payload;
    },
    addCity: (state, action: PayloadAction<City>) => {
      state.cities.push(action.payload);
    },
    updateCity: (state, action: PayloadAction<City>) => {
      const index = state.cities.findIndex(city => city.id === action.payload.id);
      if (index !== -1) {
        state.cities[index] = action.payload;
      }
    },
    deleteCity: (state, action: PayloadAction<number>) => {
      state.cities = state.cities.filter(city => city.id !== action.payload);
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
  setCities,
  addCity,
  updateCity,
  deleteCity,
  setError,
  clearError
} = citySlice.actions;

export default citySlice.reducer;