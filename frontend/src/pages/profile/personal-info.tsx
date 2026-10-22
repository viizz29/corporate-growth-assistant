import { TextField, Button, Box, Alert } from "@mui/material";
import { Formik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import PageWrapper from "@/components/layouts/page-wrapper";
import PageHeader from "@/components/layouts/page-header";
import FormCard from "@/components/forms/form-card";
import { useContactDetailsQuery, useUpdateContactDetailsMutation } from "@/hooks/use-contact-details-queries";

type ProfileFormValues = {
  email: string;
  phone: string;
  githubUrl: string;
  linkedinUrl: string;
};

const emptyValues: ProfileFormValues = {
  email: "",
  phone: "",
  githubUrl: "",
  linkedinUrl: "",
};

const profileSchema = Yup.object({

  email: Yup.string()
    .trim()
    .email("Enter a valid email address")
    .optional(),

  phone: Yup.string()
    .trim()
    .matches(
      /^\+[1-9]\d{1,14}$/,
      "Enter a valid international phone number, e.g. +919876543210",
    )
    .optional(),

  githubUrl: Yup.string()
    .trim()
    .url("Enter a valid GitHub URL")
    .matches(
      /^https:\/\/(www\.)?github\.com\/[A-Za-z0-9-]+\/?$/,
      "Enter a valid GitHub profile URL",
    )
    .optional(),

  linkedinUrl: Yup.string()
    .trim()
    .url("Enter a valid LinkedIn URL")
    .matches(
      /^https:\/\/(www\.)?linkedin\.com\/in\/[A-Za-z0-9_-]+\/?$/,
      "Enter a valid LinkedIn profile URL",
    )
    .optional(),
});

export default function PersonalInfoPage() {
  const navigate = useNavigate();

  const existingQuery = useContactDetailsQuery(true);

  const contactDetailsMutation = useUpdateContactDetailsMutation();

  const contactDetails = existingQuery.data;

  const initialValues: ProfileFormValues = {
    email: contactDetails?.email ?? "",
    phone: contactDetails?.phone ?? "",
    githubUrl: contactDetails?.githubUrl ?? "",
    linkedinUrl: contactDetails?.linkedinUrl ?? "",
  };

  const handleSubmit = (
    values: ProfileFormValues,
    initialValues: ProfileFormValues,
  ) => {
    const changedFields = Object.fromEntries(
      Object.keys(values)
        .filter(
          (key) =>
            values[key as keyof ProfileFormValues].trim() !==
            initialValues[key as keyof ProfileFormValues].trim(),
        )
        .map((key) => [
          key,
          values[key as keyof ProfileFormValues].trim(),
        ]),
    ) as Partial<ProfileFormValues>;

    if (Object.keys(changedFields).length === 0) {
      return;
    }

    contactDetailsMutation.mutate(changedFields, {
      onSuccess: (data) => {
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
      <PageHeader
        title="Edit Personal Info"
        onBack={() => navigate("/profile")}
      />

      <FormCard title="Personal Information" maxWidth={480}>
        {contactDetailsMutation.isError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {(contactDetailsMutation.error as any)?.response?.data?.message ||
              "Failed to update profile"}
          </Alert>
        )}

        <Formik<ProfileFormValues>
          enableReinitialize
          initialValues={initialValues}
          validationSchema={profileSchema}
          onSubmit={(values) =>
            handleSubmit(values, initialValues)
          }
        >
          {({
            handleSubmit,
            handleChange,
            values,
            errors,
            touched,
            dirty,
            isValid,
            isSubmitting,
          }) => {
            const field = (
              name: keyof ProfileFormValues,
              label: string,
              placeholder?: string,
            ) => (
              <TextField
                fullWidth
                label={label}
                name={name}
                value={values[name]}
                onChange={handleChange}
                placeholder={placeholder}
                error={Boolean(touched[name] && errors[name])}
                helperText={
                  touched[name] && typeof errors[name] === "string"
                    ? errors[name]
                    : " "
                }
              />
            );

            return (
              <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                }}
              >
                {field("email", "Email", "you@example.com")}
                {field("phone", "Phone", "+919876543210")}
                {field("githubUrl", "GitHub URL", "https://github.com/username")}
                {field(
                  "linkedinUrl",
                  "LinkedIn URL",
                  "https://www.linkedin.com/in/username",
                )}

                <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={
                      !dirty ||
                      !isValid ||
                      isSubmitting ||
                      contactDetailsMutation.isPending
                    }
                  >
                    {contactDetailsMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>

                  <Button
                    variant="outlined"
                    onClick={() => navigate("/profile")}
                  >
                    Cancel
                  </Button>
                </Box>
              </Box>
            );
          }}
        </Formik>
      </FormCard>
    </PageWrapper>
  );
}