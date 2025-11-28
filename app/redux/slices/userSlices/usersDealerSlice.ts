import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserDealer {
  id: string;
  name: string;
  email: string;
  role: string;
  userType: string;
  dlpCommission: number;
  isEmailVerified: boolean;
}

interface UserDealerState {
  userDealerData: UserDealer[];
  loading: boolean;
  error: string | null;
}

const initialState: UserDealerState = {
  userDealerData: [],
  loading: false,
  error: null,
};

const usersDealerSlice = createSlice({
  name: 'usersDealer',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setUserDealerData: (state, action: PayloadAction<UserDealer[]>) => {
      state.userDealerData = action.payload;
      state.loading = false;
      state.error = null;
    },
    addUserDealer: (state, action: PayloadAction<UserDealer>) => {
      state.userDealerData.push(action.payload);
    },
    updateUserDealer: (state, action: PayloadAction<UserDealer>) => {
      const index = state.userDealerData.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.userDealerData[index] = action.payload;
      }
    },
    deleteUserDealer: (state, action: PayloadAction<string>) => {
      state.userDealerData = state.userDealerData.filter(item => item.id !== action.payload);
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
  setUserDealerData,
  addUserDealer,
  updateUserDealer,
  deleteUserDealer,
  setError,
  clearError,
} = usersDealerSlice.actions;

export default usersDealerSlice.reducer;