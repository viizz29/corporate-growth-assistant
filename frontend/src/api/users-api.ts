import api from "./client";

// ─── Types ──────────────────────────────────────────────

export type Education = {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  description: string;
  createdAt: string;
  updatedAt: string;
};

export type EducationInput = {
  institution: string;
  degree?: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
};

export type WorkExperience = {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
  createdAt: string;
  updatedAt: string;
};

export type WorkExperienceInput = {
  company: string;
  role: string;
  startDate?: string;
  endDate?: string;
  description?: string;
};

export type Skill = {
  id: string;
  skillName: string;
  proficiencyLevel: string;
  createdAt: string;
  updatedAt: string;
};

export type SkillInput = {
  skillName: string;
  proficiencyLevel?: string;
};

export type Project = {
  id: string;
  projectName: string;
  description: string;
  startDate: string;
  endDate: string;
  techStack: string;
  createdAt: string;
  updatedAt: string;
};

export type ProjectInput = {
  projectName: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  techStack?: string;
};

// ─── Education ──────────────────────────────────────────

export const listEducationsApi = async (): Promise<Education[]> => {
  const response = await api.get("/api/v1/users/educations");
  return response.data;
};

export const createEducationApi = async (data: EducationInput): Promise<Education> => {
  const response = await api.post("/api/v1/users/educations", data);
  return response.data;
};

export const updateEducationApi = async (
  id: string,
  data: Partial<EducationInput>,
): Promise<Education> => {
  const response = await api.patch(`/api/v1/users/educations/${id}`, data);
  return response.data;
};

export const deleteEducationApi = async (id: string): Promise<void> => {
  await api.delete(`/api/v1/users/educations/${id}`);
};

// ─── Work Experience ────────────────────────────────────

export const listWorkExperiencesApi = async (): Promise<WorkExperience[]> => {
  const response = await api.get("/api/v1/users/work-experiences");
  return response.data;
};

export const createWorkExperienceApi = async (
  data: WorkExperienceInput,
): Promise<WorkExperience> => {
  const response = await api.post("/api/v1/users/work-experiences", data);
  return response.data;
};

export const updateWorkExperienceApi = async (
  id: string,
  data: Partial<WorkExperienceInput>,
): Promise<WorkExperience> => {
  const response = await api.patch(`/api/v1/users/work-experiences/${id}`, data);
  return response.data;
};

export const deleteWorkExperienceApi = async (id: string): Promise<void> => {
  await api.delete(`/api/v1/users/work-experiences/${id}`);
};

// ─── Skills ─────────────────────────────────────────────

export const listSkillsApi = async (): Promise<Skill[]> => {
  const response = await api.get("/api/v1/users/skills");
  return response.data;
};

export const createSkillApi = async (data: SkillInput): Promise<Skill> => {
  const response = await api.post("/api/v1/users/skills", data);
  return response.data;
};

export const updateSkillApi = async (
  id: string,
  data: Partial<SkillInput>,
): Promise<Skill> => {
  const response = await api.patch(`/api/v1/users/skills/${id}`, data);
  return response.data;
};

export const deleteSkillApi = async (id: string): Promise<void> => {
  await api.delete(`/api/v1/users/skills/${id}`);
};

// ─── Projects ───────────────────────────────────────────

export const listProjectsApi = async (): Promise<Project[]> => {
  const response = await api.get("/api/v1/users/projects");
  return response.data;
};

export const createProjectApi = async (data: ProjectInput): Promise<Project> => {
  const response = await api.post("/api/v1/users/projects", data);
  return response.data;
};

export const updateProjectApi = async (
  id: string,
  data: Partial<ProjectInput>,
): Promise<Project> => {
  const response = await api.patch(`/api/v1/users/projects/${id}`, data);
  return response.data;
};

export const deleteProjectApi = async (id: string): Promise<void> => {
  await api.delete(`/api/v1/users/projects/${id}`);
};
