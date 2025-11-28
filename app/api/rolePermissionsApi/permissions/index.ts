import { Dispatch } from "@reduxjs/toolkit";
import axiosInstance from "../../axiosIntance";
import {
  setPermissionsData,
  setDomainsData,
  setLoading,
  setError,
} from "@/app/redux/slices/rolesPermissionsSlices/permissionsSlice";
export const getAllMasterData = async (dispatch: Dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await axiosInstance.get("master");
    //dispatch(setMasterData(response.data));
    // console.log(response.data);
    // return response.data;
  } catch (error: any) {
    dispatch(
      setError(error.message || "Failed to fetch master certificate data")
    );
    throw error;
  }
};

export const getAllDomainsData = (dispatch: Dispatch) => async () => {
  try {
    const response = await axiosInstance.get(`permissions/domains/list`);
    console.log("Domains Response:", response.data);
    dispatch(setDomainsData(response.data.data || []));
  } catch (error) {
    throw error;
  }
};

export const getAllPermissionsData = (dispatch: Dispatch) => {
  return async (...params: any[]) => {
    try {
      dispatch(setLoading(true));

      // Build query parameters from dynamic params
      const queryParams = new URLSearchParams();

      params.forEach((param, index) => {
        if (param !== undefined && param !== null) {
          if (typeof param === "object") {
            queryParams.append(`param${index}`, JSON.stringify(param));
          } else {
            queryParams.append(`param${index}`, String(param));
          }
        }
      });

      const queryString = queryParams.toString();
      const url = queryString ? `permissions?${queryString}` : "permissions";

      const response = await axiosInstance.get(url);

      dispatch(setPermissionsData(response.data || []));
      dispatch(setLoading(false));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      throw error;
    }
  };
};

export const createNewPermission =
  (dispatch: Dispatch) => async (data: any) => {
    try {
      dispatch(setLoading(true));

      const response = await axiosInstance.post(`permissions`, data);

      dispatch(setLoading(false));
      return response;
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "An error occurred while creating permission";
      dispatch(setError(errorMessage));
      dispatch(setLoading(false));
      throw error;
    }
  };

export const updatePermission =
  (dispatch: Dispatch) => async (id: string, data: any) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));

      const response = await axiosInstance.patch(`permissions/${id}`, data);

      dispatch(setLoading(false));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      throw error;
    }
  };

export const deletePermission = (dispatch: Dispatch) => async (id: string) => {
  try {
    dispatch(setLoading(true));
    dispatch(setError(null));

    const response = await axiosInstance.delete(`permissions/${id}`);

    dispatch(setLoading(false));
    return response;
  } catch (error: any) {
    dispatch(setLoading(false));
    throw error;
  }
};
