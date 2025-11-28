"use client";
import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import { GridColDef } from "@mui/x-data-grid";
import LazyDataGrid from "../../../../components/LazyDataGrid";
import Paper from "@mui/material/Paper";
import { PageContainer } from "@toolpad/core";
import {
  Box,
  Button,
  Card,
  CardContent,
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
  Drawer,
  Select,
  FormControl,
  InputLabel,
  Chip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import CloseIcon from "@mui/icons-material/Close";
import "../../../../global.css";
import {
  addModel,
  deleteModel,
  getAllFilterMakes,
  getAllModel,
  updateModel,
  getFilterModelById,
  getAllActiveMakes,
} from "@/app/api/modelApi";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/app/redux/store";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { PermissionCheck } from "@/app/components/PermissionCheck";
import { MODEL_ADD, MODEL_EDIT } from "@/app/utils/permissionsActions";

const Page = memo(function Page() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [rowToDelete, setRowToDelete] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    make_name: "",
    model_name: "",
  });
  const [isEdit, setIsEdit] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [filterValue, setFilterValue] = useState("");
  const open = Boolean(anchorEl);
  const dispatch = useDispatch();
  const { modelList, loading, error } = useSelector(
    (state: RootState) => state.modelData
  );
  const { makes } = useSelector((state: RootState) => state.modelFilter);
  const { activeMakes } = useSelector((state: RootState) => state.activeMakes);
  // useEffect(() => {
  //   console.log("activeMakes", activeMakes);
  // }, [activeMakes]);
  const fetchData = useCallback(async () => {
    try {
      await getAllModel(dispatch);
      await getAllFilterMakes(dispatch);
    } catch (error) {
      // Handle error silently
      toast.error(
        "Failed to fetch models." + (error as any).response.data.message || ""
      );
    }
  }, [dispatch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // useEffect(() => {
  //   if (error) {
  //     toast.error(error);
  //   }
  // }, [error]);

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: "actions",
        headerName: "Actions",
        filterable: false,
        width: 100,
        renderCell: (params) => (
          <IconButton onClick={(event) => handleOpenMenu(event, params.row)}>
            <MoreVertIcon color="action" />
          </IconButton>
        ),
      },
      {
        field: "makeName",
        headerName: "Make Name",
        flex: 1,
        valueGetter: (value, row) => row.makeId?.name || "N/A",
      },
      { field: "name", headerName: "Model Name", flex: 1 },
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

  const paginationModel = useMemo(() => ({ page: 0, pageSize: 10 }), []);

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
      await getAllActiveMakes(dispatch)();
      // console.log("selectedRow", selectedRow);
      setFormData({
        id: selectedRow._id,
        make_name: selectedRow.makeId?._id || "",
        model_name: selectedRow.name,
        // status: selectedRow.isActive,
      });
      setIsEdit(true);
      setModalOpen(true);
    } else if (task === "Delete") {
      setRowToDelete(selectedRow);
      setDeleteDialogOpen(true);
    } else {
      console.log(`${task} clicked for:`, selectedRow);
    }
    handleCloseMenu();
  };

  const handleDeleteConfirm = async () => {
    if (!rowToDelete?._id) {
      toast.error("No record selected for deletion");
      setDeleteDialogOpen(false);
      return;
    }
    try {
      await deleteModel(rowToDelete._id, dispatch);
      toast.success("Model deleted successfully!");
    } catch (error) {
      toast.error(
        "Failed to delete model." + (error as any).response.data.message || ""
      );
    }
    setDeleteDialogOpen(false);
    setRowToDelete(null);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setRowToDelete(null);
  };

  const handleAddClick = async () => {
    await getAllActiveMakes(dispatch)();
    setFormData({ id: null, make_name: "", model_name: "" });
    setIsEdit(false);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setFormData({ id: null, make_name: "", model_name: "" });
  };

  const handleSave = async () => {
    try {
      if (!isEdit) {
        if (!formData.make_name || !formData.model_name) {
          toast.error(
            "Please fill all required fields: Make Name and Model Name"
          );
          return;
        }
      }
      if (isEdit) {
        await updateModel(formData.id!, formData, dispatch);
        toast.success("Model updated successfully!");
      } else {
        await addModel(formData, dispatch);
        toast.success("Model created successfully!");
      }
      handleModalClose();
    } catch (error) {
      toast.error(
        "Error saving Model." + (error as any).response.data.message || ""
      );
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFilter = async () => {
    setFilterDrawerOpen(false);
    if (filterValue) {
      try {
        await getFilterModelById(dispatch)(filterValue);
        toast.success("Models filtered successfully!");
      } catch (error) {
        toast.error(
          "Failed to filter models." + (error as any).response.data.message ||
            ""
        );
      }
    } else {
      try {
        await getAllModel(dispatch);
        toast.success("All models loaded!");
      } catch (error) {
        toast.error(
          "Failed to load all models." + (error as any).response.data.message ||
            ""
        );
      }
    }
  };

  return (
    <PageContainer>
      <Paper sx={{ height: 400, width: "100%" }}>
        <Box
          sx={{
            padding: 1,
            display: "flex",
            flexDirection: "row-reverse",
            gap: 1,
          }}
        >
          <Button
            variant="outlined"
            className="button-common buttonColor"
            startIcon={<FilterAltIcon fontSize="small" />}
            onClick={() => setFilterDrawerOpen(true)}
          >
            Filter
          </Button>
          <PermissionCheck action={MODEL_ADD}>
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
          rows={modelList}
          columns={columns}
          loading={loading}
          paginationModel={paginationModel}
          pageSizeOptions={[5, 10]}
        />
      </Paper>

      <Menu anchorEl={anchorEl} open={open} onClose={handleCloseMenu}>
        {/* <MenuItem onClick={() => handleAction('View')}>View</MenuItem> */}
        <PermissionCheck action={MODEL_EDIT}>
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
            {isEdit ? "Edit Model" : "Add New Model"}
          </Typography>

          <FormControl fullWidth variant="standard" margin="normal" required>
            <InputLabel>Make Name</InputLabel>
            <Select
              value={formData.make_name}
              onChange={(e) => handleInputChange("make_name", e.target.value)}
              label="Make Name"
            >
              {activeMakes.map((make) => (
                <MenuItem
                  key={(make as any)._id}
                  value={(make as any)._id || make.id}
                >
                  {make.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            variant="standard"
            label="Model Name"
            value={formData.model_name}
            onChange={(e) => handleInputChange("model_name", e.target.value)}
            margin="normal"
          />

          {/* <FormControlLabel
            control={
              <Switch
                checked={formData.status}
                onChange={(e) => handleInputChange("status", e.target.checked)}
                className="buttonColor"
              />
            }
            label="Status"
            sx={{ mt: 2, mb: 2 }}
          /> */}

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
            Are you sure you want to delete the model &quot;{rowToDelete?.name}
            &quot; from {rowToDelete?.makeId?.name}?
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

        <FormControl fullWidth variant="standard" margin="normal">
          <InputLabel>Make Name</InputLabel>
          <Select
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            label="Make Name"
          >
            {makes.map((make) => (
              <MenuItem key={make._id} value={make._id}>
                {make.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
          <Button
            className="button-common button-primary"
            variant="contained"
            onClick={handleFilter}
            fullWidth
          >
            Apply
          </Button>
          <Button
            className="button-common buttonColor"
            variant="outlined"
            onClick={async () => {
              setFilterValue("");
              setFilterDrawerOpen(false);
              try {
                await getAllModel(dispatch);
                toast.success("All models loaded!");
              } catch (error) {
                toast.error(
                  "Failed to load all models." +
                    (error as any).response.data.message || ""
                );
              }
            }}
            fullWidth
          >
            Clear
          </Button>
        </Box>
      </Drawer>
    </PageContainer>
  );
});

export default Page;
