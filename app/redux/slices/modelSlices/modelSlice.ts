import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ModelState {
  modelList: any[];
  loading: boolean;
  error: string | null;
}

const initialState: ModelState = {
  modelList: [],
  loading: false,
  error: null,
};

const modelSlice = createSlice({
  name: "modelData",
  initialState,
  reducers: {
    setModelList: (state, action: PayloadAction<any[]>) => {
      state.modelList = action.payload.map((item, index) => ({ ...item, id: item.id || index + 1 }));
      state.loading = false;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { setModelList, setLoading, setError } = modelSlice.actions;
export default modelSlice.reducer;