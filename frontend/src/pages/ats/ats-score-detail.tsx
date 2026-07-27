import { useEffect } from "react";
import {
  Typography, Box, Paper, Button, CircularProgress, Alert, Chip, Divider, LinearProgress, Skeleton,
} from "@mui/material";
import BuildIcon from "@mui/icons-material/Build";
import PsychologyIcon from "@mui/icons-material/Psychology";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import PageWrapper from "@/components/layouts/page-wrapper";
import PageHeader from "@/components/layouts/page-header";
import { useJobAdQuery } from "@/hooks/use-job-ads-queries";
import { useAtsScoreQuery, useComputeAtsScoreMutation } from "@/hooks/use-ats-queries";

function ScoreRing({ score }: { score: number }) {
  const color = score >= 70 ? "#22c55e" : score >= 40 ? "#f59e0b" : "#ef4444";
  const bg = score >= 70 ? "#22c55e22" : score >= 40 ? "#f59e0b22" : "#ef444422";

  return (
    <Box sx={{ position: "relative", display: "inline-flex" }}>
      <CircularProgress
        variant="determinate"
        value={100}
        size={140}
        sx={{ color: bg }}
      />
      <CircularProgress
        variant="determinate"
        value={score}
        size={140}
        sx={{ color, position: "absolute", left: 0 }}
      />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: "absolute",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="h3" fontWeight={700} sx={{ color, lineHeight: 1 }}>
          {score}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          out of 100
        </Typography>
      </Box>
    </Box>
  );
}

export default function AtsScoreDetailPage() {
  const { jobAdId } = useParams<{ jobAdId: string }>();
  const navigate = useNavigate();

  const jobQuery = useJobAdQuery(jobAdId);
  const scoreQuery = useAtsScoreQuery(jobAdId);
  const computeMutation = useComputeAtsScoreMutation();

  useEffect(() => {
    if (jobAdId && scoreQuery.isError && !scoreQuery.isFetching) {
      computeMutation.mutate(jobAdId);
    }
  }, [jobAdId, scoreQuery.isError, scoreQuery.isFetching]);

  if (!jobAdId) {
    navigate("/ats");
    return null;
  }

  const handleRecompute = () => {
    if (!jobAdId) return;
    computeMutation.mutate(jobAdId, {
      onSuccess: (data) => {
        toast.success("Score recomputed");
      },
      onError: () => toast.error("Failed to compute score"),
    });
  };

  const isLoading = jobQuery.isLoading || (scoreQuery.isLoading && !computeMutation.isPending);
  const score = scoreQuery.data;
  const job = jobQuery.data;

  if (isLoading) {
    return (
      <PageWrapper>
        <Skeleton variant="rounded" height={48} sx={{ mb: 3 }} />
        <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
          <CircularProgress />
        </Box>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <PageHeader
        title={job?.title || "ATS Score Detail"}
        onBack={() => navigate("/ats")}
      />

      {(scoreQuery.isError || computeMutation.isError) && !score && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {computeMutation.isError
            ? "Failed to compute ATS score. Please try again."
            : "No ATS score available for this job ad."}
        </Alert>
      )}

      {computeMutation.isPending && !score && (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", p: 6 }}>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography color="text.secondary">Computing your ATS score...</Typography>
        </Box>
      )}

      {score && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, textAlign: "center" }}>
            <ScoreRing score={score.atsScore} />
            <Box sx={{ mt: 2 }}>
              <LinearProgress
                variant="determinate"
                value={score.atsScore}
                color={score.atsScore >= 70 ? "success" : score.atsScore >= 40 ? "warning" : "error"}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {score.atsScore >= 70
                ? "Great match! Your profile is well-aligned with this job."
                : score.atsScore >= 40
                  ? "Moderate match. See recommendations below to improve."
                  : "Low match. Review the recommendations to strengthen your profile."}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
              Computed {new Date(score.computedAt).toLocaleString()}
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={handleRecompute}
              disabled={computeMutation.isPending}
              sx={{ mt: 2 }}
            >
              {computeMutation.isPending ? "Recomputing..." : "Recompute Score"}
            </Button>
          </Paper>

          <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
              <Typography variant="h6">Recommendations</Typography>
              <Chip
                label={`${score.recommendations.length} item${score.recommendations.length !== 1 ? "s" : ""}`}
                size="small"
                color={score.recommendations.length === 0 ? "success" : "primary"}
                variant="outlined"
              />
            </Box>
            <Divider sx={{ mb: 2 }} />

            {score.recommendations.length === 0 ? (
              <Alert severity="success">
                No recommendations — your profile is optimized for this job!
              </Alert>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {score.recommendations.map((rec, idx) => (
                  <Paper
                    key={idx}
                    variant="outlined"
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      display: "flex",
                      gap: 1.5,
                      alignItems: "flex-start",
                    }}
                  >
                    {rec.type === "skill" ? (
                      <BuildIcon color="primary" sx={{ mt: 0.25 }} />
                    ) : (
                      <PsychologyIcon color="secondary" sx={{ mt: 0.25 }} />
                    )}
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                        <Typography variant="body2" fontWeight={600}>
                          {rec.message}
                        </Typography>
                        <Chip
                          label={rec.type}
                          size="small"
                          variant="outlined"
                          color={rec.type === "skill" ? "primary" : "secondary"}
                        />
                      </Box>
                      {rec.details && (
                        <Typography variant="caption" color="text.secondary">
                          {rec.details}
                        </Typography>
                      )}
                    </Box>
                  </Paper>
                ))}
              </Box>
            )}
          </Paper>

          {score.atsScore >= 70 && (
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, textAlign: "center" }}>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                Ready to generate your resume?
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Your ATS score meets the threshold. You can now generate a tailored resume.
              </Typography>
              <Button variant="contained" onClick={() => navigate("/resumes")}>
                Generate Resume
              </Button>
            </Paper>
          )}
        </Box>
      )}
    </PageWrapper>
  );
}
