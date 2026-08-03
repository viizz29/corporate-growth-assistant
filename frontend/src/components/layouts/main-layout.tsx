import { useMemo, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import {
  Box,
  Drawer,
  List,
  Divider,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PersonIcon from "@mui/icons-material/Person";
import WorkIcon from "@mui/icons-material/Work";
import ScoreIcon from "@mui/icons-material/Assignment";
import DescriptionIcon from "@mui/icons-material/Description";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import SchoolIcon from "@mui/icons-material/School";
import EngineeringIcon from "@mui/icons-material/Engineering";
import PsychologyIcon from "@mui/icons-material/Psychology";
import FolderIcon from "@mui/icons-material/Folder";

import { SidebarHeader } from "./sidebar-header-component";
import { SidebarMenuItem } from "./sidebar-menu-item";
import { Header } from "./header-component";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/use-auth";

const drawerWidth = 240;

type MenuItem = {
  label: string;
  path?: string;
  icon: React.ReactNode;
  children?: { label: string; path: string; icon: React.ReactNode }[];
};

const menuItems: MenuItem[] = [
  { label: "Dashboard", path: "/", icon: <DashboardIcon /> },
  {
    label: "Profile",
    icon: <PersonIcon />,
    children: [
      { label: "Summary", path: "/profile", icon: <PersonIcon /> },
      { label: "Personal Info", path: "/profile/edit", icon: <PersonIcon /> },
      { label: "Education", path: "/profile/education", icon: <SchoolIcon /> },
      { label: "Work Experience", path: "/profile/work-experience", icon: <EngineeringIcon /> },
      { label: "Skills", path: "/profile/skills", icon: <PsychologyIcon /> },
      { label: "Projects", path: "/profile/projects", icon: <FolderIcon /> },
    ],
  },
  { label: "Job Advertisements", path: "/job-ads", icon: <WorkIcon /> },
  { label: "ATS Scoring", path: "/ats", icon: <ScoreIcon /> },
  { label: "Resume Generation", path: "/resumes", icon: <DescriptionIcon /> },
  { label: "Settings", path: "/settings", icon: <SettingsIcon /> },
];

const PageLayout = () => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileExpanded, setProfileExpanded] = useState(true);
  const { t } = useTranslation();
  const { logout } = useAuth();

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const { pathname } = useLocation();

  const currentPage = useMemo(() => {
    const pageConfig: Record<string, { title: string; subtitle: string }> = {
      "/": { title: t("Dashboard"), subtitle: "" },
      "/profile": { title: t("Profile"), subtitle: t("yourAccountAndPreferences") },
      "/job-ads": { title: t("Job Advertisements"), subtitle: "" },
      "/ats": { title: t("ATS Scoring"), subtitle: "" },
      "/resumes": { title: t("Resume Generation"), subtitle: "" },
      "/settings": { title: t("Settings"), subtitle: "" },
    };
    const exact = pageConfig[pathname];
    if (exact) return exact;
    return { title: t("appTitle"), subtitle: "" };
  }, [pathname, t]);

  const sidebarContent = (
    <Box display="flex" flexDirection="column" height="100%">
      <SidebarHeader isSidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} showClose={!isDesktop} />

      <List sx={{ flex: 1, px: 0.5, overflowY: "auto" }}>
        {menuItems.map((item) => {
          if (item.children) {
            // const isParentActive = item.children.some(
            //   (child) => pathname === child.path,
            // );
            return (
              <Box key={item.label}>
                <ListItemButton
                  onClick={() => setProfileExpanded((prev) => !prev)}
                  sx={{ mx: 0.5, borderRadius: 1 }}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={t(item.label)} />
                  {profileExpanded ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
                <Collapse in={profileExpanded} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.children.map((child) => (
                      <SidebarMenuItem
                        key={child.path}
                        icon={child.icon}
                        path={child.path}
                        onClick={isDesktop ? undefined : toggleSidebar}
                      >
                        {t(child.label)}
                      </SidebarMenuItem>
                    ))}
                  </List>
                </Collapse>
              </Box>
            );
          }

          return (
            <SidebarMenuItem
              key={item.path}
              icon={item.icon}
              path={item.path!}
              onClick={isDesktop ? undefined : toggleSidebar}
            >
              {t(item.label)}
            </SidebarMenuItem>
          );
        })}
      </List>

      <Divider />
      <List sx={{ px: 0.5 }}>
        <ListItemButton
          onClick={() => {
            logout();
            if (!isDesktop) toggleSidebar();
          }}
          sx={{ mx: 0.5, borderRadius: 1 }}
        >
          <ListItemIcon><LogoutIcon /></ListItemIcon>
          <ListItemText primary={t("logout")} />
        </ListItemButton>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", height: "100vh", bgcolor: "background.default" }}>
      {/* Mobile drawer (temporary overlay) */}
      <Drawer
        variant="temporary"
        open={!isDesktop && sidebarOpen}
        onClose={toggleSidebar}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box" },
        }}
      >
        {sidebarContent}
      </Drawer>

      {/* Desktop drawer (persistent) */}
      <Drawer
        variant="persistent"
        open={isDesktop && sidebarOpen}
        sx={{
          display: { xs: "none", md: "block" },
          "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box" },
        }}
      >
        {sidebarContent}
      </Drawer>

      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          ml: { md: isDesktop && sidebarOpen ? `${drawerWidth}px` : 0 },
        }}
      >
        <Box sx={{ m: 1 }}>
          <Header
            isSidebarOpen={sidebarOpen}
            toggleSidebar={toggleSidebar}
            title={currentPage.title}
            subtitle={currentPage.subtitle}
          />
        </Box>

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            m: 2,
            bgcolor: "background.paper",
            boxShadow: 1,
            borderRadius: 2,
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default PageLayout;
