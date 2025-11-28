import axiosInstance from "../axiosIntance";
import { setLoading, setStates, setError } from "../../redux/slices/stateSlices/stateSlice";
import { Dispatch } from "@reduxjs/toolkit";

export const getAllStateData = (dispatch: Dispatch) => async () => {
    try {
        dispatch(setLoading(true));
        const response = await axiosInstance.get('/states');
        dispatch(setStates(response.data));
        dispatch(setError(null));
    } catch (error: any) {
        dispatch(setError(error.message || 'Failed to fetch states'));
        throw error;
    } finally {
        dispatch(setLoading(false));
    }
}