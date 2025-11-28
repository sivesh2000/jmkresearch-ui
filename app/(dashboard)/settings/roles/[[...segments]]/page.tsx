"use client";
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import { PageContainer } from "@toolpad/core";
import {
  IconButton,
  Menu,
  MenuItem,
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Chip,
  Switch,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import { RootState, AppDispatch } from "../../../../redux/store";
import "../../../../global.css";
import {
  getAllFinancierData,
  editFinancier,
  addFinancier,
  deleteFinancier,
} from "@/app/api/financierApi";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LazyDataGrid from "@/app/components/LazyDataGrid";
import {
  createNewRole,
  getAllRolesData,
  updateRoleData,
} from "@/app/api/rolePermissionsApi/roles";
import { Padding } from "@mui/icons-material";
import { PermissionCheck } from "@/app/components/PermissionCheck";
import { usePermissions } from "@/app/utils/permissions";
import { Roles_ADD, ROLES_EDIT } from "@/app/utils/permissionsActions";

export default function Page() {
  const dispatch = useDispatch<AppDispatch>();
  const { hasPermission } = usePermissions(); // Add this hook

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    roleName: "",
    roleDescription: "",
  });
  const [errors, setErrors] = useState({
    roleName: "",
    roleDescription: "",
  });
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });

  const { rolesData, loading, error } = useSelector(
    (state: RootState) => state.rolesData
  );

  const fetchAllData = async () => {
    try {
      await getAllRolesData(dispatch)();
    } catch (error) {
      toast.error(
        "Failed to fetch roles data: " +
          (error as any).response?.data?.message || ""
      );
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [dispatch]);

  // Handle switch toggle
  const handleSwitch = async (row: any) => {
    try {
      await updateRoleData(dispatch)(row._id, { status: !row.status });
      fetchAllData();
      toast.success("Role status updated successfully!");
    } catch (error) {
      toast.error(
        "Failed to update role status" +
          (error as any).response?.data?.message || ""
      );
    }
  };

  // Handle modal open/close
  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setFormData({ roleName: "", roleDescription: "" });
    setErrors({ roleName: "", roleDescription: "" });
  };

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Validation function
  const validateField = (name: string, value: string) => {
    if (name === "roleName" && !value.trim()) {
      return "Role Name is required";
    }
    return "";
  };

  // Handle field blur validation
  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  // Validate all fields
  const validateForm = () => {
    const newErrors = {
      roleName: validateField("roleName", formData.roleName),
      roleDescription: "",
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== "");
  };

  // Handle form submission
  const handleCreateRole = async () => {
    if (!validateForm()) {
      return;
    }

    console.log("Creating role:", formData);
    try {
      const finalData = {
        title: formData.roleName,
        description: formData.roleDescription,
        status: true,
      };
      await createNewRole(dispatch)(finalData);
      toast.success("Role created successfully!");
      fetchAllData();
    } catch (error) {
      toast.error(
        "Failed to create role:" + (error as any).response?.data?.message || ""
      );
      return;
    }

    handleCloseModal();
  };

  // Table columns
  const columns: GridColDef[] = [
    { field: "title", headerName: "Role Name", flex: 1.5 },
    { field: "description", headerName: "Role Description", flex: 3 },
    {
      field: "status",
      headerName: "Status",
      flex: 0.5,
      renderCell: (params: any) => (
        <Switch
          checked={!!params.value}
          color="primary"
          size="small"
          onChange={() => handleSwitch(params.row)}
          inputProps={{ "aria-label": "status toggle" }}
          disabled={!hasPermission(ROLES_EDIT)} // Fixed: Use hook directly
        />
      ),
    },
  ];

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, row: any) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  return (
    <PageContainer>
      <Paper sx={{ height: "auto", width: "100%" }}>
        <Box sx={{ display: "flex", flexDirection: "row-reverse", p: 2 }}>
          <PermissionCheck action={Roles_ADD}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              className="button-common button-primary"
              onClick={handleOpenModal}
            >
              Add
            </Button>
          </PermissionCheck>
        </Box>
        <Box>
          <LazyDataGrid
            rows={rolesData || []}
            columns={columns}
            loading={loading}
            getRowId={(row) => row._id}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[5, 10]}
            sx={{}}
          />
        </Box>
      </Paper>

      {/* Create Role Modal */}
      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        aria-labelledby="create-role-modal"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "95vw", sm: 400 },
            maxHeight: { xs: "95vh", sm: "80vh" },
            bgcolor: "background.paper",
            boxShadow: 24,
            p: { xs: 2, sm: 4 },
            borderRadius: { xs: 0, sm: 2 },
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Modal Header */}
          <Typography variant="h6" component="h2">
            Create Role
          </Typography>
          {/* Modal Content */}
          <Box>
            <TextField
              fullWidth
              label="Role Name"
              name="roleName"
              value={formData.roleName}
              onChange={handleInputChange}
              onBlur={handleBlur}
              variant="standard"
              margin="normal"
              required
              error={!!errors.roleName}
              helperText={errors.roleName}
            />
            <TextField
              fullWidth
              label="Description"
              name="roleDescription"
              value={formData.roleDescription}
              onChange={handleInputChange}
              onBlur={handleBlur}
              variant="standard"
              margin="normal"
              multiline
              error={!!errors.roleDescription}
              helperText={errors.roleDescription}
            />
          </Box>

          {/* Modal create roles */}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              pt: 3,
            }}
          >
            <Button
              fullWidth
              variant="contained"
              onClick={handleCreateRole}
              className="button-common button-primary"
            >
              Create
            </Button>
            <Button
              fullWidth
              variant="outlined"
              onClick={handleCloseModal}
              className="button-common buttonColor"
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Modal>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        {/* Menu items if needed */}
      </Menu>
    </PageContainer>
  );
}
