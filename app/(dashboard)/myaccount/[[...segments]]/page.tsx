"use client";
import React, { useEffect, useState, useMemo } from "react";
import { PageContainer } from "@toolpad/core";
import { Typography, Grid, Box, TextField, Button, IconButton } from "@mui/material";
import { useSession } from "next-auth/react";
import VisibilityIcon from "@mui/icons-material/Visibility";
import '../../../global.css'
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { setLoggedInUser } from "@/app/redux/slices/userSlices/UserDataSlice";
import { updateProfile } from "@/app/api/authUpdateApi";
const FIELD_LABELS: { [key: string]: string } = {
  name: "Name",
  email: "Email",
  address: "Address",
  contactPerson: "Contact Person",
  contactPersonMobile: "Contact Person Mobile",
  gstDetails: "GST Details",
  pan: "PAN",
  location: "Location",
  tradeName: "Trade Name",
  bankName: "Bank Name",
  accountHolderName: "Account Holder Name",
  accountNumber: "Account Number",
  ifscCode: "IFSC Code",
  status: "Status",
  oemRef: "OEM",
  download: "Download Document",
};

const NON_EDITABLE_FIELDS = ["email", "oemRef", "status"];

export default function Page() {
  const dispatch = useDispatch();
  const { data: session } = useSession();

  useEffect(() => {
    const userData = session?.user || {};
    if (userData && Object.keys(userData).length > 0) {
      dispatch(setLoggedInUser(userData));
    }
  }, [session, dispatch]);

  const { loggedInUser } = useSelector((state: any) => state.loggedUserData);
  const safeLoggedInUser = useMemo(() => loggedInUser || {}, [loggedInUser]);

  // Use useMemo so initialFormState updates when loggedInUser changes
  const initialFormState = useMemo(
    () =>
      Object.entries(FIELD_LABELS).reduce((acc, [key]) => {
        let value = safeLoggedInUser[key];
        if (key === "status") {
          value = value === true ? "Active" : value === false ? "Inactive" : "";
        }
        if (key === "oemRef" && value && typeof value === "object") {
          value = value.name;
        }
        acc[key] = value !== undefined && value !== null ? value : "";
        return acc;
      }, {} as Record<string, string>),
    [safeLoggedInUser]
  );

  const [editMode, setEditMode] = useState(false);
  const [formState, setFormState] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const documentUrl = safeLoggedInUser.document || "";

  // Update formState whenever initialFormState changes (i.e., when loggedInUser changes)
  useEffect(() => {
    setFormState(initialFormState);
  }, [initialFormState]);

  const handleEditOrUpdate = async () => {
    if (editMode) {
      // Validate all fields
      const errors: Record<string, string> = {};
      Object.entries(formState).forEach(([key, value]) => {
        if (
          ["contactPerson", "accountHolderName", "accountNumber", "contactPersonMobile"].includes(key)
        ) {
          const error = validateField(key, value);
          if (error) errors[key] = error;
        }
      });
      setFormErrors(errors);
      if (Object.values(errors).some(Boolean)) return; // Stop if any error

      // Filter out non-editable fields before sending
      const filteredData = Object.fromEntries(
        Object.entries(formState).filter(
          ([key]) => !["email", "status", "oemRef", "download"].includes(key)
        )
      );

      try {
        const updatedUser = await updateProfile(dispatch, filteredData);
        dispatch(setLoggedInUser(updatedUser));
        toast.success("Profile updated successfully");
      } catch (error) {
        toast.error("Failed to update profile. Please try again." + (error as any).response.data.message || "");
      }

      // console.log("Form Data:", filteredData);
    }
    setEditMode((prev) => !prev);
  };

  function validateField(field: string, value: string) {
    let error = "";
    if (["contactPerson", "accountHolderName"].includes(field)) {
      // if (value && !/^[A-Za-z]+( [A-Za-z]+)*$/.test(value.trim())) {
      //   error = "Only letters and single spaces allowed";
      // }
    }
    if (field === "accountNumber") {
      if (value && !/^\d{12}$/.test(value)) {
        error = "Account Number must be exactly 12 digits";
      }
    }
    if (field === "contactPersonMobile") {
      if (value && !/^\d{10}$/.test(value)) {
        error = "Contact Number must be exactly 10 digits";
      }
    }
    return error;
  }

  return (
    <PageContainer>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5">My Account</Typography>
        <Button
        className="button-common button-primary"
          variant="contained"
          onClick={handleEditOrUpdate}
        >
          {editMode ? "Update" : "Edit"}
        </Button>
      </Box>
      <Box sx={{ flexGrow: 1 }}>
        <Grid container spacing={2}>
          {Object.entries(FIELD_LABELS)
            .filter(
              ([key]) =>
                key !== "isEmailVerified" &&
                key !== "role" &&
                key !== "userType"
            )
            .map(([key, label], idx) => (
              <Grid
                size={{ xs: 12, sm: 6 }}
                key={key}
              >
                {key === "download" ? (
                  <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
                    <Button
                      variant="outlined"
                      className="button-common button-secondary"
                      startIcon={<VisibilityIcon />}
                      disabled={!documentUrl}
                      onClick={() => {
                        if (documentUrl) window.open(documentUrl, "_blank");
                      }}
                      sx={{ mt: 1 }}
                    >
                      View Document
                    </Button>
                  </Box>
                ) : (
                  <TextField
                    label={label}
                    value={formState[key]}
                    fullWidth
                    disabled={!editMode || NON_EDITABLE_FIELDS.includes(key)}
                    onChange={(e) => {
                      let val = e.target.value;
                      // Input restrictions
                      if (["contactPerson", "accountHolderName"].includes(key)) {
                        val = val.replace(/[^A-Za-z ]/g, "").replace(/\s{2,}/g, " ");
                      }
                      if (["accountNumber", "contactPersonMobile"].includes(key)) {
                        val = val.replace(/\D/g, "");
                      }
                      setFormState((prev) => ({
                        ...prev,
                        [key]: val,
                      }));
                      setFormErrors((prev) => ({ ...prev, [key]: "" }));
                    }}
                    onBlur={() => {
                      const error = validateField(key, formState[key]);
                      setFormErrors((prev) => ({ ...prev, [key]: error }));
                    }}
                    error={!!formErrors[key]}
                    helperText={formErrors[key]}
                    variant="standard"
                  />
                )}
              </Grid>
            ))}
        </Grid>
      </Box>
    </PageContainer>
  );
}