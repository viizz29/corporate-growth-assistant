import { useState } from "react";
import {
  Typography, Box, Paper, IconButton, Skeleton, Chip, TextField, MenuItem,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import PageWrapper from "@/components/layouts/page-wrapper";
import PageHeader from "@/components/layouts/page-header";
import ConfirmModal from "@/components/modals/confirmation-modal";
import EmptyState from "@/components/data-display/empty-state";
import { useJobAdsQuery, useDeleteJobAdMutation } from "@/hooks/use-job-ads-queries";
import type { JobAd } from "@/api/job-ads-api";

export default function JobAdsListPage() {
  const navigate = useNavigate();
  const [deleteTarget, setDeleteTarget] = useState<JobAd | null>(null);
  const [search, setSearch] = useState("");
  const [langFilter, setLangFilter] = useState<string>("all");

  const listQuery = useJobAdsQuery();
  const deleteMutation = useDeleteJobAdMutation();

  const filtered = listQuery.data?.filter((job) => {
    const matchesSearch =
      !search ||
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.location?.toLowerCase().includes(search.toLowerCase());
    const matchesLang = langFilter === "all" || job.language === langFilter;
    return matchesSearch && matchesLang;
  });

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success("Job advertisement deleted");
        setDeleteTarget(null);
      },
      onError: () => toast.error("Failed to delete job advertisement"),
    });
  };

  return (
    <PageWrapper>
      <PageHeader
        title="Job Advertisements"
        actionLabel="Add Job Ad"
        actionIcon={<AddIcon />}
        onAction={() => navigate("/job-ads/new")}
      />

      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <TextField
          size="small"
          placeholder="Search by title or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ flex: 1 }}
          slotProps={{
            input: {
              startAdornment: <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />,
            },
          }}
        />
        <TextField
          size="small"
          select
          value={langFilter}
          onChange={(e) => setLangFilter(e.target.value)}
          sx={{ minWidth: 120 }}
        >
          <MenuItem value="all">All Languages</MenuItem>
          <MenuItem value="en">English</MenuItem>
          <MenuItem value="hi">Hindi</MenuItem>
        </TextField>
      </Box>

      {listQuery.isLoading ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rounded" height={100} />
          ))}
        </Box>
      ) : filtered?.length === 0 ? (
        <EmptyState
          message={
            listQuery.data?.length === 0
              ? "No job advertisements yet. Add your first job ad."
              : "No job ads match your search."
          }
        />
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {filtered?.map((job) => (
            <Paper key={job.id} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <Box
                  sx={{ flex: 1, cursor: "pointer" }}
                  onClick={() => navigate(`/job-ads/${job.id}`)}
                >
                  <Typography variant="subtitle1" fontWeight={600}>
                    {job.title}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1, mt: 0.5, flexWrap: "wrap" }}>
                    {job.location && <Chip label={job.location} size="small" variant="outlined" />}
                    <Chip
                      label={job.language === "hi" ? "Hindi" : "English"}
                      size="small"
                      color={job.language === "hi" ? "secondary" : "primary"}
                      variant="outlined"
                    />
                  </Box>
                  {job.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {job.description.length > 120
                        ? `${job.description.slice(0, 120)}...`
                        : job.description}
                    </Typography>
                  )}
                </Box>
                <Box>
                  <IconButton size="small" onClick={() => navigate(`/job-ads/${job.id}`)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => setDeleteTarget(job)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            </Paper>
          ))}
        </Box>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        message={`Delete "${deleteTarget?.title}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </PageWrapper>
  );
}
