import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { helpdeskAPI } from "@/app/api/helpdeskApi";

// Type definitions
interface Ticket {
  id: string;
  _id?: string;
  ticketNumber: string;
  status: string;
  priority: string;
  issueType: string;
  description: string;
  email?: string;
  contactNumber?: string;
  createdBy: { name: string };
  createdAtFormatted: string;
  attachment1?: { name: string };
  attachment2?: { name: string };
  attachment3?: { name: string };
}

interface Response {
  id: string;
  message: string;
  createdBy: { name: string };
  createdAtFormatted: string;
  senderType: string;
  attachment1?: { name: string };
  attachment2?: { name: string };
  attachment3?: { name: string };
}

interface FetchTicketsParams {
  page?: number;
  limit?: number;
  status?: string;
  priority?: string;
}

// Define State Shape
export interface HelpdeskState {
  tickets: Ticket[];
  selectedTicket: Ticket | null;
  filters: { status: string; priority: string };
  responsesByTicket: Record<string, Response[]>;
  issueTypes: string[];
  loading: boolean;
  error: string | null;
}

// Initial State
const initialState: HelpdeskState = {
  tickets: [],
  selectedTicket: null,
  filters: { status: "", priority: "" },
  responsesByTicket: {},
  issueTypes: [],
  loading: false,
  error: null,
};

// Fetch all tickets
export const fetchTickets = createAsyncThunk<
  Ticket[],
  FetchTicketsParams,
  { rejectValue: string }
>("helpdesk/fetchTickets", async (params, { rejectWithValue }) => {
  try {
    const res = await helpdeskAPI.getTickets(params);
    const tickets = res?.data || res?.results || res || [];
    return Array.isArray(tickets) ? tickets : [];
  } catch (err: any) {
    const message =
      err.message || err.response?.data?.message || "Failed to load tickets";
    return rejectWithValue(message);
  }
});

// Create a new ticket
export const createTicket = createAsyncThunk<
  Ticket,
  any,
  { rejectValue: string; state: { helpdeskData: HelpdeskState } }
>("helpdesk/createTicket", async (payload, { rejectWithValue, getState }) => {
  try {
    // Validate required fields
    if (!payload.issueType?.trim()) {
      return rejectWithValue("Issue type is required");
    }
    if (!payload.description?.trim()) {
      return rejectWithValue("Description is required");
    }
    if (payload.description.length < 10) {
      return rejectWithValue("Description must be at least 10 characters");
    }
    if (payload.description.length > 300) {
      return rejectWithValue("Description cannot exceed 300 characters");
    }
    if (!payload.priority?.trim()) {
      return rejectWithValue("Priority is required");
    }

    // Validate priority values
    const validPriorities = ["Low", "Medium", "High", 'Critical'];
    if (!validPriorities.includes(payload.priority)) {
      return rejectWithValue("Invalid priority value");
    }

    // Use dynamic issue types from state
    const { issueTypes } = getState().helpdeskData;
    if (issueTypes.length > 0 && !issueTypes.includes(payload.issueType)) {
      return rejectWithValue("Invalid issue type");
    }

    const res = await helpdeskAPI.createTicket(payload);
    return res;
  } catch (err: any) {
    const message =
      err.message || err.response?.data?.message || "Failed to create ticket";
    return rejectWithValue(message);
  }
});

// Update ticket (status / priority)
export const updateTicketStatus = createAsyncThunk<
  Ticket,
  { ticketId: any; data: any },
  { rejectValue: string }
>(
  "helpdesk/updateTicketStatus",
  async ({ ticketId, data }, { rejectWithValue }) => {
    try {
      if (!ticketId?.trim()) {
        return rejectWithValue("Ticket ID is required");
      }

      // Validate status if provided
      if (data.status) {
        const validStatuses = [
          "Open",
          "In Progress",
          "Resolved",
          "Closed",
          "Reopen",
          "Escalate",
        ];
        if (!validStatuses.includes(data.status)) {
          return rejectWithValue("Invalid status value");
        }
      }

      // Validate priority if provided
      if (data.priority) {
        const validPriorities = ["Low", "Medium", "High", 'Critical'];
        if (!validPriorities.includes(data.priority)) {
          return rejectWithValue("Invalid priority value");
        }
      }

      const res = await helpdeskAPI.updateTicket(ticketId, data);
      return { ...res, id: ticketId };
    } catch (err: any) {
      const message =
        err.message || err.response?.data?.message || "Failed to update ticket";
      return rejectWithValue(message);
    }
  }
);

// Fetch a single ticket by ID
export const fetchTicketById = createAsyncThunk<
  Ticket,
  string,
  { rejectValue: string }
>("helpdesk/fetchTicketById", async (ticketId, { rejectWithValue }) => {
  try {
    if (!ticketId?.trim()) {
      return rejectWithValue("Ticket ID is required");
    }

    const res = await helpdeskAPI.getTicketById(ticketId);
    return res;
  } catch (err: any) {
    const message =
      err.message ||
      err.response?.data?.message ||
      "Failed to load ticket details";
    return rejectWithValue(message);
  }
});

// Fetch responses by ticket ID
export const fetchResponsesByTicket = createAsyncThunk<
  { ticketId: string; responses: Response[] },
  string,
  { rejectValue: string }
>("helpdesk/fetchResponsesByTicket", async (ticketId, { rejectWithValue }) => {
  try {
    if (!ticketId?.trim()) {
      return rejectWithValue("Ticket ID is required");
    }

    const res = await helpdeskAPI.getResponsesByTicket(ticketId);
    return { ticketId, responses: res };
  } catch (err: any) {
    const message =
      err.message || err.response?.data?.message || "Failed to load responses";
    return rejectWithValue(message);
  }
});

// Add a new response
export const addResponse = createAsyncThunk<
  { ticketId: string; response: Response; status?: string; priority?: string },
  {
    ticketId: string;
    message: string;
    status?: string;
    priority?: string;
    attachment1Base64?: string;
    attachment2Base64?: string;
    attachment3Base64?: string;
  },
  { rejectValue: string }
>("helpdesk/addResponse", async (payload, { rejectWithValue }) => {
  try {
    if (!payload.ticketId?.trim()) {
      return rejectWithValue("Ticket ID is required");
    }
    if (!payload.message?.trim()) {
      return rejectWithValue("Response message is required");
    }
    if (payload.message.length > 300) {
      return rejectWithValue("Response cannot exceed 300 characters");
    }

    // Validate status if provided
    if (payload.status) {
      const validStatuses = [
        "Open",
        "In Progress",
        "Resolved",
        "Closed",
        "Reopen",
        "Escalate",
      ];
      if (!validStatuses.includes(payload.status)) {
        return rejectWithValue("Invalid status value");
      }
    }

    // Validate priority if provided
    if (payload.priority) {
      const validPriorities = ["Low", "Medium", "High", 'Critical'];
      if (!validPriorities.includes(payload.priority)) {
        return rejectWithValue("Invalid priority value");
      }
    }

    const res = await helpdeskAPI.addResponse(payload);
    return {
      ticketId: payload.ticketId,
      response: res.response,
      status: payload.status,
      priority: payload.priority,
    };
  } catch (err: any) {
    const message =
      err.message || err.response?.data?.message || "Failed to add response";
    return rejectWithValue(message);
  }
});

const helpdeskSlice = createSlice({
  name: "helpdesk",
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.error = null; // Clear error when setting filters
    },

    clearTickets: (state) => {
      state.tickets = [];
      state.error = null;
    },

    clearSelectedTicket: (state) => {
      state.selectedTicket = null;
      state.error = null;
    },

    updateSelectedTicket: (state, action) => {
      if (state.selectedTicket) {
        state.selectedTicket = { ...state.selectedTicket, ...action.payload };
      }
    },

    clearError: (state) => {
      state.error = null;
    },

    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder
     
      // Fetch all tickets
      .addCase(fetchTickets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTickets.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.tickets = action.payload;
      })
      .addCase(fetchTickets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        // Don't clear tickets on error to maintain UI state
      })

      // Create ticket
      .addCase(createTicket.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTicket.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        // Add new ticket to the beginning of the array
        state.tickets.unshift(action.payload);
      })
      .addCase(createTicket.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update ticket
      .addCase(updateTicketStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTicketStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        const updatedTicket = action.payload;

        // Update selectedTicket if it matches
        if (
          state.selectedTicket &&
          (state.selectedTicket.id === updatedTicket.id ||
            state.selectedTicket._id === updatedTicket.id)
        ) {
          state.selectedTicket = { ...state.selectedTicket, ...updatedTicket };
        }

        // Update ticket in tickets array
        const ticketIndex = state.tickets.findIndex(
          (t) => (t.id || t._id) === updatedTicket.id
        );
        if (ticketIndex !== -1) {
          state.tickets[ticketIndex] = {
            ...state.tickets[ticketIndex],
            ...updatedTicket,
          };
        }
      })
      .addCase(updateTicketStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch single ticket
      .addCase(fetchTicketById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTicketById.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.selectedTicket = action.payload;
      })
      .addCase(fetchTicketById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        // Clear selected ticket on error
        state.selectedTicket = null;
      })

      // Fetch responses
      .addCase(fetchResponsesByTicket.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchResponsesByTicket.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        const { ticketId, responses } = action.payload;
        state.responsesByTicket[ticketId] = responses;
      })
      .addCase(fetchResponsesByTicket.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Add response
      .addCase(addResponse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addResponse.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        const { ticketId, response, status, priority } = action.payload;

        // Add response to the responses array
        if (!state.responsesByTicket[ticketId]) {
          state.responsesByTicket[ticketId] = [];
        }
        state.responsesByTicket[ticketId].push(response);

        // Update selectedTicket if it matches
        if (
          state.selectedTicket &&
          (state.selectedTicket.id === ticketId ||
            state.selectedTicket._id === ticketId)
        ) {
          if (status) state.selectedTicket.status = status;
          if (priority) state.selectedTicket.priority = priority;
        }

        // Update ticket in tickets array
        if (status || priority) {
          const ticketIndex = state.tickets.findIndex(
            (t) => (t.id || t._id) === ticketId
          );
          if (ticketIndex !== -1) {
            if (status) state.tickets[ticketIndex].status = status;
            if (priority) state.tickets[ticketIndex].priority = priority;
          }
        }
      })
      .addCase(addResponse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setFilters,
  clearTickets,
  clearSelectedTicket,
  updateSelectedTicket,
  clearError,
  setLoading,
} = helpdeskSlice.actions;

export default helpdeskSlice.reducer;
