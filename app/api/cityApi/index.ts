import axiosInstance from "../axiosIntance";
import { setLoading, setCities, setError } from "../../redux/slices/citySlices/citySlice";
import { Dispatch } from "@reduxjs/toolkit";

export const getCitiesById = (dispatch: Dispatch) => async (stateId: string) => {
    try {
        dispatch(setLoading(true));
        const response = await axiosInstance.get(`/cities?stateId=${stateId}`);
        dispatch(setCities(response.data));
        dispatch(setError(null));
    } catch (error: any) {
        dispatch(setError(error.message || 'Failed to fetch cities'));
        throw error;
    } finally {
        dispatch(setLoading(false));
        
    }
}