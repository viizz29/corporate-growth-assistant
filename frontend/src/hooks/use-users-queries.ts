import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listEducationsApi,
  createEducationApi,
  updateEducationApi,
  deleteEducationApi,
  listWorkExperiencesApi,
  createWorkExperienceApi,
  updateWorkExperienceApi,
  deleteWorkExperienceApi,
  listSkillsApi,
  createSkillApi,
  updateSkillApi,
  deleteSkillApi,
  listProjectsApi,
  createProjectApi,
  updateProjectApi,
  deleteProjectApi,
  type EducationInput,
  type WorkExperienceInput,
  type SkillInput,
  type ProjectInput,
} from "@/api/users-api";
import { queryKeys } from "./query-keys";

// ─── Education ──────────────────────────────────────────

export function useEducationsQuery() {
  return useQuery({
    queryKey: queryKeys.users.educations(),
    queryFn: listEducationsApi,
  });
}

export function useCreateEducationMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createEducationApi,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.users.educations() }),
  });
}

export function useUpdateEducationMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<EducationInput> }) =>
      updateEducationApi(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.users.educations() }),
  });
}

export function useDeleteEducationMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteEducationApi,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.users.educations() }),
  });
}

// ─── Work Experience ────────────────────────────────────

export function useWorkExperiencesQuery() {
  return useQuery({
    queryKey: queryKeys.users.workExperiences(),
    queryFn: listWorkExperiencesApi,
  });
}

export function useCreateWorkExperienceMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createWorkExperienceApi,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.users.workExperiences() }),
  });
}

export function useUpdateWorkExperienceMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<WorkExperienceInput> }) =>
      updateWorkExperienceApi(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.users.workExperiences() }),
  });
}

export function useDeleteWorkExperienceMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteWorkExperienceApi,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.users.workExperiences() }),
  });
}

// ─── Skills ─────────────────────────────────────────────

export function useSkillsQuery() {
  return useQuery({
    queryKey: queryKeys.users.skills(),
    queryFn: listSkillsApi,
  });
}

export function useCreateSkillMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createSkillApi,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.users.skills() }),
  });
}

export function useUpdateSkillMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SkillInput> }) =>
      updateSkillApi(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.users.skills() }),
  });
}

export function useDeleteSkillMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteSkillApi,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.users.skills() }),
  });
}

// ─── Projects ───────────────────────────────────────────

export function useProjectsQuery() {
  return useQuery({
    queryKey: queryKeys.users.projects(),
    queryFn: listProjectsApi,
  });
}

export function useCreateProjectMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createProjectApi,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.users.projects() }),
  });
}

export function useUpdateProjectMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProjectInput> }) =>
      updateProjectApi(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.users.projects() }),
  });
}

export function useDeleteProjectMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteProjectApi,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.users.projects() }),
  });
}
