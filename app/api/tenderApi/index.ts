import axiosInstance from "../axiosIntance";
import {
  setTenders,
  setLoading,
  setError,
  setFilterPlayers,
} from "@/app/redux/slices/tenderSlice/ActiveTenderSlice";
import { Dispatch } from "@reduxjs/toolkit";
import { parseQueryParams } from "@/app/utils/functions";

export const getAllActiveTenders =
  (dispatch: Dispatch, filters: any) => async () => {
    try {
      dispatch(setLoading(true));
      const queryParam = parseQueryParams(filters, "");
      const url = "tenders?" + queryParam;
      const response = await axiosInstance.get(url);
      console.log(">>>", response);
      const tenders = response?.data?.results || [];
      dispatch(setTenders(tenders));
      dispatch(setError(null));
    } catch (error) {
      console.error("Error fetching tenders:", error);
      dispatch(setError("Failed to fetch tenders"));
      dispatch(setTenders([]));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };

export const getAllFilterPlayers = (dispatch: Dispatch) => async () => {
  try {
    dispatch(setLoading(true));
    const response = await axiosInstance.get("configs?key=tender_player_types");
    const data = response?.data?.results[0]?.value || [];
    dispatch(setFilterPlayers(data));
    dispatch(setError(null));
  } catch (error) {
    console.error("Error fetching tenders:", error);
    dispatch(setError("Failed to fetch tenders"));
    throw error;
  } finally {
    dispatch(setLoading(false));
  }
};

export const editTender =
  (dispatch: Dispatch) =>
  async (id: number, formData: { name: string; isActive: boolean }) => {
    try {
      console.log("id:", id, "formdata", formData);
      dispatch(setLoading(true));
      const response = await axiosInstance.put(`tenders/${id}`, formData);
      dispatch(setError(null));
      // Refresh the tenders list after edit
      await getAllActiveTenders(dispatch, {})();
    } catch (error) {
      console.error("Error editing tender:", error);
      dispatch(setError("Failed to edit tender"));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };

export const deleteTender = (dispatch: Dispatch) => async (id: number) => {
  try {
    dispatch(setLoading(true));
    const response = await axiosInstance.delete(`tenders/${id}`);
    dispatch(setError(null));
    // Refresh the tenders list after deletion
    await getAllActiveTenders(dispatch, {})();
  } catch (error) {
    console.error("Error deleting tender:", error);
    dispatch(setError("Failed to delete tender"));
    throw error;
  } finally {
    dispatch(setLoading(false));
  }
};
export const addTender =
  (dispatch: Dispatch) =>
  async (formData: { name: string; isActive: boolean }) => {
    try {
      console.log("formdata", formData);
      dispatch(setLoading(true));
      const response = await axiosInstance.post("tenders", formData);
      dispatch(setError(null));
      // Refresh the tenders list after adding
      await getAllActiveTenders(dispatch, {})();
    } catch (error) {
      console.error("Error adding tender:", error);
      dispatch(setError("Failed to add tender"));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };

export const getAllFilterPlayers1 = async (dispatch: Dispatch) => async () => {
  try {
    dispatch(setLoading(true));
    const response = await axiosInstance.get("configs?key=tender_player_types");
    const data = response?.data?.results[0]?.value || [];
    dispatch(setFilterPlayers(data));
    dispatch(setError(null));
  } catch (error) {
    console.error("Error fetching tender:", error);
    dispatch(setError("Failed to fetch tender"));
    throw error;
  } finally {
    dispatch(setLoading(false));
  }
};
