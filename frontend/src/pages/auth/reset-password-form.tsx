import { useState } from "react";
import { TextField, Button, Typography, Paper, Box, Alert } from "@mui/material";
import { Formik } from "formik";
import * as Yup from "yup";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useResetPasswordMutation } from "@/hooks/use-auth-queries";

export default function ResetPasswordForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [success, setSuccess] = useState(false);

  const mutation = useResetPasswordMutation();

  const handleReset = (password: string) => {
    mutation.mutate(
      { token, password },
      {
        onSuccess: () => setSuccess(true),
        onError: () => alert("Failed to reset password"),
      },
    );
  };

  if (success) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <Paper sx={{ p: 3, width: "100%", maxWidth: 448 }}>
          <Alert severity="success" sx={{ mb: 2 }}>
            Your password has been successfully reset.
          </Alert>
          <Button
            fullWidth
            variant="contained"
            onClick={() => navigate("/login")}
          >
            Go to Login
          </Button>
        </Paper>
      </Box>
    );
  }

  if (!token) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <Paper sx={{ p: 3, width: "100%", maxWidth: 448 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            Invalid or missing reset token.
          </Alert>
          <Typography variant="body2" sx={{ textAlign: "center" }}>
            <Link to="/forgot-password">Request a new reset link</Link>
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
      }}
    >
      <Paper sx={{ p: 3, width: "100%", maxWidth: 448 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Reset Password
        </Typography>

        {mutation.isError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Failed to reset password
          </Alert>
        )}

        <Formik
          initialValues={{ password: "", confirmPassword: "" }}
          validationSchema={Yup.object({
            password: Yup.string()
              .min(8, "At least 8 characters")
              .matches(/[a-z]/, "Must contain a lowercase letter")
              .matches(/[A-Z]/, "Must contain an uppercase letter")
              .matches(/\d/, "Must contain a number")
              .matches(/[@$!%*?&#^()_+\-=]/, "Must contain a special character")
              .required("Required"),
            confirmPassword: Yup.string()
              .oneOf([Yup.ref("password")], "Passwords must match")
              .required("Required"),
          })}
          onSubmit={(values, { setSubmitting }) => {
            handleReset(values.password);
            setSubmitting(false);
          }}
        >
          {({
            handleSubmit,
            handleChange,
            values,
            errors,
            touched,
          }) => (
            <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                fullWidth
                label="New Password"
                type="password"
                name="password"
                autoComplete="new-password"
                value={values.password}
                onChange={handleChange}
                error={touched.password && !!errors.password}
                helperText={touched.password && errors.password}
              />
              <TextField
                fullWidth
                label="Confirm New Password"
                type="password"
                name="confirmPassword"
                autoComplete="new-password"
                value={values.confirmPassword}
                onChange={handleChange}
                error={touched.confirmPassword && !!errors.confirmPassword}
                helperText={touched.confirmPassword && errors.confirmPassword}
              />
              <Button type="submit" fullWidth variant="contained">
                Reset Password
              </Button>
              <Typography variant="body2" sx={{ textAlign: "center", mt: 1 }}>
                <Link to="/login">Back to Login</Link>
              </Typography>
            </Box>
          )}
        </Formik>
      </Paper>
    </Box>
  );
}
