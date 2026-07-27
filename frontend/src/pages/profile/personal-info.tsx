import { TextField, Button, Box, Alert } from "@mui/material";
import { Formik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import PageWrapper from "@/components/layouts/page-wrapper";
import PageHeader from "@/components/layouts/page-header";
import FormCard from "@/components/forms/form-card";
import { useAuth } from "@/context/use-auth";
import { useUpdateProfileMutation } from "@/hooks/use-auth-queries";

export default function PersonalInfoPage() {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();

  const profileMutation = useUpdateProfileMutation();

  const handleSubmit = (values: { name: string; email: string }) => {
    profileMutation.mutate(values, {
      onSuccess: (data) => {
        updateProfile(data);
        toast.success("Profile updated successfully");
        navigate("/profile");
      },
      onError: () => {
        toast.error("Failed to update profile");
      },
    });
  };

  return (
    <PageWrapper>
      <PageHeader title="Edit Personal Info" onBack={() => navigate("/profile")} />

      <FormCard title="Personal Information" maxWidth={480}>
        {profileMutation.isError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {(profileMutation.error as any)?.response?.data?.message ||
              "Failed to update profile"}
          </Alert>
        )}

        <Formik
          enableReinitialize
          initialValues={{
            name: user?.name || "",
            email: user?.email || "",
          }}
          validationSchema={Yup.object({
            name: Yup.string().required("Name is required"),
            email: Yup.string().email("Invalid email").required("Email is required"),
          })}
          onSubmit={(values) => handleSubmit(values)}
        >
          {({
            handleSubmit,
            handleChange,
            values,
            errors,
            touched,
            dirty,
          }) => (
            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{ display: "flex", flexDirection: "column", gap: 2 }}
            >
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={values.name}
                onChange={handleChange}
                error={touched.name && !!errors.name}
                helperText={touched.name && typeof errors.name === "string" ? errors.name : undefined}
              />

              <TextField
                fullWidth
                label="Email"
                name="email"
                value={values.email}
                onChange={handleChange}
                error={touched.email && !!errors.email}
                helperText={touched.email && typeof errors.email === "string" ? errors.email : undefined}
              />

              <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={!dirty || profileMutation.isPending}
                >
                  {profileMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
                <Button variant="outlined" onClick={() => navigate("/profile")}>
                  Cancel
                </Button>
              </Box>
            </Box>
          )}
        </Formik>
      </FormCard>
    </PageWrapper>
  );
}
