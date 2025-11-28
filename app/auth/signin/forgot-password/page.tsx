"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { forgetPassword } from "@/app/api/authUpdateApi";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import '../../../global.css'
export default function ForgotPassword() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const validateEmail = (value: string) => {
    if (!value.trim()) return "Email is required";
    // Simple email regex
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Enter a valid email";
    return "";
  };

  const handleBlur = () => {
    setError(validateEmail(email));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateEmail(email);
    setError(validationError);
    if (validationError) {
      return
    }
    try {
      const formData={
        email:email
      }
       const response=await forgetPassword(dispatch,formData);
       console.log("forgot password response:", response)
       toast.success("Password reset link sent to your email");
    } catch (error) {
      toast.error("Failed to send password reset link" + (error as any).response?.data?.message || "" );
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#f5f5f5",
      }}
    >
      <Card sx={{ position: "relative", width: 350, p: 2 }}>
        <IconButton
          sx={{ position: "absolute", top: 8, right: 8 }}
          onClick={() => router.push("/auth/signin")}
        >
          <CloseIcon />
        </IconButton>
        <CardContent>
          <Typography variant="h5" align="center" gutterBottom>
            Forgot Password
          </Typography>
          <Typography align="center" mb={2}>
            Enter your email to reset your password.
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Enter your email"
              variant="standard"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={handleBlur}
              error={!!error}
              helperText={error}
      
              margin="normal"
              autoFocus
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              className="button-common button-primary"
              fullWidth
              sx={{ mt: 2 }}
            >
              Submit
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}