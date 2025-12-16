"use client";
import React, { useEffect, useState, useCallback, useMemo, memo } from "react";
import { GridColDef, GridDownloadIcon } from "@mui/x-data-grid";
import LazyDataGrid from "../../../../components/LazyDataGrid";
import CommonDrawer from "../../../../components/CommonDrawer";
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
  FormControl,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Chip,
  InputLabel,
  Select,
  ListItemText,
  Checkbox,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  Tooltip,
  ButtonBase,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Refresh";
import DownloadIcon from "@mui/icons-material/Download";
import UploadIcon from "@mui/icons-material/Upload";
import SettingsIcon from "@mui/icons-material/Settings";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Filter1OutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import "../../../../global.css";
import {
  addCompany,
  editCompany,
  getAllActiveCompanies,
  deleteCompany,
  getAllFilterPlayers,
} from "@/app/api/companyApi";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/app/redux/store";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { PermissionCheck } from "@/app/components/PermissionCheck";
import { parseQueryParams } from "../../../../utils/functions";
import { buildPayload, getCompanyPayload, getFilterPayload } from "../helper";
import ExportData from "@/app/components/ExportData";
import ImportData from "@/app/components/ImportData";
import ColumnSelector from "@/app/components/ColumnSelector";
const Page = memo(function Page() {
  const dispatch = useDispatch();
  const { activeCompanies, isLoading, error, players } = useSelector(
    (state: RootState) => state.activeCompanies
  );
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [deleteRow, setDeleteRow] = useState<any>(null);
  const [searchValue, setSearchValue] = useState<String>("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editRow, setEditRow] = useState<any>(null);
  const [formData, setFormData] = useState({
    make_name: "",
    status: true,
    id: null,
  });
  const [isEdit, setIsEdit] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDrawer, setDrawer] = useState(false);
  const [drawerAction, setDrawerAction] = useState<
    "filter" | "add" | "edit" | "import" | "export" | "view"
  >("filter");
  const open = Boolean(anchorEl);
  const [selCol, setSelCol] = useState<GridColDef[]>([]);
  const optionalColumns: GridColDef[] = [
    { field: "website", headerName: "Website", flex: 1 },
    { field: "slug", headerName: "Slug", flex: 1 },
    { field: "createdAt", headerName: "Created", flex: 1 },
    { field: "updatedAt", headerName: "Updated", flex: 1 },
    {
      field: "isVerified",
      headerName: "Verification",
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
    { field: "contactInfo.country", headerName: "Country", flex: 1 },
    { field: "contactInfo.email", headerName: "Email", flex: 1 },
    { field: "contactInfo.phone", headerName: "Phone", flex: 1 },
    { field: "contactInfo.address", headerName: "Address", flex: 1 },
    { field: "contactInfo.city", headerName: "City", flex: 1 },
    { field: "contactInfo.state", headerName: "State", flex: 1 },
    { field: "contactInfo.pincode", headerName: "Pincode", flex: 1 },
  ];

  const [newCompany, setNewCompany] = useState<any[]>([]);
  const [filterColumns, setFilterColumns] = useState<any[]>();

  useEffect(() => {
    if (players) {
      setNewCompany(getCompanyPayload(players || []));
      setFilterColumns(getFilterPayload(players || []));
    }
  }, [players]);

  const fetcCompanies = useCallback(async () => {
    try {
      getAllActiveCompanies(dispatch, {})();
      getAllFilterPlayers(dispatch)();
    } catch (error) {
      toast.error(
        "Failed to fetch company/filters." + (error as any).response || ""
      );
    }
  }, [dispatch]);

  useEffect(() => { fetcCompanies(); }, [fetcCompanies]);

  useEffect(() => {
    // console.log("Active Makes:", activeCompanies);
  }, [activeCompanies]);

  const [columns, setColumns] = useState<GridColDef[]>([
    { field: "name", headerName: "Company Name", flex: 1 },
    { field: "description", headerName: "Brief Overview", flex: 1 },
    { field: "playerType", headerName: "Player Type", flex: 1 },
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
    {
      field: "actions",
      headerName: "Actions",
      width: 90,
      renderCell: (params) => (
        <>
          <IconButton onClick={(event) => handleOpenMenu(event, params.row)}>
            <MoreVertIcon color="action" />
          </IconButton>
        </>
      ),
    },
  ]);

  useEffect(() => {
    if (selCol) {
      setColumns([
        { field: "name", headerName: "Company Name", flex: 1 },
        { field: "description", headerName: "Brief Overview", flex: 1 },
        { field: "playerType", headerName: "Player Type", flex: 1 },
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
        ...selCol,
        {
          field: "actions",
          headerName: "Actions",
          width: 90,
          renderCell: (params) => (
            <>
              <IconButton
                onClick={(event) => handleOpenMenu(event, params.row)}
              >
                <MoreVertIcon color="action" />
              </IconButton>
            </>
          ),
        },
      ]);
    }
  }, [selCol]);

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
    setEditRow(selectedRow);
    if (task === "Edit") {
      setIsEdit(true);
      setDrawerAction("edit");
      setDrawer(true);
    } else if (task === "Delete") {
      setDeleteDialogOpen(true);
    } else if (task === "View") {
      setDrawerAction("view");
      setDrawer(true);
    }

    else {
      console.log(`${task} clicked for:`, selectedRow);
    }
    handleCloseMenu();
  };

  const handleDeleteConfirm = async () => {
    try {
      const deleteId = deleteRow.id;
      const deleteFunction = deleteCompany(dispatch);
      await deleteFunction(deleteId);
      toast.success("Make deleted successfully!");
    } catch (err) {
      toast.error(
        "Failed to delete make." + (err as any).response.data.message || ""
      );
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

  const handleSave = async (data: any) => {
    console.log("Date", data)
    try {
      if (isEdit) {
        const editFunction = editCompany(dispatch);
        await editFunction(data.id!, data);
        toast.success("Make updated successfully!");
      } else {
        const addFunction = addCompany(dispatch);
        const payload = buildPayload(data);
        const resp = await addFunction(payload);
        console.log("resp", payload);
        setDrawer(false);
        toast.success("Company created successfully!");
      }
      handleModalClose();
    } catch (err) {
      console.log("Error", err);
      toast.error("Operation failed. Please try again." + (err as any).response.data.message || "");
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFilter = (params: any) => {
    getAllActiveCompanies(dispatch, params)();
    setDrawer(false);
  };

  const MenuComponent = () => {
    return (
      <Menu anchorEl={anchorEl} open={open} onClose={handleCloseMenu}>
        {/* <MenuItem onClick={() => handleAction('View')}>View</MenuItem> */}

        <MenuItem onClick={() => handleAction("View")}>
          <VisibilityIcon sx={{ mr: 1 }} /> View
        </MenuItem>

        <MenuItem onClick={() => handleAction("Edit")}>
          <EditIcon sx={{ mr: 1 }} /> Edit
        </MenuItem>

        <MenuItem onClick={() => handleAction("Delete")}>
          <DeleteIcon sx={{ mr: 1 }} /> Delete
        </MenuItem>

        {/* <MenuItem onClick={() => handleAction("Delete")}>Delete</MenuItem> */}
      </Menu>
    );
  };

  const CompanyModel = () => {
    return (
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
            {isEdit ? "Edit Company" : "Add New Company"}
          </Typography>
          <TextField
            fullWidth
            variant="standard"
            label="Company Name"
            value={formData.make_name}
            onChange={(e) => handleInputChange("company_name", e.target.value)}
            margin="normal"
          />
          <FormControl fullWidth variant="standard" margin="normal">
            <InputLabel>Player Type</InputLabel>
            <Select
              // value={filterValue}
              // onChange={(e) => setFilterValue(e.target.value)}
              label="Player Type"
            >
              {players &&
                players.map((player: any, index: number) => (
                  <MenuItem key={index} value={player}>
                    {player}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            variant="standard"
            label="Brief Overview"
            value={formData.make_name}
            onChange={(e) =>
              handleInputChange("brief_overview", e.target.value)
            }
            margin="normal"
          />
          <TextField
            fullWidth
            variant="standard"
            label="Address"
            value={formData.make_name}
            onChange={(e) => handleInputChange("address", e.target.value)}
            margin="normal"
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
    );
  };

  const DeleteDialog = () => {
    return (
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
    );
  };

  const onActionClicked = (
    action: "filter" | "add" | "edit" | "import" | "export"
  ) => {
    setDrawerAction(action);
    setDrawer(true);
  };

  return (
    <PageContainer>
      <Paper sx={{ height: "auto", width: "100%" }}>
        <Box
          sx={{ padding: 1, display: "flex", justifyContent: "space-between" }}
        >
          <Box
            sx={{
              textAlign: "left",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 1,
            }}
          >
            <TextField
              sx={{ width: "300px" }}
              variant="standard"
              placeholder="Search..."
              margin="normal"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
            <Box sx={{ textAlign: "right", pt: 2 }}>
              <IconButton
                key="btn1"
                size="small"
                sx={{
                  background: "#dedede",
                  mr: 1,
                  "&:hover": { color: "red" },
                }}
                onClick={() => {
                  handleFilter({ search: searchValue });
                }}
              >
                <SearchIcon fontSize="small" />
              </IconButton>

              <IconButton
                key="btn2"
                size="small"
                sx={{
                  background: "#dedede",
                  mr: 1,
                  "&:hover": { color: "red" },
                }}
                onClick={() => {
                  handleFilter({ search: "" });
                  setSearchValue("");
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
          <Box sx={{ textAlign: "right", pt: 3 }}>
            <ColumnSelector
              options={optionalColumns}
              selCol={selCol}
              setSelCol={setSelCol}
            />

            <Tooltip title="Add New Company" placement="top">
              <IconButton
                size="small"
                sx={{
                  background: "#dedede",
                  mr: 1,
                  "&:hover": { color: "red" },
                }}
                onClick={() => onActionClicked("add")}
              >
                <AddIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <ExportData
              dataArray={activeCompanies}
              type={"button"}
              columns={newCompany}
              title="Export Company Data"
              api='companies/export'
              setOpen={setDrawer}
              isOpen={isDrawer && drawerAction === "export"}
            />

            <ImportData title="Import Data" template="company.csv" api="companies/import" />
            <Tooltip title="Filter company data" placement="top">
              <IconButton
                size="small"
                sx={{
                  background: "#dedede",
                  mr: 1,
                  "&:hover": { color: "red" },
                }}
                onClick={() => onActionClicked("filter")}
              >
                <Filter1OutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        <LazyDataGrid
          rows={activeCompanies}
          getRowId={(row: any) => row.id}
          columns={columns}
          loading={isLoading}
          paginationModel={paginationModel}
          pageSizeOptions={[5, 10]}
        />
      </Paper>
      <MenuComponent />
      <CompanyModel />
      <DeleteDialog />
      <CommonDrawer
        title={"Filter Options"}
        isOpen={isDrawer && drawerAction === "filter"}
        setOpen={setDrawer}
        columns={filterColumns}
        onApply={handleFilter}
        buttonOkLabel="Apply Filter"
        buttonCancelLabel="Cancel"
        buttonClearLabel="Clear"
      />
      <CommonDrawer
        title={"View Company Details"}
        defaultValue={editRow}
        isOpen={isDrawer && drawerAction === "view"}
        setOpen={setDrawer}
        buttonCancelLabel="Cancel"
      />
      <CommonDrawer
        title={"Add New Company"}
        isOpen={isDrawer && drawerAction === "add"}
        setOpen={setDrawer}
        columns={newCompany}
        onApply={handleSave}
        buttonOkLabel="Add"
        buttonCancelLabel="Cancel"
      />
      <CommonDrawer
        title={"Edit Company"}
        isOpen={isDrawer && drawerAction === "edit"}
        setOpen={setDrawer}
        columns={newCompany}
        onApply={handleSave}
        defaultValue={editRow}
        buttonOkLabel="Update"
        buttonCancelLabel="Cancel"
      />
      <CommonDrawer
        title={"Import Data"}
        isOpen={isDrawer && drawerAction === "import"}
        setOpen={setDrawer}
        columns={filterColumns}
        onApply={handleFilter}
        buttonOkLabel="Import"
        buttonCancelLabel="Cancel"
      />
      <CommonDrawer
        title={"Export Data"}
        isOpen={isDrawer && drawerAction === "export"}
        setOpen={setDrawer}
        availableColumns={newCompany}
        columns={filterColumns}
        onApply={handleFilter}
        buttonOkLabel="Export"
        buttonCancelLabel="Cancel"
      />
    </PageContainer>
  );
});

export default Page;
