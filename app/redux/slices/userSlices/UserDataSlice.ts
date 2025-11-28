import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserDataState {
  loggedInUser: any | null;
}

const initialState: UserDataState = {
  loggedInUser: null,
};

const userDataSlice = createSlice({
  name: "userData",
  initialState,
  reducers: {
    setLoggedInUser(state, action: PayloadAction<any>) {
      state.loggedInUser = action.payload;
    },
    resetLoggedInUser(state) {
      state.loggedInUser = null;
    },
  },
});

export const { setLoggedInUser, resetLoggedInUser } = userDataSlice.actions;
export default userDataSlice.reducer;