import { useState } from "react";
import { TextField, Button, Typography, Paper, Box, Alert } from "@mui/material";
import { Formik } from "formik";
import * as Yup from "yup";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { APP_NAME } from "@/config";
import { useLoginMutation, useVerifyOtpLoginMutation } from "@/hooks/use-auth-queries";

export default function LoginForm() {
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [tempToken, setTempToken] = useState<string | null>(null);

  const loginMutation = useLoginMutation();
  const otpMutation = useVerifyOtpLoginMutation();

  const gotoHome = () => {
    toast(`Welcome back to ${APP_NAME}!`);
    setTimeout(() => {
      window.location.href = "/";
    }, 1000);
  };

  const handleLogin = (values: { email: string; password: string }) => {
    loginMutation.mutate(values, {
      onSuccess: (data) => {
        if (data.requiresOtp) {
          setTempToken(data.tempToken);
          setStep("otp");
          return;
        }
        gotoHome();
      },
    });
  };

  const handleOtp = (values: { otp: string }) => {
    if (!tempToken) return;
    otpMutation.mutate(
      { tempToken, otp: values.otp },
      { onSuccess: () => gotoHome() },
    );
  };

  const error =
    loginMutation.isError || otpMutation.isError
      ? loginMutation.error || otpMutation.error
      : null;

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
          {step === "otp" ? "Two-Factor Authentication" : "Login"}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {(error as any)?.response?.data?.message || "Invalid credentials"}
          </Alert>
        )}

        {step === "credentials" && (
          <Formik
            initialValues={{ email: "", password: "" }}
            validationSchema={Yup.object({
              email: Yup.string().email("Invalid email").required("Required"),
              password: Yup.string().required("Required"),
            })}
            onSubmit={(values) => handleLogin(values)}
          >
            {({ handleSubmit, handleChange, values, errors, touched }) => (
              <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{ display: "flex", flexDirection: "column", gap: 2 }}
              >
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={values.email}
                  onChange={handleChange}
                  error={touched.email && !!errors.email}
                  helperText={touched.email && errors.email}
                />
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  value={values.password}
                  onChange={handleChange}
                  error={touched.password && !!errors.password}
                  helperText={touched.password && errors.password}
                />
                <Button type="submit" fullWidth variant="contained">
                  Login
                </Button>
                <Typography variant="body2" sx={{ textAlign: "center", mt: 1 }}>
                  Don't have an account? <Link to="/register">Register</Link>
                </Typography>
                <Typography variant="body2" sx={{ textAlign: "center" }}>
                  <Link to="/forgot-password">Forgot Password?</Link>
                </Typography>
                <Typography variant="body2" sx={{ textAlign: "center" }}>
                  <Link to="/resend-verification">Resend verification email</Link>
                </Typography>
              </Box>
            )}
          </Formik>
        )}

        {step === "otp" && (
          <Formik
            initialValues={{ otp: "" }}
            validationSchema={Yup.object({
              otp: Yup.string()
                .length(6, "OTP must be 6 digits")
                .matches(/^\d{6}$/, "OTP must be 6 digits")
                .required("Required"),
            })}
            onSubmit={(values) => handleOtp(values)}
          >
            {({ handleSubmit, handleChange, values, errors, touched }) => (
              <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{ display: "flex", flexDirection: "column", gap: 2 }}
              >
                <Typography variant="body2" color="text.secondary">
                  A one-time password has been sent to your email. Enter it below to complete login.
                </Typography>
                <TextField
                  fullWidth
                  label="OTP"
                  name="otp"
                  value={values.otp}
                  onChange={handleChange}
                  error={touched.otp && !!errors.otp}
                  helperText={touched.otp && errors.otp}
                  slotProps={{ htmlInput: { maxLength: 6 } }}
                />
                <Button type="submit" fullWidth variant="contained">
                  Verify
                </Button>
                <Button
                  fullWidth
                  variant="text"
                  onClick={() => {
                    setStep("credentials");
                    setTempToken(null);
                    loginMutation.reset();
                  }}
                >
                  Back to Login
                </Button>
              </Box>
            )}
          </Formik>
        )}
      </Paper>
    </Box>
  );
}
