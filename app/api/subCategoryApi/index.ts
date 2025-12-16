import axiosInstance from "../axiosIntance"
import { setSubCategories, setLoading, setError, setFilterPlayers } from "@/app/redux/slices/subCategorySlices/ActiveSubCategoriesSlice"
import { setCategories } from "@/app/redux/slices/categorySlices/ActiveCategoriesSlice"
import { Dispatch } from "@reduxjs/toolkit"
import { parseQueryParams } from "@/app/utils/functions"

export const getAllActiveSubCategories = (dispatch: Dispatch, filters: any) => async () => {
    try {
        dispatch(setLoading(true));
        const queryParam = parseQueryParams(filters, '');
        const url = 'categories?' + queryParam;
        const response = await axiosInstance.get(url);

        const categories = response?.data?.results || []
        // console.log("subCategories", subCategories);
        // const filterSubCategories = subCategories.filter((subCategory: any) => subCategory.parentId != null);
        // const parentCategories = categories
        //     .filter((category: any) => category.parentId === null)
        //     .reduce((acc: any, category: any) => {
        //         acc[category.id] = category.name;
        //         return acc;
        //     }, {});

        // Step 2: Filter subcategories that have a parentId and add subCatName
        const filterSubCategories = categories.filter((subCategory: any) => subCategory.parentId != null);
        dispatch(setSubCategories(filterSubCategories));
        dispatch(setError(null));
    } catch (error) {
        console.error('Error fetching sub categories:', error);
        dispatch(setError('Failed to fetch sub categories'));
        throw error;
    } finally {
        dispatch(setLoading(false));
    }
}

export const addSubCategory = (dispatch: Dispatch) => async (formData: { name: string; isActive: boolean }) => {
    try {
        console.log("formdata", formData);
        dispatch(setLoading(true));
        const response = await axiosInstance.post('categories', formData);
        dispatch(setError(null));
        // Refresh the sub categories list after adding
        await getAllActiveSubCategories(dispatch, {})();
    } catch (error) {
        console.error('Error adding sub category:', error);
        dispatch(setError('Failed to add sub category'));
        throw error;
    } finally {
        dispatch(setLoading(false));
    }
}

export const editSubCategory = (dispatch: Dispatch) => async (id: number, formData: { parentId: string; name: string; isActive: boolean }) => {
    try {
        console.log("id:", id, "formdata", formData);
        dispatch(setLoading(true));
        const response = await axiosInstance.patch(`categories/${id}`, formData);
        dispatch(setError(null));
        // Refresh the sub categories list after edit
        await getAllActiveSubCategories(dispatch, {})();
    } catch (error) {
        console.error('Error editing sub category:', error);
        dispatch(setError('Failed to edit sub category'));
        throw error;
    } finally {
        dispatch(setLoading(false));
    }
}

export const deleteSubCategory = (dispatch: Dispatch) => async (id: number) => {
    try {
        dispatch(setLoading(true));
        const response = await axiosInstance.delete(`categories/${id}`);
        dispatch(setError(null));
        // Refresh the sub categories list after deletion
        await getAllActiveSubCategories(dispatch, {})();
    } catch (error) {
        console.error('Error deleting sub category:', error);
        dispatch(setError('Failed to delete sub category'));
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