import { Typography, Paper, Button, Alert, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import MarkEmailUnreadIcon from "@mui/icons-material/MarkEmailUnread";
import { useAuth } from "@/context/use-auth";
import PageWrapper from "@/components/layouts/page-wrapper";

export default function VerifyEmailPending() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <PageWrapper
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
      }}
    >
      <Paper
        variant="outlined"
        sx={{ p: 4, width: "100%", maxWidth: 448, textAlign: "center" }}
      >
        <Box sx={{ mb: 2 }}>
          <MarkEmailUnreadIcon sx={{ fontSize: 64, color: "warning.main" }} />
        </Box>

        <Typography variant="h5" sx={{ mb: 1 }}>
          Email Verification Required
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Please verify your email address
          {user?.email ? ` (${user.email})` : ""} to access this feature.
          Check your inbox for the verification link.
        </Typography>

        <Alert severity="info" sx={{ mb: 3, textAlign: "left" }}>
          Some features require a verified email address before they can be
          accessed.
        </Alert>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Button
            variant="contained"
            fullWidth
            onClick={() => navigate("/resend-verification")}
          >
            Resend Verification Email
          </Button>

          <Button
            variant="outlined"
            fullWidth
            onClick={() => navigate("/settings")}
          >
            Go to Settings
          </Button>

          <Button
            variant="text"
            fullWidth
            size="small"
            onClick={() => {
              logout();
              navigate("/login");
            }}
          >
            Logout
          </Button>
        </Box>
      </Paper>
    </PageWrapper>
  );
}
