"use client";
import React, { useEffect, useState, useCallback, useMemo, memo } from "react";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import LazyDataGrid from "../../../components/LazyDataGrid";
import Paper from "@mui/material/Paper";
import { PageContainer } from "@toolpad/core";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import {
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Modal,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
  Drawer,
  Switch,
  FormControlLabel,
  Chip,
  Checkbox,
  Radio,
  RadioGroup,
  FormControl,
  Grid,
  Divider,
  InputLabel,
  Select,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import "../../../global.css";
import {
  getAllUsers,
  updateUser,
  deleteUsers,
  createUser,
  getLocationsByMasterDealer,
  assignRolesToUser,
  getAllRolesUser,
} from "@/app/api/usersApi";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/app/redux/store";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Email, Password } from "@mui/icons-material";
import { set } from "jodit/esm/core/helpers";
import { get } from "http";
import { usersToExcel } from "@/app/api/exportExcel";
import { setRolesData } from "@/app/redux/slices/rolesPermissionsSlices/rolesSlice";
import { PermissionCheck } from "@/app/components/PermissionCheck";
import {
  USERS_ADD,
  USERS_ASSIGN_ROLE,
  USERS_EDIT,
  USERS_EXPORT,
  USERS_RESET_PASSWORD,
  USERS_VIEW,
} from "@/app/utils/permissionsActions";

const Page = memo(function Page() {
  const { data: session } = useSession();
  const dispatch = useDispatch<AppDispatch>();
  const { users, loading, error } = useSelector(
    (state: RootState) =>
      state.allUsers as {
        users: any;
        loading: boolean;
        error: any;
      }
  );

  const {
    rolesData,
    loading: rolesLoading,
    error: rolesError,
  } = useSelector((state: RootState) => state.rolesData);
  const { assignedRolesUserData } = useSelector(
    (state: RootState) => state.allAssignRolesUserData
  );

  useEffect(() => {
    console.log("Assigned Roles User Data:", assignedRolesUserData);
    if (assignedRolesUserData) {
      const roles = assignedRolesUserData?.roles?.map((role: any) => {
        setSelectedRoles((prevSelectedRoles) => [
          ...prevSelectedRoles,
          role.roleId._id,
        ]);
      });
    }
  }, [assignedRolesUserData]);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [deleteUser, setDeleteUser] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [userTypeRadio, setUserTypeRadio] = useState<
    "nyom" | "dealer" | "main_dealer"
  >("nyom");
  const [userTypeRadioModal, setUserTypeRadioModal] = useState<
    "nyom" | "dealer" | "main_dealer"
  >("nyom");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterCategory, setFilterCategory] = React.useState("name");
  const [filterDropDown, setFilterDropDown] = useState("option1");
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    contactPersonMobile: string;
    locationRef?: string; // <-- make optional
    status: boolean;
    password: string;
    confirmPassword: string;
    role: string;
    userType: string;
    mainDealerRef?: string;
    adhaar: string;
    isInvoiceEnabled: boolean;
    isCombo: boolean;
  }>({
    name: "",
    email: "",
    contactPersonMobile: "",
    locationRef: "", // <-- new field
    status: true,
    password: "",
    confirmPassword: "",
    role: "user",
    userType: "user",
    mainDealerRef: userTypeRadioModal === "dealer" ? "" : session?.user?.id,
    adhaar: "",
    isInvoiceEnabled: true,
    isCombo: false,
  });
  const [formErrors, setFormErrors] = useState({
    name: "",
    email: "",
    contactPersonMobile: "",
    location: "", // <-- new field
    status: "",
    password: "",
    confirmPassword: "",
    userType: "",
    mainDealerRef: "",
    adhaar: "",
  });
  // Add filter state as an object
  const [filterForm, setFilterForm] = useState({
    search: "",
    mainDealerRef: "",
  });

  // Update handlers for filter form
  const handleFilterInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFilterForm((prev) => ({
      ...prev,
      [name as string]: value,
    }));
  };
  const handleFilterSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFilterForm((prev) => ({
      ...prev,
      [name as string]: value,
    }));
  };
  const [isEdit, setIsEdit] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const open = Boolean(anchorEl);
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [resetPasswordData, setResetPasswordData] = useState({
    userId: "",
    password: "",
    confirmPassword: "",
  });
  const [resetPasswordErrors, setResetPasswordErrors] = useState({
    password: "",
    confirmPassword: "",
  });
  type UserType = {
    id: string;
    name: string;
    email: string;
    contactPersonMobile?: string;
    locationRef?: { title?: string };
    status?: boolean;
    userType?: string;
    mainDealerRef?: string;
    // Add any other fields you use from user objects
  };
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [paginationModel, setPaginationModel] = useState({
    page: 0, // DataGrid is 0-based, API is 1-based
    pageSize: 10,
  });
  const [assignRoleOpen, setAssignRoleOpen] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  // Add state for user type radio

  const fetchUsers = useCallback(async () => {
    if (session?.user?.id !== undefined && session?.user?.id !== null) {
      try {
        await getAllUsers(dispatch, {
          userType: "user",
          page: paginationModel.page + 1,
          limit: paginationModel.pageSize,
          mainDealerRef: filterForm.mainDealerRef,
          search: filterForm.search,
        });
      } catch {
        // Handle error silently
      }
    }
  }, [session?.user?.id, dispatch, paginationModel, userTypeRadio]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: "actions",
        headerName: "Actions",
        width: 100,
        renderCell: (params: GridRenderCellParams) => (
          <IconButton onClick={(event) => handleOpenMenu(event, params.row)}>
            <MoreVertIcon color="action" />
          </IconButton>
        ),
      },
      // Only show Master Dealer Name column if userTypeRadio is "dealer"
      ...(userTypeRadio === "dealer"
        ? [
            {
              field: "mainDealerRef",
              headerName: "Master Dealer Name",
              flex: 1,
              renderCell: (params: GridRenderCellParams) =>
                params.row.mainDealerRef?.name || "",
            },
          ]
        : []),
      { field: "name", headerName: "Name", flex: 1 },
      { field: "email", headerName: "Email", flex: 1 },
      { field: "contactPersonMobile", headerName: "Mobile Number", flex: 1 },
      // Only show Location column if not super_admin or custom
      ...(session?.user?.userType !== "super_admin" &&
      session?.user?.userType !== "custom"
        ? [
            {
              field: "location",
              headerName: "Location",
              flex: 1,
              renderCell: (params: GridRenderCellParams) =>
                params.row.locationRef?.title || "",
            },
          ]
        : []),
      {
        field: "status",
        headerName: "Status",
        flex: 1,
        renderCell: (params: any) =>
          params.value ? (
            <Chip
              label="Active"
              color="success"
              size="small"
              variant="outlined"
            />
          ) : (
            <Chip
              label="Inactive"
              size="small"
              color="default"
              variant="outlined"
            />
          ),
      },
      // Add Invoice Permission column only for main_dealer
      ...(session?.user?.userType === "main_dealer" ||
      session?.user?.userType === "super_admin" ||
      session?.user?.userType === "custom"
        ? [
            {
              field: "isInvoiceEnabled",
              headerName: "Invoice Permission",
              flex: 1,
              renderCell: (params: GridRenderCellParams) => (
                <Switch
                  checked={!!params.row.isInvoiceEnabled}
                  onChange={async (e) => {
                    // Update the value in backend and refresh table
                    try {
                      await updateUser(
                        params.row.id,
                        { isInvoiceEnabled: e.target.checked },
                        "user",
                        session?.user?.id!,
                        dispatch
                      );
                      toast.success("Invoice Permission updated!");
                      fetchUsers();
                    } catch (error) {
                      toast.error(
                        "Failed to update Invoice Permission." +
                          (error as any).response?.data?.message || ""
                      );
                    }
                  }}
                  color="primary"
                  size="small"
                />
              ),
            },
            {
              field: "isCombo",
              headerName: "Combined Pdf Permission",
              flex: 1,
              renderCell: (params: GridRenderCellParams) => (
                <Switch
                  checked={!!params.row.isCombo}
                  onChange={async (e) => {
                    // Update the value in backend and refresh table
                    try {
                      await updateUser(
                        params.row.id,
                        { isCombo: e.target.checked },
                        "user",
                        session?.user?.id!,
                        dispatch
                      );
                      toast.success("Combo Permission updated!");
                      fetchUsers();
                    } catch (error) {
                      toast.error(
                        "Failed to update Combo Permission." +
                          (error as any).response?.data?.message || ""
                      );
                    }
                  }}
                  color="primary"
                  size="small"
                />
              ),
            },
          ]
        : []),
    ],
    [session?.user?.userType, dispatch, fetchUsers, userTypeRadio]
  );

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, row: any) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedRow(null);
  };

  const handleAction = async (task: string) => {
    if (task === "Edit") {
      setSelectedId(selectedRow.id);
      setFormData({
        name: selectedRow.name,
        email: selectedRow.email,
        contactPersonMobile: selectedRow.contactPersonMobile || "",
        locationRef: selectedRow.locationRef?.id || "", // <-- set locationRef
        status: selectedRow.status !== undefined ? selectedRow.status : true,
        isInvoiceEnabled:
          selectedRow.isInvoiceEnabled !== undefined
            ? selectedRow.isInvoiceEnabled
            : true,
        isCombo:
          selectedRow.isCombo !== undefined ? selectedRow.isCombo : false,
        password: "",
        confirmPassword: "",
        role: "user",
        userType: selectedRow.userType || "user",
        mainDealerRef: selectedRow.mainDealerRef || "",
        adhaar: selectedRow.adhaar || "",
      });
      setUserTypeRadioModal(
        selectedRow.userType === "dealer" ? "dealer" : "nyom"
      );
      setIsEdit(true);
      setModalOpen(true);
    } else if (task === "Delete") {
      setDeleteUser(selectedRow);
      setDeleteDialogOpen(true);
    } else if (task === "reset") {
      setResetPasswordData({
        userId: selectedRow.id,
        password: "",
        confirmPassword: "",
      });
      setResetPasswordErrors({ password: "", confirmPassword: "" });
      setResetPasswordOpen(true);
    } else if (task === "View") {
      // console.log("View clicked for:", selectedRow);
      setSelectedUser(selectedRow);
      setViewModalOpen(true);
    } else {
      // console.log(`${task} clicked for:`, selectedRow);
    }
    handleCloseMenu();
  };
  const handleAssignRole = async () => {
    try {
      //await getAllRolesData(dispatch)();
      await getAllRolesUser(dispatch, selectedRow.id);
    } catch (error) {
      toast.error(
        "Failed to fetch roles." + (error as any).response?.data?.message || ""
      );
    }
    setAssignRoleOpen(true);
    setAnchorEl(null);
  };
  const handleAssignRoleAction = async () => {
    // console.log("Assigning roles:", selectedRoles, "to user:", selectedRow);
    try {
      const FinalFormData = {
        userId: selectedRow.id,
        roleIds: selectedRoles,
      };
      await assignRolesToUser(dispatch, FinalFormData);
      toast.success("Roles assigned successfully!");
    } catch (error) {
      toast.error(
        "Failed to assign roles." + (error as any).response?.data?.message || ""
      );
    }
  };
  const handleResetPasswordInput = (field: string, value: string) => {
    setResetPasswordData((prev) => ({ ...prev, [field]: value }));
    if (resetPasswordErrors[field as keyof typeof resetPasswordErrors]) {
      setResetPasswordErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleResetPasswordBlur = (field: string, value: string) => {
    let error = "";
    if (!value.trim()) {
      error = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
    } else if (
      field === "confirmPassword" &&
      value !== resetPasswordData.password
    ) {
      error = "Passwords do not match";
    } else if (field === "password" && value.length < 6) {
      error = "Password must be at least 6 characters long";
    }
    setResetPasswordErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleResetPasswordSave = async () => {
    const errors = {
      password: !resetPasswordData.password.trim()
        ? "Password is required"
        : resetPasswordData.password.length < 6
          ? "Password must be at least 6 characters long"
          : "",
      confirmPassword: !resetPasswordData.confirmPassword.trim()
        ? "Confirm Password is required"
        : resetPasswordData.confirmPassword !== resetPasswordData.password
          ? "Passwords do not match"
          : "",
    };
    setResetPasswordErrors(errors);
    if (errors.password || errors.confirmPassword) return;
    console.log(
      "Resetting password for userId:",
      resetPasswordData.userId,
      "to new password:",
      resetPasswordData.password
    );
    // TODO: Call your reset password API here with resetPasswordData.userId and resetPasswordData.password
    try {
      const { userId, confirmPassword, ...finalData } = resetPasswordData;
      await updateUser(userId, finalData, "user", session?.user?.id!, dispatch);
      toast.success("Password reset successfully!");
    } catch (error) {
      toast.error(
        "Failed to reset password." + (error as any).response.data.message || ""
      );
    }
    setResetPasswordOpen(false);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteUsers(deleteUser.id, "user", session?.user?.id!, dispatch);
      toast.success("User deleted successfully!");
    } catch (error) {
      toast.error(
        "Failed to delete user." + (error as any).response.data.message || ""
      );
    }
    setDeleteDialogOpen(false);
    setDeleteUser(null);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setDeleteUser(null);
  };

  const handleAddClick = async () => {
    setFormData({
      name: "",
      email: "",
      contactPersonMobile: "",
      locationRef: "",
      status: true,
      isInvoiceEnabled: true,
      isCombo: false,
      password: "",
      confirmPassword: "",
      role: "user",
      userType: "user",
      mainDealerRef: userTypeRadioModal === "dealer" ? "" : session?.user?.id,
      adhaar: "",
    });
    setUserTypeRadioModal("nyom"); // <-- default to nyom user
    setIsEdit(false);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setFormData({
      name: "",
      email: "",
      contactPersonMobile: "",
      locationRef: "", // <-- reset location
      status: true,
      isInvoiceEnabled: true,
      isCombo: false,
      password: "",
      confirmPassword: "",
      role: "user",
      userType: "user",
      mainDealerRef: userTypeRadioModal === "dealer" ? "" : session?.user?.id,
      adhaar: "",
    });
    setFormErrors({
      name: "",
      email: "",
      contactPersonMobile: "",
      location: "", // <-- reset location
      status: "",
      password: "",
      confirmPassword: "",
      userType: "",
      mainDealerRef: "",
      adhaar: "",
    });
  };

  const handleSave = async () => {
    // Validate all fields before save
    const errors = {
      name: validateField("name", formData.name),
      email: validateField("email", formData.email),
      contactPersonMobile: validateField(
        "contactPersonMobile",
        formData.contactPersonMobile
      ),
      location:
        session?.user?.userType === "super_admin" ||
        session?.user?.userType === "custom"
          ? userTypeRadioModal === "dealer"
            ? validateField("locationRef", formData.locationRef ?? "")
            : ""
          : validateField("locationRef", formData.locationRef ?? ""),
      status: "",
      password: !isEdit ? validateField("password", formData.password) : "",
      confirmPassword: !isEdit
        ? validateField(
            "confirmPassword",
            formData.confirmPassword,
            formData.password
          )
        : "",
      userType: "",
      mainDealerRef:
        (session?.user?.userType === "super_admin" ||
          session?.user?.userType === "custom") &&
        userTypeRadioModal === "dealer"
          ? validateField("mainDealerRef", formData.mainDealerRef ?? "")
          : "",
      adhaar: "",
    };
    setFormErrors(errors);
    if (Object.values(errors).some((error) => error !== "")) {
      return;
    }
    try {
      const { confirmPassword, ...apiPayload } = formData;
      let finalPayload = { ...apiPayload };

      if (session?.user?.id) {
        if (isEdit && selectedId) {
          // REMOVE isInvoiceEnabled and isCombo from payload during edit
          const {
            mainDealerRef,
            password,
            isInvoiceEnabled,
            isCombo,
            ...restPayload
          } = finalPayload;
          let data = null;
          if (
            session.user?.userType === "super_admin" ||
            session.user?.userType === "custom"
          ) {
            data = {
              name: restPayload.name,
              email: restPayload.email,
              userType: userTypeRadioModal === "dealer" ? "user" : "custom",
              status: restPayload.status,
              contactPersonMobile: apiPayload.contactPersonMobile,
              role: "admin",
            };
            if (userTypeRadioModal === "dealer") {
              (data as any).mainDealerRef = finalPayload.mainDealerRef;
              (data as any).locationRef = finalPayload.locationRef;
            }
            await updateUser(
              selectedId,
              restPayload,
              "custom",
              session?.user?.id!,
              dispatch
            );
          } else {
            data = restPayload;
          }
          await updateUser(
            selectedId,
            restPayload,
            "user",
            session?.user?.id!,
            dispatch
          );
          toast.success("User updated successfully!");
        } else {
          // ADD isInvoiceEnabled: true during creation
          finalPayload.isInvoiceEnabled = true;
          if (
            session.user?.userType === "super_admin" ||
            session.user?.userType === "custom"
          ) {
            const data: {
              name: string;
              email: string;
              userType: string;
              password: string;
              status: boolean;
              contactPersonMobile: string;
              role: string;
              isInvoiceEnabled: boolean;
              [key: string]: any; // Allow dynamic properties
            } = {
              name: finalPayload.name,
              email: finalPayload.email,
              userType: userTypeRadioModal === "dealer" ? "user" : "custom",
              password: finalPayload.password,
              status: finalPayload.status,
              contactPersonMobile: finalPayload.contactPersonMobile,
              role: "admin",
              isInvoiceEnabled: true, // ensure it's present
            };
            if (userTypeRadioModal === "dealer") {
              data.mainDealerRef = finalPayload.mainDealerRef;
              data.locationRef = finalPayload.locationRef;
            }
            await createUser(data, "custom", "", dispatch);
          } else {
            await createUser(
              finalPayload,
              "user",
              session?.user?.id!,
              dispatch
            );
          }
          toast.success("User created successfully!");
        }
      } else {
        toast.error("Operation failed. Please try again.");
      }
      handleModalClose();
      fetchUsers();
    } catch (error) {
      toast.error(
        "Operation failed. Please try again." +
          (error as any).response.data.message || ""
      );
    }
  };

  const validateField = (
    field: string,
    value: string,
    passwordValue?: string
  ) => {
    let error = "";
    if (field === "status") return "";
    if (!value || (typeof value === "string" && !value.trim())) {
      if (field === "contactPersonMobile") {
        error = "Mobile number is required";
        return error;
      }
      // Aadhaar is NOT required, so skip required validation for adhaar
      if (field === "adhaar") {
        return "";
      }
      error = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
    } else if (
      field === "adhaar" &&
      session?.user?.userType !== "super_admin" &&
      session?.user?.userType !== "custom"
    ) {
      // Only validate format if filled
      if (value && !/^\d{12}$/.test(value)) {
        error = "Aadhaar Card Number must be exactly 12 digits";
      }
    }
    return error;
  };
  const handleInputChange = (field: string, value: any) => {
    if (field === "name") {
      value = value.replace(/[^A-Za-z0-9\s]/g, "").replace(/\s{2,}/g, " ");
    }
    if (field === "contactPersonMobile") {
      value = value.replace(/[^0-9]/g, "").slice(0, 10);
    }
    if (field === "adhaar") {
      value = value.replace(/[^0-9]/g, "").slice(0, 12);
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field as keyof typeof formErrors]) {
      setFormErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleBlur = (field: string, value: string) => {
    // Always validate on blur for all fields
    let error =
      field === "confirmPassword"
        ? validateField(field, value, formData.password)
        : validateField(field, value);
    setFormErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleApplyFilters = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // await getAllCertificateData(dispatch, {
      //   ...filterForm,
      //   page: 1,
      //   limit: paginationModel.pageSize,
      // });
      console.log("Applying filters:", filterForm);
      setPaginationModel((prev) => ({ ...prev, page: 0 })); // Reset to first page
    } catch (error) {
      toast.error(
        "Error applying filters:" + (error as any).response.data.message || ""
      );
    }
    setFilterOpen(false);
  };

  const handleClearFilters = async () => {
    try {
      fetchUsers();
      setPaginationModel((prev) => ({ ...prev, page: 0 }));
    } catch (error) {
      toast.error(
        "Error clearing filters:" + (error as any).response.data.message || ""
      );
    }
    setFilterForm({
      search: "",
      mainDealerRef: "",
    });
    setFilterCategory("chassisNumber");
    setFilterOpen(false);
  };

  const handleExport = async () => {
    // Filter out action columns or any you don't want exported
    try {
      const data = await usersToExcel(dispatch)(filterForm);
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "users.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error("Error exporting to Excel");
    }
  };

  const roleColumns: GridColDef[] = [
    {
      field: "selectRole",
      headerName: "",
      renderHeader: () => (
        <Checkbox
          checked={
            selectedRoles.length === rolesData.length && rolesData.length > 0
          }
          indeterminate={
            selectedRoles.length > 0 && selectedRoles.length < rolesData.length
          }
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedRoles(rolesData.map((row) => (row as any)._id));
            } else {
              setSelectedRoles([]);
            }
          }}
        />
      ),
      width: 120,
      renderCell: (params) => (
        <Checkbox
          checked={selectedRoles.includes(params.row._id)}
          onChange={() => {
            if (selectedRoles.includes(params.row._id)) {
              setSelectedRoles(
                selectedRoles.filter((id) => id !== params.row._id)
              );
            } else {
              setSelectedRoles([...selectedRoles, params.row._id]);
            }
          }}
        />
      ),
      sortable: false,
      disableColumnMenu: true,
    },
    { field: "title", headerName: "Role Name", flex: 1 },
  ];

  return (
    <PageContainer>
      <Paper sx={{ height: "auto", width: "100%" }}>
        <Box
          sx={{
            padding: 1,
            display: "flex",
            flexDirection: "row-reverse",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Button
            variant="outlined"
            className="button-common buttonColor"
            onClick={async () => {
              setFilterOpen(true);
            }}
            startIcon={<FilterAltIcon fontSize="small" />}
          >
            Filter
          </Button>
          {/* <PermissionCheck action={USERS_ADD}> */}
          <Button
            variant="contained"
            className="button-primary button-common"
            startIcon={<AddIcon fontSize="small" />}
            onClick={handleAddClick}
          >
            Create
          </Button>
          {/* </PermissionCheck> */}
          <PermissionCheck action={USERS_EXPORT}>
            <Button
              variant="outlined"
              className="button-common buttonColor"
              onClick={handleExport}
              startIcon={<ArrowDownwardIcon fontSize="small" />}
            >
              Export
            </Button>
          </PermissionCheck>
        </Box>
        <LazyDataGrid
          rows={users.results}
          columns={columns}
          loading={loading}
          pagination
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[5, 10]}
          rowCount={users.totalResults || 0}
          paginationMode="server"
        />
      </Paper>

      <Menu anchorEl={anchorEl} open={open} onClose={handleCloseMenu}>
        <PermissionCheck action={USERS_VIEW}>
          <MenuItem onClick={() => handleAction("View")}>View</MenuItem>
        </PermissionCheck>
        <PermissionCheck action={USERS_EDIT}>
          <MenuItem onClick={() => handleAction("Edit")}>Edit</MenuItem>
        </PermissionCheck>
        <PermissionCheck action={USERS_RESET_PASSWORD}>
          <MenuItem onClick={() => handleAction("reset")}>
            Reset Password
          </MenuItem>
        </PermissionCheck>
        <PermissionCheck action={USERS_ASSIGN_ROLE}>
          <MenuItem onClick={handleAssignRole}>Assign Role</MenuItem>
        </PermissionCheck>
      </Menu>

      <Modal open={modalOpen} onClose={handleModalClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "95vw", sm: 420 },
            maxHeight: { xs: "95vh", sm: 600 },
            bgcolor: "background.paper",
            boxShadow: 24,
            p: { xs: 2, sm: 4 },
            borderRadius: { xs: 0, sm: 2 },
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Typography variant="h6" component="h2" mb={3}>
            {isEdit ? "Edit User" : "Add New User"}
          </Typography>
          {(session?.user?.userType === "super_admin" ||
            session?.user?.userType === "custom") && (
            <>
              <FormControl sx={{ mb: 2 }}>
                <RadioGroup
                  row
                  value={userTypeRadioModal}
                  onChange={(e) => {
                    setUserTypeRadioModal(e.target.value as "nyom" | "dealer");
                    setFormData((prev) => ({
                      ...prev,
                      userType: e.target.value === "dealer" ? "dealer" : "user",
                      // Optionally reset mainDealerRef/locationRef if switching to nyom
                      // ...(e.target.value === "nyom"
                      //   ? { mainDealerRef: "", locationRef: "" }
                      //   : {}),
                    }));
                  }}
                  name="user-type-radio-modal"
                >
                  <FormControlLabel
                    value="nyom"
                    control={<Radio size="small" />}
                    label="Nyom User"
                    className="radio-label-small"
                  />
                  <FormControlLabel
                    value="dealer"
                    control={<Radio size="small" />}
                    label="Dealer User"
                    className="radio-label-small"
                  />
                </RadioGroup>
              </FormControl>

              {userTypeRadioModal === "dealer" && (
                <>
                  <TextField
                    select
                    fullWidth
                    variant="standard"
                    label="Main Dealer"
                    value={formData.mainDealerRef}
                    onChange={async (e) => {
                      handleInputChange("mainDealerRef", e.target.value);
                      await getLocationsByMasterDealer(dispatch, {
                        userRef: e.target.value,
                      });
                    }}
                    margin="normal"
                    required
                    error={!!formErrors.mainDealerRef}
                    helperText={formErrors.mainDealerRef}
                  >
                    {(userDealerData || []).map((dealer) => (
                      <MenuItem key={dealer.id} value={dealer.id}>
                        {dealer.name}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    select
                    fullWidth
                    variant="standard"
                    label="Location"
                    value={formData.locationRef}
                    onChange={(e) =>
                      handleInputChange("locationRef", e.target.value)
                    }
                    onBlur={(e) => handleBlur("locationRef", e.target.value)}
                    margin="normal"
                    required
                    error={!!formErrors.location}
                    helperText={formErrors.location}
                  >
                    {locationData.map((loc) => (
                      <MenuItem key={loc.id} value={loc._id}>
                        {loc.title}
                      </MenuItem>
                    ))}
                  </TextField>
                </>
              )}
            </>
          )}
          {session?.user?.userType !== "super_admin" &&
            session?.user?.userType !== "custom" && (
              <TextField
                select
                fullWidth
                variant="standard"
                label="Location"
                value={formData.locationRef}
                onChange={(e) =>
                  handleInputChange("locationRef", e.target.value)
                }
                onBlur={(e) => handleBlur("locationRef", e.target.value)}
                error={!!formErrors.location}
                helperText={formErrors.location}
                margin="normal"
                required
              ></TextField>
            )}

          <TextField
            fullWidth
            variant="standard"
            label="Name"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            onBlur={(e) => handleBlur("name", e.target.value)}
            error={!!formErrors.name}
            helperText={formErrors.name}
            margin="normal"
            required
          />

          <TextField
            fullWidth
            variant="standard"
            label="Email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            onBlur={(e) => handleBlur("email", e.target.value)}
            error={!!formErrors.email}
            helperText={formErrors.email}
            margin="normal"
            required
          />

          <TextField
            fullWidth
            variant="standard"
            label="Mobile Number"
            value={formData.contactPersonMobile}
            onChange={(e) =>
              handleInputChange("contactPersonMobile", e.target.value)
            }
            onBlur={(e) => handleBlur("contactPersonMobile", e.target.value)}
            error={!!formErrors.contactPersonMobile}
            helperText={formErrors.contactPersonMobile}
            margin="normal"
            required
          />

          {session?.user?.userType !== "super_admin" &&
            session?.user?.userType !== "custom" && (
              <TextField
                fullWidth
                variant="standard"
                label="Aadhaar Card Number"
                value={formData.adhaar}
                onChange={(e) => handleInputChange("adhaar", e.target.value)}
                // onBlur={(e) => handleBlur("adhaar", e.target.value)}
                error={!!formErrors.adhaar}
                helperText={formErrors.adhaar}
                margin="normal"
                inputProps={{
                  maxLength: 12,
                  inputMode: "numeric",
                  pattern: "[0-9]*",
                }}
                // required // <-- REMOVE THIS LINE
              />
            )}

          {/* Conditionally render password fields only if not editing */}
          {!isEdit && (
            <>
              <TextField
                fullWidth
                variant="standard"
                label="Password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                onBlur={(e) => handleBlur("password", e.target.value)}
                error={!!formErrors.password}
                helperText={formErrors.password}
                margin="normal"
                required
              />

              <TextField
                fullWidth
                variant="standard"
                label="Confirm Password"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  handleInputChange("confirmPassword", e.target.value)
                }
                onBlur={(e) => handleBlur("confirmPassword", e.target.value)}
                error={!!formErrors.confirmPassword}
                helperText={formErrors.confirmPassword}
                margin="normal"
                required
              />
            </>
          )}

          <FormControlLabel
            control={
              <Switch
                checked={formData.status}
                onChange={(e) => handleInputChange("status", e.target.checked)}
                color="primary"
              />
            }
            label="Status"
            sx={{ mt: 2, mb: 1 }}
          />
          {session?.user?.userType === "main_dealer" && (
            <>
              <Divider sx={{ my: 1 }} />
              <Typography variant="h6">Permissions</Typography>
              <Grid container spacing={2}>
                <Grid sx={{ lg: 6 }} textAlign={"center"}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.isInvoiceEnabled}
                        onChange={(e) =>
                          handleInputChange(
                            "isInvoiceEnabled",
                            e.target.checked
                          )
                        }
                        color="primary"
                      />
                    }
                    label="Invoice"
                    sx={{ mt: 2, mb: 1 }}
                  />
                </Grid>
                <Grid sx={{ lg: 6 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.isCombo}
                        onChange={(e) =>
                          handleInputChange("isCombo", e.target.checked)
                        }
                        color="primary"
                      />
                    }
                    label="Combined PDF"
                    sx={{ mt: 2, mb: 1 }}
                  />
                </Grid>
              </Grid>
            </>
          )}

          <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
            <Button
              className="button-common button-primary"
              variant="contained"
              onClick={handleSave}
              fullWidth
            >
              Save
            </Button>
            <Button
              className="button-common buttonColor"
              variant="outlined"
              onClick={handleModalClose}
              fullWidth
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Reset Password Modal moved outside the user modal */}
      <Modal
        open={resetPasswordOpen}
        onClose={() => setResetPasswordOpen(false)}
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "100vw", sm: 420 },
            maxWidth: { xs: "100vw", sm: 420 },
            maxHeight: { xs: "100vh", sm: 600 },
            bgcolor: "background.paper",
            boxShadow: 24,
            p: { xs: 2, sm: 4 },
            borderRadius: { xs: 0, sm: 2 },
            overflowY: "auto",
            overflowX: "hidden",
            display: "flex",
            flexDirection: "column",
            // alignItems: 'center',
          }}
        >
          {/* <Box sx={{ width: { xs: '100%', sm: 400 }, maxWidth: { xs: '100%', sm: 400 } }}> */}
          <Typography variant="h6" component="h2" mb={3} align="center">
            Reset Password
          </Typography>
          <TextField
            fullWidth
            variant="standard"
            label="New Password"
            type="password"
            value={resetPasswordData.password}
            onChange={(e) =>
              handleResetPasswordInput("password", e.target.value)
            }
            onBlur={(e) => handleResetPasswordBlur("password", e.target.value)}
            error={!!resetPasswordErrors.password}
            helperText={resetPasswordErrors.password}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            variant="standard"
            label="Confirm Password"
            type="password"
            value={resetPasswordData.confirmPassword}
            onChange={(e) =>
              handleResetPasswordInput("confirmPassword", e.target.value)
            }
            onBlur={(e) =>
              handleResetPasswordBlur("confirmPassword", e.target.value)
            }
            error={!!resetPasswordErrors.confirmPassword}
            helperText={resetPasswordErrors.confirmPassword}
            margin="normal"
            required
          />
          <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
            <Button
              className="button-common button-primary"
              variant="contained"
              onClick={handleResetPasswordSave}
              fullWidth
            >
              Reset Password
            </Button>
            <Button
              className="button-common buttonColor"
              variant="outlined"
              onClick={() => setResetPasswordOpen(false)}
              fullWidth
            >
              Cancel
            </Button>
          </Box>
          {/* </Box> */}
        </Box>
      </Modal>
      {/* Drawer for Filters */}
      <Drawer
        anchor="right"
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
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
          <IconButton onClick={() => setFilterOpen(false)}>
            <CloseIcon sx={{ color: "black" }} />
          </IconButton>
        </Box>
        <form
          onSubmit={handleApplyFilters}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {(session?.user?.userType === "super_admin" ||
            session?.user?.userType === "custom") && (
            <FormControl
              fullWidth
              size="small"
              variant="standard"
              sx={{ mb: 2 }}
            >
              <InputLabel>Master Dealer</InputLabel>
              <Select
                name="mainDealerRef"
                value={filterForm.mainDealerRef}
                onChange={handleFilterSelectChange}
                label="Master Dealer"
              ></Select>
            </FormControl>
          )}
          <FormControl variant="standard">
            <Select
              value={filterDropDown}
              onChange={(e) => {
                setFilterDropDown(e.target.value);
              }}
            >
              <MenuItem value="option1">Name</MenuItem>
              <MenuItem value="option2">Email</MenuItem>
              <MenuItem value="option3">Phone No.</MenuItem>
            </Select>
          </FormControl>
          {/* Search input */}
          <TextField
            fullWidth
            name="search"
            label="Search"
            variant="standard"
            size="small"
            value={filterForm.search}
            onChange={handleFilterInputChange}
          />

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
              onClick={handleClearFilters}
            >
              Clear
            </Button>
          </Box>
        </form>
      </Drawer>

      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the User {deleteUser?.name}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            onClick={handleDeleteCancel}
            className="button-common buttonColor"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            className="button-common button-primary"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      {/* view modal */}

      <Modal open={viewModalOpen} onClose={() => setViewModalOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "95vw", sm: 420 },
            maxHeight: { xs: "95vh", sm: 600 },
            bgcolor: "background.paper",
            boxShadow: 24,
            p: { xs: 2, sm: 4 },
            borderRadius: { xs: 0, sm: 2 },
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            // position: "relative",
          }}
        >
          <IconButton
            aria-label="close"
            onClick={() => setViewModalOpen(false)}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              color: (theme) => theme.palette.grey[500],
              zIndex: 10,
            }}
          >
            ×
          </IconButton>
          <Typography variant="h6" component="h2" mb={3} align="center">
            User Details
          </Typography>
          {selectedUser && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Typography className="viewContentSize">
                <b>Name:</b> {selectedUser.name}
              </Typography>
              <Typography className="viewContentSize">
                <b>Email:</b> {selectedUser.email}
              </Typography>
              <Typography className="viewContentSize">
                <b>Mobile Number:</b> {selectedUser.contactPersonMobile}
              </Typography>
              <Typography className="viewContentSize">
                <b>Location:</b> {selectedUser.locationRef?.title || ""}
              </Typography>
              <Typography className="viewContentSize">
                <b>Status:</b> {selectedUser.status ? "Active" : "Inactive"}
              </Typography>
              {/* Add more fields as needed */}
            </Box>
          )}
        </Box>
      </Modal>
      {/* assign role modal */}
      <Modal open={assignRoleOpen} onClose={() => setAssignRoleOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "95vw", sm: 500 },
            maxHeight: { xs: "95vh", sm: 600 },
            bgcolor: "background.paper",
            boxShadow: 24,
            p: { xs: 2, sm: 4 },
            borderRadius: { xs: 0, sm: 2 },
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Typography variant="h6" mb={2}>
            Assign Roles
          </Typography>
          <LazyDataGrid
            rows={rolesData || []}
            columns={roleColumns}
            getRowId={(row) => row._id}
            pageSizeOptions={[5, 10]}
          />
          <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
            <Button
              variant="contained"
              className="button-common button-primary"
              onClick={handleAssignRoleAction}
              fullWidth
            >
              Assign
            </Button>
            <Button
              variant="outlined"
              className="button-common buttonColor"
              onClick={() => {
                setAssignRoleOpen(false);
                setSelectedRoles([]);
              }}
              fullWidth
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Modal>
    </PageContainer>
  );
});

export default Page;
