import {
  Typography, Paper, Box, Avatar, Button, Skeleton, Chip, Divider,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import SchoolIcon from "@mui/icons-material/School";
import WorkIcon from "@mui/icons-material/Work";
import PsychologyIcon from "@mui/icons-material/Psychology";
import FolderIcon from "@mui/icons-material/Folder";
import EditIcon from "@mui/icons-material/Edit";
import PageWrapper from "@/components/layouts/page-wrapper";
import PageHeader from "@/components/layouts/page-header";
import EmptyState from "@/components/data-display/empty-state";
import { useAuth } from "@/context/use-auth";
import {
  useEducationsQuery,
  useWorkExperiencesQuery,
  useSkillsQuery,
  useProjectsQuery,
} from "@/hooks/use-users-queries";

function SectionCard({
  title,
  icon,
  count,
  to,
  emptyMessage,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  count: number;
  to: string;
  emptyMessage: string;
  children?: React.ReactNode;
}) {
  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {icon}
          <Typography variant="h6">{title}</Typography>
          <Chip label={count} size="small" color="primary" variant="outlined" />
        </Box>
        <Button
          component={Link}
          to={to}
          size="small"
          startIcon={<EditIcon />}
        >
          Manage
        </Button>
      </Box>
      <Divider sx={{ mb: 2 }} />
      {count === 0 ? (
        <EmptyState message={emptyMessage} />
      ) : (
        children
      )}
    </Paper>
  );
}

export default function ProfilePage() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const educationsQuery = useEducationsQuery();
  const workQuery = useWorkExperiencesQuery();
  const skillsQuery = useSkillsQuery();
  const projectsQuery = useProjectsQuery();

  const isLoading =
    educationsQuery.isLoading ||
    workQuery.isLoading ||
    skillsQuery.isLoading ||
    projectsQuery.isLoading;

  return (
    <PageWrapper>
      <PageHeader title={t("Profile")} />

      <Paper variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <Avatar sx={{ width: 64, height: 64, bgcolor: "primary.main", fontSize: "1.5rem" }}>
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5">{user?.name || t("noName")}</Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.email}
            </Typography>
            <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
              {user?.role && <Chip label={user.role} size="small" />}
              {user?.isEmailVerified && (
                <Chip label={t("verified")} size="small" color="success" variant="outlined" />
              )}
            </Box>
          </Box>
          <Button
            component={Link}
            to="/profile/edit"
            variant="outlined"
            startIcon={<EditIcon />}
          >
            {t("edit")}
          </Button>
        </Box>
      </Paper>

      {isLoading ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="rounded" height={120} />
          ))}
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <SectionCard
            title={t("Education")}
            icon={<SchoolIcon color="primary" />}
            count={educationsQuery.data?.length ?? 0}
            to="/profile/education"
            emptyMessage={t("noEducationEntries")}
          >
            {educationsQuery.data?.slice(0, 3).map((edu) => (
              <Box key={edu.id} sx={{ mb: 1 }}>
                <Typography variant="body2" fontWeight={600}>
                  {edu.degree}{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ""}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {edu.institution}
                  {edu.startDate ? ` | ${edu.startDate}` : ""}
                  {edu.endDate ? ` - ${edu.endDate}` : ""}
                </Typography>
              </Box>
            ))}
          </SectionCard>

          <SectionCard
            title={t("WorkExperience")}
            icon={<WorkIcon color="primary" />}
            count={workQuery.data?.length ?? 0}
            to="/profile/work-experience"
            emptyMessage={t("noWorkExperienceEntries")}
          >
            {workQuery.data?.slice(0, 3).map((work) => (
              <Box key={work.id} sx={{ mb: 1 }}>
                <Typography variant="body2" fontWeight={600}>
                  {work.role}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {work.company}
                  {work.startDate ? ` | ${work.startDate}` : ""}
                  {work.endDate ? ` - ${work.endDate}` : ""}
                </Typography>
              </Box>
            ))}
          </SectionCard>

          <SectionCard
            title={t("Skills")}
            icon={<PsychologyIcon color="primary" />}
            count={skillsQuery.data?.length ?? 0}
            to="/profile/skills"
            emptyMessage={t("noSkillsEntries")}
          >
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {skillsQuery.data?.map((skill) => (
                <Chip
                  key={skill.id}
                  label={skill.proficiencyLevel ? `${skill.skillName} (${skill.proficiencyLevel})` : skill.skillName}
                  size="small"
                  variant="outlined"
                />
              ))}
            </Box>
          </SectionCard>

          <SectionCard
            title={t("Projects")}
            icon={<FolderIcon color="primary" />}
            count={projectsQuery.data?.length ?? 0}
            to="/profile/projects"
            emptyMessage={t("noProjectEntries")}
          >
            {projectsQuery.data?.slice(0, 3).map((proj) => (
              <Box key={proj.id} sx={{ mb: 1 }}>
                <Typography variant="body2" fontWeight={600}>
                  {proj.projectName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {proj.description?.slice(0, 80)}
                  {proj.description && proj.description.length > 80 ? "..." : ""}
                </Typography>
                {proj.techStack && (
                  <Typography variant="caption" display="block" color="text.secondary">
                    {proj.techStack}
                  </Typography>
                )}
              </Box>
            ))}
          </SectionCard>
        </Box>
      )}
    </PageWrapper>
  );
}
