"use client";
import React, { useEffect, useState ,useCallback } from "react";
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
import { RootState, AppDispatch } from "../../../../redux/store";
import "../../../../global.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../../../global.css";
import LazyDataGrid from "@/app/components/LazyDataGrid";
import {
  createNewPermission,
  deletePermission,
  getAllDomainsData,
  getAllMasterData,
  getAllPermissionsData,
  updatePermission,
} from "@/app/api/rolePermissionsApi/permissions";
import { permission } from "process";
import { PermissionCheck } from "@/app/components/PermissionCheck";
import {
  PERMISSIONS_ADD,
  PERMISSIONS_DELETE,
  PERMISSIONS_EDIT,
} from "@/app/utils/permissionsActions";
export default function Page() {
  const dispatch = useDispatch<AppDispatch>();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState({
    domain: "",
    action: "",
    instance: "",
    permissionDescription: "",
  });
  const [errors, setErrors] = useState({
    domain: "",
    action: "",
    instance: "",
    permissionDescription: "",
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
 
const fetchAllData = useCallback(async () => {
  try {
    await getAllPermissionsData(dispatch)();
  } catch (error: any) {
    console.error("Failed to fetch permissions data", error);
  }
}, [dispatch]);

  useEffect(() => {
    fetchAllData();
  }, [dispatch, fetchAllData]);
  const { permissionsData, domainsData } = useSelector(
    (state: RootState) => state.permissionsData
  );

  // const { masterData } = useSelector((state: RootState) => []);

  useEffect(() => {
    console.log("permissions data:", permissionsData);
    console.log("domains data: " + domainsData);
  }, [permissionsData, domainsData]); // Add all dependencies
  // Handle switch toggle
  const handleSwitch = async (row: any) => {
    console.log("Switch toggled for:", row);
    try {
      await updatePermission(dispatch)(row.id, { isActive: !row.isActive });
      toast.success("Permission status updated successfully!");
      await fetchAllData();
    } catch (error) {
      toast.error(
        "Error updating permission: " + (error as any).response?.data?.message
      );
    }
  };

  //  table columns
  const columns: GridColDef[] = [
    {
      field: "actionsMenu",
      headerName: "Actions",
      width: 100,
      renderCell: (params) => (
        <IconButton onClick={(event) => handleOpenMenu(event, params.row)}>
          <MoreVertIcon color="action" />
        </IconButton>
      ),
    },
    {
      field: "domain",
      headerName: "Domain",
      flex: 1,
      sortable: true,
      filterable: true,
      renderCell: (params: any) =>
        params.row.domain ? params.row.domain.title : "N/A",
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      sortable: true,
      filterable: true,
    },
    {
      field: "instance",
      headerName: "Instance",
      flex: 1,
      sortable: true,
      filterable: true,
    },
    {
      field: "description",
      headerName: "Permission Description",
      flex: 2,
      sortable: true,
      filterable: true,
    },
    {
      field: "isActive",
      headerName: "Status",
      flex: 1,
      renderCell: (params: any) => (
        <Switch
          checked={!!params.value}
          color="primary"
          size="small"
          onChange={() => handleSwitch(params.row)}
          inputProps={{ "aria-label": "status toggle" }}
        />
      ),
    },
  ];

  const paginationModel = { page: 0, pageSize: 10 };

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, row: any) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const validateField = (name: string, value: string) => {
    if (!value.trim()) {
      const fieldNames = {
        domain: "Domain",
        action: "Action",
        instance: "Instance",
        permissionDescription: "Description",
      };
      return `${fieldNames[name as keyof typeof fieldNames]} is required`;
    }
    return "";
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

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

  const validateForm = () => {
    const newErrors = {
      domain: validateField("domain", formData.domain),
      action: validateField("action", formData.action),
      instance: validateField("instance", formData.instance),
      permissionDescription: validateField(
        "permissionDescription",
        formData.permissionDescription
      ),
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== "");
  };

  const handleOpenModal = async () => {
    try {
      await getAllMasterData(dispatch);
      await getAllDomainsData(dispatch)();
    } catch (error) {
      toast.error(
        "Error fetching Domains: " + (error as any).response?.data?.message
      );
    }
    setIsEdit(false);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setFormData({
      domain: "",
      action: "",
      instance: "",
      permissionDescription: "",
    });
    setErrors({
      domain: "",
      action: "",
      instance: "",
      permissionDescription: "",
    });
    setIsEdit(false);
  };

  // Replace your existing helper functions with these updated ones
  const getDomainNameById = (domainId: string): string => {
    const domain = domainsData?.find((d) => d.id === domainId);
    return domain?.title || "";
  };

  const formatToSnakeCase = (str: string): string => {
    return str
      .toLowerCase()
      .replace(/\s+/g, ".") // Replace spaces with dots
      .replace(/[^a-z0-9.]/g, "") // Remove special characters except dots
      .replace(/\.+/g, ".") // Replace multiple dots with single dot
      .replace(/^\.+|\.+$/g, ""); // Remove leading/trailing dots
  };

  const createCombinedAction = (domainId: string, action: string): string => {
    const domainName = getDomainNameById(domainId);
    const formattedDomain = formatToSnakeCase(domainName);
    const formattedAction = formatToSnakeCase(action);

    return `${formattedDomain}.${formattedAction}`;
  };

  const extractActionFromCombined = (combinedAction: string): string => {
    if (combinedAction.includes(".")) {
      const parts = combinedAction.split(".");
      // Take everything after the first part (domain) and rejoin with spaces
      const actionParts = parts.slice(1);
      return actionParts
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
    }
    return combinedAction;
  };

  const extractDomainFromCombined = (combinedAction: string): string => {
    if (combinedAction.includes(".")) {
      const parts = combinedAction.split(".");
      // Take the first part and format it back to title case
      return parts[0]
        .split(".")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
    }
    return combinedAction;
  };

  const handleCreatePermission = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      // Create combined action using helper function
      const combinedAction = createCombinedAction(
        formData.domain,
        formData.action
      );

      if (isEdit) {
        const updateData = {
          domain: formData.domain,
          actions: combinedAction,
          instance: formData.instance,
          description: formData.permissionDescription,
        };

        await updatePermission(dispatch)(selectedRow.id, updateData);
        toast.success("Permission updated successfully!");
      } else {
        const createData = {
          domain: formData.domain,
          actions: combinedAction,
          instance: formData.instance,
          description: formData.permissionDescription,
          isActive: true,
        };

        await createNewPermission(dispatch)(createData);
        toast.success("Permission created successfully!");
      }

      await fetchAllData();
      handleCloseModal();
    } catch (error) {
      toast.error(
        `Error ${isEdit ? "updating" : "creating"} permission: ` +
        (error as any).response?.data?.message
      );
    }
  };

  const handleAction = async (action: string) => {
    try {
      await getAllMasterData(dispatch);
      await getAllDomainsData(dispatch)();
    } catch (error) {
      toast.error(
        "Error fetching Domains: " + (error as any).response?.data?.message
      );
    }

    if (action === "edit" && selectedRow) {
      // Extract action from combined format (master.data.download.certificate -> Download Certificate)
      const extractedAction = extractActionFromCombined(
        selectedRow?.actions || ""
      );

      setFormData({
        domain: selectedRow?.domain?.id,
        action: extractedAction,
        instance: selectedRow?.instance,
        permissionDescription: selectedRow?.description,
      });
      setIsEdit(true);
      setModalOpen(true);
      handleCloseMenu();
    } else if (action === "delete") {
      handleOpenDeleteDialog();
    }
  };

  const handleOpenDeleteDialog = () => {
    setDeleteDialogOpen(true);
    handleCloseMenu();
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
  };

  const handleConfirmDelete = async () => {
    try {
      await deletePermission(dispatch)(selectedRow.id);
      toast.success("Permission deleted successfully!");
      await fetchAllData();
    } catch (error) {
      toast.error(
        "Error deleting permission: " + (error as any).response?.data?.message
      );
    }
    handleCloseDeleteDialog();
  };

  return (
    <PageContainer>
      <Paper sx={{ height: "auto", width: "100%" }}>
        <Box sx={{ display: "flex", flexDirection: "row-reverse", p: 2 }}>
          <PermissionCheck action={PERMISSIONS_ADD}>
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
            rows={(permissionsData as any).data || []}
            loading={false}
            columns={columns}
            getRowId={(row) => row.id}
            paginationModel={paginationModel}
            pageSizeOptions={[5, 10]}
            sx={{
              "& .MuiDataGrid-cell": {
                whiteSpace: "normal !important",
                wordWrap: "break-word",
                lineHeight: "1.2 !important",
                padding: "8px",
                display: "flex",
                alignItems: "center",
              },
              "& .MuiDataGrid-row": {
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.04)",
                },
              },
            }}
          />
        </Box>
      </Paper>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        <PermissionCheck action={PERMISSIONS_EDIT}>
          <MenuItem onClick={() => handleAction("edit")}>Edit</MenuItem>
        </PermissionCheck>
        <PermissionCheck action={PERMISSIONS_DELETE}>
          <MenuItem onClick={() => handleAction("delete")}>Delete</MenuItem>
        </PermissionCheck>
      </Menu>

      {/* Create permission Modal */}
      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        aria-labelledby="create-permission-modal"
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
            {isEdit ? "Edit Permission" : "Create Permission"}
          </Typography>

          {/* Modal Content */}
          <Box>
            <TextField
              fullWidth
              select
              label="Domain"
              name="domain"
              value={formData.domain}
              onChange={handleInputChange}
              onBlur={handleBlur}
              variant="standard"
              margin="normal"
              required
              error={!!errors.domain}
              helperText={errors.domain}
            >
              {domainsData?.map((option) => (
                <MenuItem key={option.id} value={option.id}>
                  {option.title}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              select
              label="Action"
              name="action"
              value={formData.action}
              onChange={handleInputChange}
              onBlur={handleBlur}
              variant="standard"
              margin="normal"
              required
              error={!!errors.action}
              helperText={errors.action}
            >
              {/* {masterData?.permissionAction?.map((option: any) => (
                <MenuItem key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </MenuItem>
              ))} */}
            </TextField>

            <TextField
              fullWidth
              label="Instance"
              name="instance"
              value={formData.instance}
              onChange={handleInputChange}
              onBlur={handleBlur}
              variant="standard"
              margin="normal"
              required
              error={!!errors.instance}
              helperText={errors.instance}
            />

            <TextField
              fullWidth
              label="Description"
              name="permissionDescription"
              value={formData.permissionDescription}
              onChange={handleInputChange}
              onBlur={handleBlur}
              variant="standard"
              margin="normal"
              multiline
              required
              error={!!errors.permissionDescription}
              helperText={errors.permissionDescription}
            />
          </Box>

          {/* Modal Actions */}
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
              onClick={handleCreatePermission}
              className="button-common button-primary"
            >
              {isEdit ? "Update" : "Create"}
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">Delete Permission</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete this permission?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            className="button-common"
            variant="contained"
            autoFocus
          >
            Delete
          </Button>
          <Button
            onClick={handleCloseDeleteDialog}
            className="button-common buttonColor"
            variant="outlined"
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
}
