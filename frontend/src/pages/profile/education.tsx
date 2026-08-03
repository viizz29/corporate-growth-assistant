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
  useEducationsQuery,
  useCreateEducationMutation,
  useUpdateEducationMutation,
  useDeleteEducationMutation,
} from "@/hooks/use-users-queries";
import type { Education, EducationInput } from "@/api/users-api";

const validationSchema = Yup.object({
  institution: Yup.string().required("Institution is required"),
  degree: Yup.string(),
  fieldOfStudy: Yup.string(),
  startDate: Yup.string(),
  endDate: Yup.string(),
  description: Yup.string(),
});

const emptyValues: EducationInput = {
  institution: "",
  degree: "",
  fieldOfStudy: "",
  startDate: "",
  endDate: "",
  description: "",
};

export default function EducationPage() {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Education | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Education | null>(null);

  const listQuery = useEducationsQuery();
  const createMutation = useCreateEducationMutation();
  const updateMutation = useUpdateEducationMutation();
  const deleteMutation = useDeleteEducationMutation();

  const handleOpenAdd = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (item: Education) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingItem(null);
  };

  // const handleCreate = (values: EducationInput) => {
  //   createMutation.mutate(values, {
  //     onSuccess: () => {
  //       toast.success("Education entry added");
  //       setModalOpen(false);
  //     },
  //     onError: () => toast.error("Failed to add education"),
  //   });
  // };

  // const handleUpdate = (values: EducationInput) => {
  //   if (!editingItem) return;
  //   updateMutation.mutate(
  //     { id: editingItem.id, data: values },
  //     {
  //       onSuccess: () => {
  //         toast.success("Education entry updated");
  //         setModalOpen(false);
  //         setEditingItem(null);
  //       },
  //       onError: () => toast.error("Failed to update education"),
  //     },
  //   );
  // };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success("Education entry deleted");
        setDeleteTarget(null);
      },
      onError: () => toast.error("Failed to delete education"),
    });
  };

  return (
    <PageWrapper>
      <PageHeader
        title="Education"
        onBack={() => navigate("/profile")}
        actionLabel="Add Education"
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
        <EmptyState message="No education entries yet. Add your first education." />
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {listQuery.data?.map((edu) => (
            <Paper key={edu.id} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {edu.institution}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1, mt: 0.5, flexWrap: "wrap" }}>
                    {edu.degree && <Chip label={edu.degree} size="small" />}
                    {edu.fieldOfStudy && (
                      <Chip label={edu.fieldOfStudy} size="small" variant="outlined" />
                    )}
                  </Box>
                  {(edu.startDate || edu.endDate) && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                      {edu.startDate || "?"} - {edu.endDate || "Present"}
                    </Typography>
                  )}
                  {edu.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {edu.description}
                    </Typography>
                  )}
                </Box>
                <Box>
                  <IconButton size="small" onClick={() => handleOpenEdit(edu)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => setDeleteTarget(edu)}>
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
        title={editingItem ? "Edit Education" : "Add Education"}
        onClose={handleCloseModal}
        onCancel={handleCloseModal}
        actions={[]}
      >
        <Formik
          enableReinitialize
          initialValues={{
            institution: editingItem?.institution || emptyValues.institution,
            degree: editingItem?.degree || emptyValues.degree,
            fieldOfStudy: editingItem?.fieldOfStudy || emptyValues.fieldOfStudy,
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
                label="Institution *"
                name="institution"
                value={values.institution}
                onChange={handleChange}
                error={touched.institution && !!errors.institution}
                helperText={touched.institution && typeof errors.institution === "string" ? errors.institution : undefined}
                size="small"
              />
              <TextField
                fullWidth
                label="Degree"
                name="degree"
                value={values.degree}
                onChange={handleChange}
                size="small"
              />
              <TextField
                fullWidth
                label="Field of Study"
                name="fieldOfStudy"
                value={values.fieldOfStudy}
                onChange={handleChange}
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
        message={`Delete "${deleteTarget?.institution}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </PageWrapper>
  );
}
