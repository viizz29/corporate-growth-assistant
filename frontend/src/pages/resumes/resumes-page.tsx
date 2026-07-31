import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Typography, Box, Paper, Button, CircularProgress, Alert, Chip, Divider,
  Skeleton, FormControl, InputLabel, Select, MenuItem, LinearProgress,
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import DownloadIcon from "@mui/icons-material/Download";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { toast } from "react-toastify";
import PageWrapper from "@/components/layouts/page-wrapper";
import PageHeader from "@/components/layouts/page-header";
import EmptyState from "@/components/data-display/empty-state";
import { useJobAdsQuery } from "@/hooks/use-job-ads-queries";
import { useAtsScoreQuery } from "@/hooks/use-ats-queries";
import {
  useResumeTemplatesQuery,
  useGenerateResumeMutation,
  fetchResumePreviewApi,
  getPreviewUrl,
} from "@/hooks/use-resumes-queries";

const ATS_THRESHOLD = 40;

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

  const canGenerate =
    !!selectedJobAdId &&
    !!selectedTemplateId &&
    !!score &&
    score.atsScore >= ATS_THRESHOLD;

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
        onBack={() => navigate("/")}
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

            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel id="resume-template-select-label">Resume Template</InputLabel>
              <Select
                labelId="resume-template-select-label"
                label="Resume Template"
                value={selectedTemplateId}
                onChange={(event) => {
                  setSelectedTemplateId(event.target.value as string);
                  setGeneratedPreviewId(null);
                }}
                displayEmpty
              >
                {templates.length === 0 && (
                  <MenuItem value="" disabled>
                    No templates available
                  </MenuItem>
                )}
                {templates.map((template) => (
                  <MenuItem key={template.id} value={template.id}>
                    {template.name}
                    <Chip
                      label={template.language === "hi" ? "Hindi" : "English"}
                      size="small"
                      variant="outlined"
                      sx={{ ml: 1 }}
                    />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {templates.length === 0 && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                No active resume templates were found on the server.
              </Alert>
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
                  {score.atsScore >= ATS_THRESHOLD ? (
                    <Alert severity="success" sx={{ py: 0.5 }}>
                      Eligible to generate a resume for this job.
                    </Alert>
                  ) : (
                    <Alert severity="warning" sx={{ py: 0.5 }}>
                      ATS score below {ATS_THRESHOLD}. Improve your profile to unlock resume generation.
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
              {generatedPreviewId && (
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  href={getPreviewUrl(generatedPreviewId)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open PDF
                </Button>
              )}
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
              <>
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
                    src={previewUrl}
                    style={{ width: "100%", height: 600, border: 0 }}
                  />
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                  If the PDF does not render, use the “Open PDF” button above.
                </Typography>
              </>
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
                <PictureAsPdfIcon sx={{ fontSize: 56, mb: 2, opacity: 0.4 }} />
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
            ? `Resume generation requires an ATS score of at least ${ATS_THRESHOLD} for “${selectedJob.title}”.`
            : `Resume generation requires an ATS score of at least ${ATS_THRESHOLD}.`}
        </Typography>
      )}
    </PageWrapper>
  );
}
