import {
  Typography, Switch, FormControlLabel, Alert, Skeleton,
} from "@mui/material";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import PageWrapper from "@/components/layouts/page-wrapper";
import PageHeader from "@/components/layouts/page-header";
import FormCard from "@/components/forms/form-card";
import { useAuth } from "@/context/use-auth";
import {
  useUpdateProfileMutation,
  useEmailPreferencesQuery,
  useUpdateEmailPreferencesMutation,
  useToggle2faMutation,
} from "@/hooks/use-auth-queries";
import FormCardSelectField from "./form-card-select-field";

export default function SettingsPage() {
  const { user, updateProfile } = useAuth();
  const { t } = useTranslation();

  const emailPrefsQuery = useEmailPreferencesQuery();
  const profileMutation = useUpdateProfileMutation();
  const emailPrefsMutation = useUpdateEmailPreferencesMutation();
  const toggle2faMutation = useToggle2faMutation();

  const handleLanguageChange = (lang: "en" | "hi") => {
    profileMutation.mutate(
      {
        name: user?.name || "",
        email: user?.email || "",
        languagePreference: lang,
      } as any,
      {
        onSuccess: (data) => {
          updateProfile(data);
          toast.success(t("profileUpdated"));
        },
        onError: () => toast.error(t("failedToUpdateProfile")),
      },
    );
  };

  const handleThemeChange = (theme: "light" | "dark") => {
    profileMutation.mutate(
      {
        name: user?.name || "",
        email: user?.email || "",
        themePreference: theme,
      } as any,
      {
        onSuccess: (data) => {
          updateProfile(data);
          toast.success(t("profileUpdated"));
        },
        onError: () => toast.error(t("failedToUpdateProfile")),
      },
    );
  };

  const handleEmailToggle = (_: unknown, checked: boolean) => {
    emailPrefsMutation.mutate(
      { emailNotifications: checked },
      {
        onSuccess: () => toast.success(t("emailPreferencesUpdated")),
        onError: () => toast.error(t("failedToUpdateEmailPreferences")),
      },
    );
  };

  const handle2faToggle = (_: unknown, checked: boolean) => {
    toggle2faMutation.mutate(checked, {
      onSuccess: () => {
        toast.success(checked ? t("twoFactorEnabled") : t("twoFactorDisabled"));
      },
      onError: () => toast.error(t("failedToUpdate2faSetting")),
    });
  };

  return (
    <PageWrapper>
      <PageHeader title={t('Settings')} />

      <FormCard title={t('Language Preference')} maxWidth={480}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t('Choose the language used throughout the application.')}
        </Typography>
        <FormCardSelectField
          label={t('Language')}
          value={user?.languagePreference || "en"}
          onChange={(v) => handleLanguageChange(v as "en" | "hi")}
          disabled={profileMutation.isPending}
          options={[
            { value: "en", label: t('English') },
            { value: "hi", label: t('Hindi') },
          ]}
        />
      </FormCard>

      <FormCard title={t('Theme Preference')} maxWidth={480}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t('Switch between light and dark interface modes.')}
        </Typography>
        <FormCardSelectField
          label={t('Theme')}
          value={user?.themePreference || "light"}
          onChange={(v) => handleThemeChange(v as "light" | "dark")}
          disabled={profileMutation.isPending}
          options={[
            { value: "light", label: t('Light') },
            { value: "dark", label: t('Dark') },
          ]}
        />
      </FormCard>

      <FormCard title={t('emailPreferences')} maxWidth={480}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t('receiveEmailNotifications')}
        </Typography>
        {emailPrefsQuery.isLoading ? (
          <Skeleton width={280} height={40} />
        ) : (
          <FormControlLabel
            control={
              <Switch
                checked={emailPrefsQuery.data?.emailNotifications ?? false}
                onChange={handleEmailToggle}
                disabled={emailPrefsMutation.isPending}
              />
            }
            label={t('receiveEmailNotifications')}
          />
        )}
      </FormCard>

      <FormCard title={t('twoFactorAuth')} maxWidth={480}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t('requireOtp')}
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={user?.is2faEnabled ?? false}
              onChange={handle2faToggle}
              disabled={toggle2faMutation.isPending}
            />
          }
          label={user?.is2faEnabled ? t('2FA is enabled') : t('Enable two-factor authentication')}
        />
        {toggle2faMutation.isError && (
          <Alert severity="error" sx={{ mt: 1 }}>
            {(toggle2faMutation.error as any)?.response?.data?.message ||
              t('failedToUpdate2faSetting')}
          </Alert>
        )}
      </FormCard>
    </PageWrapper>
  );
}
