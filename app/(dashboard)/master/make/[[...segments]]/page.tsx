"use client";
import React, { useEffect, useState, useCallback, useMemo, memo } from "react";
import { GridColDef } from "@mui/x-data-grid";
import LazyDataGrid from "../../../../components/LazyDataGrid";
import Paper from "@mui/material/Paper";
import { PageContainer } from "@toolpad/core";
import {
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Modal,
  TextField,
  Typography,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Chip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import "../../../../global.css";
import {
  addMake,
  editMake,
  getAllActiveMakes,
  deleteMake,
} from "@/app/api/makeApi";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/app/redux/store";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { PermissionCheck } from "@/app/components/PermissionCheck";
import { OEM_ADD, OEM_EDIT } from "@/app/utils/permissionsActions";

const Page = memo(function Page() {
  const dispatch = useDispatch();
  const { activeMakes, isLoading, error } = useSelector(
    (state: RootState) => state.activeMakes
  );
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [deleteRow, setDeleteRow] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    make_name: "",
    status: true,
    id: null,
  });
  const [isEdit, setIsEdit] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const open = Boolean(anchorEl);

  const fetchMakes = useCallback(async () => {
    try {
      getAllActiveMakes(dispatch)();
    } catch(error) {
      // Handle error silently
      toast.error("Failed to fetch makes."+ (error as any).response.data.message || "");
    }
  }, [dispatch]);

  useEffect(() => {
    fetchMakes();
  }, [fetchMakes]);

  useEffect(() => {
    console.log("Active Makes:", activeMakes);
  }, [activeMakes]);

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: "actions",
        headerName: "Actions",
        width: 100,
        renderCell: (params) => (
          <IconButton onClick={(event) => handleOpenMenu(event, params.row)}>
            <MoreVertIcon color="action" />
          </IconButton>
        ),
      },
      { field: "name", headerName: "Make Name", flex: 1 },
      {
        field: "isActive",
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
    ],
    []
  );

  const paginationModel = useMemo(() => ({ page: 0, pageSize: 5 }), []);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, row: any) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedRow(null);
  };

  const handleAction = (task: string) => {
    if (task === "Edit") {
      setFormData({
        make_name: selectedRow.name,
        status: selectedRow.isActive,
        id: selectedRow._id,
      });
      setIsEdit(true);
      setModalOpen(true);
    } else if (task === "Delete") {
      setDeleteRow(selectedRow);
      setDeleteDialogOpen(true);
    } else {
      console.log(`${task} clicked for:`, selectedRow);
    }
    handleCloseMenu();
  };

  const handleDeleteConfirm = async () => {
    try {
      const deleteId = deleteRow._id;
      const deleteFunction = deleteMake(dispatch);
      await deleteFunction(deleteId);
      toast.success("Make deleted successfully!");
    } catch (err) {
      toast.error("Failed to delete make."+ (err as any).response.data.message || "");
    }
    setDeleteDialogOpen(false);
    setDeleteRow(null);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setDeleteRow(null);
  };

  const handleAddClick = () => {
    setFormData({ make_name: "", status: true, id: null });
    setIsEdit(false);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setFormData({ make_name: "", status: true, id: null });
  };

  const handleSave = async () => {
    try {
      if (isEdit) {
        const editFunction = editMake(dispatch);
        await editFunction(formData.id!, {
          name: formData.make_name,
          isActive: formData.status,
        });
        toast.success("Make updated successfully!");
      } else {
        const addFunction = addMake(dispatch);
        await addFunction({
          name: formData.make_name,
          isActive: formData.status,
        });
        toast.success("Make created successfully!");
      }
      handleModalClose();
    } catch (err) {
      toast.error("Operation failed. Please try again."+ (err as any).response.data.message || "");
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <PageContainer>
      <Paper sx={{ height:"auto", width: "100%" }}>
      <Box sx={{ padding: 1, display: "flex", flexDirection: "row-reverse" }}>
        <PermissionCheck action={OEM_ADD}>
        <Button
          variant="contained"
          className="button-primary button-common"
          startIcon={<AddIcon fontSize="small" />}
          onClick={handleAddClick}
        >
          Create
        </Button>
        </PermissionCheck>
      </Box>
        <LazyDataGrid
          rows={activeMakes}
          getRowId={(row: any) => row._id}
          columns={columns}
          loading={isLoading}
          paginationModel={paginationModel}
          pageSizeOptions={[5, 10]}
        />
      </Paper>
      <Menu anchorEl={anchorEl} open={open} onClose={handleCloseMenu}>
        {/* <MenuItem onClick={() => handleAction('View')}>View</MenuItem> */}
        <PermissionCheck action={OEM_EDIT}>
        <MenuItem onClick={() => handleAction("Edit")}>Edit</MenuItem>
        </PermissionCheck>
        {/* <MenuItem onClick={() => handleAction("Delete")}>Delete</MenuItem> */}
      </Menu>

      <Modal open={modalOpen} onClose={handleModalClose}>
        <Box
          sx={{
            position: "absolute",
            top: { xs: 0, sm: "50%" },
            left: { xs: 0, sm: "50%" },
            transform: { xs: "none", sm: "translate(-50%, -50%)" },
            width: { xs: "100vw", sm: 400 },
            height: { xs: "100vh", sm: "auto" },
            bgcolor: "background.paper",
            boxShadow: 24,
            p: { xs: 2, sm: 4 },
            borderRadius: { xs: 0, sm: 2 },
            overflow: "auto",
          }}
        >
          <Typography variant="h6" component="h2" mb={3}>
            {isEdit ? "Edit Make" : "Add New Make"}
          </Typography>

          <TextField
            fullWidth
            variant="standard"
            label="Make Name"
            value={formData.make_name}
            onChange={(e) => handleInputChange("make_name", e.target.value)}
            margin="normal"
          />

          <FormControlLabel
            control={
              <Switch
                checked={formData.status}
                onChange={(e) => handleInputChange("status", e.target.checked)}
                className="buttonColor"
              />
            }
            label="Status"
            sx={{ mt: 2, mb: 2 }}
          />

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

      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the make &quot;{deleteRow?.name}
            &quot;?
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
    </PageContainer>
  );
});

export default Page;
