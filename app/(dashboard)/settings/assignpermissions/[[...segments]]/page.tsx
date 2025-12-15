"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { DataGrid, GridColDef, GridRowSelectionModel } from "@mui/x-data-grid";
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
  Grid,
  Divider,
  CardContent,
  Card,
  FormControl,
  InputLabel,
  Select,
  Checkbox,
  FormHelperText,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import { RootState, AppDispatch } from "../../../../redux/store";
import "../../../../global.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  assignPermissionsToRole,
  getAllAssignedPermissionsData,
  getAllDomainsData,
  getAllPermissionsData,
  getAllRolesData,
  removePermissionsFromRole,
} from "@/app/api/rolePermissionsApi/assignPermissions";
import { resetAssignedPermissionsData } from "@/app/redux/slices/rolesPermissionsSlices/assignedPermissionsSlice";

export default function Page() {
  const dispatch = useDispatch<AppDispatch>();

  // State for left side
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);

  // State for right side
  const [selectedModule, setSelectedModule] = useState("");
  const [selectedAvailableRowIds, setSelectedAvailableRowIds] = useState<
    string[]
  >([]);
  const [finalPermissions, setFinalPermissions] = useState<any[]>([]);

  const { domainsData, permissionsData } = useSelector(
    (state: RootState) => state.permissionsData
  );

  const {
    rolesData,
    loading: rolesLoading,
    error: rolesError,
  } = useSelector((state: RootState) => state.rolesData);
  const { assignedPermissionsData } = useSelector(
    (state: RootState) => state.assignedPermissionsData
  );

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        await getAllRolesData(dispatch)();
        await getAllDomainsData(dispatch)();
        return (
          dispatch(resetAssignedPermissionsData())
        )
      } catch (error) {
        toast.error(
          "Failed to fetch data." + (error as any).response?.data?.message || ""
        );
      }
    };
    fetchAllData();
  }, [dispatch]);

  const handleFilterModulePermissions = useCallback((moduleId: string) => {
    try {
      console.log("function called with moduleId:", moduleId);
      // Filter permissions based on selected module
      if (moduleId && permissionsData) {
        const filteredPermissions = permissionsData.filter(
          (permission: any) => {
            // Handle both id and _id cases
            const domainId = permission.domain?.id || permission.domain?._id;
            return domainId === moduleId;
          }
        );

        // console.log("Filtered permissions:", filteredPermissions);
        setFinalPermissions(filteredPermissions);

        // if (filteredPermissions.length === 0) {
        //   toast.info("No permissions found for selected module");
        // }
      } else {
        // Clear finalPermissions if no module selected
        setFinalPermissions([]);
      }
    } catch (error) {
      console.error("Error filtering permissions:", error);
      toast.error("Failed to load permissions for selected module");
      setFinalPermissions([]);
    }
  }, [permissionsData]);
  // Add this useEffect after your existing useEffects
  useEffect(() => {
    // Re-filter permissions when permissionsData changes and a module is selected
    if (selectedModule && permissionsData) {
      handleFilterModulePermissions(selectedModule);
    }
  }, [permissionsData, selectedModule, handleFilterModulePermissions]);
  // Handle role selection
  const handleRoleChange = async (event: any) => {
    try {
      await getAllPermissionsData(dispatch)(event.target.value);
      await getAllAssignedPermissionsData(dispatch)(event.target.value);
    } catch (error) {
      toast.error(
        "Failed to load data: " + (error as any).response?.data?.message || ""
      );
    }
    setSelectedRole(event.target.value);
    setSelectedRowIds([]); // Clear selected rows when role changes
  };

  // Handle module selection
  const handleModuleChange = (event: any) => {
    const selectedModuleId = event.target.value;
    setSelectedModule(selectedModuleId);
    // console.log("Selected module:", selectedModuleId);
    handleFilterModulePermissions(selectedModuleId);
    setSelectedAvailableRowIds([]); // Clear selected rows when module changes
  };


  // Handle individual checkbox selection for assigned permissions
  const handleCheckboxChange = (id: string) => {
    setSelectedRowIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((rowId) => rowId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Handle individual checkbox selection for available permissions
  const handleAvailableCheckboxChange = (id: string) => {
    setSelectedAvailableRowIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((rowId) => rowId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Handle select all checkbox for assigned permissions
  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedRowIds(
        (assignedPermissionsData as any[]).map((row) => row?.permissionId?.id)
      );
    } else {
      setSelectedRowIds([]);
    }
  };

  // Handle select all checkbox for available permissions
  const handleSelectAllAvailable = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.checked) {
      setSelectedAvailableRowIds(finalPermissions.map((row) => row.id)); // Use finalPermissions
    } else {
      setSelectedAvailableRowIds([]);
    }
  };

  // Check if all rows are selected for assigned permissions
  const isAllSelected =
    selectedRowIds.length === assignedPermissionsData.length &&
    assignedPermissionsData.length > 0;
  const isIndeterminate =
    selectedRowIds.length > 0 &&
    selectedRowIds.length < assignedPermissionsData.length;

  // Check if all rows are selected for available permissions
  const isAllAvailableSelected =
    selectedAvailableRowIds.length === finalPermissions.length &&
    finalPermissions.length > 0;
  const isAvailableIndeterminate =
    selectedAvailableRowIds.length > 0 &&
    selectedAvailableRowIds.length < finalPermissions.length;

  // Handle remove button click
  const handleRemoveClick = async () => {
    if (selectedRowIds.length === 0) {
      toast.warning("No rows selected");
      return;
    }
    try {
      const finalformData = {
        roleId: selectedRole,
        permissionIds: selectedRowIds,
      };
      console.log("Final form data for removal:", finalformData);
      await removePermissionsFromRole(dispatch)(finalformData);
    } catch (error) {
      toast.error(
        "Failed to remove permissions: " + (error as any).response.data.message
      );
    }

    await getAllAssignedPermissionsData(dispatch)(selectedRole);
    await getAllPermissionsData(dispatch)(selectedRole);
    // handleFilterModulePermissions(selectedModule);
    setSelectedRowIds([]);
  };

  // Handle add button click
  const handleAddClick = async () => {
    // console.log("Selected row IDs for adding:", selectedAvailableRowIds);

    if (selectedAvailableRowIds.length === 0) {
      toast.warning("No rows selected");
      return;
    }
    try {
      const finalformData = {
        roleId: selectedRole,
        permissionIds: selectedAvailableRowIds,
      };
      console.log("Final form data for removal:", finalformData);
      await assignPermissionsToRole(dispatch)(finalformData);
    } catch (error) {
      toast.error(
        "Failed to add permissions: " + (error as any).response.data.message
      );
    }
    await getAllAssignedPermissionsData(dispatch)(selectedRole);
    await getAllPermissionsData(dispatch)(selectedRole);
    // handleFilterModulePermissions(selectedModule);
    setSelectedAvailableRowIds([]);
  };

  // Columns for assigned permissions table
  const assignedPermissionsColumns: GridColDef[] = [
    {
      field: "checkbox",
      headerName: "",
      width: 50,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderHeader: () => (
        <Checkbox
          checked={isAllSelected}
          indeterminate={isIndeterminate}
          onChange={handleSelectAll}
          size="small"
        />
      ),
      renderCell: (params) => (
        <Checkbox
          checked={selectedRowIds.includes(params.row?.permissionId?.id)}
          onChange={() => handleCheckboxChange(params.row?.permissionId?.id)}
          size="small"
        />
      ),
    },
    {
      field: "modules",
      headerName: "Modules",
      flex: 1,
      renderCell: (params) => params.row?.permissionId?.domain?.title || "",
    },
    {
      field: "description",
      headerName: "Description",
      flex: 2,
      renderCell: (params) => params.row?.permissionId?.description || "",
    },
  ];

  // Columns for available permissions table
  const availablePermissionsColumns: GridColDef[] = [
    {
      field: "checkbox",
      headerName: "",
      width: 50,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderHeader: () => (
        <Checkbox
          checked={isAllAvailableSelected}
          indeterminate={isAvailableIndeterminate}
          onChange={handleSelectAllAvailable}
          size="small"
        />
      ),
      renderCell: (params) => (
        <Checkbox
          checked={selectedAvailableRowIds.includes(params.row.id)}
          onChange={() => handleAvailableCheckboxChange(params.row.id)}
          size="small"
        />
      ),
    },
    {
      field: "module",
      headerName: "Modules",
      flex: 1,
      renderCell: (params) => params.row.domain?.title || "",
    },
    { field: "description", headerName: "Description", flex: 2 },
  ];

  return (
    <PageContainer>
      <Grid container spacing={2} sx={{ width: "100%", height: "100%" }}>
        {/* left table */}
        <Grid size={{ lg: 6, md: 12, sm: 12, xs: 12 }}>
          <Card sx={{ height: "90vh" }}>
            <CardContent sx={{ height: "90vh", overflowY: "auto" }}>
              {/* Role Section Heading */}
              <Typography variant="h6" gutterBottom>
                Roles
              </Typography>

              {/* Role Dropdown */}
              <FormControl fullWidth variant="standard" sx={{ mb: 3 }}>
                <InputLabel>Role</InputLabel>
                <Select
                  value={selectedRole}
                  onChange={handleRoleChange}
                  label="Role"
                >
                  {rolesData?.map((role) => (
                    <MenuItem
                      key={role.id || (role as any)._id}
                      value={role.id || (role as any)._id}
                    >
                      {role.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Assigned Permissions Heading */}
              <Typography gutterBottom fontWeight="bold">
                Assigned Permissions for Role
              </Typography>

              {/* DataGrid with Custom Checkbox Column */}
              <Paper sx={{ height: "auto", width: "100%", mb: 2 }}>
                <DataGrid
                  rows={assignedPermissionsData}
                  getRowId={(row) => row.id}
                  columns={assignedPermissionsColumns}
                  hideFooterSelectedRowCount={true}
                  initialState={{
                    pagination: {
                      paginationModel: { page: 0, pageSize: 5 },
                    },
                  }}
                  pageSizeOptions={[5, 10]}
                  getRowHeight={() => "auto"}
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
              </Paper>

              {/* Remove Button */}
              <Button
                variant="contained"
                color="error"
                onClick={handleRemoveClick}
                disabled={selectedRowIds.length === 0}
                startIcon={<RemoveIcon />}
                className="button-common"
              >
                Remove Selected ({selectedRowIds.length})
              </Button>
            </CardContent>
          </Card>
        </Grid>
        {/*right table */}
        <Grid size={{ lg: 6, md: 12, sm: 12, xs: 12 }}>
          <Card sx={{ height: "90vh" }}>
            <CardContent sx={{ height: "90vh", overflowY: "auto" }}>
              {/* Search Available Permissions Heading */}
              <Typography gutterBottom variant="h6">
                Permissions
              </Typography>

              <FormControl fullWidth variant="standard" sx={selectedRole === "" ? { mb: 0 } : { mb: 3 }} error={selectedRole === ""}>
                <InputLabel>Modules</InputLabel>
                <Select
                  value={selectedModule}
                  onChange={handleModuleChange}
                  label="Modules"
                  disabled={selectedRole === ""}
                >
                  {domainsData?.map((option) => (
                    <MenuItem key={option.id} value={option.id}>
                      {option.title}
                    </MenuItem>
                  ))}
                </Select>
                {selectedRole === "" && (
                  <FormHelperText >Please select a role first to manage permissions.</FormHelperText>
                )}
              </FormControl>
              {/* Available Permissions Heading */}
              <Typography gutterBottom fontWeight="bold">
                Available Permissions
              </Typography>

              {/* DataGrid with Custom Checkbox Column */}
              <Paper sx={{ height: "auto", width: "100%", mb: 2 }}>
                <DataGrid
                  rows={finalPermissions} // Use finalPermissions instead of availablePermissions
                  getRowId={(row) => row.id}
                  columns={availablePermissionsColumns}
                  hideFooterSelectedRowCount={true}
                  initialState={{
                    pagination: {
                      paginationModel: { page: 0, pageSize: 5 },
                    },
                  }}
                  pageSizeOptions={[5, 10]}
                  getRowHeight={() => "auto"}
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
              </Paper>

              {/* Add Button */}
              <Button
                variant="contained"
                color="primary"
                onClick={handleAddClick}
                disabled={selectedAvailableRowIds.length === 0}
                className="button-common"
                startIcon={<AddIcon />}
              >
                Add Selected ({selectedAvailableRowIds.length})
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </PageContainer>
  );
}
