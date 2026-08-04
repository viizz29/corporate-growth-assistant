import { useState } from "react";
import {
  Typography, Box, Paper, Button, Skeleton, Chip, Divider, IconButton,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { useNavigate } from "react-router-dom";
import PageWrapper from "@/components/layouts/page-wrapper";
import PageHeader from "@/components/layouts/page-header";
import EmptyState from "@/components/data-display/empty-state";
import { useGeneratedResumesQuery, getPreviewUrl } from "@/hooks/use-resumes-queries";

export default function PastResumesPage() {
  const navigate = useNavigate();
  const [previewId, setPreviewId] = useState<string | null>(null);

  const resumesQuery = useGeneratedResumesQuery();
  const resumes = resumesQuery.data ?? [];

  return (
    <PageWrapper>
      <PageHeader
        title="Past Resumes"
        onBack={() => navigate("/resumes")}
        actionLabel="Generate New"
        onAction={() => navigate("/resumes")}
      />

      {resumesQuery.isLoading ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rounded" height={80} />
          ))}
        </Box>
      ) : resumes.length === 0 ? (
        <EmptyState
          message="No resumes generated yet. Generate your first resume to see it here."
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
                    Generated {new Date(resume.generatedAt).toLocaleDateString()}
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
                    href={getPreviewUrl(resume.id)}
                    download
                  >
                    Download
                  </Button>
                </Box>
              </Box>
            </Paper>
          ))}
        </Box>
      )}

      {previewId && (
        <Paper
          variant="outlined"
          sx={{ p: 3, borderRadius: 2, mt: 3 }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6">Preview</Typography>
            <Button size="small" onClick={() => setPreviewId(null)}>
              Close
            </Button>
          </Box>
          <Divider sx={{ mb: 2 }} />
          <Box
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              overflow: "hidden",
              bgcolor: "background.default",
            }}
          >
            <iframe
              title="Resume preview"
              src={getPreviewUrl(previewId)}
              style={{ width: "100%", height: 600, border: 0 }}
            />
          </Box>
        </Paper>
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
