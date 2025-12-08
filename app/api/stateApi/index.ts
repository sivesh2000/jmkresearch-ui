import axiosInstance from "../axiosIntance";
import { setLoading, setStates, setError } from "../../redux/slices/stateSlices/stateSlice";
import { Dispatch } from "@reduxjs/toolkit";

// export const getAllStateData = (dispatch: Dispatch) => async () => {
//     try {
//         dispatch(setLoading(true));
//         const response = await axiosInstance.get('/states');
//         dispatch(setStates(response.data));
//         dispatch(setError(null));
//     } catch (error: any) {
//         dispatch(setError(error.message || 'Failed to fetch states'));
//         throw error;
//     } finally {
//         dispatch(setLoading(false));
//     }
// }

export const getAllActiveStates = (dispatch: Dispatch) => async () => {
    try {
        dispatch(setLoading(true));
        const response = await axiosInstance.get('states');
        const states = response?.data?.results || []
        dispatch(setStates(states));
        dispatch(setError(null));
    } catch (error) {
        console.error('Error fetching states:', error);
        dispatch(setError('Failed to fetch states'));
        throw error;
    } finally {
        dispatch(setLoading(false));
    }
}

export const addState = (dispatch: Dispatch) => async (formData: { name: string; isActive: boolean }) => {
    try {
        console.log("formdata", formData);
        dispatch(setLoading(true));
        const response = await axiosInstance.post('states', formData);
        dispatch(setError(null));
        // Refresh the states list after adding
        await getAllActiveStates(dispatch)();
    } catch (error) {
        console.error('Error adding state:', error);
        dispatch(setError('Failed to add state'));
        throw error;
    } finally {
        dispatch(setLoading(false));
    }
}

export const editState = (dispatch: Dispatch) => async (id: number, formData: { name: string; isActive: boolean }) => {
    try {
        console.log("id:", id, "formdata", formData);
        dispatch(setLoading(true));
        const response = await axiosInstance.put(`states/${id}`, formData);
        dispatch(setError(null));
        // Refresh the states list after edit
        await getAllActiveStates(dispatch)();
    } catch (error) {
        console.error('Error editing state:', error);
        dispatch(setError('Failed to edit state'));
        throw error;
    } finally {
        dispatch(setLoading(false));
    }
}

export const deleteState = (dispatch: Dispatch) => async (id: number) => {
    try {
        dispatch(setLoading(true));
        const response = await axiosInstance.delete(`states/${id}`);
        dispatch(setError(null));
        // Refresh the states list after deletion
        await getAllActiveStates(dispatch)();
    } catch (error) {
        console.error('Error deleting state:', error);
        dispatch(setError('Failed to delete state'));
        throw error;
    } finally {
        dispatch(setLoading(false));
    }
}