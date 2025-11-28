import axiosInstance from "../axiosIntance";
import { setModelList, setLoading, setError } from "../../redux/slices/modelSlices/modelSlice";
import { setMakes as setFilterMakes, setLoading as setFilterLoading, setError as setFilterError } from "../../redux/slices/modelSlices/modelFilterSlice";
import { setMakes} from "@/app/redux/slices/makeSlices/ActiveMakesSlice"
export const getAllModel=async(dispatch: any)=>{
    try {
        dispatch(setLoading(true));
        const response=await axiosInstance.get('models')
        dispatch(setModelList(response.data));
        return response.data;
    } catch (error: any) {
        dispatch(setError(error.message || 'Failed to fetch Model data'));
        throw error;
    }
}

export const updateModel=async(id: string | number, formData: any, dispatch: any)=>{
    try {
        dispatch(setLoading(true));
        
        const apiData = {
            makeId: formData.make_name,
            name: formData.model_name.toUpperCase(),
        };
        
        const response=await axiosInstance.put(`models/${id}`, apiData);
        await getAllModel(dispatch);
        return response.data;
    } catch (error: any) {
        dispatch(setError(error.message || 'Failed to update Model data'));
        throw error;
    }
}

export const deleteModel=async(id: string | number, dispatch: any)=>{
    try {
        dispatch(setLoading(true));
        const response=await axiosInstance.delete(`model/${id}`);
        await getAllModel(dispatch);
        return response.data;
    } catch (error: any) {
        dispatch(setError(error.message || 'Failed to delete Model data'));
        throw error;
    }
}

export const addModel=async(formData: any, dispatch: any)=>{
    try {
        dispatch(setLoading(true));

        const apiData = {
            makeId: formData.make_name,
            name: formData.model_name.toUpperCase(),
        };
        
        const response=await axiosInstance.post('/models', apiData);
        await getAllModel(dispatch);
        return response.data;
    } catch (error: any) {
        dispatch(setError(error.message || 'Failed to add Model data'));
        throw error;
    }
}
export const getAllFilterMakes = async(dispatch: any) => {
    try {
        dispatch(setFilterLoading(true));
        const response = await axiosInstance.get('makes');
        dispatch(setFilterMakes(response.data));
        dispatch(setFilterError(null));
    } catch (error) {
        console.error('Error fetching makes:', error);
        dispatch(setFilterError('Failed to fetch makes'));
        throw error;
    } finally {
        dispatch(setFilterLoading(false));
    }
}
export const getFilterModelById = (dispatch: any)=> async(id: string | number) => {
    try {
        dispatch(setFilterLoading(true));
        const response = await axiosInstance.get(`models?makeId=${id}`);
        dispatch(setModelList(response.data));;
        dispatch(setFilterError(null));
    } catch (error) {
        console.error('Error fetching makes:', error);
        dispatch(setFilterError('Failed to fetch makes'));
        throw error;
    } finally {
        dispatch(setFilterLoading(false));
    }
}

export const getAllActiveMakes = (dispatch: any) => async () => {
    try {
        // dispatch(setLoading(true));
        const response = await axiosInstance.get('makes');
        dispatch(setMakes(response.data));
    } catch (error) {
        console.error('Error fetching makes:', error);
        dispatch(setError('Failed to fetch makes'));
        throw error;
    }
}