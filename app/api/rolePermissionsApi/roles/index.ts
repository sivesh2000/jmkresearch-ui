import { Dispatch } from "@reduxjs/toolkit";
import axiosInstance from "../../axiosIntance";
import { setRolesData, setLoading, setError } from "@/app/redux/slices/rolesPermissionsSlices/rolesSlice";
export const getAllRolesData = (dispatch: Dispatch) => {
    return async (...params: any[]) => {
        try {
             dispatch(setLoading(true));
            // Build query parameters from dynamic params
            const queryParams = new URLSearchParams();
            
            params.forEach((param, index) => {
                if (param !== undefined && param !== null) {
                    if (typeof param === 'object') {
                        queryParams.append(`param${index}`, JSON.stringify(param));
                    } else {
                        queryParams.append(`param${index}`, String(param));
                    }
                }
            });

            const queryString = queryParams.toString();
            const url = queryString ? `roles?${queryString}` : 'roles';
            
            const response = await axiosInstance.get(url);
            dispatch(setRolesData(response.data.data || []));
        } catch (error) {
            throw error;
        }
    };
};

export const createNewRole = (dispatch: Dispatch) => async (data: any) => {
    try {
        await axiosInstance.post(`roles`, data);
    } catch (error) {
        throw error;
    }
};

export const updateRoleData = (dispatch: Dispatch) => async (id: string, data: any) => {
    try {
        await axiosInstance.patch(`roles/${id}`, data);
    } catch (error) {
        throw error;
    }
};