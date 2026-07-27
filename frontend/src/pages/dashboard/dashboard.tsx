import { Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import PageWrapper from "@/components/layouts/page-wrapper";

export default function DashboardPage() {
  const { t } = useTranslation();

  return (
    <PageWrapper>
      <Typography variant="h4">{t("Dashboard")}</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
        {t("welcomeMessage")}
      </Typography>
    </PageWrapper>
  );
}
