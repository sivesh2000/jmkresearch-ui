import { Dispatch } from "@reduxjs/toolkit";
import axiosInstance from "../axiosIntance";

export const usersToExcel = (dispatch: Dispatch) => async (filterForm: any) => {
  try {
    const params = new URLSearchParams(filterForm).toString();
    const response = await axiosInstance.get(`/users/export?${params}`, {
      responseType: "blob", // Important
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
