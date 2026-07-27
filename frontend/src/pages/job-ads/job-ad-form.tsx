import { useEffect, useState } from "react";
import {
  TextField, Button, Box, MenuItem, Alert, Skeleton, Typography,
} from "@mui/material";
import { Formik } from "formik";
import * as Yup from "yup";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import PageWrapper from "@/components/layouts/page-wrapper";
import PageHeader from "@/components/layouts/page-header";
import FormCard from "@/components/forms/form-card";
import ConfirmModal from "@/components/modals/confirmation-modal";
import {
  useJobAdQuery,
  useCreateJobAdMutation,
  useUpdateJobAdMutation,
  useDeleteJobAdMutation,
} from "@/hooks/use-job-ads-queries";

const validationSchema = Yup.object({
  title: Yup.string().required("Title is required"),
  description: Yup.string().required("Description is required"),
  requirements: Yup.string().required("Requirements are required"),
  location: Yup.string(),
  language: Yup.string().oneOf(["en", "hi"]).required("Language is required"),
});

export default function JobAdFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const [deleteTarget, setDeleteTarget] = useState(false);

  const existingQuery = useJobAdQuery(id, isEditing);

  const createMutation = useCreateJobAdMutation();
  const updateMutation = useUpdateJobAdMutation(id!);
  const deleteMutation = useDeleteJobAdMutation();

  useEffect(() => {
    if (isEditing && existingQuery.isError) {
      toast.error("Failed to load job advertisement");
      navigate("/job-ads");
    }
  }, [isEditing, existingQuery.isError, navigate]);

  const handleCreate = (values: Parameters<typeof createMutation.mutate>[0]) => {
    createMutation.mutate(values, {
      onSuccess: (data) => {
        toast.success("Job advertisement created");
        navigate(`/job-ads/${data.id}`);
      },
      onError: () => toast.error("Failed to create job advertisement"),
    });
  };

  const handleUpdate = (values: Parameters<typeof updateMutation.mutate>[0]) => {
    updateMutation.mutate(values, {
      onSuccess: () => {
        toast.success("Job advertisement updated");
      },
      onError: () => toast.error("Failed to update job advertisement"),
    });
  };

  const handleDelete = () => {
    deleteMutation.mutate(undefined as any, {
      onSuccess: () => {
        toast.success("Job advertisement deleted");
        navigate("/job-ads");
      },
      onError: () => toast.error("Failed to delete job advertisement"),
    });
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const jobData = existingQuery.data;

  if (isEditing && existingQuery.isLoading) {
    return (
      <PageWrapper>
        <Skeleton variant="rounded" height={48} sx={{ mb: 3 }} />
        <Skeleton variant="rounded" height={400} />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <PageHeader
        title={isEditing ? "Edit Job Advertisement" : "New Job Advertisement"}
        onBack={() => navigate("/job-ads")}
        {...(isEditing
          ? {
              actionLabel: "Delete",
              onAction: () => setDeleteTarget(true),
            }
          : {})}
      />

      {(createMutation.isError || updateMutation.isError) && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {(createMutation.error as any)?.response?.data?.message ||
            (updateMutation.error as any)?.response?.data?.message ||
            "Something went wrong. Please try again."}
        </Alert>
      )}

      <FormCard title={isEditing ? "Update Details" : "Job Details"} maxWidth={600}>
        <Formik
          enableReinitialize
          initialValues={{
            title: jobData?.title || "",
            description: jobData?.description || "",
            requirements: jobData?.requirements || "",
            location: jobData?.location || "",
            language: jobData?.language || ("en" as const),
          }}
          validationSchema={validationSchema}
          onSubmit={(values) => {
            if (isEditing) {
              handleUpdate(values);
            } else {
              handleCreate(values);
            }
          }}
        >
          {({ handleSubmit, handleChange, values, errors, touched }) => (
            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{ display: "flex", flexDirection: "column", gap: 2 }}
            >
              <TextField
                fullWidth
                label="Job Title *"
                name="title"
                value={values.title}
                onChange={handleChange}
                error={touched.title && !!errors.title}
                helperText={touched.title && typeof errors.title === "string" ? errors.title : undefined}
              />

              <TextField
                fullWidth
                label="Description *"
                name="description"
                value={values.description}
                onChange={handleChange}
                multiline
                rows={4}
                error={touched.description && !!errors.description}
                helperText={touched.description && typeof errors.description === "string" ? errors.description : undefined}
              />

              <TextField
                fullWidth
                label="Requirements *"
                name="requirements"
                value={values.requirements}
                onChange={handleChange}
                multiline
                rows={4}
                error={touched.requirements && !!errors.requirements}
                helperText={touched.requirements && typeof errors.requirements === "string" ? errors.requirements : undefined}
              />

              <TextField
                fullWidth
                label="Location"
                name="location"
                value={values.location}
                onChange={handleChange}
                placeholder="e.g. Mumbai, India (optional)"
              />

              <TextField
                fullWidth
                select
                label="Language *"
                name="language"
                value={values.language}
                onChange={handleChange}
                error={touched.language && !!errors.language}
                helperText={touched.language && typeof errors.language === "string" ? errors.language : undefined}
              >
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="hi">Hindi</MenuItem>
              </TextField>

              {isEditing && jobData && (
                <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Created: {new Date(jobData.createdAt).toLocaleDateString()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Updated: {new Date(jobData.updatedAt).toLocaleDateString()}
                  </Typography>
                </Box>
              )}

              <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? "Saving..."
                    : isEditing
                      ? "Save Changes"
                      : "Create Job Ad"}
                </Button>
                <Button variant="outlined" onClick={() => navigate("/job-ads")}>
                  Cancel
                </Button>
              </Box>
            </Box>
          )}
        </Formik>
      </FormCard>

      <ConfirmModal
        open={deleteTarget}
        message={`Delete "${jobData?.title || "this job ad"}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(false)}
      />
    </PageWrapper>
  );
}
