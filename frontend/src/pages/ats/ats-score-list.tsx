import {
  Typography, Box, Paper, Button, Skeleton, Chip, LinearProgress, IconButton,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import PageWrapper from "@/components/layouts/page-wrapper";
import PageHeader from "@/components/layouts/page-header";
import EmptyState from "@/components/data-display/empty-state";
import { useJobAdsQuery } from "@/hooks/use-job-ads-queries";
import { useAtsScoresQuery, useComputeAtsScoreMutation } from "@/hooks/use-ats-queries";

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 70 ? "success" : score >= 40 ? "warning" : "error";
  return (
    <Chip
      label={`${score}`}
      color={color}
      size="small"
      sx={{ fontWeight: 700, minWidth: 48 }}
    />
  );
}

export default function AtsScoreListPage() {
  const navigate = useNavigate();

  const jobAdsQuery = useJobAdsQuery();
  const scoresQuery = useAtsScoresQuery();
  const computeMutation = useComputeAtsScoreMutation();

  const jobs = jobAdsQuery.data ?? [];
  const scores = scoresQuery.data ?? [];

  const scoresByJobId = new Map(scores.map((score) => [score.jobAdId, score]));
  const threshold = scores[0]?.atsThreshold ?? 40;

  const handleCompute = (jobId: string) => {
    computeMutation.mutate(jobId, {
      onSuccess: (data) => {
        toast.success("ATS score computed");
        navigate(`/ats/${data.jobAdId}`);
      },
      onError: () => toast.error("Failed to compute ATS score"),
    });
  };

  return (
    <PageWrapper>
      <PageHeader title="ATS Scoring" />

      {jobAdsQuery.isLoading ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rounded" height={80} />
          ))}
        </Box>
      ) : jobs.length === 0 ? (
        <EmptyState
          message="No job advertisements found. Add a job ad first to compute ATS scores."
          severity="info"
        />
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {jobs.map((job) => {
            const score = scoresByJobId.get(job.id);
            const isComputing = computeMutation.isPending && computeMutation.variables === job.id;
            const canGenerate = !!score && score.atsScore >= (score.atsThreshold ?? threshold);

            return (
              <Paper key={job.id} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="subtitle1" fontWeight={600} noWrap>
                      {job.title}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, mt: 0.5, alignItems: "center" }}>
                      {job.location && (
                        <Chip label={job.location} size="small" variant="outlined" />
                      )}
                      <Chip
                        label={job.language === "hi" ? "Hindi" : "English"}
                        size="small"
                        variant="outlined"
                      />
                      {score && <ScoreBadge score={score.atsScore} />}
                    </Box>
                    {score && (
                      <LinearProgress
                        variant="determinate"
                        value={score.atsScore}
                        color={score.atsScore >= 70 ? "success" : score.atsScore >= 40 ? "warning" : "error"}
                        sx={{ mt: 1.5, height: 6, borderRadius: 3 }}
                      />
                    )}
                    {score && (
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                        {score.recommendations.length} recommendation{score.recommendations.length !== 1 ? "s" : ""}
                        {" · "}
                        Computed {new Date(score.computedAt).toLocaleDateString()}
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexShrink: 0, ml: 1 }}>
                    {score && (
                      <IconButton
                        size="small"
                        onClick={() => handleCompute(job.id)}
                        disabled={isComputing}
                        title="Recompute score"
                      >
                        <RefreshIcon fontSize="small" />
                      </IconButton>
                    )}
                    {canGenerate && (
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<AutoAwesomeIcon />}
                        onClick={() => navigate(`/resumes?jobAdId=${job.id}`)}
                      >
                        Generate Resume
                      </Button>
                    )}
                    <Button
                      variant={score ? "outlined" : "contained"}
                      size="small"
                      endIcon={<ArrowForwardIcon />}
                      onClick={() => {
                        if (score) {
                          navigate(`/ats/${job.id}`);
                        } else {
                          handleCompute(job.id);
                        }
                      }}
                      disabled={isComputing}
                    >
                      {isComputing ? "Computing..." : score ? "View Score" : "Compute Score"}
                    </Button>
                  </Box>
                </Box>
              </Paper>
            );
          })}
        </Box>
      )}
    </PageWrapper>
  );
}
