import { Box, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { APP_NAME } from "@/config";

interface SidebarHeaderProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  showClose?: boolean;
}

export const SidebarHeader = ({ isSidebarOpen, toggleSidebar, showClose }: SidebarHeaderProps) => {
  return (
    <Box
      component="header"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        bgcolor: "background.paper",
        color: "text.primary",
        p: 2,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography variant="h6" fontWeight={700}>
          {APP_NAME}
        </Typography>
      </Box>

      {showClose && isSidebarOpen && (
        <IconButton onClick={toggleSidebar} size="small">
          <CloseIcon />
        </IconButton>
      )}
    </Box>
  );
};
