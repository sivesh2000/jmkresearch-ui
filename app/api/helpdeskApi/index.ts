import axiosInstance from "@/app/api/axiosIntance";
import { toast } from "react-toastify";
import { Dispatch } from "@reduxjs/toolkit";

const baseUrl = "tickets";
const responseUrl = "responses";

export const helpdeskAPI = {
  // Create a new ticket
  createTicket: async (data: any) => {
    try {
      const maxFileSize = 10 * 1024 * 1024; // 10MB

      ["attachment1Base64", "attachment2Base64", "attachment3Base64"].forEach(
        (key) => {
          if (data[key]) {
            const size = data[key].length * 0.75;
            if (size > maxFileSize) {
              throw new Error(`${key} too large — max 10MB allowed`);
            }
          }
        }
      );

      const res = await axiosInstance.post(baseUrl, data);
      return res.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to create ticket";
      throw new Error(message);
    }
  },

  // Fetch tickets list (with optional filters)
  getTickets: async (params?: Record<string, any>) => {
    try {
      const res = await axiosInstance.get(baseUrl, { params });
      return res.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Failed to fetch tickets";
      throw new Error(message);
    }
  },

  // Fetch single ticket by ID
  getTicketById: async (id: string) => {
    try {
      if (!id) throw new Error("Ticket ID is required");
      const res = await axiosInstance.get(`${baseUrl}/${id}`);
      return res.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Failed to fetch ticket details";
      throw new Error(message);
    }
  },

  // Update ticket (status, priority etc.)
  updateTicket: async (id: string, data: any) => {
    try {
      if (!id) throw new Error("Ticket ID is required");
      const res = await axiosInstance.patch(`${baseUrl}/${id}`, data);
      return res.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Failed to update ticket";
      throw new Error(message);
    }
  },

  // Add response/comment to a ticket with attachments
  addResponse: async (data: any) => {
    try {
      if (!data.ticketId) throw new Error("Ticket ID is required");
      if (!data.message?.trim())
        throw new Error("Response message is required");

      // Validate attachments size
      const maxFileSize = 10 * 1024 * 1024; // 10MB
      ["attachment1Base64", "attachment2Base64", "attachment3Base64"].forEach(
        (key) => {
          if (data[key]) {
            const size = data[key].length * 0.75;
            if (size > maxFileSize) {
              throw new Error(`${key} too large — max 10MB allowed`);
            }
          }
        }
      );

      const res = await axiosInstance.post(responseUrl, data);
      return res.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to add response";
      throw new Error(message);
    }
  },

  // Download response attachment
  downloadResponseAttachment: async (responseId: string, index: number) => {
    try {
      if (!responseId) throw new Error("Response ID is required");
      if (!index || index < 1 || index > 3)
        throw new Error("Invalid attachment index");

      const res = await axiosInstance.get(
        `${responseUrl}/${responseId}/attachment/${index}`,
        { responseType: "blob" }
      );
      return res;
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Failed to download attachment";
      throw new Error(message);
    }
  },

  // Get all responses for a ticket
  getResponsesByTicket: async (ticketId: string) => {
    try {
      if (!ticketId) throw new Error("Ticket ID is required");
      const res = await axiosInstance.get(`${responseUrl}/ticket/${ticketId}`);
      return res.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Failed to fetch responses";
      throw new Error(message);
    }
  },

  // Fetch all admin/support users
  getAdminUsers: async () => {
    try {
      const res = await axiosInstance.get("/users", {
        params: { page: 1, limit: 10000 },
      });
      return res.data?.results || res.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Failed to fetch admin users";
      throw new Error(message);
    }
  },

  // Download ticket attachment
  downloadAttachment: async (ticketId: string, index: number) => {
    try {
      if (!ticketId) throw new Error("Ticket ID is required");
      if (!index || index < 1 || index > 3)
        throw new Error("Invalid attachment index");

      const res = await axiosInstance.get(
        `${baseUrl}/${ticketId}/attachment/${index}`,
        { responseType: "blob" }
      );
      return res;
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Failed to download attachment";
      throw new Error(message);
    }
  },
};

// Get available issue types
export const getAllMasterData = async (dispatch: Dispatch) => {
  try {
    //dispatch(setLoading(true));
    const response = await axiosInstance.get("master");
    //dispatch(setMasterData(response.data));
    // console.log(response.data);
    // return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message || "Failed to fetch issue types";
    throw new Error(message);
  }
};
