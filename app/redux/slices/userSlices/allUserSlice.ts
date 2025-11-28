import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AllUserState {
  users: {
    results: any[];
    page: number;
    limit: number;
    totalPages: number;
    totalResults: number;
  };
  loading: boolean;
  error: string | null;
}

const initialState: AllUserState = {
  users: {
    results: [],
    page: 1,
    limit: 10,
    totalPages: 1,
    totalResults: 0,
  },
  loading: false,
  error: null,
};

const allUserSlice = createSlice({
  name: 'allUsers',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setUsers: (state, action: PayloadAction<any>) => {
      state.users = action.payload; // Store full response object
      state.loading = false;
      state.error = null;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { setLoading, setUsers, setError } = allUserSlice.actions;
export default allUserSlice.reducer;