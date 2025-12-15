"use client";
import React, { useEffect, useState, useCallback, useMemo, memo } from "react";
import { GridColDef, GridDownloadIcon } from "@mui/x-data-grid";
import LazyDataGrid from "../../../../components/LazyDataGrid";
import CommonDrawer from "../../../../components/CommonDrawer";
import Paper from "@mui/material/Paper";
import { PageContainer } from "@toolpad/core";
import {
  Box, Button, IconButton, Menu, MenuItem, Modal, TextField, Typography, FormControl, Switch, FormControlLabel, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Chip, InputLabel, Select, ListItemText, Checkbox, List, ListItem, ListItemButton, ListItemIcon, Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import UploadIcon from "@mui/icons-material/Upload";
import SettingsIcon from "@mui/icons-material/Settings";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Filter1OutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import "../../../../global.css";
import {
  getAllActiveCategories,
  addCategory,
  editCategory,
  deleteCategory,
} from "@/app/api/categoryApi";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/app/redux/store";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { PermissionCheck } from "@/app/components/PermissionCheck";
import { buildPayload, getCategoryPayload, getFilterPayload } from '../helper';
import { options, set } from "jodit/esm/core/helpers";
// import { buildPayload } from '../helper';
import ExportData from "@/app/components/ExportData";
import ImportData from "@/app/components/ImportData";
import ColumnSelector from "@/app/components/ColumnSelector";
const Page = memo(function Page() {
  const dispatch = useDispatch();
  const { activeCategories, isLoading, error, players } = useSelector(
    (state: RootState) => state.activeCategories
  );
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [deleteRow, setDeleteRow] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    category_name: "",
    slug: "",
    description: "",
    status: true,
    id: null,
  });
  const [isEdit, setIsEdit] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDrawer, setDrawer] = useState(false);
  const [drawerAction, setDrawerAction] = useState<"filter" | "add" | "edit" | "view" | "import" | "export">("filter");
  const open = Boolean(anchorEl);
  const [selCol, setSelCol] = useState<GridColDef[]>([]);
  const [filterColumns, setFilterColumns] = useState<any[]>();
  const [editableColumns, setEditableColumns] = useState<any[]>([]);
  const [editRow, setEditRow] = useState<any>();
  const optionalColumns: GridColDef[] = [
    { field: "slug", headerName: "Slug", flex: 1 },
    { field: "icon", headerName: "Icon", flex: 1 },
    { field: "color", headerName: "Color", flex: 1 },
    { field: "description", headerName: "Description", flex: 1 },
  ];

  useEffect(() => {
    if (activeCategories) {
      setFilterColumns(getFilterPayload(players || []));
      setEditableColumns(getCategoryPayload(players || []));
    }
  }, [activeCategories, players]);

  const fetchCategories = useCallback(async () => {
    try {
      getAllActiveCategories(dispatch, {})();
      // getAllFilterPlayers(dispatch)();
    } catch (error) {
      // Handle error silently
      toast.error(
        "Failed to fetch company/filters." + (error as any).response || ""
      );
    }
  }, [dispatch]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    // console.log("Active Makes:", activeCategories);
  }, [activeCategories]);

  const [columns, setColumns] = useState<GridColDef[]>([]);

  useEffect(() => {
    if (selCol) {
      setColumns([
        { field: "name", headerName: "Category Name", flex: 1 },
        ...selCol,
        {
          field: "isActive", headerName: "Status", flex: 1, renderCell: (params: any) => params.value ? (<Chip label="Active" color="success" size="small" variant="outlined" />) : (<Chip label="Inactive" size="small" color="default" variant="outlined" />),
        },
        {
          field: "actions", headerName: "Actions", width: 100, renderCell: (params) => (
            <IconButton onClick={(event) => handleOpenMenu(event, params.row)}>
              <MoreVertIcon color="action" />
            </IconButton>
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
    console.log("Task", selectedRow)
    if (task === "Edit") {
      setEditRow(selectedRow);
      setDrawerAction('edit');
      setDrawer(true);
      setIsEdit(true);
    } else if (task === "Delete") {
      setDeleteRow(selectedRow);
      setDeleteDialogOpen(true);
    } else if (task === "View") {
      setEditRow(selectedRow);
      setDrawerAction('view');
      setDrawer(true);
    } else {
      console.log(`${task} clicked for:`, selectedRow);

    }
    handleCloseMenu();
  };

  const handleDeleteConfirm = async () => {
    try {
      const deleteId = deleteRow.id;
      const deleteFunction = deleteCategory(dispatch);
      await deleteFunction(deleteId);
      toast.success("Category deleted successfully!");
    } catch (err) {
      toast.error(
        "Failed to delete category." + (err as any).response.data.message || ""
      );
    }
    setDeleteDialogOpen(false);
    setDeleteRow(null);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setDeleteRow(null);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setFormData({
      category_name: "",
      slug: "",
      description: "",
      status: true,
      id: null,
    });
  };

  const handleSave = async (data: any) => {
    try {
      if (isEdit) {
        const editFunction = editCategory(dispatch);
        const payload = buildPayload(data);
        await editFunction(data.id!, payload);
        toast.success("Category updated successfully!");
      } else {
        const addFunction = addCategory(dispatch);
        const payload = buildPayload(data);
        const resp = await addFunction(payload);
        console.log("Response", resp);
        setDrawer(false);
        toast.success("Category created successfully!");
      }
      handleModalClose();
    } catch (err) {
      toast.error(
        "Operation failed. Please try again." +
        (err as any).response.data.message || ""
      );
    }
  };

  const handleFilter = (params: any) => {
    console.log("Params", params);
    getAllActiveCategories(dispatch, params)();
    setDrawer(false);
  };

  const MenuComponent = () => {
    return (
      <Menu anchorEl={anchorEl} open={open} onClose={handleCloseMenu}>
        {/* <MenuItem onClick={() => handleAction('View')}>View</MenuItem> */}
        {/* <PermissionCheck action={OEM_EDIT}> */}
        <MenuItem onClick={() => handleAction("View")}> View</MenuItem>
        {/* </PermissionCheck> */}
        {/* <PermissionCheck action={OEM_EDIT}> */}
        <MenuItem onClick={() => handleAction("Edit")}>Edit</MenuItem>
        {/* </PermissionCheck> */}
        {/* <PermissionCheck action={OEM_EDIT}> */}
        <MenuItem onClick={() => handleAction("Delete")}>Delete</MenuItem>
        {/* </PermissionCheck> */}
        {/* <MenuItem onClick={() => handleAction("Delete")}>Delete</MenuItem> */}
      </Menu>
    );
  };

  const DeleteDialog = () => {
    return (
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the category &quot;{deleteRow?.name}
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
              <Button className="button-common button-primary" variant="contained" fullWidth onClick={() => { console.log("Selected", checked); setSelCol(checked); }}>
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
              placeholder="Category Name"
              margin="normal"
            />
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
            {/* <IconButton size="small" sx={{ background: '#dedede', mr: 1, '&:hover': { color: 'red' } }} onClick={() => onActionClicked('add')}>
              <SettingsIcon fontSize="small" />
            </IconButton> */}
            <ColumnSelector options={optionalColumns} selCol={selCol} setSelCol={setSelCol} />
            <IconButton size="small" sx={{ background: "#dedede", mr: 1, "&:hover": { color: "red" }, }} onClick={() => onActionClicked("add")}>
              <AddIcon fontSize="small" />
            </IconButton>
            <ExportData dataArray={activeCategories} type={'button'} columns={columns} />
            <ImportData title="Import Data" />
            <IconButton size="small" sx={{ background: "#dedede", mr: 1, "&:hover": { color: "red" } }} onClick={() => onActionClicked("filter")}>
              <Filter1OutlinedIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
        <LazyDataGrid
          rows={activeCategories}
          getRowId={(row: any) => row.id}
          columns={columns}
          loading={isLoading}
          paginationModel={paginationModel}
          pageSizeOptions={[5, 10]}
        />
      </Paper>
      <MenuComponent />
      {/* <CategoryModel /> */}
      <DeleteDialog />
      <CommonDrawer title={"Category Details"} isOpen={isDrawer && drawerAction === "view"} setOpen={setDrawer} defaultValue={editRow} />
      <CommonDrawer title={"Filter Options"} isOpen={isDrawer && drawerAction === "filter"} setOpen={setDrawer} columns={filterColumns} onApply={handleFilter} buttonOkLabel="Apply Filter" buttonCancelLabel="Cancel" buttonClearLabel="Clear" />
      <CommonDrawer title={"Add New Category"} isOpen={isDrawer && drawerAction === "add"} setOpen={setDrawer} columns={editableColumns} onApply={handleSave} buttonOkLabel="Add" buttonCancelLabel="Cancel" />
      <CommonDrawer title={"Edit Category"} isOpen={isDrawer && drawerAction === "edit"} setOpen={setDrawer} columns={editableColumns} defaultValue={editRow} onApply={handleSave} buttonOkLabel="Update" buttonCancelLabel="Cancel" />
      <CommonDrawer title={"Import Data"} isOpen={isDrawer && drawerAction === "import"} setOpen={setDrawer} columns={filterColumns} onApply={handleFilter} buttonOkLabel="Import" buttonCancelLabel="Cancel" />
      <CommonDrawer title={"Export Data"} isOpen={isDrawer && drawerAction === "export"} setOpen={setDrawer} columns={filterColumns} onApply={handleFilter} buttonOkLabel="Export" buttonCancelLabel="Cancel" />
    </PageContainer>
  );
});

export default Page;
