"use client";
import React, { useCallback, useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Container,
  Button,
  Modal,
  TextField,
  FormControl,
  InputLabel,
  IconButton,
  Select,
  MenuItem,
  Card,
  CardContent,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  Grid,
  Checkbox,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { PageContainer } from "@toolpad/core";
import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Menu from "@mui/material/Menu";
import "../../../../global.css";
import { toast } from "react-toastify";
import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
import { RootState } from "@/app/redux/store";
import { useSelector, useDispatch } from "react-redux";
import {
  createmapping,
  getAllHelpDeskMappingData,
  getAllMasterData,
  getAllRolesData,
} from "@/app/api/helpDeskMappingApi";
import LazyDataGrid from "@/app/components/LazyDataGrid";
import { PermissionCheck } from "@/app/components/PermissionCheck";
import { HELP_DESK_MAPPING_ADD } from "@/app/utils/permissionsActions";

const Page = () => {
  const dispatch = useDispatch();
  const [mappingType, setMappingType] = useState("category");
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  const [isAccordionExpanded, setIsAccordionExpanded] = useState(false);

  // Right side form states
  const [emails, setEmails] = useState<string[]>([""]);
  const [mobileNumber, setMobileNumber] = useState("");
  const [alternateMobile, setAlternateMobile] = useState("");
  const [roleRef, setRoleRef] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  // Replace selectedRowIds with object-based states
  const [selectedCategoryObject, setSelectedCategoryObject] =
    useState<any>(null);
  const [selectedSubcategoryObjects, setSelectedSubcategoryObjects] = useState<
    any[]
  >([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  // fetch master and roles data
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        await getAllMasterData(dispatch);
        await getAllRolesData(dispatch);
      } catch (error) {
        toast.error(
          "operation failed " + (error as any).response?.data?.message ||
            "Unknown error"
        );
      }
    };
    fetchAllData();
  }, [dispatch]);
  // fetch table data
  useEffect(() => {
    const fetchtableData = async () => {
      try {
        // Pass page and limit parameters (API expects 1-based page numbers)
        await getAllHelpDeskMappingData(dispatch)({
          page: paginationModel.page + 1,
          limit: paginationModel.pageSize,
        });
      } catch (error) {
        toast.error("Failed to fetch mapping data");
      }
    };
    fetchtableData();
  }, [dispatch, paginationModel]);

  const { masterData } = useSelector(
    (state: RootState) => state.certificateMasterData
  );
  const { helpdeskMappingData, loading, error } = useSelector(
    (state: RootState) => state.helpDeskMapping
  );
  const { rolesData } = useSelector((state: RootState) => state.rolesData);

  useEffect(() => {
    console.log("helpdeskMappingData", helpdeskMappingData);
  }, [helpdeskMappingData]);

  // Get categories from masterData
  const getCategoryData = () => {
    if (!masterData?.issueCategory) return [];
    return masterData.issueCategory.map((category: any) => ({
      id: category.id,
      name: category.name,
      description: category.description,
    }));
  };

  // Get subcategories for selected category from masterData
  const getSubcategoryData = (categoryId: string) => {
    if (!masterData?.issueCategory) return [];

    const selectedCat = masterData.issueCategory.find(
      (category: any) => category.id === categoryId
    );

    if (!selectedCat || !selectedCat.subCategory) return [];

    return selectedCat.subCategory.map((subcat: any) => ({
      id: subcat.id,
      name: subcat.name,
      description: subcat.description,
    }));
  };

  const handleMappingTypeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setMappingType(event.target.value);
    // Clear all selections when switching types
    setSelectedCategoryObject(null);
    setSelectedSubcategoryObjects([]);
    setSelectedCategory(""); // Clear category selection when switching types
    setRoleRef(""); // Reset role selection
    setEmails([""]); // Reset emails
    setMobileNumber(""); // Reset mobile
    setAlternateMobile(""); // Reset alternate mobile
    setErrors({}); // Clear errors
  };

  // Handle category dropdown change
  const handleCategoryChange = (event: any) => {
    const categoryId = event.target.value;
    setSelectedCategory(categoryId);

    // Find and store the selected category object
    const categoryObject = getCategoryData().find(
      (cat: any) => cat.id === categoryId
    );
    setSelectedCategoryObject(categoryObject || null);

    // Clear subcategory selections when changing category
    setSelectedSubcategoryObjects([]);
  };

  // Handle accordion expand
  const handleAccordionChange = () => {
    setIsAccordionExpanded(!isAccordionExpanded);
  };

  // Handle mapping button click
  const handleMappingButtonClick = () => {
    setIsAccordionExpanded(true);
  };

  // Get current data based on selected mapping type and category
  const getCurrentData = () => {
    if (mappingType === "category") {
      return getCategoryData();
    } else {
      // For subcategory, return data based on selected category
      if (selectedCategory) {
        return getSubcategoryData(selectedCategory);
      }
      return []; // Return empty array if no category selected
    }
  };

  // Handle individual checkbox selection
  const handleCheckboxChange = (id: string) => {
    const currentData = getCurrentData();
    const selectedObject = currentData.find((item: any) => item.id === id);

    if (!selectedObject) return;

    if (mappingType === "category") {
      // Single selection for category - store the category object
      const isSelected = selectedCategoryObject?.id === id;
      setSelectedCategoryObject(isSelected ? null : selectedObject);
    } else {
      // Multiple selection for subcategory - store subcategory objects
      setSelectedSubcategoryObjects((prev) => {
        const isSelected = prev.some((obj: any) => obj.id === id);
        if (isSelected) {
          return prev.filter((obj: any) => obj.id !== id);
        } else {
          return [...prev, selectedObject];
        }
      });
    }
  };

  // Handle select all checkbox (only for subcategory)
  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (mappingType === "subcategory") {
      if (event.target.checked) {
        setSelectedSubcategoryObjects(getCurrentData());
      } else {
        setSelectedSubcategoryObjects([]);
      }
    }
  };

  // Email validation
  const validateEmail = (email: string) => {
    if (!email) return "";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) ? "" : "Please enter a valid email address";
  };

  // Mobile validation
  const validateMobile = (mobile: string) => {
    // if (!mobile) return "Mobile number is required";
    if(mobile){
    const mobileRegex = /^\d{10}$/;
    return mobileRegex.test(mobile)
      ? ""
      : "Mobile number must be exactly 10 digits";
    }
    return "";
  };

  // Handle email input change
  const handleEmailChange = (index: number, value: string) => {
    const newEmails = [...emails];
    newEmails[index] = value;
    setEmails(newEmails);

    // Clear error on change
    if (errors[`email${index}`]) {
      setErrors((prev) => ({ ...prev, [`email${index}`]: "" }));
    }
  };

  // Handle email blur validation
  const handleEmailBlur = (index: number, value: string) => {
    if (index === 0 && !value) {
      setErrors((prev) => ({
        ...prev,
        [`email${index}`]: "First email is required",
      }));
    } else if (value) {
      const error = validateEmail(value);
      setErrors((prev) => ({ ...prev, [`email${index}`]: error }));
    } else {
      setErrors((prev) => ({ ...prev, [`email${index}`]: "" }));
    }
  };

  // Add new email field
  const addEmailField = () => {
    if (emails.length < 4) {
      setEmails([...emails, ""]);
    }
  };

  // Handle mobile number change
  const handleMobileChange = (field: string, value: string) => {
    const numericValue = value.replace(/[^0-9]/g, "").slice(0, 10);

    if (field === "mobile") {
      setMobileNumber(numericValue);
    } else {
      setAlternateMobile(numericValue);
    }

    // Clear error on change
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Handle mobile blur validation
  const handleMobileBlur = (field: string, value: string) => {
    if (field === "mobile") {
      const error = validateMobile(value);
      setErrors((prev) => ({ ...prev, mobile: error }));
    } else if (value) {
      const mobileRegex = /^\d{10}$/;
      const error = mobileRegex.test(value)
        ? ""
        : "Mobile number must be exactly 10 digits";
      setErrors((prev) => ({ ...prev, alternateMobile: error }));
    }
  };

  // Handle save
  const handleSave = async () => {
    const newErrors: { [key: string]: string } = {};

    // Validate role selection (required)
    if (!roleRef) {
      newErrors.roleRef = "Role selection is required";
    }

    // Validate first email (required)
    // if (!emails[0]) {
    //   newErrors.email0 = "First email is required";
    // } else {
    //   const emailError = validateEmail(emails[0]);
    //   if (emailError) newErrors.email0 = emailError;
    // }

    // Validate other emails (optional but must be valid if provided)
    emails.slice(1).forEach((email, index) => {
      if (email) {
        const emailError = validateEmail(email);
        if (emailError) newErrors[`email${index + 1}`] = emailError;
      }
    });

    // Validate mobile (required)
    const mobileError = validateMobile(mobileNumber);
    if (mobileError) newErrors.mobile = mobileError;

    // Validate alternate mobile (optional but must be valid if provided)
    if (alternateMobile) {
      const mobileRegex = /^\d{10}$/;
      if (!mobileRegex.test(alternateMobile)) {
        newErrors.alternateMobile = "Mobile number must be exactly 10 digits";
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      // Prepare data based on mapping type
      try {
        const baseFormData = {
          roleRef,
          email: emails.filter((email) => email.trim() !== ""),
          phone: mobileNumber,
          alternativePhone: alternateMobile,
        };

        let finalData;

        if (mappingType === "category") {
          // Category mapping
          finalData = {
            ...baseFormData,
            categoryId: selectedCategoryObject?.id,
            categoryName: selectedCategoryObject?.name,
          };
          console.log("Category mapping data:", finalData);
        } else {
          // Subcategory mapping
          const parentCategoryObject = getCategoryData().find(
            (cat: any) => cat.id === selectedCategory
          );
           // Remove description from selectedSubcategoryObjects
        const subcategoriesWithoutDescription = selectedSubcategoryObjects.map(subcat => ({
          id: subcat.id,
          name: subcat.name
          // Exclude description field
        }));

          finalData = {
            ...baseFormData,
            categoryId: selectedCategory,
            categoryName: parentCategoryObject?.name,
            subCategories: subcategoriesWithoutDescription,
          };
        }

        // Make API call
        await createmapping(dispatch, finalData);
        await getAllHelpDeskMappingData(dispatch)({
          page: paginationModel.page + 1,
          limit: paginationModel.pageSize,
        });

        toast.success("Mapping saved successfully!");

        // Reset form after successful save
        setSelectedCategoryObject(null);
        setSelectedSubcategoryObjects([]);
        setSelectedCategory("");
        setRoleRef("");
        setEmails([""]);
        setMobileNumber("");
        setAlternateMobile("");
        setErrors({});
        setIsAccordionExpanded(false); // collapse accordion
      } catch (error) {
        toast.error(
          "Error in mapping: " + (error as any).response.data.message
        );
      }
    }
  };

  // Check if all rows are selected (for subcategory)
  const currentData = getCurrentData();
  const isAllSelected =
    mappingType === "subcategory" &&
    selectedSubcategoryObjects.length === currentData.length &&
    currentData.length > 0;
  const isIndeterminate =
    mappingType === "subcategory" &&
    selectedSubcategoryObjects.length > 0 &&
    selectedSubcategoryObjects.length < currentData.length;

  // Helper function to check if a row is selected
  const isRowSelected = (id: string) => {
    if (mappingType === "category") {
      return selectedCategoryObject?.id === id;
    } else {
      return selectedSubcategoryObjects.some((obj: any) => obj.id === id);
    }
  };

  // Helper function to get total selected count
  const getSelectedCount = () => {
    if (mappingType === "category") {
      return selectedCategoryObject ? 1 : 0;
    } else {
      return selectedSubcategoryObjects.length;
    }
  };
  // for change pagination modal
  const handlePaginationModelChange = useCallback(
    (newModel: { page: number; pageSize: number }) => {
      setPaginationModel(newModel);
    },
    []
  );
  // Table columns for main table
  const columns: GridColDef[] = [
    {
      field: "checkbox",
      headerName: "",
      width: 50,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderHeader: () =>
        mappingType === "subcategory" ? (
          <Checkbox
            checked={isAllSelected}
            indeterminate={isIndeterminate}
            onChange={handleSelectAll}
            size="small"
            disabled={currentData.length === 0}
          />
        ) : null,
      renderCell: (params) => (
        <Checkbox
          checked={isRowSelected(params.row.id)}
          onChange={() => handleCheckboxChange(params.row.id)}
          size="small"
        />
      ),
    },
    { field: "name", headerName: "Name", flex: 1 },
    { field: "description", headerName: "Description", flex: 2 },
  ];

  // Columns for view table
  const viewTableColumns: GridColDef[] = [
    {
      field: "categoryName",
      headerName: "Category",
      flex: 0.5,
      
      
    },
    {
      field: "roleRef",
      headerName: "Role Name",
      flex: 0.5,
      
      renderCell: (params) => (params.row.roleRef ? params.row.roleRef.title : ""),
    },
    
    {
      field: "mapping",
      headerName: "Mapped Email/Phone",
      flex: 1,
      renderCell: (params) => {
        const mapping = params.row;
        return (
          <Box>
            {/* Emails */}
            {mapping.email && mapping.email.length > 0 && (
              <Box>
                <Typography
                  variant="body2"
                  component="span"
                  sx={{ fontWeight: "bold", fontSize: "0.75rem" }}
                >
                  Emails:
                </Typography>
                <Typography
                  variant="body2"
                  component="span"
                  sx={{ fontSize: "0.75rem", ml: 0.5 }}
                >
                  {mapping.email.join(", ")}
                </Typography>
              </Box>
            )}

            {/* Mobile Number */}
            {mapping.phone && (
              <Box>
                <Typography
                  variant="body2"
                  component="span"
                  sx={{ fontWeight: "bold", fontSize: "0.75rem" }}
                >
                  Mobile:
                </Typography>
                <Typography
                  variant="body2"
                  component="span"
                  sx={{ fontSize: "0.75rem", ml: 0.5 }}
                >
                  {mapping.phone}
                </Typography>
              </Box>
            )}

            {/* Alternate Mobile */}
            {mapping.alternativePhone && (
              <Box>
                <Typography
                  variant="body2"
                  component="span"
                  sx={{ fontWeight: "bold", fontSize: "0.75rem" }}
                >
                  Alt Mobile:
                </Typography>
                <Typography
                  variant="body2"
                  component="span"
                  sx={{ fontSize: "0.75rem", ml: 0.5 }}
                >
                  {mapping.alternativePhone}
                </Typography>
              </Box>
            )}
          </Box>
        );
      },
    },
  ];

  return (
    <PageContainer>
      {/* Accordion for Mapping Section */}
      <Accordion
        expanded={isAccordionExpanded}
        onChange={handleAccordionChange}
        sx={{
          mb: 2,
          boxShadow: "none",
          border: "none",
          "&:before": {
            display: "none",
          },
          "& .MuiAccordion-root": {
            boxShadow: "none",
          },
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="mapping-content"
          id="mapping-header"
          sx={{
            display: isAccordionExpanded ? "flex" : "none",
            "& .MuiAccordionSummary-content": {
              margin: 0,
            },
            minHeight: 0,
            padding: 0,
            backgroundColor: "transparent",
            boxShadow: "none",
          }}
        >
          <Typography
            variant="body2"
            sx={{ display: "flex", justifyContent: "flex-end", width: "100%" }}
          >
            Collapse
          </Typography>
        </AccordionSummary>
        <AccordionDetails
          sx={{
            p: 0,
            margin: 0,
            backgroundColor: "transparent",
            boxShadow: "none",
          }}
        >
          <Card>
            <CardContent>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>Add/Update Mapping</Typography>
                {/* <FormControl component="fieldset">
                  <RadioGroup
                    row
                    value={mappingType}
                    onChange={handleMappingTypeChange}
                    name="mapping-type"
                    className="radio-button-common"
                  >
                    <FormControlLabel
                      value="category"
                      control={<Radio size="small" />}
                      label="Category Wise"
                    />
                    <FormControlLabel
                      value="subcategory"
                      control={<Radio size="small" />}
                      label="Subcategory Wise"
                      className="radio-button-common"
                    />
                  </RadioGroup>
                </FormControl> */}

                {/* Category Dropdown - Only show when subcategory is selected */}
                {mappingType === "subcategory" && (
                  <Box sx={{ mt: 2 }}>
                    <FormControl
                      size="small"
                      sx={{ minWidth: 200 }}
                      variant="standard"
                      margin="none"
                    >
                      <InputLabel>Select Category</InputLabel>
                      <Select
                        value={selectedCategory}
                        onChange={handleCategoryChange}
                        label="Select Category"
                      >
                        {getCategoryData().map((category: any) => (
                          <MenuItem key={category.id} value={category.id}>
                            {category.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                )}
              </Box>

              <Grid container spacing={2}>
                <Grid size={{ lg: 6, md: 6, sm: 12, xs: 12 }}>
                  <Paper
                    sx={{
                      p: 2,
                      height: "400px",
                      width: "100%",
                      overflowY: "auto",
                    }}
                  >
                    {mappingType === "subcategory" && !selectedCategory ? (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          height: "100%",
                          color: "text.secondary",
                        }}
                      >
                        <Typography>
                          Please select a category to view subcategories
                        </Typography>
                      </Box>
                    ) : (
                      <DataGrid
                        rows={getCurrentData()}
                        columns={columns}
                        getRowId={(row) => row.id}
                        hideFooterSelectedRowCount={true}
                        autoHeight
                        initialState={{
                          pagination: {
                            paginationModel: { page: 0, pageSize: 5 },
                          },
                        }}
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
                        }}
                      />
                    )}
                  </Paper>
                </Grid>

                <Grid size={{ lg: 6, md: 6, sm: 12, xs: 12 }}>
                  <Paper sx={{ p: 2, height: "400px", overflowY: "auto" }}>
                    <Typography variant="h6" gutterBottom>
                      Contact Information
                    </Typography>
                    {/* Role Section */}
                    <Box sx={{ mb: 3 }}>
                      <FormControl
                        fullWidth
                        variant="standard"
                        size="small"
                        error={!!errors.roleRef}
                        required
                      >
                        <InputLabel>Select Role</InputLabel>
                        <Select
                          value={roleRef}
                          onChange={(e) => {
                            setRoleRef(e.target.value);
                            // Clear error on change
                            if (errors.roleRef) {
                              setErrors((prev) => ({ ...prev, roleRef: "" }));
                            }
                          }}
                          label="Select Role"
                        >
                          {rolesData?.map((role: any) => (
                            <MenuItem
                              key={role.id || role._id}
                              value={role.id || role._id}
                            >
                              {role.title}
                            </MenuItem>
                          ))}
                        </Select>
                        {errors.roleRef && (
                          <Typography
                            variant="caption"
                            color="error"
                            sx={{ mt: 0.5 }}
                          >
                            {errors.roleRef}
                          </Typography>
                        )}
                      </FormControl>
                    </Box>

                    {/* Email Section */}
                    <Box sx={{ mb: 3 }}>
                      {emails.map((email, index) => (
                        <Box
                          key={index}
                          sx={{ display: "flex", alignItems: "center", mb: 2 }}
                        >
                          <TextField
                            fullWidth
                            type="email"
                            variant="standard"
                            label={`Email ${index + 1}${index === 0 ? "" : ""}`}
                            value={email}
                            onChange={(e) =>
                              handleEmailChange(index, e.target.value)
                            }
                            onBlur={(e) =>
                              handleEmailBlur(index, e.target.value)
                            }
                            error={!!errors[`email${index}`]}
                            helperText={errors[`email${index}`]}
                            size="small"
                            // required={index === 0}
                          />
                          {index === emails.length - 1 && emails.length < 4 && (
                            <IconButton
                              onClick={addEmailField}
                              size="small"
                              sx={{ ml: 1 }}
                              color="primary"
                            >
                              <AddIcon sx={{ color: "var(--primary-blue)" }} />
                            </IconButton>
                          )}
                        </Box>
                      ))}
                    </Box>

                    {/* Mobile Section */}
                    <Box sx={{ mb: 3 }}>
                      <TextField
                        fullWidth
                        variant="standard"
                        label="Mobile Number"
                        value={mobileNumber}
                        onChange={(e) =>
                          handleMobileChange("mobile", e.target.value)
                        }
                        onBlur={(e) =>
                          handleMobileBlur("mobile", e.target.value)
                        }
                        error={!!errors.mobile}
                        helperText={errors.mobile}
                        size="small"
                        // required
                        inputProps={{ maxLength: 10 }}
                        sx={{ mb: 2 }}
                      />
                      <TextField
                        fullWidth
                        variant="standard"
                        label="Alternate Mobile Number"
                        value={alternateMobile}
                        onChange={(e) =>
                          handleMobileChange("alternateMobile", e.target.value)
                        }
                        onBlur={(e) =>
                          handleMobileBlur("alternateMobile", e.target.value)
                        }
                        error={!!errors.alternateMobile}
                        helperText={errors.alternateMobile}
                        size="small"
                        inputProps={{ maxLength: 10 }}
                      />
                    </Box>

                    {/* Save Button */}
                    <Button
                      variant="contained"
                      onClick={handleSave}
                      startIcon={<SaveIcon />}
                      fullWidth
                      disabled={getSelectedCount() === 0}
                      className={`button-common ${
                        getSelectedCount() > 0 ? "button-primary" : ""
                      }`}
                    >
                      Save Mapping
                    </Button>

                    {getSelectedCount() === 0 && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mt: 1, display: "block" }}
                      >
                        Please select at least one item from the left table
                      </Typography>
                    )}
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </AccordionDetails>
      </Accordion>

      {/* Mapping Button - Only show when accordion is collapsed */}
      {!isAccordionExpanded && (
        <PermissionCheck action={HELP_DESK_MAPPING_ADD}>
        <Card sx={{ mb: 2 }}>
          <CardContent
            sx={{ display: "flex", justifyContent: "flex-end", py: 2 }}
          >
            <Button
              variant="contained"
              onClick={handleMappingButtonClick}
              startIcon={<HubOutlinedIcon fontSize="small" />}
              className="button-common button-primary"
            >
              Mapping
            </Button>
          </CardContent>
        </Card>
        </PermissionCheck>
      )}

      {/* View Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Help Desk Mapping View
          </Typography>
          <Box sx={{ height: "auto", width: "100%" }}>
            <LazyDataGrid
              rows={helpdeskMappingData?.results || []}
              columns={viewTableColumns}
              loading={loading}
              getRowId={(row) => row.id}
              paginationModel={paginationModel}
              onPaginationModelChange={handlePaginationModelChange}
              pageSizeOptions={[5, 10]}
              rowCount={helpdeskMappingData?.totalResults || 0}
              paginationMode="server"
              sx={{
               
              }}
            />
          </Box>
        </CardContent>
      </Card>
    </PageContainer>
  );
};

export default Page;
