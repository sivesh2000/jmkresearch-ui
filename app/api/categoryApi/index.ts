import axiosInstance from "../axiosIntance"
import { setCategories, setLoading, setError, setFilterPlayers } from "@/app/redux/slices/categorySlices/ActiveCategoriesSlice"
import { Dispatch } from "@reduxjs/toolkit"

export const getAllActiveCategories = (dispatch: Dispatch) => async () => {
    try {
        dispatch(setLoading(true));
        const response = await axiosInstance.get('categories');
        const categories = response?.data?.results || []
        dispatch(setCategories(categories));
        dispatch(setError(null));
    } catch (error) {
        console.error('Error fetching categories:', error);
        dispatch(setError('Failed to fetch categories'));
        throw error;
    } finally {
        dispatch(setLoading(false));
    }
}

export const addCategory = (dispatch: Dispatch) => async (formData: { name: string; isActive: boolean }) => {
    try {
        console.log("formdata", formData);
        dispatch(setLoading(true));
        const response = await axiosInstance.post('categories', formData);
        dispatch(setError(null));
        // Refresh the categories list after adding
        await getAllActiveCategories(dispatch)();
    } catch (error) {
        console.error('Error adding category:', error);
        dispatch(setError('Failed to add category'));
        throw error;
    } finally {
        dispatch(setLoading(false));
    }
}

export const editCategory = (dispatch: Dispatch) => async (id: number, formData: { name: string; isActive: boolean }) => {
    try {
        console.log("id:", id, "formdata", formData);
        dispatch(setLoading(true));
        const response = await axiosInstance.put(`categories/${id}`, formData);
        dispatch(setError(null));
        // Refresh the categories list after edit
        await getAllActiveCategories(dispatch)();
    } catch (error) {
        console.error('Error editing category:', error);
        dispatch(setError('Failed to edit category'));
        throw error;
    } finally {
        dispatch(setLoading(false));
    }
}

export const deleteCategory = (dispatch: Dispatch) => async (id: number) => {
    try {
        dispatch(setLoading(true));
        const response = await axiosInstance.delete(`categories/${id}`);
        dispatch(setError(null));
        // Refresh the categories list after deletion
        await getAllActiveCategories(dispatch)();
    } catch (error) {
        console.error('Error deleting category:', error);
        dispatch(setError('Failed to delete category'));
        throw error;
    } finally {
        dispatch(setLoading(false));
    }
}

// export const getAllFilterPlayers = (dispatch: Dispatch) => async () => {
//     try {
//         dispatch(setLoading(true));
//         const response = await axiosInstance.get('configs?key=company_player_types');
//         const data = response?.data?.results[0]?.value || []
//         dispatch(setFilterPlayers(data));
//         dispatch(setError(null));
//     } catch (error) {
//         console.error('Error fetching companies:', error);
//         dispatch(setError('Failed to fetch companies'));
//         throw error;
//     } finally {
//         dispatch(setLoading(false));
//     }
// }