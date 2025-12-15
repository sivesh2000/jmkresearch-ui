import { Dispatch } from "@reduxjs/toolkit";
//import { setLoading, setMasterData, setError } from "../../redux/slices/certificateSlices/certificateMasterSlice";
import axiosInstance from "../axiosIntance";
import { setRolesData } from "@/app/redux/slices/rolesPermissionsSlices/rolesSlice";
import {
  setLoading as setHelpDeskLoading,
  setError as setHelpDeskError,
  setHelpdeskMappingData,
} from "@/app/redux/slices/helpDeskMappingSlices/helpDeskMappingSlice";

export const getAllMasterData = async (dispatch: Dispatch) => {
  try {
    //dispatch(setLoading(true));
    const response = await axiosInstance.get("master");
    //dispatch(setMasterData(response.data));
    // console.log(response.data);
    // return response.data;
  } catch (error: any) {
    //dispatch(setError(error.message || 'Failed to fetch master certificate data'));
    throw error;
  }
};

export const getAllRolesData = async (dispatch: Dispatch) => {
  try {
    const response = await axiosInstance.get("roles");
    dispatch(setRolesData(response.data.data || []));
  } catch (error) {
    throw error;
  }
};

export const getAllHelpDeskMappingData = (dispatch: Dispatch) => {
  return async (params: Record<string, any> = {}) => {
    dispatch(setHelpDeskLoading(true));
    try {
      const queryParams: string[] = [];
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.push(`${key}=${encodeURIComponent(value)}`);
        }
      });
      const query = queryParams.length ? `?${queryParams.join("&")}` : "";
      const queryString = query.toString();
      const url = queryString
        ? `help-desk-mapping${query}`
        : "help-desk-mapping";

      const response = await axiosInstance.get(url);
      console.log("Help Desk Mapping Response:", response.data);

      // Update Redux state with the whole response object
      dispatch(setHelpdeskMappingData(response.data));
      dispatch(setHelpDeskError(null));

      return response.data;
    } catch (error: any) {
      console.error("Error fetching help desk mapping data:", error);
      dispatch(
        setHelpDeskError(
          error.message || "Failed to fetch help desk mapping data"
        )
      );
      throw error;
    } finally {
      dispatch(setHelpDeskLoading(false));
    }
  };
};

export const createmapping = async (dispatch: Dispatch, formData: any) => {
  dispatch(setHelpDeskLoading(true));
  try {
    const response = await axiosInstance.post(`/help-desk-mapping`, formData);
    console.log("Create mapping response:", response.data);

    // Clear error on success
    dispatch(setHelpDeskError(null));

    return response.data;
  } catch (error: any) {
    console.error("Error creating mapping:", error);
    dispatch(setHelpDeskError(error.message || "Failed to create mapping"));
    throw error;
  } finally {
    dispatch(setHelpDeskLoading(false));
  }
};
