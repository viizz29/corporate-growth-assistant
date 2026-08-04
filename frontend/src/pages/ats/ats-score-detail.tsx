import { useEffect } from "react";
import {
  Typography, Box, Paper, Button, CircularProgress, Alert, Chip, Divider, LinearProgress, Skeleton, IconButton,
} from "@mui/material";
import BuildIcon from "@mui/icons-material/Build";
import PsychologyIcon from "@mui/icons-material/Psychology";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import SchoolIcon from "@mui/icons-material/School";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import CodeIcon from "@mui/icons-material/Code";
import DownloadIcon from "@mui/icons-material/Download";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import HistoryIcon from "@mui/icons-material/History";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import PageWrapper from "@/components/layouts/page-wrapper";
import PageHeader from "@/components/layouts/page-header";
import { useJobAdQuery } from "@/hooks/use-job-ads-queries";
import { useAtsScoreQuery, useComputeAtsScoreMutation } from "@/hooks/use-ats-queries";
import {
  useGeneratedResumesByJobQuery,
  getPreviewUrl,
  getDownloadUrl,
} from "@/hooks/use-resumes-queries";

function RecommendationIcon({ type }: { type: string }) {
  if (type === "skill") return <BuildIcon color="primary" sx={{ mt: 0.25 }} />;
  if (type === "experience") return <WorkOutlineIcon color="info" sx={{ mt: 0.25 }} />;
  if (type === "education") return <SchoolIcon color="success" sx={{ mt: 0.25 }} />;
  return <PsychologyIcon color="secondary" sx={{ mt: 0.25 }} />;
}

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
  const resumesQuery = useGeneratedResumesByJobQuery(jobAdId);
  const resumes = resumesQuery.data ?? [];

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
      onSuccess: () => {
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
                    <RecommendationIcon type={rec.type} />
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                        <Typography variant="body2" fontWeight={600}>
                          {rec.message}
                        </Typography>
                        <Chip
                          label={rec.type}
                          size="small"
                          variant="outlined"
                          color={
                            rec.type === "skill"
                              ? "primary"
                              : rec.type === "experience"
                                ? "info"
                                : rec.type === "education"
                                  ? "success"
                                  : "secondary"
                          }
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

          <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
              <Typography variant="h6">AI Feedback</Typography>
              <Chip
                label="AI generated"
                size="small"
                variant="outlined"
                color="secondary"
                icon={<AutoAwesomeIcon />}
              />
            </Box>
            <Divider sx={{ mb: 2 }} />

            {!score.aiFeedback ? (
              <Alert severity="info">
                AI feedback is not available for this score. It is generated when a scoring service is configured.
              </Alert>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <Box>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5 }}>
                    Summary
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {score.aiFeedback.summary}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                    Strengths
                  </Typography>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    {score.aiFeedback.strengths.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        No strengths identified.
                      </Typography>
                    ) : (
                      score.aiFeedback.strengths.map((strength, idx) => (
                        <Box key={idx} sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                          <CheckCircleOutlineIcon color="success" fontSize="small" sx={{ mt: 0.2 }} />
                          <Typography variant="body2">{strength}</Typography>
                        </Box>
                      ))
                    )}
                  </Box>
                </Box>

                <Box>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                    Weaknesses
                  </Typography>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    {score.aiFeedback.weaknesses.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        No weaknesses identified.
                      </Typography>
                    ) : (
                      score.aiFeedback.weaknesses.map((weakness, idx) => (
                        <Box key={idx} sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                          <ErrorOutlineIcon color="error" fontSize="small" sx={{ mt: 0.2 }} />
                          <Typography variant="body2">{weakness}</Typography>
                        </Box>
                      ))
                    )}
                  </Box>
                </Box>

                <Box>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                    Improvement Areas
                  </Typography>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    {score.aiFeedback.improvementAreas.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        No improvement areas identified.
                      </Typography>
                    ) : (
                      score.aiFeedback.improvementAreas.map((item, idx) => (
                        <Paper key={idx} variant="outlined" sx={{ p: 1.5, borderRadius: 2, display: "flex", gap: 1.5 }}>
                          <TrendingUpIcon color="warning" fontSize="small" sx={{ mt: 0.2 }} />
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {item.area}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {item.detail}
                            </Typography>
                          </Box>
                        </Paper>
                      ))
                    )}
                  </Box>
                </Box>

                <Box>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                    Skill Recommendations
                  </Typography>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    {score.aiFeedback.skillRecommendations.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        No skill recommendations.
                      </Typography>
                    ) : (
                      score.aiFeedback.skillRecommendations.map((rec, idx) => (
                        <Box key={idx} sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                          <LightbulbIcon color="warning" fontSize="small" sx={{ mt: 0.2 }} />
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {rec.skill}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {rec.why}
                            </Typography>
                          </Box>
                        </Box>
                      ))
                    )}
                  </Box>
                </Box>

                <Box>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                    Project Suggestions
                  </Typography>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                    {score.aiFeedback.projectSuggestions.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        No project suggestions.
                      </Typography>
                    ) : (
                      score.aiFeedback.projectSuggestions.map((suggestion, idx) => (
                        <Paper key={idx} variant="outlined" sx={{ p: 2, borderRadius: 2, display: "flex", gap: 1.5 }}>
                          <CodeIcon color="primary" sx={{ mt: 0.25 }} />
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" fontWeight={600}>
                              {suggestion.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                              {suggestion.description}
                            </Typography>
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 1 }}>
                              {suggestion.skills.map((skill, skillIdx) => (
                                <Chip key={skillIdx} label={skill} size="small" variant="outlined" color="primary" />
                              ))}
                            </Box>
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                              {suggestion.why}
                            </Typography>
                          </Box>
                        </Paper>
                      ))
                    )}
                  </Box>
                </Box>
              </Box>
            )}
          </Paper>

          <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <HistoryIcon color="primary" />
                <Typography variant="h6">Generated Resumes</Typography>
              </Box>
              <Button size="small" variant="text" onClick={() => navigate("/resumes/history")}>
                View All
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />

            {resumesQuery.isLoading ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {[1, 2].map((i) => (
                  <Skeleton key={i} variant="rounded" height={60} />
                ))}
              </Box>
            ) : resumes.length === 0 ? (
              <Alert severity="info">
                No resumes generated for this job advertisement yet.
              </Alert>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {resumes.map((resume) => (
                  <Paper
                    key={resume.id}
                    variant="outlined"
                    sx={{ p: 2, borderRadius: 2, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1 }}
                  >
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={600} noWrap>
                        {resume.filename || "Untitled Resume"}
                      </Typography>
                      <Box sx={{ display: "flex", gap: 1, mt: 0.5, flexWrap: "wrap", alignItems: "center" }}>
                        {resume.resumeTemplate && (
                          <Chip label={resume.resumeTemplate.name} size="small" color="primary" variant="outlined" />
                        )}
                        <Chip
                          label={`ATS: ${resume.atsScore}`}
                          size="small"
                          color={resume.atsScore >= 70 ? "success" : resume.atsScore >= 40 ? "warning" : "error"}
                          variant="outlined"
                        />
                        <Typography variant="caption" color="text.secondary">
                          {new Date(resume.generatedAt).toLocaleString()}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexShrink: 0 }}>
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
                  </Paper>
                ))}
              </Box>
            )}
          </Paper>

          {score.atsScore >= (score.atsThreshold ?? 40) && (
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, textAlign: "center" }}>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                Ready to generate your resume?
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Your ATS score meets the threshold. You can now generate a tailored resume.
              </Typography>
              <Button variant="contained" onClick={() => navigate(`/resumes?jobAdId=${jobAdId}`)}>
                Generate Resume
              </Button>
            </Paper>
          )}
        </Box>
      )}
    </PageWrapper>
  );
}
