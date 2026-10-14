import { useState } from "react";
import {
  Button,
  Box,
  Paper,
  IconButton,
  TextField,
  Skeleton,
  Chip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { Formik, type FormikHelpers } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

import PageWrapper from "@/components/layouts/page-wrapper";
import PageHeader from "@/components/layouts/page-header";
import GenericModal from "@/components/modals/generic-modal";
import ConfirmModal from "@/components/modals/confirmation-modal";
import EmptyState from "@/components/data-display/empty-state";
import {
  useLanguagesQuery,
  useCreateLanguageMutation,
  useUpdateLanguageMutation,
  useDeleteLanguageMutation,
} from "@/hooks/use-users-queries";
import type { Language, LanguageInput } from "@/api/users-api";

const validationSchema = Yup.object({
  languageName: Yup.string().required("Language name is required"),
  proficiencyLevel: Yup.string(),
});

export default function LanguagesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: languages, isLoading } = useLanguagesQuery();
  const createMut = useCreateLanguageMutation();
  const updateMut = useUpdateLanguageMutation();
  const deleteMut = useDeleteLanguageMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Language | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Language | null>(null);

  const handleSubmit = async (
    values: LanguageInput,
    { setSubmitting }: FormikHelpers<LanguageInput>,
  ) => {
    try {
      if (editing) {
        await updateMut.mutateAsync({ id: editing.id, data: values });
        toast.success(t("Language updated") || "Language updated");
      } else {
        await createMut.mutateAsync(values);
        toast.success(t("Language added") || "Language added");
      }
      setModalOpen(false);
      setEditing(null);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      const message =
        err?.response?.data?.message ||
        t("Failed to save language") ||
        "Failed to save language";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteMut.mutateAsync(toDelete.id);
      toast.success(t("Language deleted") || "Language deleted");
      setConfirmOpen(false);
      setToDelete(null);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      const message =
        err?.response?.data?.message ||
        t("Failed to delete language") ||
        "Failed to delete language";
      toast.error(message);
    }
  };

  const initialValues: LanguageInput = {
    languageName: editing?.languageName || "",
    proficiencyLevel: editing?.proficiencyLevel || "",
  };

  return (
    <PageWrapper>
      <PageHeader
        title={t("Languages")}
        onBack={() => navigate(-1)}
        actionLabel={t("Add Language")}
        actionIcon={<AddIcon />}
        onAction={() => {
          setEditing(null);
          setModalOpen(true);
        }}
      />
      {isLoading ? (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} variant="rounded" width={120} height={32} />
          ))}
        </Box>
      ) : !languages?.length ? (
        <EmptyState

          message={t(
            "Add your first language to showcase your communication skills.",
          )}
        // actionLabel={t("Add Language")}
        // onAction={() => {
        //   setEditing(null);
        //   setModalOpen(true);
        // }}
        />
      ) : (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {languages.map((lang) => (
            <Paper
              key={lang.id}
              sx={{
                p: 1.5,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Chip
                label={`${lang.languageName}${lang.proficiencyLevel ? ` • ${lang.proficiencyLevel}` : ""}`}
                variant="outlined"
              />
              <IconButton
                size="small"
                onClick={() => {
                  setEditing(lang);
                  setModalOpen(true);
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                color="error"
                onClick={() => {
                  setToDelete(lang);
                  setConfirmOpen(true);
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Paper>
          ))}
        </Box>
      )}

      <GenericModal
        open={modalOpen}
        title={editing ? t("Edit Language") : t("Add Language")}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}

      >
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            handleSubmit,
            isSubmitting,
          }) => (
            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{
                mt: 1,
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              <TextField
                name="languageName"
                label={t("Language name")}
                placeholder={t("e.g. English")}
                value={values.languageName}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.languageName && Boolean(errors.languageName)}
                helperText={
                  touched.languageName &&
                  (t(errors.languageName as string) || errors.languageName)
                }
                fullWidth
                required
              />
              <TextField
                name="proficiencyLevel"
                label={t("Proficiency level")}
                placeholder={t("e.g. Native, Fluent, Intermediate, Basic")}
                value={values.proficiencyLevel || ""}
                onChange={handleChange}
                onBlur={handleBlur}
                error={
                  touched.proficiencyLevel && Boolean(errors.proficiencyLevel)
                }
                helperText={
                  touched.proficiencyLevel && errors.proficiencyLevel
                }
                fullWidth
              />
              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  justifyContent: "flex-end",
                }}
              >
                <Button
                  onClick={() => {
                    setModalOpen(false);
                    setEditing(null);
                  }}
                >
                  {t("Cancel")}
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting}
                >
                  {editing ? t("Save") : t("Add")}
                </Button>
              </Box>
            </Box>
          )}
        </Formik>
      </GenericModal>

      <ConfirmModal
        open={confirmOpen}
        // title="Delete language"
        message={`Are you sure you want to delete "${toDelete?.languageName}"?`}
        onConfirm={handleDelete}
        onCancel={() => {
          setConfirmOpen(false);
          setToDelete(null);
        }}
      // confirmColor="error"
      // loading={deleteMut.isPending}
      />
    </PageWrapper>
  );
}