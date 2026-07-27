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
  useWorkExperiencesQuery,
  useCreateWorkExperienceMutation,
  useUpdateWorkExperienceMutation,
  useDeleteWorkExperienceMutation,
} from "@/hooks/use-users-queries";
import type { WorkExperience, WorkExperienceInput } from "@/api/users-api";

const validationSchema = Yup.object({
  company: Yup.string().required("Company is required"),
  role: Yup.string().required("Role is required"),
  startDate: Yup.string(),
  endDate: Yup.string(),
  description: Yup.string(),
});

const emptyValues: WorkExperienceInput = {
  company: "",
  role: "",
  startDate: "",
  endDate: "",
  description: "",
};

export default function WorkExperiencePage() {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WorkExperience | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<WorkExperience | null>(null);

  const listQuery = useWorkExperiencesQuery();
  const createMutation = useCreateWorkExperienceMutation();
  const updateMutation = useUpdateWorkExperienceMutation();
  const deleteMutation = useDeleteWorkExperienceMutation();

  const handleOpenAdd = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (item: WorkExperience) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingItem(null);
  };

  const handleCreate = (values: WorkExperienceInput) => {
    createMutation.mutate(values, {
      onSuccess: () => {
        toast.success("Work experience added");
        setModalOpen(false);
      },
      onError: () => toast.error("Failed to add work experience"),
    });
  };

  const handleUpdate = (values: WorkExperienceInput) => {
    if (!editingItem) return;
    updateMutation.mutate(
      { id: editingItem.id, data: values },
      {
        onSuccess: () => {
          toast.success("Work experience updated");
          setModalOpen(false);
          setEditingItem(null);
        },
        onError: () => toast.error("Failed to update work experience"),
      },
    );
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success("Work experience deleted");
        setDeleteTarget(null);
      },
      onError: () => toast.error("Failed to delete work experience"),
    });
  };

  return (
    <PageWrapper>
      <PageHeader
        title="Work Experience"
        onBack={() => navigate("/profile")}
        actionLabel="Add Experience"
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
        <EmptyState message="No work experience entries yet. Add your first entry." />
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {listQuery.data?.map((work) => (
            <Paper key={work.id} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {work.role}
                  </Typography>
                  <Chip label={work.company} size="small" />
                  {(work.startDate || work.endDate) && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                      {work.startDate || "?"} - {work.endDate || "Present"}
                    </Typography>
                  )}
                  {work.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {work.description}
                    </Typography>
                  )}
                </Box>
                <Box>
                  <IconButton size="small" onClick={() => handleOpenEdit(work)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => setDeleteTarget(work)}>
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
        title={editingItem ? "Edit Work Experience" : "Add Work Experience"}
        onClose={handleCloseModal}
        onCancel={handleCloseModal}
        actions={[]}
      >
        <Formik
          enableReinitialize
          initialValues={{
            company: editingItem?.company || emptyValues.company,
            role: editingItem?.role || emptyValues.role,
            startDate: editingItem?.startDate || emptyValues.startDate,
            endDate: editingItem?.endDate || emptyValues.endDate,
            description: editingItem?.description || emptyValues.description,
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
                label="Company *"
                name="company"
                value={values.company}
                onChange={handleChange}
                error={touched.company && !!errors.company}
                helperText={touched.company && typeof errors.company === "string" ? errors.company : undefined}
                size="small"
              />
              <TextField
                fullWidth
                label="Role *"
                name="role"
                value={values.role}
                onChange={handleChange}
                error={touched.role && !!errors.role}
                helperText={touched.role && typeof errors.role === "string" ? errors.role : undefined}
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
                label="Description"
                name="description"
                value={values.description}
                onChange={handleChange}
                multiline
                rows={3}
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
        message={`Delete "${deleteTarget?.role} at ${deleteTarget?.company}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </PageWrapper>
  );
}
