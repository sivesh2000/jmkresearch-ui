"use client";
import React, { useEffect, useState, useCallback, memo } from "react";
import {
  Box,
  Button,
  IconButton,
  Typography,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem as SelectItem,
  CircularProgress,
  Fade,
  Modal,
  Card,
  CardContent,
  Paper,
  Menu,
  MenuItem,
  TextField,
  Drawer,
  Chip,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
} from "@mui/material";

import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import CloseIcon from "@mui/icons-material/Close";
import { PageContainer } from "@toolpad/core";
import { useDispatch, useSelector } from "react-redux";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import {
  fetchTickets,
  setFilters,
  createTicket,
  addResponse,
  fetchTicketById,
  fetchResponsesByTicket,
  updateSelectedTicket,
  updateTicketStatus,
} from "@/app/redux/slices/helpdeskSlices/helpdeskSlice";

import { helpdeskAPI, getAllMasterData } from "@/app/api/helpdeskApi";
import type { AppDispatch, RootState } from "@/app/redux/store";
import "../../../global.css";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { PermissionCheck } from "@/app/components/PermissionCheck";
import { HELP_DESK_ADD, HELP_DESK_EDIT } from "@/app/utils/permissionsActions";

const statusOptions = [
  "Open",
  "In Progress",
  "Resolved",
  "Closed",
  "Reopen",
  "Escalate",
];
const priorityOptions = ["Low", "Medium", "High", "Critical"];

const validateField = (field: string, value: string) => {
  const errors: Record<string, string> = {};

  if (field === "issueType" && !value?.trim()) {
    errors.issueType = "Category is required";
  }
  if (field === "subCategory" && !value?.trim()) {
    errors.subCategory = "Sub Category is required";
  }
  if (field === "priority" && !value?.trim()) {
    errors.priority = "Priority is required";
  }
  if (field === "description") {
    if (!value?.trim()) {
      errors.description = "Description is required";
    } else if (value.length < 10) {
      errors.description = "Description must be at least 10 characters";
    } else if (value.length > 300) {
      errors.description = "Description cannot exceed 300 characters";
    }
  }

  return errors;
};

// Form validation functions
const validateForm = (form: any) => {
  let allErrors: Record<string, string> = {};

  if (!form.issueType?.trim()) {
    allErrors.issueType = "Category is required";
  }
  if (!form.subCategory?.trim()) {
    allErrors.subCategory = "Sub Category is required";
  }
  if (!form.priority?.trim()) {
    allErrors.priority = "Priority is required";
  }
  if (!form.description?.trim()) {
    allErrors.description = "Description is required";
  } else if (form.description.length < 10) {
    allErrors.description = "Description must be at least 10 characters";
  } else if (form.description.length > 300) {
    allErrors.description = "Description cannot exceed 300 characters";
  }

  return allErrors;
};
const validateFileSize = (base64String: string, maxSizeMB: number = 10) => {
  if (!base64String) return true;
  const sizeInBytes = base64String.length * 0.75;
  const sizeInMB = sizeInBytes / (1024 * 1024);
  return sizeInMB <= maxSizeMB;
};

const Page = memo(function Page() {
  const dispatch = useDispatch<AppDispatch>();
  const {
    tickets,
    filters,
    loading,
    selectedTicket,
    responsesByTicket,
    issueTypes,
  } = useSelector((state: RootState) => state.helpdeskData) as {
    tickets: any[];
    filters: any;
    loading: boolean;
    selectedTicket: any;
    responsesByTicket: any;
    issueTypes: string[];
  };
  // const { masterData } = useSelector(
  //   (state: RootState) => state.certificateMasterData
  // );

  // useEffect(() => {
  //   console.log(masterData);
  //   console.log("Issue categories:", masterData?.issueCategory); // Add this line
  // }, [masterData]);

  // Safe fallback for issueTypes
  const safeIssueTypes = issueTypes || [];

  const { data: session } = useSession();
  const role = session?.user?.userType || "";

  // State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [descriptionCharCount, setDescriptionCharCount] = useState(0);
  const [responseCharCount, setResponseCharCount] = useState(0);
  const [visibleAttachments, setVisibleAttachments] = useState(1);
  const [issueTypesLoading, setIssueTypesLoading] = useState(true);

  const [responseAttachments, setResponseAttachments] = useState<
    (File | null)[]
  >([null, null, null]);
  const [visibleResponseAttachments, setVisibleResponseAttachments] =
    useState(1);

  // Modals & Drawers
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState({
    status: "",
    priority: "",
  });
  const [showReopenForm, setShowReopenForm] = useState(false);

  // Forms
  const [form, setForm] = useState({
    issueType: "",
    issue: "",
    description: "",
    priority: "",
    subCategory: "",
    email: "",
    contactNumber: "",
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [attachments, setAttachments] = useState<(File | null)[]>([
    null,
    null,
    null,
  ]);

  const [editorValue, setEditorValue] = useState<string>("");

  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [comments, setComments] = useState("");
  type SubCategory = { id: string | number; name: string; priority?: string };

  const [subCategoryArray, setSubCategory] = useState<SubCategory[]>([]);

  // Fetch Tickets with error handling
  const fetchTicketsData = useCallback(async () => {
    try {
      await dispatch(fetchTickets({ page, limit, ...filters })).unwrap();
    } catch (error: any) {
      console.error("Failed to load tickets:", error);
    }
  }, [dispatch, page, limit, filters]);

  // Load tickets
  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      if (mounted) {
        try {
          await fetchTicketsData();
        } catch (error) {
          console.error("Error loading tickets:", error);
        }
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [fetchTicketsData]);

  // Load issue types
  useEffect(() => {
    let mounted = true;

    const loadIssueTypes = async () => {
      if (mounted) {
        try {
          // Temporary fallback if fetchIssueTypes is not available

          await getAllMasterData(dispatch);

          // You can set a fallback array here if needed

          if (mounted) setIssueTypesLoading(false);
        } catch (error) {
          console.error("Error loading issue types:", error);
          if (mounted) setIssueTypesLoading(false);
        }
      }
    };

    loadIssueTypes();

    return () => {
      mounted = false;
    };
  }, [dispatch]);

  useEffect(() => {
    if (selectedTicket) {
      if (role === "super_admin" || role === "custom") {
        setStatus(selectedTicket.status || "");
      } else {
        if (
          selectedTicket.status === "Open" ||
          selectedTicket.status === "Reopen"
        ) {
          setStatus("Resolved");
        } else if (selectedTicket.status === "Resolved") {
          setStatus("Closed");
        } else if (selectedTicket.status === "In Progress") {
          setStatus("In Progress");
        } else if (selectedTicket.status === "Escalate") {
          setStatus("Escalate");
        }
      }
    }
  }, [selectedTicket, role]);

  //  Helpers
  const toBase64 = (f: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(f);
      reader.onload = () => {
        const result = reader.result;
        if (typeof result === "string" && result.startsWith("data:")) {
          resolve(result);
        } else {
          resolve(`data:${f.type};base64,${btoa(String(result))}`);
        }
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const validateField = (field: string, value: string) => {
    const errors: Record<string, string> = {};

    if (field === "issueType" && !value?.trim()) {
      errors.issueType = "Category is required";
    }
    if (field === "subCategory" && !value?.trim()) {
      errors.subCategory = "Sub Category is required";
    }
    if (field === "priority" && !value?.trim()) {
      errors.priority = "Priority is required";
    }
    if (field === "description") {
      if (!value?.trim()) {
        errors.description = "Description is required";
      } else if (value.length < 10) {
        errors.description = "Description must be at least 10 characters";
      } else if (value.length > 300) {
        errors.description = "Description cannot exceed 300 characters";
      }
    }

    return errors;
  };
  // Enhanced form submission with validation
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    try {
      const errors = validateForm(form);
      setFormErrors(errors);

      if (Object.keys(errors).length > 0) {
        toast.error("Please fix the form errors");
        return;
      }

      const payload: any = {
        issueType: form.issueType.trim(),
        subCategory: form.subCategory.trim(),
        description: form.description.trim(),
        priority: form.priority,
        email: form.email.trim(),
        contactNumber: form.contactNumber.trim(),
      };

      const attachmentPromises = attachments.map(async (file, index) => {
        if (!file) return null;

        try {
          const base64 = await toBase64(file);
          if (!validateFileSize(base64)) {
            throw new Error(`Attachment ${index + 1} exceeds 10MB limit`);
          }
          return base64;
        } catch (error) {
          throw new Error(
            `Failed to process attachment ${index + 1}: ${error}`
          );
        }
      });

      const processedAttachments = await Promise.all(attachmentPromises);

      if (processedAttachments[0])
        payload.attachment1Base64 = processedAttachments[0];
      if (processedAttachments[1])
        payload.attachment2Base64 = processedAttachments[1];
      if (processedAttachments[2])
        payload.attachment3Base64 = processedAttachments[2];

      await dispatch(createTicket(payload)).unwrap();
      toast.success("Ticket created successfully!");

      setTicketModalOpen(false);
      setForm({
        issueType: "",
        issue: "",
        description: "",
        priority: "",
        subCategory: "",
        email: "",
        contactNumber: "",
      });
      setAttachments([null, null, null]);
      setFormErrors({});
      setVisibleAttachments(1);
      setDescriptionCharCount(0);

      await fetchTicketsData();
    } catch (error: any) {
      toast.error(error || "Failed to create ticket");
    }
  };

  // Response handling
  const handleRespond = async () => {
    try {
      if (!selectedRow?.id) {
        toast.error("Ticket not found");
        return;
      }

      if (!comments.trim()) {
        toast.error("Response message is required");
        return;
      }

      if (comments.length > 300) {
        toast.error("Response cannot exceed 300 characters");
        return;
      }

      const payload: any = {
        ticketId: selectedRow.id,
        message: comments.trim(),
      };

      if (status) payload.status = status;

      const attachmentPromises = responseAttachments.map(
        async (file, index) => {
          if (!file) return null;
          try {
            const base64 = await toBase64(file);
            if (!validateFileSize(base64)) {
              throw new Error(`Attachment ${index + 1} exceeds 10MB limit`);
            }
            return base64;
          } catch (error) {
            throw new Error(
              `Failed to process attachment ${index + 1}: ${error}`
            );
          }
        }
      );

      const processedAttachments = await Promise.all(attachmentPromises);

      if (processedAttachments[0])
        payload.attachment1Base64 = processedAttachments[0];
      if (processedAttachments[1])
        payload.attachment2Base64 = processedAttachments[1];
      if (processedAttachments[2])
        payload.attachment3Base64 = processedAttachments[2];

      await dispatch(addResponse(payload)).unwrap();
      toast.success("Response added successfully!");

      setUpdateModalOpen(false);
      setComments("");
      setResponseCharCount(0);
      setResponseAttachments([null, null, null]);
      setVisibleResponseAttachments(1);

      await fetchTicketsData();
    } catch (error: any) {
      toast.error(error || "Failed to add response");
    }
  };

  //  Menu handlers
  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>, row: any) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
    setSelectedRow(row);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const openUpdateForSelectedRow = () => {
    handleMenuClose();
    setTimeout(() => {
      setUpdateModalOpen(true);
    }, 0);
  };

  const viewForSelectedRow = async () => {
    if (!selectedRow) return;

    handleMenuClose();

    try {
      setViewModalOpen(true);
      await dispatch(fetchTicketById(selectedRow.id)).unwrap();
      await dispatch(fetchResponsesByTicket(selectedRow.id)).unwrap();
    } catch (error: any) {
      toast.error(error || "Failed to load ticket details");
      setViewModalOpen(false);
    }
  };

  const handleDownload = async (ticketId: string, index: number) => {
    try {
      const res = await helpdeskAPI.downloadAttachment(ticketId, index);
      const blob = res.data || res;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `attachment_${index}`;
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success("File downloaded successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to download file");
    }
  };

  const handleResponseDownload = async (responseId: string, index: number) => {
    try {
      const res = await helpdeskAPI.downloadResponseAttachment(
        responseId,
        index
      );
      const blob = res.data || res;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `response_attachment_${index}`;
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success("File downloaded successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to download file");
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));

    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: "" }));
    }

    if (field === "description") {
      setDescriptionCharCount(value.length);
      if (value.length > 300) {
        setFormErrors((prev) => ({
          ...prev,
          description: "Description cannot exceed 300 characters",
        }));
      }
    }
  };

  // Columns
  const columns: GridColDef[] = [
    {
      field: "status",
      headerName: "Status",
      width: 130,
      renderCell: (params: GridRenderCellParams<any, any, any>) => {
        const value = params.value;

        const chipColor =
          value === "Open"
            ? "success"
            : value === "In Progress"
              ? "warning"
              : value === "Resolved"
                ? "info"
                : value === "Reopen"
                  ? "warning"
                  : value === "Closed"
                    ? "error"
                    : value === "Escalate"
                      ? "secondary"
                      : "default";

        return (
          <Chip
            label={value}
            color={chipColor as any}
            size="small"
            variant="outlined"
            sx={{
              fontWeight: 600,
              fontSize: "0.75rem",
              textTransform: "capitalize",
            }}
          />
        );
      },
    },

    {
      field: "ticketNumber",
      headerName: "View Ticket",
      width: 160,
      renderCell: (params: GridRenderCellParams<any, any, any>) => (
        <Button
          onClick={async (e) => {
            e.stopPropagation();
            try {
              const ticketData = await dispatch(
                fetchTicketById(params.row.id)
              ).unwrap();

              if (role === "super_admin" || role === "custom") {
                setStatus(ticketData.status || "");
              } else {
                if (
                  ticketData.status === "Open" ||
                  ticketData.status === "Reopen"
                ) {
                  setStatus("Resolved");
                } else if (ticketData.status === "Resolved") {
                  setStatus("Closed");
                } else if (ticketData.status === "In Progress") {
                  setStatus("In Progress");
                } else {
                  setStatus(ticketData.status || "");
                }
              }

              await dispatch(fetchResponsesByTicket(params.row.id)).unwrap();
              setSelectedRow(params.row);
              setViewModalOpen(true);
            } catch (error: any) {
              toast.error(error || "Failed to load ticket details");
            }
          }}
          className="button-common buttonColor"
          sx={{
            textTransform: "none",
            fontSize: "0.8rem",
            px: 1.5,
            py: 0.5,
            borderRadius: 1.5,
          }}
        >
          {params.value}
        </Button>
      ),
    },

    { field: "issueType", headerName: "Category", width: 150 },
    ...(role === "super_admin" || role === "custom"
      ? [{ field: "mainDealerRef", headerName: "Dealer", width: 180 }]
      : []),
    { field: "createdBy", headerName: "User", width: 180 },
    { field: "date", headerName: "Date", width: 150 },
    { field: "priority", headerName: "Priority", width: 120 },

    {
      field: "attachments",
      headerName: "Attachments",
      width: 170,
      sortable: false,
      renderCell: (params: GridRenderCellParams<any, any, any>) => {
        const ticketId = params.row.id;

        const links: JSX.Element[] = [];
        for (let i = 1; i <= 3; i++) {
          const attachment = params.row[`attachment${i}`];
          if (attachment && attachment.name) {
            links.push(
              <Button
                key={`${ticketId}-${i}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload(ticketId, i);
                }}
                size="small"
                sx={{
                  textTransform: "none",
                  fontSize: "0.8rem",
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1.5,
                }}
              >
                File {i}
              </Button>
            );
          }
        }

        return links.length ? (
          <Box display="flex" flexWrap="wrap">
            {links}
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No File
          </Typography>
        );
      },
    },
  ];

  // Rows
  const rows = tickets.map((t: any, index: number) => ({
    id: t.id || t._id || `ticket-${index}`,
    date: t.createdAtFormatted,
    ticketNumber: t.ticketNumber,
    issueType: t.issueType,
    priority: t.priority,
    status: t.status,
    mainDealerRef: t.createdBy?.mainDealerRef?.name || "-",
    createdBy: t.createdBy?.name || "-",
    attachment1: t.attachment1,
    attachment2: t.attachment2,
    attachment3: t.attachment3,
  }));

  const handleFilterChange = (field: string, value: string) => {
    dispatch(setFilters({ [field]: value }));
  };

  const responses = responsesByTicket[selectedRow?.id || ""] || [];

  // UI
  return (
    <PageContainer>
      <Paper sx={{ width: "100%", borderRadius: 2, boxShadow: 3 }}>
        {/* Top Bar */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "row-reverse",
            alignItems: "center",
            gap: 2,
            p: 1.5,
            borderBottom: "1px solid #eee",
          }}
        >
          <Button
            variant="outlined"
            onClick={() => setFilterDrawerOpen(true)}
            startIcon={<FilterAltIcon fontSize="small" />}
            className="button-common buttonColor"
          >
            Filter
          </Button>
          <PermissionCheck action={HELP_DESK_ADD}>
            <Button
              variant="contained"
              startIcon={<AddIcon fontSize="small" />}
              onClick={() => setTicketModalOpen(true)}
              className="button-primary button-common"
            >
              New Request
            </Button>
          </PermissionCheck>
        </Box>

        {/* Data Grid */}
        <DataGrid
          rows={rows}
          columns={columns}
          autoHeight
          loading={loading}
          paginationModel={{ page: page - 1, pageSize: limit }}
          onPaginationModelChange={(m) => {
            setPage(m.page + 1);
            setLimit(m.pageSize);
          }}
          pageSizeOptions={[5, 10, 20]}
          disableRowSelectionOnClick
          sx={{
            border: 0,
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#f5f5f5",
              fontWeight: "bold",
            },
            "& .MuiDataGrid-cell": { fontSize: "13px" },
          }}
        />
      </Paper>

      {/* ---------------- New Ticket Modal ---------------- */}
      <Modal open={ticketModalOpen} onClose={() => setTicketModalOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "95%", sm: 600, md: 650 },
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 24,
            p: { xs: 3, sm: 4 },
            maxHeight: "90vh",
            overflowY: "auto",
          }}
        >
          {/* Header */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 2 }}
          >
            <Typography variant="h6" fontWeight={600}>
              Create New Ticket
            </Typography>
            <IconButton onClick={() => setTicketModalOpen(false)}>
              <CloseIcon sx={{ color: "#333" }} />
            </IconButton>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Fill out the details below to raise a support request.
          </Typography>

          <form onSubmit={handleSubmit}>
            {/* Issue Type */}
            {/* Category */}
            <Box sx={{ mt: 2 }}>
              <FormControl
                required
                fullWidth
                variant="standard"
                error={!!formErrors.issueType}
              >
                <InputLabel id="category-label">Category</InputLabel>
                <Select
                  value={form.issueType}
                  onChange={(e) => {
                    const selectedValue = e.target.value;
                    handleInputChange("issueType", selectedValue);

                    // const selectedCategory = masterData?.issueCategory?.find(
                    //   (cat: any) => cat.name === selectedValue
                    // );

                    const selectedCategory = { subCategory: [] }; // Temporary fallback

                    setSubCategory(selectedCategory?.subCategory || []);
                    handleInputChange("subCategory", "");
                    handleInputChange("priority", ""); // Add this line
                  }}
                  onBlur={() => {
                    const errors = validateField("issueType", form.issueType);
                    setFormErrors((prev) => ({ ...prev, ...errors }));
                  }}
                  disabled={issueTypesLoading}
                >
                  {/* {masterData?.issueCategory?.map((t: any) => (
                    <SelectItem key={t.id} value={t.name}>
                      {t.name}
                    </SelectItem>
                  ))} */}
                </Select>
                {formErrors.issueType && (
                  <Typography color="error" variant="caption">
                    {formErrors.issueType}
                  </Typography>
                )}
              </FormControl>
            </Box>

            {/* Sub Category */}
            <Box sx={{ mt: 2 }}>
              <FormControl
                required
                fullWidth
                variant="standard"
                error={!!formErrors.subCategory}
              >
                <InputLabel id="subcategory-label">Sub Category</InputLabel>
                <Select
                  value={form.subCategory}
                  onChange={(e) => {
                    const selectedValue = e.target.value;
                    handleInputChange("subCategory", selectedValue);

                    // Auto-set priority based on selected subcategory
                    const selectedSubCategory = subCategoryArray.find(
                      (sub: any) => sub.name === selectedValue
                    );
                    console.log("Selected subcategory:", selectedSubCategory); // Add this line
                    if (selectedSubCategory?.priority) {
                      console.log(
                        "Setting priority to:",
                        selectedSubCategory.priority
                      ); // Add this line
                      handleInputChange(
                        "priority",
                        selectedSubCategory.priority
                      );
                    }
                  }}
                  onBlur={() => {
                    const errors = validateField(
                      "subCategory",
                      form.subCategory
                    );
                    setFormErrors((prev) => ({ ...prev, ...errors }));
                  }}
                  disabled={issueTypesLoading || subCategoryArray.length === 0}
                >
                  {subCategoryArray.map((t: any) => (
                    <SelectItem key={t.id} value={t.name}>
                      {t.name}
                    </SelectItem>
                  ))}
                </Select>
                {formErrors.subCategory && (
                  <Typography color="error" variant="caption">
                    {formErrors.subCategory}
                  </Typography>
                )}
              </FormControl>
            </Box>

            {/* Priority */}
            <Box
              sx={{
                mt: 3,
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              <FormLabel component="legend" sx={{ fontSize: "14.5px" }}>
                Priority :
              </FormLabel>
              <RadioGroup
                value={form.priority}
                onChange={(e) => handleInputChange("priority", e.target.value)}
                onBlur={() => {
                  const errors = validateField("priority", form.priority);
                  setFormErrors((prev) => ({ ...prev, ...errors }));
                }}
                row
              >
                {priorityOptions.map((p) => (
                  <FormControlLabel
                    key={p}
                    value={p}
                    control={<Radio size="small" />}
                    label={p}
                    className="radio-button-common"
                  />
                ))}
              </RadioGroup>
            </Box>
            {formErrors.priority && (
              <Typography color="error" variant="caption">
                {formErrors.priority}
              </Typography>
            )}

            {/* Email and Contact Number */}
            <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
              <TextField
                label="Email"
                variant="standard"
                fullWidth
                type="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
              />
              <TextField
                label="Contact Number"
                variant="standard"
                fullWidth
                placeholder="Enter your contact number"
                value={form.contactNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  if (value.length <= 10) {
                    handleInputChange("contactNumber", value);
                  }
                }}
                onBlur={() => {
                  const errors = validateField(
                    "contactNumber",
                    form.contactNumber
                  );
                  setFormErrors((prev) => ({ ...prev, ...errors }));
                }}
                error={!!formErrors.contactNumber}
                helperText={
                  formErrors.contactNumber ||
                  (form.contactNumber && form.contactNumber.length !== 10
                    ? "Must be exactly 10 digits"
                    : "")
                }
              />
            </Box>

            {/* Description */}
            <Box sx={{ mt: 2 }}>
              <TextField
                label="Description"
                required
                multiline
                variant="standard"
                fullWidth
                placeholder="Write ticket description here..."
                value={form.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                onBlur={() => {
                  const errors = validateField("description", form.description);
                  setFormErrors((prev) => ({ ...prev, ...errors }));
                }}
                error={!!formErrors.description}
                helperText={formErrors.description}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 1,
                  },
                }}
              />
              <Typography
                variant="caption"
                color={descriptionCharCount > 280 ? "error" : "text.secondary"}
                sx={{ display: "block", textAlign: "right", mt: 0.5 }}
              >
                {descriptionCharCount}/300 characters
              </Typography>
            </Box>

            {/* Multiple File Uploads */}
            <Box sx={{ mt: 3 }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 0.5 }}
              >
                Supported Attachments (JPEG, PNG, PDF)
              </Typography>

              {Array.from({ length: visibleAttachments }, (_, index) => (
                <Box
                  key={index}
                  sx={{ display: "flex", alignItems: "center", mb: 1 }}
                >
                  <input
                    type="file"
                    id={`file-upload-${index}`}
                    style={{ display: "none" }}
                    accept=".jpeg,.jpg,.png,.pdf,.doc,.docx"
                    onChange={(e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (!file) return;

                      const allowed = [
                        "image/jpeg",
                        "image/png",
                        "application/pdf",
                        "application/msword",
                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                      ];

                      if (!allowed.includes(file.type)) {
                        toast.error("Only JPEG, PNG, PDF files are allowed");
                        return;
                      }

                      const updated = [...attachments];
                      updated[index] = file;
                      setAttachments(updated);
                    }}
                  />
                  <label htmlFor={`file-upload-${index}`}>
                    <IconButton component="span" color="primary">
                      <UploadFileIcon />
                    </IconButton>
                  </label>
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    {attachments[index]?.name ||
                      `Upload Attachment ${index + 1} (optional)`}
                  </Typography>
                </Box>
              ))}

              {visibleAttachments < 3 && (
                <Button
                  variant="text"
                  onClick={() => setVisibleAttachments((prev) => prev + 1)}
                  sx={{
                    mt: 1,
                    textTransform: "none",
                    fontSize: "0.875rem",
                    color: "var(--primary-blue)",
                  }}
                >
                  + Add more attachment
                </Button>
              )}
            </Box>

            {/* Buttons */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 2,
                mt: 3,
              }}
            >
              <Button
                className="button-common buttonColor"
                variant="outlined"
                onClick={() => {
                  setTicketModalOpen(false);
                  setVisibleAttachments(1);
                  setFormErrors({});
                  setForm({
                    issueType: "",
                    issue: "",
                    description: "",
                    priority: "",
                    subCategory: "",
                    email: "",
                    contactNumber: "",
                  });
                  setDescriptionCharCount(0);
                }}
                sx={{
                  minWidth: 110,
                  textTransform: "none",
                  borderRadius: 1.5,
                }}
              >
                Cancel
              </Button>
              <Button
                className="button-primary button-common"
                variant="contained"
                type="submit"
                sx={{
                  minWidth: 130,
                  textTransform: "none",
                  borderRadius: 1.5,
                }}
              >
                Submit
              </Button>
            </Box>
          </form>
        </Box>
      </Modal>

      {/* ---------------- Update Modal---------------- */}
      <Modal
        open={updateModalOpen}
        onClose={() => setUpdateModalOpen(false)}
        closeAfterTransition
      >
        <Fade in={updateModalOpen}>
          <Box
            sx={{
              position: "absolute",
              top: { xs: "55%", sm: "50%" },
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: { xs: "95vw", sm: 460 },
              bgcolor: "background.paper",
              borderRadius: 2,
              boxShadow: "0px 4px 16px rgba(0,0,0,0.2)",
              p: { xs: 2, sm: 3 },
              display: "flex",
              flexDirection: "column",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                mb: 2,
                fontWeight: 600,
                borderBottom: "1px solid #eee",
                pb: 1,
              }}
            >
              Update Ticket / Respond
            </Typography>

            {/* --- Status --- */}
            <FormControl fullWidth variant="standard" margin="normal">
              <InputLabel>Status</InputLabel>
              <Select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                sx={{
                  "& .MuiSelect-select": { py: 1 },
                }}
              >
                {statusOptions.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </Select>
            </FormControl>

            {/* --- Priority --- */}
            <FormControl fullWidth variant="standard" margin="normal">
              <InputLabel>Priority</InputLabel>
              <Select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                sx={{
                  "& .MuiSelect-select": { py: 1 },
                }}
              >
                {priorityOptions.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </Select>
            </FormControl>

            {/* --- Response Message --- */}
            <TextField
              fullWidth
              variant="standard"
              label="Response Message"
              multiline
              minRows={3}
              margin="normal"
              value={comments}
              onChange={(e) => {
                if (e.target.value.length <= 300) {
                  setComments(e.target.value);
                  setResponseCharCount(e.target.value.length);
                }
              }}
            />
            <Typography
              variant="caption"
              color={responseCharCount > 280 ? "error" : "text.secondary"}
              sx={{ display: "block", textAlign: "right", mt: 0.5 }}
            >
              {responseCharCount}/300 characters
            </Typography>
            {/* Response Attachments */}
            <Box sx={{ mt: 2 }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 0.5 }}
              >
                Attachments (JPEG, PNG, PDF)
              </Typography>

              {Array.from(
                { length: visibleResponseAttachments },
                (_, index) => (
                  <TextField
                    key={index}
                    type="file"
                    variant="standard"
                    fullWidth
                    margin="dense"
                    inputProps={{
                      accept: ".jpeg,.jpg,.png,.pdf",
                    }}
                    onChange={(e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (!file) return;

                      const allowed = [
                        "image/jpeg",
                        "image/png",
                        "application/pdf",
                        "application/msword",
                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                      ];

                      if (!allowed.includes(file.type)) {
                        toast.error("Only JPEG, PNG, PDF files are allowed");
                        return;
                      }

                      const updated = [...responseAttachments];
                      updated[index] = file;
                      setResponseAttachments(updated);
                    }}
                    helperText={`Upload Attachment ${index + 1} (optional)`}
                  />
                )
              )}

              {visibleResponseAttachments < 3 && (
                <Button
                  variant="text"
                  onClick={() =>
                    setVisibleResponseAttachments((prev) => prev + 1)
                  }
                  sx={{
                    mt: 1,
                    textTransform: "none",
                    fontSize: "0.875rem",
                    color: "var(--primary-blue)",
                  }}
                >
                  + Add attachment
                </Button>
              )}
            </Box>

            {/* --- Buttons --- */}
            <Box
              sx={{
                display: "flex",
                gap: 2,
                mt: 3,
                justifyContent: "flex-end",
              }}
            >
              <Button
                className="button-common buttonColor"
                variant="outlined"
                color="inherit"
                onClick={() => setUpdateModalOpen(false)}
                sx={{
                  borderRadius: 1.5,
                  textTransform: "none",
                  px: 3,
                }}
              >
                Cancel
              </Button>
              <Button
                className="button-primary button-common"
                variant="contained"
                color="primary"
                onClick={handleRespond}
                sx={{
                  borderRadius: 1.5,
                  textTransform: "none",
                  px: 3,
                }}
              >
                Submit
              </Button>
            </Box>
          </Box>
        </Fade>
      </Modal>

      {/* ---------------- View Ticket Modal ---------------- */}
      <Modal open={viewModalOpen} onClose={() => setViewModalOpen(false)}>
        <Fade in={viewModalOpen}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "95%",
              height: "90vh",
              bgcolor: "#f7f9fb",
              borderRadius: 2,
              boxShadow: "0px 6px 25px rgba(0,0,0,0.15)",
              display: "flex",
              flexDirection: "column",
              p: 2,
            }}
          >
            {/* Header */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                p: { xs: 2, sm: 3 },
                borderBottom: "1px solid #eee",
                bgcolor: "#f7f9fb",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  flexWrap: "wrap",
                }}
              >
                <Typography variant="h6" fontWeight={700}>
                  Ticket Details: -{" "}
                  {selectedTicket && `#${selectedTicket.ticketNumber}`}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                {selectedTicket && (
                  <Box
                    sx={{
                      display: "flex",
                      gap: 2,
                      alignItems: "center",
                      flexWrap: "wrap",
                      mr: 2,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography
                        sx={{ fontSize: "0.875rem", fontWeight: 600 }}
                      >
                        Priority:
                      </Typography>
                      <Chip
                        label={selectedTicket.priority}
                        size="small"
                        color={
                          selectedTicket.priority === "Critical"
                            ? "error"
                            : selectedTicket.priority === "High"
                              ? "warning"
                              : selectedTicket.priority === "Medium"
                                ? "info"
                                : "success"
                        }
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>

                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontSize: "0.875rem", fontWeight: 600 }}
                      >
                        Status:
                      </Typography>
                      <Chip
                        label={selectedTicket.status}
                        color={
                          selectedTicket.status === "Open"
                            ? "success"
                            : selectedTicket.status === "In Progress"
                              ? "warning"
                              : selectedTicket.status === "Resolved"
                                ? "info"
                                : selectedTicket.status === "Reopen"
                                  ? "warning"
                                  : selectedTicket.status === "Closed"
                                    ? "error"
                                    : selectedTicket.status === "Escalate"
                                      ? "secondary"
                                      : "default"
                        }
                        size="small"
                        sx={{
                          fontWeight: 600,
                          fontSize: "0.875rem",
                          textTransform: "capitalize",
                        }}
                      />
                    </Box>
                  </Box>
                )}
                <IconButton onClick={() => setViewModalOpen(false)}>
                  <CloseIcon sx={{ color: "#333" }} />
                </IconButton>
              </Box>
            </Box>

            {loading ? (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <CircularProgress />
              </Box>
            ) : selectedTicket ? (
              <>
                {/* Ticket Details Card */}
                <Box sx={{}}>
                  <Card>
                    <CardContent>
                      {/* Info Grid */}
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns:
                            role === "super_admin" || role === "custom"
                              ? "repeat(4, 1fr)"
                              : "repeat(3, 1fr)",
                          gap: 2,
                          alignItems: "start",
                        }}
                      >
                        {/* First Row */}
                        <Box>
                          <Typography sx={{ fontSize: "0.875rem" }}>
                            <span style={{ fontWeight: 600 }}>Date:</span>{" "}
                            <span style={{ color: "#666" }}>
                              {selectedTicket.createdAtFormatted}
                            </span>
                          </Typography>
                        </Box>

                        {/* Show dealer name only for super admin */}
                        {(role === "super_admin" || role === "custom") && (
                          <Box>
                            <Typography sx={{ fontSize: "0.875rem" }}>
                              <span style={{ fontWeight: 600 }}>Dealer:</span>{" "}
                              <span style={{ color: "#666" }}>
                                {(selectedTicket as any).createdBy
                                  ?.mainDealerRef?.name || "-"}
                              </span>
                            </Typography>
                          </Box>
                        )}

                        <Box>
                          <Typography sx={{ fontSize: "0.875rem" }}>
                            <span style={{ fontWeight: 600 }}>Category:</span>{" "}
                            <span style={{ color: "#666" }}>
                              {selectedTicket.issueType}
                            </span>
                          </Typography>
                        </Box>

                        <Box>
                          <Typography sx={{ fontSize: "0.875rem" }}>
                            <span style={{ fontWeight: 600 }}>
                              Sub Category:
                            </span>{" "}
                            <span style={{ color: "#666" }}>
                              {selectedTicket.subCategory || "-"}
                            </span>
                          </Typography>
                        </Box>

                        {/* Second Row - Name, Mobile, Email */}
                        <Box>
                          <Typography sx={{ fontSize: "0.875rem" }}>
                            <span style={{ fontWeight: 600 }}>Name:</span>{" "}
                            <span style={{ color: "#666" }}>
                              {selectedTicket.createdBy?.name || "-"}
                            </span>
                          </Typography>
                        </Box>

                        <Box>
                          <Typography sx={{ fontSize: "0.875rem" }}>
                            <span style={{ fontWeight: 600 }}>Mobile:</span>{" "}
                            <span style={{ color: "#666" }}>
                              {selectedTicket.contactNumber ||
                                selectedTicket.createdBy?.contactPersonMobile ||
                                "-"}
                            </span>
                          </Typography>
                        </Box>

                        <Box>
                          <Typography sx={{ fontSize: "0.875rem" }}>
                            <span style={{ fontWeight: 600 }}>Email:</span>{" "}
                            <span style={{ color: "#666" }}>
                              <a
                                href={`mailto:${selectedTicket.email || selectedTicket.createdBy?.email || ""}`}
                              >
                                {selectedTicket.email ||
                                  selectedTicket.createdBy?.email ||
                                  "-"}
                              </a>
                            </span>
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Box>

                {/* Scrollable Content */}
                {/* <Box
                  sx={{
                    flex: 1,
                    overflowY: "auto",
                    p: { xs: 2, sm: 3 },
                  }}
                > */}
                {/* Combined Response History and Respond Section Card */}
                <Card sx={{ mb: 2, overflow: "auto" }}>
                  <CardContent>
                    <Box sx={{ display: "flex", gap: 1, minHeight: "500px" }}>
                      {/* Left Side - Response History */}
                      <Box
                        sx={{
                          width:
                            selectedTicket.status === "Closed" &&
                            role !== "super_admin" &&
                            role !== "custom"
                              ? "100%"
                              : "auto",
                          flex:
                            selectedTicket.status === "Closed" &&
                            role !== "super_admin" &&
                            role !== "custom"
                              ? "none"
                              : 1,
                        }}
                      >
                        <Typography
                          variant="h6"
                          sx={{ mb: 1.5, fontWeight: 600 }}
                        >
                          Response History
                        </Typography>
                        {/* <Divider sx={{ mb: 2 }} /> */}
                        <Box sx={{ maxHeight: "400px", overflowY: "auto" }}>
                          <Box
                            sx={{
                              p: 1.5,
                              borderRadius: 2,
                              color: "var(--primary-green)",
                              bgcolor: "var( --primary-greenBackground)",
                              border: "1px solid #eee",
                              mb: 1.5,
                            }}
                          >
                            <Typography
                              variant="subtitle2"
                              sx={{ fontWeight: 600, color: "black" }}
                            >
                              {selectedTicket.createdBy?.name || "-"}
                            </Typography>
                            <Box
                              sx={{
                                display: "flex",
                                gap: 1,
                                flexWrap: "wrap",
                                alignItems: "center",
                              }}
                            >
                              <Typography
                                sx={{
                                  fontWeight: 600,
                                  color: "black",
                                  fontSize: "12px",
                                }}
                              >
                                Description:
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{ color: "black", fontSize: "12px" }}
                              >
                                {selectedTicket.description || "-"}
                              </Typography>
                            </Box>
                            {["attachment1", "attachment2", "attachment3"].some(
                              (key) => (selectedTicket as any)[key]?.name
                            ) && (
                              <Box
                                sx={{
                                  mt: 1,
                                  display: "flex",
                                  flexWrap: "wrap",
                                  gap: 1,
                                }}
                              >
                                {[
                                  "attachment1",
                                  "attachment2",
                                  "attachment3",
                                ].map(
                                  (key, attIdx) =>
                                    (selectedTicket as any)[key]?.name && (
                                      <Box
                                        key={attIdx}
                                        sx={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 0.5,
                                          cursor: "pointer",
                                          borderRadius: 1,
                                        }}
                                        onClick={() =>
                                          handleResponseDownload(
                                            selectedTicket.id,
                                            attIdx + 1
                                          )
                                        }
                                      >
                                        <Typography
                                          sx={{
                                            fontSize: "0.75rem",
                                            color: "#1274b0",
                                          }}
                                        >
                                          File {attIdx + 1}
                                        </Typography>
                                      </Box>
                                    )
                                )}
                              </Box>
                            )}

                            <Typography
                              variant="caption"
                              sx={{
                                display: "block",
                                mt: 0.5,
                                color: "black",
                              }}
                            >
                              {selectedTicket.createdAtFormatted}
                            </Typography>
                          </Box>
                          {responsesByTicket[selectedTicket.id]?.length ? (
                            responsesByTicket[selectedTicket.id].map(
                              (r: any, idx: number) => (
                                <Box
                                  key={idx}
                                  sx={{
                                    p: 1.5,
                                    borderRadius: 2,
                                    color:
                                      r.senderType === "super_admin" ||
                                      r.senderType === "custom"
                                        ? "var(--primary-logo)"
                                        : "var(--primary-green)",
                                    bgcolor:
                                      r.senderType === "super_admin" ||
                                      r.senderType === "custom"
                                        ? "var(--primary-blueBackground)"
                                        : "var( --primary-greenBackground)",
                                    border: "1px solid #eee",
                                    mb: 1.5,
                                  }}
                                >
                                  <Typography
                                    variant="subtitle2"
                                    sx={{ fontWeight: 600, color: "black" }}
                                  >
                                    {r.createdBy?.name || "Unknown"}
                                    {r.senderType === "super_admin" ||
                                      r.senderType === "custom"}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    sx={{ mt: 0.5, color: "black" }}
                                  >
                                    {r.message}
                                  </Typography>
                                  {[
                                    "attachment1",
                                    "attachment2",
                                    "attachment3",
                                  ].some((key) => r[key]?.name) && (
                                    <Box
                                      sx={{
                                        mt: 1,
                                        display: "flex",
                                        flexWrap: "wrap",
                                        gap: 1,
                                      }}
                                    >
                                      {[
                                        "attachment1",
                                        "attachment2",
                                        "attachment3",
                                      ].map(
                                        (key, attIdx) =>
                                          r[key]?.name && (
                                            <Box
                                              key={attIdx}
                                              sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 0.5,
                                                cursor: "pointer",

                                                borderRadius: 1,
                                              }}
                                              onClick={() =>
                                                handleResponseDownload(
                                                  r.id,
                                                  attIdx + 1
                                                )
                                              }
                                            >
                                              <Typography
                                                sx={{
                                                  fontSize: "0.75rem",
                                                  color: "#1274b0",
                                                }}
                                              >
                                                File {attIdx + 1}
                                              </Typography>
                                            </Box>
                                          )
                                      )}
                                    </Box>
                                  )}

                                  <Typography
                                    variant="caption"
                                    sx={{
                                      display: "block",
                                      mt: 0.5,
                                      color: "black",
                                    }}
                                  >
                                    {r.createdAtFormatted}
                                  </Typography>
                                </Box>
                              )
                            )
                          ) : (
                            <Typography color="text.secondary">
                              No responses yet.
                            </Typography>
                          )}
                        </Box>
                      </Box>
                      <PermissionCheck action={HELP_DESK_EDIT}>
                        {/* Right Side - Respond Section */}
                        <Box
                          sx={{ flex: 1, borderLeft: "1px solid #eee", pl: 3 }}
                        >
                          {(selectedTicket.status === "Open" ||
                            selectedTicket.status === "In Progress" ||
                            selectedTicket.status === "Resolved" ||
                            selectedTicket.status === "Reopen" ||
                            selectedTicket.status === "Escalate" ||
                            (selectedTicket.status === "Closed" &&
                              (role === "super_admin" ||
                                role === "custom"))) && (
                            <>
                              {!(
                                selectedTicket.status === "Resolved" &&
                                role !== "super_admin" &&
                                role !== "custom"
                              ) && (
                                <Box
                                  sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    mb: 1.5,
                                  }}
                                >
                                  <Typography
                                    variant="h6"
                                    sx={{ fontWeight: 600 }}
                                  >
                                    Add Response
                                  </Typography>
                                </Box>
                              )}
                              {/* <Divider sx={{ mb: 2 }} /> */}
                              {(role === "super_admin" ||
                                role === "custom") && (
                                <FormControl
                                  variant="standard"
                                  sx={{ minWidth: 300 }}
                                >
                                  <InputLabel
                                    id="update-status"
                                    sx={{ fontSize: "20px" }}
                                  >
                                    Update Status
                                  </InputLabel>
                                  <Select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                  >
                                    {statusOptions.map((s) => (
                                      <SelectItem key={s} value={s}>
                                        {s}
                                      </SelectItem>
                                    ))}
                                  </Select>
                                </FormControl>
                              )}

                              {(selectedTicket.status === "Open" ||
                                selectedTicket.status === "In Progress" ||
                                selectedTicket.status === "Reopen" ||
                                selectedTicket.status === "Escalate" ||
                                (selectedTicket.status === "Closed" &&
                                  (role === "super_admin" ||
                                    role === "custom")) ||
                                role === "super_admin" ||
                                role === "custom") && (
                                <>
                                  {!(
                                    selectedTicket.status === "Resolved" &&
                                    role !== "super_admin" &&
                                    role !== "custom"
                                  ) && (
                                    <>
                                      <Typography
                                        fontWeight={500}
                                        sx={{ mb: 0.5, mt: 2 }}
                                      >
                                        Message:
                                      </Typography>
                                      <TextField
                                        multiline
                                        variant="standard"
                                        fullWidth
                                        placeholder="Write your response here..."
                                        value={comments}
                                        onChange={(e) => {
                                          if (e.target.value.length <= 300) {
                                            setComments(e.target.value);
                                            setResponseCharCount(
                                              e.target.value.length
                                            );
                                          }
                                        }}
                                        sx={{
                                          "& .MuiOutlinedInput-root": {
                                            borderRadius: 1,
                                          },
                                        }}
                                      />
                                      <Typography
                                        variant="caption"
                                        color={
                                          responseCharCount > 280
                                            ? "error"
                                            : "text.secondary"
                                        }
                                        sx={{
                                          display: "block",
                                          textAlign: "right",
                                          mt: 0.5,
                                        }}
                                      >
                                        {responseCharCount}/300 characters
                                      </Typography>
                                      <Box sx={{ mt: 2 }}>
                                        <Typography
                                          variant="body2"
                                          color="text.secondary"
                                          sx={{ mb: 0.5 }}
                                        >
                                          Attachments (JPEG, PNG, PDF)
                                        </Typography>
                                        {Array.from(
                                          {
                                            length: visibleResponseAttachments,
                                          },
                                          (_, index) => (
                                            <Box
                                              key={index}
                                              sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                mb: 1,
                                              }}
                                            >
                                              <input
                                                type="file"
                                                id={`response-file-upload-${index}`}
                                                style={{ display: "none" }}
                                                accept=".jpeg,.jpg,.png,.pdf,.doc,.docx"
                                                onChange={(e) => {
                                                  const file = (
                                                    e.target as HTMLInputElement
                                                  ).files?.[0];
                                                  if (!file) return;
                                                  const allowed = [
                                                    "image/jpeg",
                                                    "image/png",
                                                    "application/pdf",
                                                    "application/msword",
                                                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                                                  ];
                                                  if (
                                                    !allowed.includes(file.type)
                                                  ) {
                                                    toast.error(
                                                      "Only JPEG, PNG, PDF files are allowed"
                                                    );
                                                    return;
                                                  }
                                                  const updated = [
                                                    ...responseAttachments,
                                                  ];
                                                  updated[index] = file;
                                                  setResponseAttachments(
                                                    updated
                                                  );
                                                }}
                                              />
                                              <label
                                                htmlFor={`response-file-upload-${index}`}
                                              >
                                                <IconButton
                                                  component="span"
                                                  color="primary"
                                                >
                                                  <UploadFileIcon />
                                                </IconButton>
                                              </label>
                                              <Typography
                                                variant="body2"
                                                sx={{ ml: 1 }}
                                              >
                                                {responseAttachments[index]
                                                  ?.name ||
                                                  `Upload Attachment ${index + 1} (optional)`}
                                              </Typography>
                                            </Box>
                                          )
                                        )}

                                        {visibleResponseAttachments < 3 && (
                                          <Button
                                            variant="text"
                                            onClick={() =>
                                              setVisibleResponseAttachments(
                                                (prev) => prev + 1
                                              )
                                            }
                                            sx={{
                                              mt: 1,
                                              textTransform: "none",
                                              fontSize: "0.875rem",
                                              color: "var(--primary-blue)",
                                            }}
                                          >
                                            + Add attachment
                                          </Button>
                                        )}
                                      </Box>
                                      <Box
                                        sx={{
                                          display: "flex",
                                          justifyContent: "flex-end",
                                          gap: 2,
                                          mt: 3,
                                        }}
                                      >
                                        <Button
                                          className="button-common buttonColor"
                                          variant="outlined"
                                          onClick={() =>
                                            setViewModalOpen(false)
                                          }
                                        >
                                          Close
                                        </Button>
                                        <Button
                                          className="button-primary button-common"
                                          variant="contained"
                                          onClick={async () => {
                                            try {
                                              if (!comments.trim()) {
                                                toast.error("Enter a response");
                                                return;
                                              }
                                              const payload: any = {
                                                ticketId: selectedTicket.id,
                                                message: comments,
                                              };
                                              if (status)
                                                payload.status = status;
                                              const attachmentPromises =
                                                responseAttachments.map(
                                                  async (file, index) => {
                                                    if (!file) return null;
                                                    const base64 =
                                                      await toBase64(file);
                                                    if (
                                                      !validateFileSize(base64)
                                                    )
                                                      throw new Error(
                                                        `Attachment ${index + 1} exceeds 10MB limit`
                                                      );
                                                    return base64;
                                                  }
                                                );
                                              const processedAttachments =
                                                await Promise.all(
                                                  attachmentPromises
                                                );
                                              if (processedAttachments[0])
                                                payload.attachment1Base64 =
                                                  processedAttachments[0];
                                              if (processedAttachments[1])
                                                payload.attachment2Base64 =
                                                  processedAttachments[1];
                                              if (processedAttachments[2])
                                                payload.attachment3Base64 =
                                                  processedAttachments[2];
                                              await dispatch(
                                                addResponse(payload)
                                              ).unwrap();
                                              toast.success(
                                                "Response updated successfully"
                                              );
                                              setComments("");
                                              setResponseCharCount(0);
                                              setResponseAttachments([
                                                null,
                                                null,
                                                null,
                                              ]);
                                              setVisibleResponseAttachments(1);
                                              await dispatch(
                                                fetchTicketById(
                                                  selectedTicket.id
                                                )
                                              ).unwrap();
                                              await dispatch(
                                                fetchResponsesByTicket(
                                                  selectedTicket.id
                                                )
                                              ).unwrap();
                                              dispatch(
                                                fetchTickets({
                                                  page,
                                                  limit,
                                                  ...filters,
                                                })
                                              );
                                            } catch (error: any) {
                                              toast.error(
                                                error ||
                                                  "Failed to update response"
                                              );
                                            }
                                          }}
                                        >
                                          Submit
                                        </Button>
                                      </Box>
                                    </>
                                  )}
                                </>
                              )}
                              {selectedTicket.status === "Resolved" &&
                                role !== "super_admin" &&
                                role !== "custom" && (
                                  <>
                                    {!showReopenForm ? (
                                      <Box
                                        sx={{
                                          display: "flex",
                                          justifyContent: "center",

                                          gap: 2,

                                          mt: 10,
                                        }}
                                      >
                                        <Button
                                          className="button-orange button-common"
                                          variant="contained"
                                          onClick={async () => {
                                            try {
                                              await dispatch(
                                                updateTicketStatus({
                                                  ticketId: selectedTicket.id,
                                                  data: { status: "Escalate" },
                                                })
                                              ).unwrap();
                                              toast.success(
                                                "Ticket escalate successfully"
                                              );
                                              await dispatch(
                                                fetchTicketById(
                                                  selectedTicket.id
                                                )
                                              ).unwrap();
                                              dispatch(
                                                fetchTickets({
                                                  page,
                                                  limit,
                                                  ...filters,
                                                })
                                              );
                                            } catch (error: any) {
                                              toast.error(
                                                error ||
                                                  "Failed to escalate ticket"
                                              );
                                            }
                                          }}
                                          sx={{ fontSize: "0.875rem" }}
                                        >
                                          Escalate Ticket
                                        </Button>

                                        <Button
                                          className="button-primary button-common"
                                          variant="contained"
                                          onClick={() =>
                                            setShowReopenForm(true)
                                          }
                                        >
                                          Re-open Ticket
                                        </Button>
                                      </Box>
                                    ) : (
                                      <>
                                        <Typography
                                          variant="h6"
                                          sx={{ mb: 1.5, fontWeight: 600 }}
                                        >
                                          Add Response
                                        </Typography>
                                        <Divider sx={{ mb: 2 }} />
                                        <Typography
                                          fontWeight={500}
                                          sx={{ mb: 1, mt: 2 }}
                                        >
                                          Message:
                                        </Typography>
                                        <TextField
                                          multiline
                                          variant="standard"
                                          fullWidth
                                          placeholder="Write your response here..."
                                          value={comments}
                                          onChange={(e) => {
                                            if (e.target.value.length <= 300) {
                                              setComments(e.target.value);
                                              setResponseCharCount(
                                                e.target.value.length
                                              );
                                            }
                                          }}
                                          sx={{
                                            "& .MuiOutlinedInput-root": {
                                              borderRadius: 1,
                                            },
                                          }}
                                        />
                                        <Typography
                                          variant="caption"
                                          color={
                                            responseCharCount > 280
                                              ? "error"
                                              : "text.secondary"
                                          }
                                          sx={{
                                            display: "block",
                                            textAlign: "right",
                                            mt: 0.5,
                                          }}
                                        >
                                          {responseCharCount}/300 characters
                                        </Typography>
                                        <Box sx={{ mt: 2 }}>
                                          <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{ mb: 0.5 }}
                                          >
                                            Attachments (JPEG, PNG, PDF)
                                          </Typography>
                                          {Array.from(
                                            {
                                              length:
                                                visibleResponseAttachments,
                                            },
                                            (_, index) => (
                                              <Box
                                                key={index}
                                                sx={{
                                                  display: "flex",
                                                  alignItems: "center",
                                                  mb: 1,
                                                }}
                                              >
                                                <input
                                                  type="file"
                                                  id={`response-file-upload-${index}`}
                                                  style={{ display: "none" }}
                                                  accept=".jpeg,.jpg,.png,.pdf,.doc,.docx"
                                                  onChange={(e) => {
                                                    const file = (
                                                      e.target as HTMLInputElement
                                                    ).files?.[0];
                                                    if (!file) return;
                                                    const allowed = [
                                                      "image/jpeg",
                                                      "image/png",
                                                      "application/pdf",
                                                      "application/msword",
                                                      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                                                    ];
                                                    if (
                                                      !allowed.includes(
                                                        file.type
                                                      )
                                                    ) {
                                                      toast.error(
                                                        "Only JPEG, PNG, PDF files are allowed"
                                                      );
                                                      return;
                                                    }
                                                    const updated = [
                                                      ...responseAttachments,
                                                    ];
                                                    updated[index] = file;
                                                    setResponseAttachments(
                                                      updated
                                                    );
                                                  }}
                                                />
                                                <label
                                                  htmlFor={`response-file-upload-${index}`}
                                                >
                                                  <IconButton
                                                    component="span"
                                                    color="primary"
                                                  >
                                                    <UploadFileIcon />
                                                  </IconButton>
                                                </label>
                                                <Typography
                                                  variant="body2"
                                                  sx={{ ml: 1 }}
                                                >
                                                  {responseAttachments[index]
                                                    ?.name ||
                                                    `Upload Attachment ${index + 1} (optional)`}
                                                </Typography>
                                              </Box>
                                            )
                                          )}

                                          {visibleResponseAttachments < 3 && (
                                            <Button
                                              variant="text"
                                              onClick={() =>
                                                setVisibleResponseAttachments(
                                                  (prev) => prev + 1
                                                )
                                              }
                                              sx={{
                                                mt: 1,
                                                textTransform: "none",
                                                fontSize: "0.875rem",
                                                color: "var(--primary-blue)",
                                              }}
                                            >
                                              + Add attachment
                                            </Button>
                                          )}
                                        </Box>
                                        <Box
                                          sx={{
                                            display: "flex",
                                            justifyContent: "center",
                                            gap: 2,
                                            mt: 3,
                                          }}
                                        >
                                          <Button
                                            className="button-common buttonColor"
                                            variant="outlined"
                                            onClick={() => {
                                              setShowReopenForm(false);
                                              setComments("");
                                              setResponseCharCount(0);
                                              setResponseAttachments([
                                                null,
                                                null,
                                                null,
                                              ]);
                                              setVisibleResponseAttachments(1);
                                            }}
                                          >
                                            Close
                                          </Button>
                                          <Button
                                            className="button-primary button-common"
                                            variant="contained"
                                            onClick={async () => {
                                              try {
                                                if (!comments.trim()) {
                                                  toast.error(
                                                    "Enter a response"
                                                  );
                                                  return;
                                                }
                                                const payload: any = {
                                                  ticketId: selectedTicket.id,
                                                  message: comments,
                                                  status: "Reopen",
                                                };
                                                const attachmentPromises =
                                                  responseAttachments.map(
                                                    async (file, index) => {
                                                      if (!file) return null;
                                                      const base64 =
                                                        await toBase64(file);
                                                      if (
                                                        !validateFileSize(
                                                          base64
                                                        )
                                                      )
                                                        throw new Error(
                                                          `Attachment ${index + 1} exceeds 10MB limit`
                                                        );
                                                      return base64;
                                                    }
                                                  );
                                                const processedAttachments =
                                                  await Promise.all(
                                                    attachmentPromises
                                                  );
                                                if (processedAttachments[0])
                                                  payload.attachment1Base64 =
                                                    processedAttachments[0];
                                                if (processedAttachments[1])
                                                  payload.attachment2Base64 =
                                                    processedAttachments[1];
                                                if (processedAttachments[2])
                                                  payload.attachment3Base64 =
                                                    processedAttachments[2];
                                                await dispatch(
                                                  addResponse(payload)
                                                ).unwrap();
                                                await dispatch(
                                                  updateTicketStatus({
                                                    ticketId: selectedTicket.id,
                                                    data: { status: "Reopen" },
                                                  })
                                                ).unwrap();
                                                toast.success(
                                                  "Ticket reopened successfully"
                                                );
                                                setComments("");
                                                setResponseCharCount(0);
                                                setResponseAttachments([
                                                  null,
                                                  null,
                                                  null,
                                                ]);
                                                setVisibleResponseAttachments(
                                                  1
                                                );
                                                setShowReopenForm(false);
                                                await dispatch(
                                                  fetchTicketById(
                                                    selectedTicket.id
                                                  )
                                                ).unwrap();
                                                await dispatch(
                                                  fetchResponsesByTicket(
                                                    selectedTicket.id
                                                  )
                                                ).unwrap();
                                                dispatch(
                                                  fetchTickets({
                                                    page,
                                                    limit,
                                                    ...filters,
                                                  })
                                                );
                                              } catch (error: any) {
                                                toast.error(
                                                  error ||
                                                    "Failed to reopen ticket"
                                                );
                                              }
                                            }}
                                          >
                                            Submit
                                          </Button>
                                        </Box>
                                      </>
                                    )}
                                  </>
                                )}
                            </>
                          )}
                        </Box>
                      </PermissionCheck>
                    </Box>
                  </CardContent>
                </Card>
                {/* </Box> */}
              </>
            ) : (
              <Typography sx={{ p: 3 }}>No ticket found.</Typography>
            )}
          </Box>
        </Fade>
      </Modal>

      {/* ---------------- Filter Drawer ---------------- */}
      <Drawer
        anchor="right"
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        sx={{
          "& .MuiDrawer-paper": {
            width: { xs: "100vw", sm: 400 },
            maxWidth: "100vw",
            height: "100vh",
            overflow: "auto",
            padding: { xs: 2, sm: 3 },
            display: "flex",
            flexDirection: "column",
            gap: 2,
          },
        }}
      >
        {/* Sticky Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
            position: "sticky",
            top: 0,
            bgcolor: "background.paper",
            zIndex: 1,
            mt: 7,
          }}
        >
          <Typography variant="h6">Filter Options</Typography>
          <IconButton onClick={() => setFilterDrawerOpen(false)}>
            <CloseIcon sx={{ color: "black" }} />
          </IconButton>
        </Box>

        {/* Filter Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            try {
              dispatch(setFilters(localFilters));
              dispatch(fetchTickets({ ...localFilters, page, limit }));
              setFilterDrawerOpen(false);
            } catch (error: any) {
              toast.error(error || "Failed to apply filters");
            }
          }}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {/* Status Filter */}
          <FormControl fullWidth variant="standard">
            <InputLabel>Status</InputLabel>
            <Select
              value={localFilters.status}
              onChange={(e) =>
                setLocalFilters({ ...localFilters, status: e.target.value })
              }
            >
              <SelectItem value="">All</SelectItem>
              {statusOptions.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </Select>
          </FormControl>

          {/* Priority Filter */}
          <FormControl fullWidth variant="standard">
            <InputLabel>Priority</InputLabel>
            <Select
              value={localFilters.priority}
              onChange={(e) =>
                setLocalFilters({ ...localFilters, priority: e.target.value })
              }
            >
              <SelectItem value="">All</SelectItem>
              {priorityOptions.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </Select>
          </FormControl>

          {/* Bottom Buttons */}
          <Box
            sx={{
              display: "flex",
              gap: 1,
              mt: 2,
              bgcolor: "background.paper",
              pt: 2,
            }}
          >
            <Button
              type="submit"
              variant="contained"
              className="button-primary button-common"
              fullWidth
            >
              Apply Filters
            </Button>
            <Button
              type="button"
              variant="outlined"
              className="button-common buttonColor"
              fullWidth
              onClick={() => {
                try {
                  setLocalFilters({ status: "", priority: "" });
                  dispatch(setFilters({ status: "", priority: "" }));
                  dispatch(fetchTickets({ page, limit }));
                  setFilterDrawerOpen(false);
                } catch (error: any) {
                  toast.error(error || "Failed to clear filters");
                }
              }}
            >
              Clear
            </Button>
          </Box>
        </form>
      </Drawer>
    </PageContainer>
  );
});

export default Page;
