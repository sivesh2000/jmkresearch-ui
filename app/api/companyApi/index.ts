import axiosInstance from "../axiosIntance";
import {
  setCompanies,
  setLoading,
  setError,
  setFilterPlayers,
} from "@/app/redux/slices/companySlices/ActiveCompaniesSlice";
import { Dispatch } from "@reduxjs/toolkit";
import { parseQueryParams } from "@/app/utils/functions";

export const getAllActiveCompanies =
  (dispatch: Dispatch, filters: any) => async () => {
    try {
      dispatch(setLoading(true));
      const queryParam = parseQueryParams(filters, "");
      const url = "companies?" + queryParam;
      const response = await axiosInstance.get(url);
      // console.log(">>>",response)
      const companies = response?.data?.results || [];
      dispatch(setCompanies(companies));
      dispatch(setError(null));
    } catch (error) {
      console.error("Error fetching companies:", error);
      dispatch(setError("Failed to fetch companies"));
      dispatch(setCompanies([]));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };

export const getAllFilterPlayers = (dispatch: Dispatch) => async () => {
  try {
    dispatch(setLoading(true));
    const response = await axiosInstance.get(
      "configs?key=company_player_types"
    );
    const data = response?.data?.results[0]?.value || [];
    dispatch(setFilterPlayers(data));
    dispatch(setError(null));
  } catch (error) {
    console.error("Error fetching companies:", error);
    dispatch(setError("Failed to fetch companies"));
    throw error;
  } finally {
    dispatch(setLoading(false));
  }
};

export const editCompany = (dispatch: Dispatch) => async (id: number, data: any) => {
  try {
    console.log("id:", id, "formdata", data);
    let formData = { ...data };
    delete formData.id; // Remove id from formData
    dispatch(setLoading(true));
    const response = await axiosInstance.patch(`companies/${id}`, formData);
    dispatch(setError(null));
    // Refresh the companies list after edit
    await getAllActiveCompanies(dispatch, {})();
  } catch (error) {
    console.error("Error editing company:", error);
    dispatch(setError("Failed to edit company"));
    throw error;
  } finally {
    dispatch(setLoading(false));
  }
};

export const deleteCompany = (dispatch: Dispatch) => async (id: number) => {
  try {
    dispatch(setLoading(true));
    const response = await axiosInstance.delete(`companies/${id}`);
    dispatch(setError(null));
    // Refresh the companies list after deletion
    await getAllActiveCompanies(dispatch, {})();
  } catch (error) {
    console.error("Error deleting company:", error);
    dispatch(setError("Failed to delete company"));
    throw error;
  } finally {
    dispatch(setLoading(false));
  }
};
export const addCompany =
  (dispatch: Dispatch) =>
    async (formData: { name: string; isActive: boolean }) => {
      try {
        console.log("formdata", formData);
        dispatch(setLoading(true));
        const response = await axiosInstance.post("companies", formData);
        dispatch(setError(null));
        // Refresh the companies list after adding
        await getAllActiveCompanies(dispatch, {})();
      } catch (error) {
        console.error("Error adding company:", error);
        dispatch(setError("Failed to add company"));
        throw error;
      } finally {
        dispatch(setLoading(false));
      }
    };

export const getAllFilterPlayers1 = async (dispatch: Dispatch) => async () => {
  try {
    dispatch(setLoading(true));
    const response = await axiosInstance.get(
      "configs?key=company_player_types"
    );
    const data = response?.data?.results[0]?.value || [];
    dispatch(setFilterPlayers(data));
    dispatch(setError(null));
  } catch (error) {
    console.error("Error fetching company:", error);
    dispatch(setError("Failed to fetch company"));
    throw error;
  } finally {
    dispatch(setLoading(false));
  }
};
