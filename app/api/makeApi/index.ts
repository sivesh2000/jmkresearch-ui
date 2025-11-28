import axiosInstance from "../axiosIntance"
import { setMakes, setLoading, setError } from "@/app/redux/slices/makeSlices/ActiveMakesSlice"
import { Dispatch } from "@reduxjs/toolkit"

export const getAllActiveMakes = (dispatch: Dispatch) => async () => {
    try {
        dispatch(setLoading(true));
        const response = await axiosInstance.get('makes');
        dispatch(setMakes(response.data));
        dispatch(setError(null));
    } catch (error) {
        console.error('Error fetching makes:', error);
        dispatch(setError('Failed to fetch makes'));
        throw error;
    } finally {
        dispatch(setLoading(false));
    }
}
export const editMake = (dispatch: Dispatch) => async (id: number, formData: { name: string; isActive: boolean }) => {
    try {
        console.log("id:",id,"formdata",formData);
        dispatch(setLoading(true));
        const response = await axiosInstance.put(`makes/${id}`, formData);
        dispatch(setError(null));
        // Refresh the makes list after edit
        await getAllActiveMakes(dispatch)();
    } catch (error) {
        console.error('Error editing make:', error);
        dispatch(setError('Failed to edit make'));
        throw error;
    } finally {
        dispatch(setLoading(false));
    }
}

export const deleteMake = (dispatch: Dispatch) => async (id: number) => {
    try {
        dispatch(setLoading(true));
        const response = await axiosInstance.delete(`makes/${id}`);
        dispatch(setError(null));
        // Refresh the makes list after deletion
        await getAllActiveMakes(dispatch)();
    } catch (error) {
        console.error('Error deleting make:', error);
        dispatch(setError('Failed to delete make'));
        throw error;
    } finally {
        dispatch(setLoading(false));
    }
}
export const addMake = (dispatch: Dispatch) => async (formData: { name: string; isActive: boolean }) => {
    try {
        console.log("formdata", formData);
        dispatch(setLoading(true));
        const response = await axiosInstance.post('makes', formData);
        dispatch(setError(null));
        // Refresh the makes list after adding
        await getAllActiveMakes(dispatch)();
    } catch (error) {
        console.error('Error adding make:', error);
        dispatch(setError('Failed to add make'));
        throw error;
    } finally {
        dispatch(setLoading(false));
    }
}