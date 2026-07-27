import { useEffect } from "react";
import i18n from "@/i18n/config";
import { useAuth } from "@/context/use-auth";
import { useThemeController } from "@/theme/theme-context";

export default function PreferencesSync() {
  const { user } = useAuth();
  const { mode, toggleTheme } = useThemeController();

  useEffect(() => {
    if (user?.languagePreference && i18n.language !== user.languagePreference) {
      i18n.changeLanguage(user.languagePreference);
    }
  }, [user?.languagePreference]);

  useEffect(() => {
    if (user?.themePreference && user.themePreference !== mode) {
      toggleTheme();
    }
  }, [user?.themePreference, mode, toggleTheme]);

  return null;
}
