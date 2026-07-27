import { Suspense, lazy, type JSX } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { useAuth } from "../context/use-auth";
import NavigateSetter from "../components/navigate-setter";

// Layout
import MainLayout from "../components/layouts/main-layout";

// ─── Loading Fallback ──────────────────────────────────

const LoadingFallback = () => (
  <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", p: 4 }}>
    <CircularProgress />
  </Box>
);

// ─── Lazy Pages ────────────────────────────────────────

const Dashboard = lazy(() => import("../pages/dashboard/dashboard"));
const Profile = lazy(() => import("../pages/profile/profile"));
const PersonalInfo = lazy(() => import("../pages/profile/personal-info"));
const Education = lazy(() => import("../pages/profile/education"));
const WorkExperience = lazy(() => import("../pages/profile/work-experience"));
const Skills = lazy(() => import("../pages/profile/skills"));
const Projects = lazy(() => import("../pages/profile/projects"));
const JobAdsList = lazy(() => import("../pages/job-ads/job-ads-list"));
const JobAdForm = lazy(() => import("../pages/job-ads/job-ad-form"));
const AtsScoreList = lazy(() => import("../pages/ats/ats-score-list"));
const AtsScoreDetail = lazy(() => import("../pages/ats/ats-score-detail"));
const Settings = lazy(() => import("../pages/settings/settings"));
const Login = lazy(() => import("../pages/auth/login"));
const Register = lazy(() => import("../pages/auth/register"));
const ForgotPassword = lazy(() => import("../pages/auth/forgot-password"));
const ResetPassword = lazy(() => import("../pages/auth/reset-password"));
const VerifyEmail = lazy(() => import("../pages/auth/verify-email"));
const ResendVerification = lazy(() => import("../pages/auth/resend-verification"));
const VerifyEmailPending = lazy(() => import("../pages/auth/verify-email-pending"));
const NotFound = lazy(() => import("../pages/misc/not-found"));

// ─── Route Guards ──────────────────────────────────────

/**
 * AuthRoute – for unauthenticated users only.
 * Redirects to "/" if already logged in.
 */
const AuthRoute = ({ children }: { children: JSX.Element }) => {
  const { user, isAuthReady } = useAuth();

  if (!isAuthReady) return <LoadingFallback />;
  return user ? <Navigate to="/" replace /> : children;
};

/**
 * PrivateRoute – requires authentication only.
 * Redirects to "/login" if not logged in.
 */
const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { user, isAuthReady } = useAuth();

  if (!isAuthReady) return <LoadingFallback />;
  return user ? children : <Navigate to="/login" replace />;
};

/**
 * VerifiedRoute – requires authentication AND verified email.
 * Redirects to "/login" if not logged in.
 * Redirects to "/verify-email-pending" if email not verified.
 */
const VerifiedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, isAuthReady } = useAuth();

  if (!isAuthReady) return <LoadingFallback />;
  if (!user) return <Navigate to="/login" replace />;
  if (!user.isEmailVerified) return <Navigate to="/verify-email-pending" replace />;
  return children;
};

// ─── App Routes ────────────────────────────────────────

export default function AppRoutes() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <NavigateSetter />
      <Routes>
        {/* ── Public (no auth required) ── */}
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />

        {/* ── Auth pages (redirect if already logged in) ── */}
        <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
        <Route path="/register" element={<AuthRoute><Register /></AuthRoute>} />
        <Route path="/forgot-password" element={<AuthRoute><ForgotPassword /></AuthRoute>} />
        <Route path="/resend-verification" element={<AuthRoute><ResendVerification /></AuthRoute>} />

        {/* ── Protected: auth required ── */}
        <Route element={<PrivateRoute><MainLayout /></PrivateRoute>}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/edit" element={<PersonalInfo />} />
          <Route path="/profile/education" element={<Education />} />
          <Route path="/profile/work-experience" element={<WorkExperience />} />
          <Route path="/profile/skills" element={<Skills />} />
          <Route path="/profile/projects" element={<Projects />} />
          <Route path="/job-ads" element={<JobAdsList />} />
          <Route path="/job-ads/new" element={<JobAdForm />} />
          <Route path="/job-ads/:id" element={<JobAdForm />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* ── Protected: auth + email verification required ── */}
        <Route element={<VerifiedRoute><MainLayout /></VerifiedRoute>}>
          <Route path="/ats" element={<AtsScoreList />} />
          <Route path="/ats/:jobAdId" element={<AtsScoreDetail />} />
          <Route path="/resumes" element={<Dashboard />} />
        </Route>

        {/* ── Verification pending (auth required) ── */}
        <Route
          path="/verify-email-pending"
          element={<PrivateRoute><VerifyEmailPending /></PrivateRoute>}
        />

        {/* ── Catch-all ── */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
