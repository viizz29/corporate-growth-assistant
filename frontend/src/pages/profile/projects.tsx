import { useState } from "react";
import {
  Typography, Button, Box, Paper, IconButton, TextField, Skeleton, Chip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { Formik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import PageWrapper from "@/components/layouts/page-wrapper";
import PageHeader from "@/components/layouts/page-header";
import GenericModal from "@/components/modals/generic-modal";
import ConfirmModal from "@/components/modals/confirmation-modal";
import EmptyState from "@/components/data-display/empty-state";
import {
  useProjectsQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
} from "@/hooks/use-users-queries";
import type { Project, ProjectInput } from "@/api/users-api";

const validationSchema = Yup.object({
  projectName: Yup.string().required("Project name is required"),
  description: Yup.string(),
  startDate: Yup.string(),
  endDate: Yup.string(),
  techStack: Yup.string(),
});

const emptyValues: ProjectInput = {
  projectName: "",
  description: "",
  startDate: "",
  endDate: "",
  techStack: "",
};

export default function ProjectsPage() {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Project | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);

  const listQuery = useProjectsQuery();
  const createMutation = useCreateProjectMutation();
  const updateMutation = useUpdateProjectMutation();
  const deleteMutation = useDeleteProjectMutation();

  const handleOpenAdd = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (item: Project) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingItem(null);
  };

  const handleCreate = (values: ProjectInput) => {
    createMutation.mutate(values, {
      onSuccess: () => {
        toast.success("Project added");
        setModalOpen(false);
      },
      onError: () => toast.error("Failed to add project"),
    });
  };

  const handleUpdate = (values: ProjectInput) => {
    if (!editingItem) return;
    updateMutation.mutate(
      { id: editingItem.id, data: values },
      {
        onSuccess: () => {
          toast.success("Project updated");
          setModalOpen(false);
          setEditingItem(null);
        },
        onError: () => toast.error("Failed to update project"),
      },
    );
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success("Project deleted");
        setDeleteTarget(null);
      },
      onError: () => toast.error("Failed to delete project"),
    });
  };

  return (
    <PageWrapper>
      <PageHeader
        title="Projects"
        onBack={() => navigate("/profile")}
        actionLabel="Add Project"
        actionIcon={<AddIcon />}
        onAction={handleOpenAdd}
      />

      {listQuery.isLoading ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rounded" height={100} />
          ))}
        </Box>
      ) : listQuery.data?.length === 0 ? (
        <EmptyState message="No projects yet. Add your first project." />
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {listQuery.data?.map((proj) => (
            <Paper key={proj.id} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {proj.projectName}
                  </Typography>
                  {(proj.startDate || proj.endDate) && (
                    <Typography variant="caption" color="text.secondary">
                      {proj.startDate || "?"} - {proj.endDate || "Present"}
                    </Typography>
                  )}
                  {proj.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {proj.description}
                    </Typography>
                  )}
                  {proj.techStack && (
                    <Box sx={{ mt: 1 }}>
                      {proj.techStack.split(",").map((tech, idx) => (
                        <Chip
                          key={idx}
                          label={tech.trim()}
                          size="small"
                          variant="outlined"
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      ))}
                    </Box>
                  )}
                </Box>
                <Box>
                  <IconButton size="small" onClick={() => handleOpenEdit(proj)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => setDeleteTarget(proj)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            </Paper>
          ))}
        </Box>
      )}

      <GenericModal
        open={modalOpen}
        title={editingItem ? "Edit Project" : "Add Project"}
        onClose={handleCloseModal}
        onCancel={handleCloseModal}
        actions={[]}
      >
        <Formik
          enableReinitialize
          initialValues={{
            projectName: editingItem?.projectName || emptyValues.projectName,
            description: editingItem?.description || emptyValues.description,
            startDate: editingItem?.startDate || emptyValues.startDate,
            endDate: editingItem?.endDate || emptyValues.endDate,
            techStack: editingItem?.techStack || emptyValues.techStack,
          }}
          validationSchema={validationSchema}
          onSubmit={(values, { setSubmitting }) => {
            const onSettled = () => setSubmitting(false);
            if (editingItem) {
              updateMutation.mutate(
                { id: editingItem.id, data: values },
                { onSettled },
              );
            } else {
              createMutation.mutate(values, { onSettled });
            }
          }}
        >
          {({ handleSubmit, handleChange, values, errors, touched }) => (
            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}
            >
              <TextField
                fullWidth
                label="Project Name *"
                name="projectName"
                value={values.projectName}
                onChange={handleChange}
                error={touched.projectName && !!errors.projectName}
                helperText={touched.projectName && typeof errors.projectName === "string" ? errors.projectName : undefined}
                size="small"
              />
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={values.description}
                onChange={handleChange}
                multiline
                rows={3}
                size="small"
              />
              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField
                  fullWidth
                  label="Start Date"
                  name="startDate"
                  type="date"
                  value={values.startDate}
                  onChange={handleChange}
                  size="small"
                  slotProps={{ inputLabel: { shrink: true } }}
                />
                <TextField
                  fullWidth
                  label="End Date"
                  name="endDate"
                  type="date"
                  value={values.endDate}
                  onChange={handleChange}
                  size="small"
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Box>
              <TextField
                fullWidth
                label="Tech Stack"
                name="techStack"
                value={values.techStack}
                onChange={handleChange}
                placeholder="Comma-separated: React, Node.js, PostgreSQL"
                size="small"
              />
              <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                <Button onClick={handleCloseModal}>Cancel</Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? "Saving..."
                    : editingItem
                      ? "Update"
                      : "Add"}
                </Button>
              </Box>
            </Box>
          )}
        </Formik>
      </GenericModal>

      <ConfirmModal
        open={!!deleteTarget}
        message={`Delete "${deleteTarget?.projectName}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </PageWrapper>
  );
}
