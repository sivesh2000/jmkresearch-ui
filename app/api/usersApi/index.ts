import axiosInstance from "@/app/api/axiosIntance";
import {
  setLoading,
  setUsers,
  setError,
} from "@/app/redux/slices/userSlices/allUserSlice";
import {
  setLoading as setDealerLoading,
  setUserDealerData,
  setError as setDealerError,
} from "@/app/redux/slices/userSlices/usersDealerSlice";
import {
  setLoading as setAssignRolesLoading,
  setError as setAssignRolesError,
  setAssignedRolesUserData,
} from "@/app/redux/slices/userSlices/allAssignRolesSlice";
import { AppDispatch } from "@/app/redux/store";
export const getAllUsers = async (
  dispatch: AppDispatch,
  params: Record<string, any> = {}
) => {
  try {
    dispatch(setLoading(true));
    const queryParams = Object.entries(params)
      .filter(
        ([_, value]) => value !== undefined && value !== null && value !== ""
      )
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`);

    const query = queryParams.length ? `?${queryParams.join("&")}` : "";
    const response = await axiosInstance.get(`users${query}`);
    dispatch(setUsers(response.data));
  } catch (error: any) {
    dispatch(setError(error.message || "Failed to fetch users"));
    throw error;
  }
};

export const updateUser = async (
  id: number | string,
  userData: any,
  userType: string,
  userId: string | undefined,
  dispatch: AppDispatch
) => {
  try {
    dispatch(setLoading(true));
    const response = await axiosInstance.patch(`users/${id}`, userData);
    console.log(response.data);

    return response.data;
  } catch (error: any) {
    dispatch(setError(error.message || "Failed to update user"));
    throw error;
  } finally {
    dispatch(setLoading(false));
  }
};
export const deleteUsers = async (
  id: number,
  userType: string,
  userId: string | undefined,
  dispatch: AppDispatch
) => {
  try {
    dispatch(setLoading(true));
    const response = await axiosInstance.delete(`users/${id}`);
    console.log(response.data);
    return response.data;
  } catch (error: any) {
    dispatch(setError(error.message || "Failed to delete user"));
    throw error;
  }
};
export const createUser = async (
  userData: any,
  userType: string,
  userId: string | undefined,
  dispatch: AppDispatch
) => {
  try {
    console.log(userData);
    dispatch(setLoading(true));
    const response = await axiosInstance.post("users", userData);
    console.log(response.data);
    return response.data;
  } catch (error: any) {
    dispatch(setError(error.message || "Failed to create user"));
    throw error;
  }
};
export const getAllUsersDealer = async (
  dispatch: AppDispatch,
  userType: string,
  userId: string | undefined
) => {
  try {
    console.log("function called");
    dispatch(setDealerLoading(true));
    const response = await axiosInstance.get(
      `users?userType=${userType}&mainDealerRef=${userId}&page=1&limit=10000`
    );
    console.log(response.data.results);
    dispatch(setUserDealerData(response.data.results));
  } catch (error: any) {
    dispatch(setDealerError(error.message || "Failed to fetch users"));
    throw error;
  }
};
export const getAllMasterDealers = async (
  dispatch: AppDispatch,
  userType: string
) => {
  try {
    console.log("function called");
    dispatch(setDealerLoading(true));
    const response = await axiosInstance.get(
      `users/?userType=${userType}&limit=1000&page=1`
    );
    console.log(response.data.results);
    dispatch(setUserDealerData(response.data.results));
  } catch (error: any) {
    dispatch(setDealerError(error.message || "Failed to fetch users"));
    throw error;
  }
};

export const assignRolesToUser = async (
  dispatch: AppDispatch,
  formData: any
) => {
  try {
    await axiosInstance.post(`/user-role/toggle`, formData);
  } catch (error) {
    throw error;
  }
};
export const getAllRolesUser = async (dispatch: AppDispatch, id: any) => {
  dispatch(setAssignRolesLoading(true));
  try {
    const response = await axiosInstance.get(
      `/user-role/${id}/roles-permissions`
    );

    // Update Redux state with the response data
    dispatch(setAssignedRolesUserData(response.data));
    dispatch(setAssignRolesError(null));
  } catch (error: any) {
    dispatch(
      setAssignRolesError(error.message || "Failed to fetch user roles")
    );
    throw error;
  } finally {
    dispatch(setAssignRolesLoading(false));
  }
};
