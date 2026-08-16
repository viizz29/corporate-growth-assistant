import { describe, it, expect } from "vitest";

import { queryKeys } from "./query-keys";

describe("queryKeys", () => {
  it("auth keys", () => {
    expect(queryKeys.auth.all).toEqual(["auth"]);
    expect(queryKeys.auth.profile()).toEqual(["auth", "profile"]);
    expect(queryKeys.auth.emailPreferences()).toEqual([
      "auth",
      "email-preferences",
    ]);
  });

  it("users keys", () => {
    expect(queryKeys.users.all).toEqual(["users"]);
    expect(queryKeys.users.educations()).toEqual(["users", "educations"]);
    expect(queryKeys.users.education("e1")).toEqual([
      "users",
      "educations",
      "e1",
    ]);
    expect(queryKeys.users.workExperiences()).toEqual([
      "users",
      "work-experiences",
    ]);
    expect(queryKeys.users.workExperience("w1")).toEqual([
      "users",
      "work-experiences",
      "w1",
    ]);
    expect(queryKeys.users.skills()).toEqual(["users", "skills"]);
    expect(queryKeys.users.skill("s1")).toEqual(["users", "skills", "s1"]);
    expect(queryKeys.users.projects()).toEqual(["users", "projects"]);
    expect(queryKeys.users.project("p1")).toEqual(["users", "projects", "p1"]);
  });

  it("jobAds keys", () => {
    expect(queryKeys.jobAds.all).toEqual(["job-ads"]);
    expect(queryKeys.jobAds.list()).toEqual(["job-ads", "list"]);
    expect(queryKeys.jobAds.detail("j1")).toEqual(["job-ads", "detail", "j1"]);
  });

  it("ats keys", () => {
    expect(queryKeys.ats.all).toEqual(["ats"]);
    expect(queryKeys.ats.score("j1")).toEqual(["ats", "score", "j1"]);
    expect(queryKeys.ats.scores()).toEqual(["ats", "scores"]);
  });

  it("resumes keys", () => {
    expect(queryKeys.resumes.all).toEqual(["resumes"]);
    expect(queryKeys.resumes.list()).toEqual(["resumes", "list"]);
    expect(queryKeys.resumes.byJob("j1")).toEqual(["resumes", "byJob", "j1"]);
    expect(queryKeys.resumes.templates()).toEqual(["resumes", "templates"]);
    expect(queryKeys.resumes.generate("j1", "t1")).toEqual([
      "resumes",
      "generate",
      "j1",
      "t1",
    ]);
  });
});
