import axiosInstance from "../axiosIntance";
import { setDistrictData } from "@/app/redux/slices/districtSlice"; // <-- import the setter
import { AppDispatch } from "@/app/redux/store";
export const getAllDistrictByStateId = async (dispatch: AppDispatch, stateId: string) => {
  try {
    const response = await axiosInstance.get(`/districts?stateId=${stateId}`);
    dispatch(setDistrictData(response.data)); // <-- update the redux state
  } catch (error) {
    console.error("Error fetching districts:", error);
    throw error
  }
};
