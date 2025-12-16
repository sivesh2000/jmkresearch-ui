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
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import UploadIcon from "@mui/icons-material/Upload";
import SettingsIcon from "@mui/icons-material/Settings";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Filter1OutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import "../../../../global.css";
import { addTender, editTender, getAllActiveTenders, deleteTender } from "@/app/api/tenderApi";
import { getAllActiveCompanies, getAllFilterPlayers } from "@/app/api/companyApi";
import { getAllActiveStates } from "@/app/api/stateApi";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/app/redux/store";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { PermissionCheck } from "@/app/components/PermissionCheck";
import { parseQueryParams } from '../../../../utils/functions';
import { buildPayload, getFilterPayload, getTenderPayload, ColumnConfig } from '../helper';
import ExportData from "@/app/components/ExportData";
import ImportData from "@/app/components/ImportData";
import ColumnSelector from "@/app/components/ColumnSelector";
const Page = memo(function Page() {
  const dispatch = useDispatch();
  const { activeTenders, isLoading, error, players } = useSelector((state: RootState) => state.activeTenders);
  const { activeCompanies } = useSelector((state: RootState) => state.activeCompanies);
  const { activeStates } = useSelector((state: RootState) => state.activeStates);
  const states = useSelector((state: RootState) => state);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [deleteRow, setDeleteRow] = useState<any>(null);
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
  const [editableColumns, setEditableColumns] = useState<any[]>([]);
  const [drawerAction, setDrawerAction] = useState<'filter' | 'add' | 'edit' | 'import' | 'view' | 'export'>('filter');
  const open = Boolean(anchorEl);
  const [selCol, setSelCol] = useState<GridColDef[]>([]);
  const optionalColumns: GridColDef[] = [
    { field: 'tenderName', headerName: 'Tender Name', flex: 1 },
    { field: 'tenderNumber', headerName: 'Tender Number', flex: 1 },
    // { field: 'slug', headerName: 'Slug', flex: 1 },
    { field: 'rfsIssueDate', headerName: 'RFS Issue Date', flex: 1 },
    { field: 'bidSubmissionDeadline', headerName: 'BID Submission Deadline', flex: 1 },
    { field: 'technology', headerName: 'Technology', flex: 1 },
    { field: 'tenderingAuthority', headerName: 'Tender Ingauthority', flex: 1 },
    { field: 'tenderScope', headerName: 'Tender Scope', flex: 1 },
    { field: 'tenderCapacityMW', headerName: 'Tender Capacity MW', flex: 1 },
    { field: 'allottedCapacityMW', headerName: 'Allotted Capacity MW', flex: 1 },
    { field: 'ceilingTariffINR', headerName: 'Ceiling Tariff INR', flex: 1 },
    { field: 'commissioningTimelineMonths', headerName: 'Commissioning Timeline Months', flex: 1 },
    { field: 'expectedCommissioningDate', headerName: 'Expected Commissioning Date', flex: 1 },
    { field: 'tenderStatus', headerName: 'Tender Status', flex: 1 },
    { field: 'lowestTariffQuoted', headerName: 'Lowest Tariff Quoted', flex: 1 },
    { field: 'storageComponent', headerName: 'Storage Component', flex: 1 },
    { field: 'notes', headerName: 'Notes', flex: 1 },
    { field: 'winnersDetails', headerName: 'Winners Details', flex: 1 },
    { field: 'ppaSigningDate', headerName: 'PPA Signing Date', flex: 1 },
    { field: 'location', headerName: 'Location', flex: 1 },
    { field: 'resultAnnouncedDate', headerName: 'Result Announced Date', flex: 1 },
    { field: 'companyId', headerName: 'Company ID', flex: 1 },
    { field: 'stateId', headerName: 'State ID', flex: 1 },
    {
      field: 'isActive', headerName: 'Active', flex: 1, renderCell: (params: any) =>
        params.value ? (<Chip label="Active" color="success" size="small" variant="outlined" />
        ) : (<Chip label="Inactive" size="small" color="default" variant="outlined" />),
    },
    // { field: 'createdAt', headerName: 'Created', flex: 1 },
    // { field: 'updatedAt', headerName: 'Updated', flex: 1 },
  ];
  const [filterColumns, setFilterColumns] = useState<any[]>();
  useEffect(() => {
    if (players) {
      setEditableColumns(getTenderPayload(activeCompanies, activeStates));
      setFilterColumns(getFilterPayload(activeCompanies || [], activeStates || []));
    }
  }, [players, activeCompanies, activeStates]);
  const fetcTenders = useCallback(async () => {
    try {
      getAllActiveCompanies(dispatch, {})();
      getAllActiveTenders(dispatch, {})();
      getAllActiveStates(dispatch, {})();
      getAllFilterPlayers(dispatch)();
    } catch (error) {
      // Handle error silently
      toast.error(
        "Failed to fetch tender/filters." + (error as any).response || ""
      );
    }
  }, [dispatch]);

  useEffect(() => {
    fetcTenders();
  }, [fetcTenders]);

  useEffect(() => {
    // console.log("Active Makes:", activeTenders);
  }, [activeTenders]);

  const [columns, setColumns] = useState<GridColDef[]>([
    { field: "tenderName", headerName: "Tender Name", flex: 1 },
    { field: "tenderNumber", headerName: "Tender Number", flex: 1 },
    { field: "location", headerName: "Location", flex: 1 },
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
        { field: "tenderName", headerName: "Tender Name", flex: 1 },
        { field: "tenderNumber", headerName: "Tender Number", flex: 1 },
        { field: "location", headerName: "Location", flex: 1 },
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
      setDrawerAction('edit');
      setDrawer(true);
    } else if (task === "Delete") {
      console.log("Delete", selectedRow);
      setDeleteRow(selectedRow);
      setDeleteDialogOpen(true);
    } else if (task === "View") {
      setDrawerAction('view');
      setDrawer(true);
      setIsEdit(false);
    } else {
      console.log(`${task} clicked for:`, selectedRow);
    }
    handleCloseMenu();
  };

  const handleDeleteConfirm = async () => {
    try {
      const deleteId = deleteRow.id;
      const deleteFunction = deleteTender(dispatch);
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
    console.log(data, "HandleSave")
    const transformedData = {
      ...data,
      companyId: data.company.id,
      stateId: data.state._id,
    };
    try {
      if (isEdit) {
        const editFunction = editTender(dispatch);
        const payload = buildPayload(transformedData);
        await editFunction(data.id!, payload);
        setDrawer(false);
        toast.success("Tender updated successfully!");
      } else {
        const addFunction = addTender(dispatch);
        const payload = buildPayload(transformedData);
        console.log("payload", payload);
        const resp = await addFunction(payload);
        console.log("resp", resp);
        setDrawer(false);
        toast.success("Tender created successfully!");
      }
      handleModalClose();
    } catch (err) {
      toast.error(
        "Operation failed. Please try again." +
        (err as any).response.data.message || ""
      );
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFilter = (params: any) => {
    console.log("Params", params);
    getAllActiveTenders(dispatch, params)();
    setDrawer(false);
  };

  const MenuComponent = () => {
    return (
      <Menu anchorEl={anchorEl} open={open} onClose={handleCloseMenu}>
        <MenuItem onClick={() => handleAction("View")}>
          <VisibilityIcon sx={{ mr: 1 }} /> View
        </MenuItem>

        <MenuItem onClick={() => handleAction("Edit")}>
          <EditIcon sx={{ mr: 1 }} /> Edit
        </MenuItem>

        <MenuItem onClick={() => handleAction("Delete")}>
          <DeleteIcon sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>
    );
  };

  const TenderModel = () => {
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
            {isEdit ? "Edit Tender" : "Add New Tender"}
          </Typography>
          <TextField
            fullWidth
            variant="standard"
            label="Tender Name"
            value={formData.make_name}
            onChange={(e) => handleInputChange("tender_name", e.target.value)}
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

  const ColSelector: React.FC<any> = ({
    options,
    selCol,
    setSelCol,
  }) => {
    const [viewCols, setViewCols] = useState(false);
    const [checked, setChecked] = useState<any[]>(selCol || []);

    const handleToggle = (value: any) => {
      console.log("Value", checked);
      const isExist = checked.find((x) => x.field === value.field);
      if (isExist) {
        setChecked(checked.filter((x) => x.field !== value.field));
      } else {
        setChecked([...checked, value]);
      }
    };

    return (
      <>
        <Tooltip title="Columns selection" placement="top">
          <IconButton
            size="small"
            sx={{ background: "#dedede", mr: 1, "&:hover": { color: "red" } }}
            onClick={() => setViewCols(true)}
          >
            <SettingsIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Modal open={viewCols} onClose={() => setViewCols(false)}>
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
            <Typography variant="h6" mb={3}>
              Select Columns
            </Typography>

            <List
              sx={{
                width: "100%",
                maxWidth: 360,
                bgcolor: "background.paper",
                position: "relative",
                overflow: "auto",
                maxHeight: 300,
                "& ul": { padding: 0 },
              }}
            >
              {options.map((e: GridColDef) => {
                const labelId = `checkbox-list-label-${e.field}`;
                return (
                  <ListItem key={e.field} disablePadding>
                    <ListItemButton onClick={() => handleToggle(e)} dense>
                      <ListItemIcon>
                        <Checkbox
                          edge="start"
                          checked={checked.includes(e)}
                          tabIndex={-1}
                          disableRipple
                          inputProps={{ "aria-labelledby": labelId }}
                        />
                      </ListItemIcon>
                      <ListItemText id={labelId} primary={e.headerName} />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>

            <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
              <Button
                className="button-common button-primary"
                variant="contained"
                fullWidth
                onClick={() => {
                  console.log("Selected", checked);
                  setSelCol(checked);
                  // setViewCols(false);
                }}
              >
                OK
              </Button>
              <Button
                className="button-common buttonColor"
                variant="outlined"
                fullWidth
                onClick={() => setViewCols(false)}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        </Modal>
      </>
    );
  };

  return (
    <PageContainer>
      <Paper sx={{ height: "auto", width: "100%" }}>
        <Box sx={{ padding: 1, display: "flex", justifyContent: "space-between" }}>
          <Box sx={{ textAlign: "left", display: "flex", justifyContent: "center", alignItems: "center", gap: 1 }}>
            <TextField sx={{ width: '300px' }} variant="standard" placeholder="Tender Name1" margin="normal" />
            <Box sx={{ textAlign: "right", pt: 2 }}>
              <IconButton
                size="small"
                sx={{
                  background: "#dedede",
                  mr: 1,
                  "&:hover": { color: "red" },
                }}
              >
                <SearchIcon fontSize="small" />
              </IconButton>

              <IconButton
                size="small"
                sx={{
                  background: "#dedede",
                  mr: 1,
                  "&:hover": { color: "red" },
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
          <Box sx={{ textAlign: "right", pt: 3 }}>
            <ColumnSelector options={optionalColumns} selCol={selCol} setSelCol={setSelCol} />
            <Tooltip title="Add New Tender" placement="top">
              <IconButton size="small" sx={{ background: '#dedede', mr: 1, '&:hover': { color: 'red' } }} onClick={() => onActionClicked('add')}>
                <AddIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <ExportData dataArray={activeTenders} type={'button'} columns={columns} />
            <ImportData title="Import Data" />
            <Tooltip title="Filter tender data" placement="top">
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
          rows={activeTenders}
          getRowId={(row: any) => row.id}
          columns={columns}
          loading={isLoading}
          paginationModel={paginationModel}
          pageSizeOptions={[5, 10]}
        />
      </Paper>
      <MenuComponent />
      <TenderModel />
      <DeleteDialog />
      <CommonDrawer title={'View Tender Info'} isOpen={isDrawer && drawerAction === 'view'} setOpen={setDrawer} defaultValue={editRow} buttonCancelLabel="Cancel" buttonClearLabel="Clear" />
      <CommonDrawer title={'Filter Options'} isOpen={isDrawer && drawerAction === 'filter'} setOpen={setDrawer} columns={filterColumns} onApply={handleFilter} buttonOkLabel="Apply Filter" buttonCancelLabel="Cancel" buttonClearLabel="Clear" />
      <CommonDrawer title={'Add New Tender'} isOpen={isDrawer && drawerAction === 'add'} setOpen={setDrawer} columns={editableColumns} onApply={handleSave} buttonOkLabel="Add" buttonCancelLabel="Cancel" />
      <CommonDrawer title={'Edit Tender'} isOpen={isDrawer && drawerAction === 'edit'} setOpen={setDrawer} columns={editableColumns} defaultValue={editRow} onApply={handleSave} buttonOkLabel="Update" buttonCancelLabel="Cancel" />
      <CommonDrawer title={'Import Data'} isOpen={isDrawer && drawerAction === 'import'} setOpen={setDrawer} columns={filterColumns} onApply={handleFilter} buttonOkLabel="Import" buttonCancelLabel="Cancel" />
      <CommonDrawer title={'Export Data'} isOpen={isDrawer && drawerAction === 'export'} setOpen={setDrawer} columns={filterColumns} onApply={handleFilter} buttonOkLabel="Export" buttonCancelLabel="Cancel" />
    </PageContainer>
  );
});

export default Page;
