import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement, type ReactNode } from "react";

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
  type Education,
  type WorkExperience,
  type Skill,
  type Project,
} from "@/api/users-api";

import {
  useEducationsQuery,
  useCreateEducationMutation,
  useUpdateEducationMutation,
  useDeleteEducationMutation,
  useWorkExperiencesQuery,
  useCreateWorkExperienceMutation,
  useUpdateWorkExperienceMutation,
  useDeleteWorkExperienceMutation,
  useSkillsQuery,
  useCreateSkillMutation,
  useUpdateSkillMutation,
  useDeleteSkillMutation,
  useProjectsQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
} from "./use-users-queries";
import { queryKeys } from "./query-keys";

vi.mock("@/api/users-api", () => ({
  listEducationsApi: vi.fn(),
  createEducationApi: vi.fn(),
  updateEducationApi: vi.fn(),
  deleteEducationApi: vi.fn(),
  listWorkExperiencesApi: vi.fn(),
  createWorkExperienceApi: vi.fn(),
  updateWorkExperienceApi: vi.fn(),
  deleteWorkExperienceApi: vi.fn(),
  listSkillsApi: vi.fn(),
  createSkillApi: vi.fn(),
  updateSkillApi: vi.fn(),
  deleteSkillApi: vi.fn(),
  listProjectsApi: vi.fn(),
  createProjectApi: vi.fn(),
  updateProjectApi: vi.fn(),
  deleteProjectApi: vi.fn(),
}));

const mockListEducationsApi = vi.mocked(listEducationsApi);
const mockCreateEducationApi = vi.mocked(createEducationApi);
const mockUpdateEducationApi = vi.mocked(updateEducationApi);
const mockDeleteEducationApi = vi.mocked(deleteEducationApi);
const mockListWorkExperiencesApi = vi.mocked(listWorkExperiencesApi);
const mockCreateWorkExperienceApi = vi.mocked(createWorkExperienceApi);
const mockUpdateWorkExperienceApi = vi.mocked(updateWorkExperienceApi);
const mockDeleteWorkExperienceApi = vi.mocked(deleteWorkExperienceApi);
const mockListSkillsApi = vi.mocked(listSkillsApi);
const mockCreateSkillApi = vi.mocked(createSkillApi);
const mockUpdateSkillApi = vi.mocked(updateSkillApi);
const mockDeleteSkillApi = vi.mocked(deleteSkillApi);
const mockListProjectsApi = vi.mocked(listProjectsApi);
const mockCreateProjectApi = vi.mocked(createProjectApi);
const mockUpdateProjectApi = vi.mocked(updateProjectApi);
const mockDeleteProjectApi = vi.mocked(deleteProjectApi);

const education: Education = {
  id: "e1",
  institution: "MIT",
  degree: "BSc",
  fieldOfStudy: "CS",
  startDate: "2020-01-01",
  endDate: "2024-01-01",
  description: "",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

const workExperience: WorkExperience = {
  id: "w1",
  company: "Acme",
  role: "Engineer",
  startDate: "2024-01-01",
  endDate: "2026-01-01",
  description: "",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

const skill: Skill = {
  id: "s1",
  skillName: "TypeScript",
  proficiencyLevel: "advanced",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

const project: Project = {
  id: "p1",
  projectName: "Portfolio",
  description: "",
  startDate: "2025-01-01",
  endDate: "2025-06-01",
  techStack: "React",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
  return { queryClient, wrapper };
}

describe("educations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches educations via listEducationsApi", async () => {
    mockListEducationsApi.mockResolvedValue([education]);
    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useEducationsQuery(), { wrapper });

    await waitFor(() => expect(result.current.data).toEqual([education]));
    expect(mockListEducationsApi).toHaveBeenCalledTimes(1);
  });

  it("creates an education and invalidates the list on success", async () => {
    mockCreateEducationApi.mockResolvedValue(education);
    const { queryClient, wrapper } = makeWrapper();
    queryClient.setQueryData(queryKeys.users.educations(), []);
    const { result } = renderHook(() => useCreateEducationMutation(), { wrapper });

    result.current.mutate({ institution: "MIT", degree: "BSc" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockCreateEducationApi).toHaveBeenCalledWith(
      {
        institution: "MIT",
        degree: "BSc",
      },
      expect.anything(),
    );
    await waitFor(() =>
      expect(queryClient.getQueryState(queryKeys.users.educations())?.isInvalidated)
        .toBe(true),
    );
  });

  it("updates an education with id and data and invalidates the list on success", async () => {
    mockUpdateEducationApi.mockResolvedValue({ ...education, institution: "MIT2" });
    const { queryClient, wrapper } = makeWrapper();
    queryClient.setQueryData(queryKeys.users.educations(), []);
    const { result } = renderHook(() => useUpdateEducationMutation(), { wrapper });

    result.current.mutate({ id: "e1", data: { institution: "MIT2" } });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockUpdateEducationApi).toHaveBeenCalledWith("e1", {
      institution: "MIT2",
    });
    await waitFor(() =>
      expect(queryClient.getQueryState(queryKeys.users.educations())?.isInvalidated)
        .toBe(true),
    );
  });

  it("deletes an education and invalidates the list on success", async () => {
    mockDeleteEducationApi.mockResolvedValue(undefined);
    const { queryClient, wrapper } = makeWrapper();
    queryClient.setQueryData(queryKeys.users.educations(), []);
    const { result } = renderHook(() => useDeleteEducationMutation(), { wrapper });

    result.current.mutate("e1");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockDeleteEducationApi).toHaveBeenCalledWith("e1", expect.anything());
    await waitFor(() =>
      expect(queryClient.getQueryState(queryKeys.users.educations())?.isInvalidated)
        .toBe(true),
    );
  });
});

describe("workExperiences", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches work experiences via listWorkExperiencesApi", async () => {
    mockListWorkExperiencesApi.mockResolvedValue([workExperience]);
    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useWorkExperiencesQuery(), { wrapper });

    await waitFor(() => expect(result.current.data).toEqual([workExperience]));
    expect(mockListWorkExperiencesApi).toHaveBeenCalledTimes(1);
  });

  it("creates a work experience and invalidates the list on success", async () => {
    mockCreateWorkExperienceApi.mockResolvedValue(workExperience);
    const { queryClient, wrapper } = makeWrapper();
    queryClient.setQueryData(queryKeys.users.workExperiences(), []);
    const { result } = renderHook(() => useCreateWorkExperienceMutation(), {
      wrapper,
    });

    result.current.mutate({ company: "Acme", role: "Engineer" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockCreateWorkExperienceApi).toHaveBeenCalledWith(
      {
        company: "Acme",
        role: "Engineer",
      },
      expect.anything(),
    );
    await waitFor(() =>
      expect(
        queryClient.getQueryState(queryKeys.users.workExperiences())?.isInvalidated,
      ).toBe(true),
    );
  });

  it("updates a work experience with id and data and invalidates the list on success", async () => {
    mockUpdateWorkExperienceApi.mockResolvedValue({
      ...workExperience,
      role: "Senior",
    });
    const { queryClient, wrapper } = makeWrapper();
    queryClient.setQueryData(queryKeys.users.workExperiences(), []);
    const { result } = renderHook(() => useUpdateWorkExperienceMutation(), {
      wrapper,
    });

    result.current.mutate({ id: "w1", data: { role: "Senior" } });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockUpdateWorkExperienceApi).toHaveBeenCalledWith("w1", {
      role: "Senior",
    });
    await waitFor(() =>
      expect(
        queryClient.getQueryState(queryKeys.users.workExperiences())?.isInvalidated,
      ).toBe(true),
    );
  });

  it("deletes a work experience and invalidates the list on success", async () => {
    mockDeleteWorkExperienceApi.mockResolvedValue(undefined);
    const { queryClient, wrapper } = makeWrapper();
    queryClient.setQueryData(queryKeys.users.workExperiences(), []);
    const { result } = renderHook(() => useDeleteWorkExperienceMutation(), {
      wrapper,
    });

    result.current.mutate("w1");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockDeleteWorkExperienceApi).toHaveBeenCalledWith("w1", expect.anything());
    await waitFor(() =>
      expect(
        queryClient.getQueryState(queryKeys.users.workExperiences())?.isInvalidated,
      ).toBe(true),
    );
  });
});

describe("skills", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches skills via listSkillsApi", async () => {
    mockListSkillsApi.mockResolvedValue([skill]);
    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useSkillsQuery(), { wrapper });

    await waitFor(() => expect(result.current.data).toEqual([skill]));
    expect(mockListSkillsApi).toHaveBeenCalledTimes(1);
  });

  it("creates a skill and invalidates the list on success", async () => {
    mockCreateSkillApi.mockResolvedValue(skill);
    const { queryClient, wrapper } = makeWrapper();
    queryClient.setQueryData(queryKeys.users.skills(), []);
    const { result } = renderHook(() => useCreateSkillMutation(), { wrapper });

    result.current.mutate({ skillName: "TypeScript" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockCreateSkillApi).toHaveBeenCalledWith(
      { skillName: "TypeScript" },
      expect.anything(),
    );
    await waitFor(() =>
      expect(queryClient.getQueryState(queryKeys.users.skills())?.isInvalidated).toBe(
        true,
      ),
    );
  });

  it("updates a skill with id and data and invalidates the list on success", async () => {
    mockUpdateSkillApi.mockResolvedValue({ ...skill, skillName: "TypeScript 5" });
    const { queryClient, wrapper } = makeWrapper();
    queryClient.setQueryData(queryKeys.users.skills(), []);
    const { result } = renderHook(() => useUpdateSkillMutation(), { wrapper });

    result.current.mutate({ id: "s1", data: { skillName: "TypeScript 5" } });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockUpdateSkillApi).toHaveBeenCalledWith("s1", {
      skillName: "TypeScript 5",
    });
    await waitFor(() =>
      expect(queryClient.getQueryState(queryKeys.users.skills())?.isInvalidated).toBe(
        true,
      ),
    );
  });

  it("deletes a skill and invalidates the list on success", async () => {
    mockDeleteSkillApi.mockResolvedValue(undefined);
    const { queryClient, wrapper } = makeWrapper();
    queryClient.setQueryData(queryKeys.users.skills(), []);
    const { result } = renderHook(() => useDeleteSkillMutation(), { wrapper });

    result.current.mutate("s1");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockDeleteSkillApi).toHaveBeenCalledWith("s1", expect.anything());
    await waitFor(() =>
      expect(queryClient.getQueryState(queryKeys.users.skills())?.isInvalidated).toBe(
        true,
      ),
    );
  });
});

describe("projects", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches projects via listProjectsApi", async () => {
    mockListProjectsApi.mockResolvedValue([project]);
    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useProjectsQuery(), { wrapper });

    await waitFor(() => expect(result.current.data).toEqual([project]));
    expect(mockListProjectsApi).toHaveBeenCalledTimes(1);
  });

  it("creates a project and invalidates the list on success", async () => {
    mockCreateProjectApi.mockResolvedValue(project);
    const { queryClient, wrapper } = makeWrapper();
    queryClient.setQueryData(queryKeys.users.projects(), []);
    const { result } = renderHook(() => useCreateProjectMutation(), { wrapper });

    result.current.mutate({ projectName: "Portfolio" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockCreateProjectApi).toHaveBeenCalledWith(
      { projectName: "Portfolio" },
      expect.anything(),
    );
    await waitFor(() =>
      expect(queryClient.getQueryState(queryKeys.users.projects())?.isInvalidated).toBe(
        true,
      ),
    );
  });

  it("updates a project with id and data and invalidates the list on success", async () => {
    mockUpdateProjectApi.mockResolvedValue({
      ...project,
      projectName: "Portfolio v2",
    });
    const { queryClient, wrapper } = makeWrapper();
    queryClient.setQueryData(queryKeys.users.projects(), []);
    const { result } = renderHook(() => useUpdateProjectMutation(), { wrapper });

    result.current.mutate({ id: "p1", data: { projectName: "Portfolio v2" } });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockUpdateProjectApi).toHaveBeenCalledWith("p1", {
      projectName: "Portfolio v2",
    });
    await waitFor(() =>
      expect(queryClient.getQueryState(queryKeys.users.projects())?.isInvalidated).toBe(
        true,
      ),
    );
  });

  it("deletes a project and invalidates the list on success", async () => {
    mockDeleteProjectApi.mockResolvedValue(undefined);
    const { queryClient, wrapper } = makeWrapper();
    queryClient.setQueryData(queryKeys.users.projects(), []);
    const { result } = renderHook(() => useDeleteProjectMutation(), { wrapper });

    result.current.mutate("p1");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockDeleteProjectApi).toHaveBeenCalledWith("p1", expect.anything());
    await waitFor(() =>
      expect(queryClient.getQueryState(queryKeys.users.projects())?.isInvalidated).toBe(
        true,
      ),
    );
  });
});
