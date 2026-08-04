import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Typography, Box, Paper, Button, CircularProgress, Alert, Chip, Divider,
  Skeleton, FormControl, InputLabel, Select, MenuItem, LinearProgress,
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import DownloadIcon from "@mui/icons-material/Download";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import HistoryIcon from "@mui/icons-material/History";
import { toast } from "react-toastify";
import PageWrapper from "@/components/layouts/page-wrapper";
import PageHeader from "@/components/layouts/page-header";
import EmptyState from "@/components/data-display/empty-state";
import PdfViewer from "@/components/pdf-viewer/pdf-viewer";
import { useJobAdsQuery } from "@/hooks/use-job-ads-queries";
import { useAtsScoreQuery } from "@/hooks/use-ats-queries";
import {
  useResumeTemplatesQuery,
  useGenerateResumeMutation,
  fetchResumePreviewApi,
  getPreviewUrl,
  getDownloadUrl,
} from "@/hooks/use-resumes-queries";

export default function ResumesPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const jobAdsQuery = useJobAdsQuery();
  const templatesQuery = useResumeTemplatesQuery();
  const generateMutation = useGenerateResumeMutation();

  const jobAds = jobAdsQuery.data ?? [];

  const [selectedJobAdId, setSelectedJobAdId] = useState<string>(() => {
    const fromParam = searchParams.get("jobAdId");
    return fromParam ?? "";
  });
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [generatedPreviewId, setGeneratedPreviewId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;

    if (!generatedPreviewId) {
      setPreviewUrl(null);
      return;
    }

    setPreviewLoading(true);
    fetchResumePreviewApi(generatedPreviewId)
      .then((blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setPreviewUrl(objectUrl);
      })
      .catch(() => {
        if (!cancelled) {
          setPreviewUrl(null);
          toast.error("Failed to load resume preview");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setPreviewLoading(false);
        }
      });

    return () => {
      cancelled = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [generatedPreviewId]);

  useEffect(() => {
    if (!selectedJobAdId && jobAds.length > 0) {
      setSelectedJobAdId(jobAds[0].id);
    }
  }, [selectedJobAdId, jobAds]);

  useEffect(() => {
    if (templatesQuery.data && templatesQuery.data.length > 0) {
      const alreadySelected = templatesQuery.data.some(
        (t) => t.id === selectedTemplateId,
      );
      if (!alreadySelected) {
        setSelectedTemplateId(templatesQuery.data[0].id);
      }
    }
  }, [templatesQuery.data, selectedTemplateId]);

  const scoreQuery = useAtsScoreQuery(selectedJobAdId, !!selectedJobAdId);

  const selectedJob = useMemo(
    () => jobAds.find((job) => job.id === selectedJobAdId),
    [jobAds, selectedJobAdId],
  );
  const templates = templatesQuery.data ?? [];
  const score = scoreQuery.data;
  const threshold = score?.atsThreshold ?? 40;

  const canGenerate =
    !!selectedJobAdId &&
    !!selectedTemplateId &&
    !!score &&
    score.atsScore >= threshold;

  const handleGenerate = () => {
    if (!selectedJobAdId || !selectedTemplateId) return;
    generateMutation.mutate(
      { jobAdId: selectedJobAdId, resumeTemplateId: selectedTemplateId },
      {
        onSuccess: (data) => {
          setGeneratedPreviewId(data.previewId);
          toast.success("Resume generated successfully");
        },
        onError: () => toast.error("Failed to generate resume"),
      },
    );
  };

  const isLoading =
    jobAdsQuery.isLoading || (templatesQuery.isLoading && !templatesQuery.isFetching);

  return (
    <PageWrapper>
      <PageHeader
        title="Resume Generation"
        onBack={() => navigate("/ats")}
        actionLabel="Generate"
        onAction={handleGenerate}
        actionIcon={<AutoAwesomeIcon />}
      />

      {isLoading ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Skeleton variant="rounded" height={48} />
          <Skeleton variant="rounded" height={300} />
        </Box>
      ) : jobAds.length === 0 ? (
        <EmptyState
          message="No job advertisements found. Add a job ad and compute its ATS score before generating a resume."
          severity="info"
        />
      ) : (
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 3,
            alignItems: "flex-start",
          }}
        >
          <Paper
            variant="outlined"
            sx={{ p: 3, borderRadius: 2, flex: 1, minWidth: 0, maxWidth: { md: 420 } }}
          >
            <Typography variant="h6" sx={{ mb: 2 }}>
              Resume Details
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel id="resume-job-select-label">Job Advertisement</InputLabel>
              <Select
                labelId="resume-job-select-label"
                label="Job Advertisement"
                value={selectedJobAdId}
                onChange={(event) => {
                  setSelectedJobAdId(event.target.value as string);
                  setGeneratedPreviewId(null);
                }}
              >
                {jobAds.map((job) => (
                  <MenuItem key={job.id} value={job.id}>
                    {job.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
              Resume Template
            </Typography>
            {templates.length === 0 ? (
              <Alert severity="warning" sx={{ mb: 2 }}>
                No active resume templates were found on the server.
              </Alert>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mb: 2 }}>
                {templates.map((template) => {
                  const isSelected = template.id === selectedTemplateId;
                  return (
                    <Paper
                      key={template.id}
                      variant="outlined"
                      onClick={() => {
                        setSelectedTemplateId(template.id);
                        setGeneratedPreviewId(null);
                      }}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        cursor: "pointer",
                        borderColor: isSelected ? "primary.main" : "divider",
                        borderWidth: isSelected ? 2 : 1,
                        bgcolor: isSelected ? "primary.main" : "background.paper",
                        color: isSelected ? "primary.contrastText" : "text.primary",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        "&:hover": {
                          borderColor: "primary.main",
                        },
                      }}
                    >
                      <Typography variant="body2" fontWeight={600}>
                        {template.name}
                      </Typography>
                      <Chip
                        label={template.language === "hi" ? "Hindi" : "English"}
                        size="small"
                        variant="outlined"
                        sx={{
                          color: isSelected ? "primary.contrastText" : undefined,
                          borderColor: isSelected ? "primary.contrastText" : undefined,
                        }}
                      />
                    </Paper>
                  );
                })}
              </Box>
            )}

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
              ATS Score
            </Typography>

            {scoreQuery.isLoading ? (
              <Skeleton variant="rounded" height={60} />
            ) : score ? (
              <>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Chip
                    label={`${score.atsScore}`}
                    color={score.atsScore >= 70 ? "success" : score.atsScore >= 40 ? "warning" : "error"}
                    size="small"
                    sx={{ fontWeight: 700 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    out of 100
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={score.atsScore}
                  color={score.atsScore >= 70 ? "success" : score.atsScore >= 40 ? "warning" : "error"}
                  sx={{ mt: 1, height: 8, borderRadius: 4 }}
                />
                <Box sx={{ mt: 1 }}>
                  {score.atsScore >= threshold ? (
                    <Alert severity="success" sx={{ py: 0.5 }}>
                      Eligible to generate a resume for this job.
                    </Alert>
                  ) : (
                    <Alert severity="warning" sx={{ py: 0.5 }}>
                      ATS score below {threshold}. Improve your profile to unlock resume generation.
                    </Alert>
                  )}
                </Box>
              </>
            ) : (
              <Alert severity="info" sx={{ mb: 1 }}>
                No ATS score available for this job ad yet.
                <Box sx={{ mt: 1 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => navigate(`/ats/${selectedJobAdId}`)}
                  >
                    Compute Score
                  </Button>
                </Box>
              </Alert>
            )}
          </Paper>

          <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, flex: 2, minWidth: 0 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography variant="h6">Preview</Typography>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  size="small"
                  variant="text"
                  startIcon={<HistoryIcon />}
                  onClick={() =>
                    navigate(
                      selectedJobAdId
                        ? `/resumes/history?jobAdId=${selectedJobAdId}`
                        : "/resumes/history",
                    )
                  }
                >
                  History
                </Button>
                {generatedPreviewId && (
                  <>
                    <Button
                      size="small"
                      variant="text"
                      startIcon={<OpenInNewIcon />}
                      href={getPreviewUrl(generatedPreviewId)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Open PDF
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<DownloadIcon />}
                      component="a"
                      href={getDownloadUrl(generatedPreviewId)}
                    >
                      Download
                    </Button>
                  </>
                )}
              </Box>
            </Box>
            <Divider sx={{ mb: 2 }} />

            {generateMutation.isPending ? (
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", p: 6 }}>
                <CircularProgress sx={{ mb: 2 }} />
                <Typography color="text.secondary">Generating your resume...</Typography>
              </Box>
            ) : previewLoading ? (
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", p: 6 }}>
                <CircularProgress sx={{ mb: 2 }} />
                <Typography color="text.secondary">Loading preview...</Typography>
              </Box>
            ) : previewUrl ? (
              <PdfViewer
                url={previewUrl}
                title={selectedJob ? `Resume — ${selectedJob.title}` : "Resume Preview"}
                height={600}
              />
            ) : (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  p: 8,
                  color: "text.secondary",
                }}
              >
                <AutoAwesomeIcon sx={{ fontSize: 56, mb: 2, opacity: 0.4 }} />
                <Typography align="center">
                  Select a job advertisement and template, then click “Generate” to create your resume.
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>
      )}

      {!canGenerate && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: "block" }}>
          {selectedJob?.title
            ? `Resume generation requires an ATS score of at least ${threshold} for “${selectedJob.title}”.`
            : `Resume generation requires an ATS score of at least ${threshold}.`}
        </Typography>
      )}
    </PageWrapper>
  );
}
