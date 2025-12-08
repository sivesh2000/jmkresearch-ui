"use client";
import React, { useEffect, useState, useCallback, useMemo, memo } from "react";
import { GridColDef, GridDownloadIcon } from "@mui/x-data-grid";
import LazyDataGrid from "../../../../components/LazyDataGrid";
import CommonDrawer from "../../../../components/CommonDrawer";
import Paper from "@mui/material/Paper";
import { PageContainer } from "@toolpad/core";
import {
  Box, Button, IconButton, Menu, MenuItem, Modal, TextField, Typography,
  FormControl, Switch, FormControlLabel, Dialog, DialogTitle, DialogContent,
  DialogContentText, DialogActions, Chip, InputLabel, Select
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
import { getAllActiveCategories, addCategory, editCategory, deleteCategory } from "@/app/api/categoryApi";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/app/redux/store";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { PermissionCheck } from "@/app/components/PermissionCheck";
import { OEM_ADD, OEM_EDIT } from "@/app/utils/permissionsActions";
import { options, set } from "jodit/esm/core/helpers";

const Page = memo(function Page() {
  const dispatch = useDispatch();
  const { activeCategories, isLoading, error, players } = useSelector((state: RootState) => state.activeCategories);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [deleteRow, setDeleteRow] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ category_name: "", slug: "", description: "", status: true, id: null });
  const [isEdit, setIsEdit] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDrawer, setDrawer] = useState(false);
  const [drawerAction, setDrawerAction] = useState<'filter' | 'add' | 'edit' | 'import' | 'export'>('filter');
  const open = Boolean(anchorEl);

  const filterColumns: any[] = [
    { field: "name", headerName: "Category Name", type: 'textbox' },
    { field: "slug", headerName: "Slug", type: 'textbox' },
    { field: "description", headerName: "Brief Overview", type: 'textbox' },
    // { field: "status", headerName: "Status", type: 'switch' },
    // { field: "playerType",multiple:true, headerName: "Player Type", type: 'dropdown', options: players || [], optionLabelField: null, optionValueField: null },
    { field: "isActive", headerName: "Status", type: 'dropdown', options: [{ key: "Active", value: true }, { key: "In-Active", value: false }], optionLabelField: 'key', optionValueField: 'value' },
  ];

  const fetchCategories = useCallback(async () => {
    try {
      getAllActiveCategories(dispatch)();
      // getAllFilterPlayers(dispatch)();
    } catch (error) {
      // Handle error silently
      toast.error("Failed to fetch company/filters." + (error as any).response || "");
    }
  }, [dispatch]);

  useEffect(() => {
    fetchCategories();
  }, []);


  useEffect(() => {
    // console.log("Active Makes:", activeCategories);
  }, [activeCategories]);

  const columns: GridColDef[] = useMemo(() => [
    { field: "name", headerName: "Category Name", flex: 1 },
    { field: "slug", headerName: "Slug", flex: 1 },
    { field: "description", headerName: "Brief Overview", flex: 1 },
    // { field: "playerType", headerName: "Player Type", flex: 1 },
    {
      field: "isActive", headerName: "Status", flex: 1, renderCell: (params: any) =>
        params.value ? (<Chip label="Active" color="success" size="small" variant="outlined" />
        ) : (<Chip label="Inactive" size="small" color="default" variant="outlined" />),
    },
    {
      field: "actions", headerName: "Actions", width: 100, renderCell: (params) => (
        <IconButton onClick={(event) => handleOpenMenu(event, params.row)}>
          <MoreVertIcon color="action" />
        </IconButton>
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
        category_name: selectedRow.name,
        slug: selectedRow.slug,
        description: selectedRow.description,
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
      const deleteFunction = deleteCategory(dispatch);
      await deleteFunction(deleteId);
      toast.success("Category deleted successfully!");
    } catch (err) {
      toast.error("Failed to delete category." + (err as any).response.data.message || "");
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
    setFormData({ category_name: "", slug: "", description: "", status: true, id: null });
  };

  const handleSave = async (data: any) => {
    try {
      if (isEdit) {
        const editFunction = editCategory(dispatch);
        await editFunction(formData.id!, {
          name: formData.category_name,
          slug: formData.slug,
          description: formData.description,
          isActive: formData.status,
        });
        toast.success("Category updated successfully!");
      } else {
        const addFunction = addCategory(dispatch);
        const payload = {
          name: data?.name,
          slug: data.slug,
          description: data.description,
          isActive: true
        }
        const resp =await addFunction(payload);
        console.log("Response", resp)
        setDrawer(false);
        toast.success("Category created successfully!");
      }
      handleModalClose();
    } catch (err) {
      toast.error("Operation failed. Please try again." + (err as any).response.data.message || "");
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFilter = (params: any) => {
    console.log("Params", params)
    setDrawer(false);
  }


  const MenuComponent = () => {
    return (<Menu anchorEl={anchorEl} open={open} onClose={handleCloseMenu}>
      {/* <MenuItem onClick={() => handleAction('View')}>View</MenuItem> */}
      <PermissionCheck action={OEM_EDIT}>
        <MenuItem onClick={() => handleAction("Edit")}> View</MenuItem>
      </PermissionCheck>
      <PermissionCheck action={OEM_EDIT}>
        <MenuItem onClick={() => handleAction("Edit")}>Edit</MenuItem>
      </PermissionCheck>
      <PermissionCheck action={OEM_EDIT}>
        <MenuItem onClick={() => handleAction("Edit")}>Delete</MenuItem>
      </PermissionCheck>
      {/* <MenuItem onClick={() => handleAction("Delete")}>Delete</MenuItem> */}
    </Menu>)
  };

  const DeleteDialog = () => {
    return (<Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
      <DialogTitle>Confirm Delete</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to delete the category &quot;{deleteRow?.name}
          &quot;?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={handleDeleteCancel} className="button-common buttonColor">Cancel</Button>
        <Button onClick={handleDeleteConfirm} className="button-common button-primary" variant="contained">Delete</Button>
      </DialogActions>
    </Dialog>);
  }

  const onActionClicked = (action: 'filter' | 'add' | 'edit' | 'import' | 'export') => {
    setDrawerAction(action);
    setDrawer(true);
  }
  return (
    <PageContainer>
      <Paper sx={{ height: "auto", width: "100%" }}>
        <Box sx={{ padding: 1, display: "flex", justifyContent: "space-between" }}>
          <Box sx={{ textAlign: "left", display: "flex", justifyContent: "center", alignItems: "center", gap: 1 }}>
            <TextField sx={{ width: '300px' }} variant="standard" placeholder="Category Name" margin="normal" />
            <Box sx={{ textAlign: "right", pt: 2 }}>
              <IconButton variant="contained" size="small" sx={{ background: '#dedede', mr: 1, '&:hover': { color: 'red' } }}>
                <SearchIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" sx={{ background: '#dedede', mr: 1, '&:hover': { color: 'red' } }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
          <Box sx={{ textAlign: "right", pt: 3 }}>
            <IconButton size="small" sx={{ background: '#dedede', mr: 1, '&:hover': { color: 'red' } }} onClick={() => onActionClicked('add')}>
              <SettingsIcon fontSize="small" />
            </IconButton>
            <PermissionCheck action={OEM_ADD}>
              <IconButton size="small" sx={{ background: '#dedede', mr: 1, '&:hover': { color: 'red' } }} onClick={() => onActionClicked('add')}>
                <AddIcon fontSize="small" />
              </IconButton>
            </PermissionCheck>
            <PermissionCheck action={OEM_ADD}>
              <IconButton size="small" sx={{ background: '#dedede', mr: 1, '&:hover': { color: 'red' } }} onClick={() => onActionClicked('export')}>
                <DownloadIcon fontSize="small" />
              </IconButton>
            </PermissionCheck>
            <PermissionCheck action={OEM_ADD}>
              <IconButton size="small" sx={{ background: '#dedede', mr: 1, '&:hover': { color: 'red' } }} onClick={() => onActionClicked('import')}>
                <UploadIcon fontSize="small" />
              </IconButton>
            </PermissionCheck>
            <IconButton size="small" sx={{ background: '#dedede', mr: 1, '&:hover': { color: 'red' } }} onClick={() => onActionClicked('filter')}>
              <Filter1OutlinedIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
        <LazyDataGrid rows={activeCategories} getRowId={(row: any) => row.id} columns={columns} loading={isLoading} paginationModel={paginationModel} pageSizeOptions={[5, 10]} />
      </Paper>
      <MenuComponent />
      {/* <CategoryModel /> */}
      <DeleteDialog />
      <CommonDrawer title={'Filter Options'} isOpen={isDrawer && drawerAction === 'filter'} setOpen={setDrawer} columns={filterColumns} onApply={handleFilter} buttonOkLabel="Apply Filter" buttonCancelLabel="Cancel" />
      <CommonDrawer title={'Add New Category'} isOpen={isDrawer && drawerAction === 'add'} setOpen={setDrawer} columns={filterColumns} onApply={handleSave} buttonOkLabel="Add" buttonCancelLabel="Cancel" />
      <CommonDrawer title={'Edit Category'} isOpen={isDrawer && drawerAction === 'edit'} setOpen={setDrawer} columns={filterColumns} onApply={handleSave} buttonOkLabel="Update" buttonCancelLabel="Cancel" />
      <CommonDrawer title={'Import Data'} isOpen={isDrawer && drawerAction === 'import'} setOpen={setDrawer} columns={filterColumns} onApply={handleFilter} buttonOkLabel="Import" buttonCancelLabel="Cancel" />
      <CommonDrawer title={'Export Data'} isOpen={isDrawer && drawerAction === 'export'} setOpen={setDrawer} columns={filterColumns} onApply={handleFilter} buttonOkLabel="Export" buttonCancelLabel="Cancel" />
    </PageContainer>
  );
});

export default Page;
