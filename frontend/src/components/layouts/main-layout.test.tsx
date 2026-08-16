import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route, useLocation } from "react-router-dom";
import { createTheme, ThemeProvider } from "@mui/material";
import { type ReactNode } from "react";

import PageLayout from "./main-layout";

const { useMediaQueryMock } = vi.hoisted(() => ({
  useMediaQueryMock: vi.fn(() => true),
}));

const { authMock } = vi.hoisted(() => ({
  authMock: { logout: vi.fn() },
}));

vi.mock("@mui/material", async () => {
  const { createTheme, ThemeProvider, useTheme } = await import(
    "@mui/material/styles"
  );
  const Box = (await import("@mui/material/Box")).default;
  const List = (await import("@mui/material/List")).default;
  const Divider = (await import("@mui/material/Divider")).default;
  const ListItemButton = (await import("@mui/material/ListItemButton")).default;
  const ListItemIcon = (await import("@mui/material/ListItemIcon")).default;
  const ListItemText = (await import("@mui/material/ListItemText")).default;
  const Collapse = (await import("@mui/material/Collapse")).default;
  const Paper = (await import("@mui/material/Paper")).default;
  const IconButton = (await import("@mui/material/IconButton")).default;
  const Typography = (await import("@mui/material/Typography")).default;
  return {
    createTheme,
    ThemeProvider,
    useTheme,
    Box,
    List,
    Divider,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Collapse,
    Paper,
    IconButton,
    Typography,
    Drawer: ({
      open,
      variant,
      children,
    }: {
      open: boolean;
      variant: string;
      children: ReactNode;
    }) => (open ? <div data-testid={`drawer-${variant}`}>{children}</div> : null),
    useMediaQuery: useMediaQueryMock,
  };
});

vi.mock("@/context/use-auth", () => ({
  useAuth: () => authMock,
}));

vi.mock("@/components/layouts/header-component", () => ({
  Header: ({ title, subtitle }: { title: string; subtitle?: string }) => (
    <div data-testid="header">
      <span data-testid="header-title">{title}</span>
      <span data-testid="header-subtitle">{subtitle || ""}</span>
    </div>
  ),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: "en", changeLanguage: vi.fn() },
  }),
}));

function LocationProbe() {
  const { pathname } = useLocation();
  return <div data-testid="pathname">{pathname}</div>;
}

function renderLayout(path: string, desktop = true) {
  useMediaQueryMock.mockReturnValue(desktop);
  return render(
    <MemoryRouter initialEntries={[path]}>
      <ThemeProvider theme={createTheme()}>
        <Routes>
          <Route element={<PageLayout />}>
            <Route path="*" element={<LocationProbe />} />
          </Route>
        </Routes>
      </ThemeProvider>
    </MemoryRouter>
  );
}

describe("PageLayout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useMediaQueryMock.mockReturnValue(true);
  });

  it("renders the header title and subtitle for the current pathname", () => {
    renderLayout("/profile");

    expect(screen.getByTestId("header-title")).toHaveTextContent("Profile");
    expect(screen.getByTestId("header-subtitle")).toHaveTextContent(
      "yourAccountAndPreferences",
    );
  });

  it("renders the sidebar menu items and logout action", () => {
    renderLayout("/dashboard");

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Job Advertisements")).toBeInTheDocument();
    expect(screen.getByText("ATS Scoring")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
    expect(screen.getByText("logout")).toBeInTheDocument();
  });

  it("expands a parent menu item to reveal its children when clicked", async () => {
    const user = userEvent.setup({ delay: null });
    renderLayout("/dashboard");

    expect(screen.queryByText("Generate")).not.toBeInTheDocument();
    expect(screen.queryByText("Past Resumes")).not.toBeInTheDocument();

    await user.click(screen.getByText("Resume Generation"));

    expect(screen.getByText("Generate")).toBeInTheDocument();
    expect(screen.getByText("Past Resumes")).toBeInTheDocument();
  });

  it("navigates to the child route when its menu item is clicked", async () => {
    const user = userEvent.setup({ delay: null });
    renderLayout("/dashboard");

    await user.click(screen.getByText("Personal Info"));

    expect(screen.getByTestId("pathname")).toHaveTextContent("/profile/edit");
  });

  it("calls logout when the logout item is clicked", async () => {
    const user = userEvent.setup({ delay: null });
    renderLayout("/dashboard");

    await user.click(screen.getByText("logout"));

    expect(authMock.logout).toHaveBeenCalled();
  });

  it("renders a persistent drawer on desktop without a close control", () => {
    renderLayout("/dashboard", true);

    expect(screen.getByTestId("drawer-persistent")).toBeInTheDocument();
    expect(screen.queryByTestId("drawer-temporary")).not.toBeInTheDocument();
    expect(screen.queryByTestId("CloseIcon")).not.toBeInTheDocument();
  });

  it("renders a temporary drawer with a close control on mobile", () => {
    renderLayout("/dashboard", false);

    expect(screen.getByTestId("drawer-temporary")).toBeInTheDocument();
    expect(screen.queryByTestId("drawer-persistent")).not.toBeInTheDocument();
    expect(screen.getByTestId("CloseIcon")).toBeInTheDocument();
  });
});
