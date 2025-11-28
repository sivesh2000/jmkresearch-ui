import { Dispatch } from "redux";
import {
  setRolesData,
  setLoading,
  setError,
} from "@/app/redux/slices/rolesPermissionsSlices/rolesSlice";
import {
  setPermissionsData,
  setDomainsData,
  setLoading as permissionLoading,
} from "@/app/redux/slices/rolesPermissionsSlices/permissionsSlice";
import { setAssignedPermissionsData } from "@/app/redux/slices/rolesPermissionsSlices/assignedPermissionsSlice";
import axiosInstance from "../../axiosIntance";
export const getAllRolesData = (dispatch: Dispatch) => {
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
      const url = queryString ? `roles?${queryString}` : "roles";

      const response = await axiosInstance.get(url);
      dispatch(setRolesData(response.data.data || []));
    } catch (error) {
      throw error;
    }
  };
};

export const getAllDomainsData = (dispatch: Dispatch) => async () => {
  try {
    const response = await axiosInstance.get(`permissions/domains/list`);
    dispatch(setDomainsData(response.data.data || []));
  } catch (error) {
    throw error;
  }
};
export const getAllPermissionsData = (dispatch: Dispatch) => {
  return async (...params: any[]) => {
    try {
      dispatch(permissionLoading(true)); // Use permissionLoading instead of setLoading

      // Get the first parameter as the roleId
      const roleId = params[0];

      if (!roleId) {
        throw new Error("Role ID is required");
      }

      // Construct URL with roleId directly in the path
      const url = `role-permission/${roleId}/available`;

      const response = await axiosInstance.get(url);

      dispatch(setPermissionsData(response.data || []));
      dispatch(permissionLoading(false));
      return response;
    } catch (error: any) {
      dispatch(permissionLoading(false));
      throw error;
    }
  };
};
export const getAllAssignedPermissionsData = (dispatch: Dispatch) => {
  return async (...params: any[]) => {
    try {
      // dispatch(permissionLoading(true)); // Use permissionLoading instead of setLoading

      // Get the first parameter as the roleId
      const roleId = params[0];

      if (!roleId) {
        throw new Error("Role ID is required");
      }

      // Construct URL with roleId directly in the path
      const url = `/role-permission/${roleId}/permissions`;

      const response = await axiosInstance.get(url);

      dispatch(setAssignedPermissionsData(response.data || []));
      // dispatch(permissionLoading(false));
      return response;
    } catch (error: any) {
      // dispatch(permissionLoading(false));
      throw error;
    }
  };
};
export const assignPermissionsToRole =(dispatch: Dispatch) => async (formData: any) => {
  try {
    await axiosInstance.post(`/role-permission/add`, formData);
  } catch (error) {
    throw error;
  }
};
export const removePermissionsFromRole =(dispatch: Dispatch) => async (formData: any) => {
  try {
    await axiosInstance.post(`/role-permission/remove`, formData);
  } catch (error) {
    throw error;
  }
};
