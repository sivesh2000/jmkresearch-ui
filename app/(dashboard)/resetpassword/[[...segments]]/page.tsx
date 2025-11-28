"use client";
import React, { useState } from "react";
import { PageContainer } from "@toolpad/core";
import { Typography, Card, CardContent, Grid, TextField, Button } from "@mui/material";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { changePassword } from "@/app/api/authUpdateApi";

export default function Page() {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [formErrors, setFormErrors] = useState({
    oldPassword: "",
    password: "",
    confirmPassword: "",
  });

  const validateField = (field: string, value: string, allValues = formData) => {
    let error = "";
    if (!value) {
      if (field === "oldPassword") error = "Old password is required";
      if (field === "newPassword") error = "New password is required";
      if (field === "confirmPassword") error = "Confirm password is required";
    }
    if (
      field === "confirmPassword" &&
      value &&
      value !== allValues.newPassword
    ) {
      error = "Passwords do not match";
    }
    if (
      field === "newPassword" &&
      allValues.confirmPassword &&
      allValues.confirmPassword !== value
    ) {
      // If password changes and confirmPassword is filled, update confirmPassword error
      setFormErrors((prev) => ({
        ...prev,
        confirmPassword: "Passwords do not match",
      }));
    }
    return error;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field on change
    setFormErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleBlur = (field: string, value: string) => {
    const error = validateField(field, value, { ...formData, [field]: value });
    setFormErrors((prev) => ({ ...prev, [field]: error }));
  };

  const validate = () => {
    let errors: any = {};
    errors.oldPassword = validateField("oldPassword", formData.oldPassword);
    errors.password = validateField("newPassword", formData.newPassword);
    errors.confirmPassword = validateField("confirmPassword", formData.confirmPassword, formData);
    setFormErrors(errors);
    return Object.values(errors).every((e) => !e);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const { confirmPassword, ...finalData } = formData;
      await changePassword(dispatch, finalData);
      toast.success("Password reset successful!");
      setFormData({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      toast.error("Failed to reset password."+ (error as any).response.data.message || "");
    }
  };

  return (
    <PageContainer>
      <Grid container alignSelf="center" sx={{ minHeight: "100vh" }}>
        <Grid>
          <Card>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      label="Old Password"
                      type="password"
                      value={formData.oldPassword}
                      onChange={(e) => handleInputChange("oldPassword", e.target.value)}
                      onBlur={(e) => handleBlur("oldPassword", e.target.value)}
                      error={!!formErrors.oldPassword}
                      helperText={formErrors.oldPassword}
                      fullWidth
                      variant="standard"
                      required
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      label="New Password"
                      type="password"
                      value={formData.newPassword}
                      onChange={(e) => handleInputChange("newPassword", e.target.value)}
                      onBlur={(e) => handleBlur("newPassword", e.target.value)}
                      error={!!formErrors.password}
                      helperText={formErrors.password}
                      fullWidth
                      variant="standard"
                      required
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }} >
                    <TextField
                      label="Confirm Password"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      onBlur={(e) => handleBlur("confirmPassword", e.target.value)}
                      error={!!formErrors.confirmPassword}
                      helperText={formErrors.confirmPassword}
                      fullWidth
                      variant="standard"
                      required
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Button type="submit" className="button-common button-primary" variant="contained" color="primary" fullWidth>
                      Reset Password
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </PageContainer>
  );
}