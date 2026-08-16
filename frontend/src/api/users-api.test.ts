import { describe, it, expect, vi, beforeEach } from "vitest";

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
} from "./users-api";
import api from "./client";

vi.mock("./client", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockApi = vi.mocked(api);

describe("users-api", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("education endpoints use the correct routes", async () => {
    mockApi.get.mockResolvedValue({ data: [] });
    await listEducationsApi();
    expect(mockApi.get).toHaveBeenCalledWith("/api/v1/users/educations");

    mockApi.post.mockResolvedValue({ data: { id: "1" } });
    await createEducationApi({ institution: "MIT" });
    expect(mockApi.post).toHaveBeenCalledWith("/api/v1/users/educations", {
      institution: "MIT",
    });

    mockApi.patch.mockResolvedValue({ data: { id: "1" } });
    await updateEducationApi("1", { degree: "PhD" });
    expect(mockApi.patch).toHaveBeenCalledWith("/api/v1/users/educations/1", {
      degree: "PhD",
    });

    mockApi.delete.mockResolvedValue({});
    await deleteEducationApi("1");
    expect(mockApi.delete).toHaveBeenCalledWith("/api/v1/users/educations/1");
  });

  it("work experience endpoints use the correct routes", async () => {
    mockApi.get.mockResolvedValue({ data: [] });
    await listWorkExperiencesApi();
    expect(mockApi.get).toHaveBeenCalledWith("/api/v1/users/work-experiences");

    mockApi.post.mockResolvedValue({ data: { id: "1" } });
    await createWorkExperienceApi({ company: "ACME", role: "Dev" });
    expect(mockApi.post).toHaveBeenCalledWith("/api/v1/users/work-experiences", {
      company: "ACME",
      role: "Dev",
    });

    mockApi.patch.mockResolvedValue({ data: { id: "1" } });
    await updateWorkExperienceApi("1", { company: "ACME 2" });
    expect(mockApi.patch).toHaveBeenCalledWith(
      "/api/v1/users/work-experiences/1",
      { company: "ACME 2" },
    );

    mockApi.delete.mockResolvedValue({});
    await deleteWorkExperienceApi("1");
    expect(mockApi.delete).toHaveBeenCalledWith(
      "/api/v1/users/work-experiences/1",
    );
  });

  it("skill endpoints use the correct routes", async () => {
    mockApi.get.mockResolvedValue({ data: [] });
    await listSkillsApi();
    expect(mockApi.get).toHaveBeenCalledWith("/api/v1/users/skills");

    mockApi.post.mockResolvedValue({ data: { id: "1" } });
    await createSkillApi({ skillName: "React" });
    expect(mockApi.post).toHaveBeenCalledWith("/api/v1/users/skills", {
      skillName: "React",
    });

    mockApi.patch.mockResolvedValue({ data: { id: "1" } });
    await updateSkillApi("1", { proficiencyLevel: "Expert" });
    expect(mockApi.patch).toHaveBeenCalledWith("/api/v1/users/skills/1", {
      proficiencyLevel: "Expert",
    });

    mockApi.delete.mockResolvedValue({});
    await deleteSkillApi("1");
    expect(mockApi.delete).toHaveBeenCalledWith("/api/v1/users/skills/1");
  });

  it("project endpoints use the correct routes", async () => {
    mockApi.get.mockResolvedValue({ data: [] });
    await listProjectsApi();
    expect(mockApi.get).toHaveBeenCalledWith("/api/v1/users/projects");

    mockApi.post.mockResolvedValue({ data: { id: "1" } });
    await createProjectApi({ projectName: "Portfolio" });
    expect(mockApi.post).toHaveBeenCalledWith("/api/v1/users/projects", {
      projectName: "Portfolio",
    });

    mockApi.patch.mockResolvedValue({ data: { id: "1" } });
    await updateProjectApi("1", { description: "updated" });
    expect(mockApi.patch).toHaveBeenCalledWith("/api/v1/users/projects/1", {
      description: "updated",
    });

    mockApi.delete.mockResolvedValue({});
    await deleteProjectApi("1");
    expect(mockApi.delete).toHaveBeenCalledWith("/api/v1/users/projects/1");
  });

  it("returns response.data from list/create/update calls", async () => {
    const item = { id: "9", skillName: "TypeScript" };
    mockApi.post.mockResolvedValue({ data: item });

    const result = await createSkillApi({ skillName: "TypeScript" });
    expect(result).toEqual(item);
  });
});
