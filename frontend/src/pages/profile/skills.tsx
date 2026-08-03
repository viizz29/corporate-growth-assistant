import { useState } from "react";
import {
  Button, Box, Paper, IconButton, TextField, Skeleton, Chip, Typography,
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
  useSkillsQuery,
  useCreateSkillMutation,
  useUpdateSkillMutation,
  useDeleteSkillMutation,
} from "@/hooks/use-users-queries";
import type { Skill } from "@/api/users-api";

const validationSchema = Yup.object({
  skillName: Yup.string().required("Skill name is required"),
  proficiencyLevel: Yup.string(),
});

export default function SkillsPage() {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Skill | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Skill | null>(null);

  const listQuery = useSkillsQuery();
  const createMutation = useCreateSkillMutation();
  const updateMutation = useUpdateSkillMutation();
  const deleteMutation = useDeleteSkillMutation();

  const handleOpenAdd = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (item: Skill) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingItem(null);
  };

  // const handleCreate = (values: SkillInput) => {
  //   createMutation.mutate(values, {
  //     onSuccess: () => {
  //       toast.success("Skill added");
  //       setModalOpen(false);
  //     },
  //     onError: () => toast.error("Failed to add skill"),
  //   });
  // };

  // const handleUpdate = (values: SkillInput) => {
  //   if (!editingItem) return;
  //   updateMutation.mutate(
  //     { id: editingItem.id, data: values },
  //     {
  //       onSuccess: () => {
  //         toast.success("Skill updated");
  //         setModalOpen(false);
  //         setEditingItem(null);
  //       },
  //       onError: () => toast.error("Failed to update skill"),
  //     },
  //   );
  // };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success("Skill deleted");
        setDeleteTarget(null);
      },
      onError: () => toast.error("Failed to delete skill"),
    });
  };

  return (
    <PageWrapper>
      <PageHeader
        title="Skills"
        onBack={() => navigate("/profile")}
        actionLabel="Add Skill"
        actionIcon={<AddIcon />}
        onAction={handleOpenAdd}
      />

      {listQuery.isLoading ? (
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} variant="rounded" width={100} height={36} />
          ))}
        </Box>
      ) : listQuery.data?.length === 0 ? (
        <EmptyState message="No skills yet. Add your first skill." />
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
            {listQuery.data?.map((skill) => (
              <Paper
                key={skill.id}
                variant="outlined"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 2,
                }}
              >
                <Typography variant="body2" fontWeight={500}>
                  {skill.skillName}
                </Typography>
                {skill.proficiencyLevel && (
                  <Chip label={skill.proficiencyLevel} size="small" variant="outlined" />
                )}
                <IconButton size="small" onClick={() => handleOpenEdit(skill)}>
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" color="error" onClick={() => setDeleteTarget(skill)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Paper>
            ))}
          </Box>
        </Box>
      )}

      <GenericModal
        open={modalOpen}
        title={editingItem ? "Edit Skill" : "Add Skill"}
        onClose={handleCloseModal}
        onCancel={handleCloseModal}
        actions={[]}
      >
        <Formik
          enableReinitialize
          initialValues={{
            skillName: editingItem?.skillName || "",
            proficiencyLevel: editingItem?.proficiencyLevel || "",
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
                label="Skill Name *"
                name="skillName"
                value={values.skillName}
                onChange={handleChange}
                error={touched.skillName && !!errors.skillName}
                helperText={touched.skillName && typeof errors.skillName === "string" ? errors.skillName : undefined}
                size="small"
              />
              <TextField
                fullWidth
                label="Proficiency Level"
                name="proficiencyLevel"
                value={values.proficiencyLevel}
                onChange={handleChange}
                placeholder="e.g. Beginner, Intermediate, Expert"
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
        message={`Delete "${deleteTarget?.skillName}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </PageWrapper>
  );
}
