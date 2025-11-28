import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface DistrictDataState {
  districtdata: any[];
}

const initialState: DistrictDataState = {
  districtdata: [],
};

const districtSlice = createSlice({
  name: "DistrictData",
  initialState,
  reducers: {
    setDistrictData: (state, action: PayloadAction<any[]>) => {
      state.districtdata = action.payload;
    },
    resetDistrictData: (state) => {
      state.districtdata = [];
    },
  },
});

export const { setDistrictData, resetDistrictData } = districtSlice.actions;
export default districtSlice.reducer;