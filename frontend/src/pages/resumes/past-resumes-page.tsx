import {
  Typography, Box, Paper, Button, Skeleton, Chip, IconButton,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ClearIcon from "@mui/icons-material/Clear";
import { useNavigate, useSearchParams } from "react-router-dom";
import PageWrapper from "@/components/layouts/page-wrapper";
import PageHeader from "@/components/layouts/page-header";
import EmptyState from "@/components/data-display/empty-state";
import { useJobAdsQuery } from "@/hooks/use-job-ads-queries";
import {
  useGeneratedResumesQuery,
  getPreviewUrl,
  getDownloadUrl,
} from "@/hooks/use-resumes-queries";

export default function PastResumesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const jobAdId = searchParams.get("jobAdId") ?? undefined;

  const jobAdsQuery = useJobAdsQuery();
  const jobAds = jobAdsQuery.data ?? [];
  const filteredJob = jobAdId
    ? jobAds.find((job) => job.id === jobAdId)
    : undefined;

  const resumesQuery = useGeneratedResumesQuery(jobAdId);
  const resumes = resumesQuery.data ?? [];

  const handleGenerateNew = () => {
    navigate(jobAdId ? `/resumes?jobAdId=${jobAdId}` : "/resumes");
  };

  return (
    <PageWrapper>
      <PageHeader
        title={filteredJob ? `Resumes for ${filteredJob.title}` : "Past Resumes"}
        onBack={() => navigate("/resumes")}
        actionLabel="Generate New"
        onAction={handleGenerateNew}
      />

      {jobAdId && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <Chip
            label={filteredJob ? `Job: ${filteredJob.title}` : `Job ID: ${jobAdId}`}
            size="small"
            color="primary"
            variant="outlined"
            onDelete={() => setSearchParams({}, { replace: true })}
            deleteIcon={<ClearIcon />}
          />
          <Button
            size="small"
            variant="text"
            onClick={() => setSearchParams({}, { replace: true })}
          >
            Show all resumes
          </Button>
        </Box>
      )}

      {resumesQuery.isLoading ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rounded" height={80} />
          ))}
        </Box>
      ) : resumes.length === 0 ? (
        <EmptyState
          message={
            jobAdId
              ? "No resumes generated for this job advertisement yet."
              : "No resumes generated yet. Generate your first resume to see it here."
          }
          severity="info"
        />
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {resumes.map((resume) => (
            <Paper key={resume.id} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="subtitle1" fontWeight={600} noWrap>
                    {resume.filename || "Untitled Resume"}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1, mt: 0.5, flexWrap: "wrap", alignItems: "center" }}>
                    {resume.jobAdvertisement && (
                      <Chip
                        label={resume.jobAdvertisement.title}
                        size="small"
                        variant="outlined"
                      />
                    )}
                    {resume.resumeTemplate && (
                      <Chip
                        label={resume.resumeTemplate.name}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    )}
                    <Chip
                      label={`ATS: ${resume.atsScore}`}
                      size="small"
                      color={
                        resume.atsScore >= 70
                          ? "success"
                          : resume.atsScore >= 40
                            ? "warning"
                            : "error"
                      }
                      sx={{ fontWeight: 700 }}
                    />
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                    Generated {new Date(resume.generatedAt).toLocaleString()}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexShrink: 0, ml: 1 }}>
                  <IconButton
                    size="small"
                    component="a"
                    href={getPreviewUrl(resume.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Open in new tab"
                  >
                    <OpenInNewIcon fontSize="small" />
                  </IconButton>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    component="a"
                    href={getDownloadUrl(resume.id)}
                  >
                    Download
                  </Button>
                </Box>
              </Box>
            </Paper>
          ))}
        </Box>
      )}

      {resumes.length > 0 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <PictureAsPdfIcon sx={{ fontSize: 18, opacity: 0.3, mr: 0.5 }} />
          <Typography variant="caption" color="text.secondary">
            {resumes.length} resume{resumes.length !== 1 ? "s" : ""} generated
          </Typography>
        </Box>
      )}
    </PageWrapper>
  );
}
