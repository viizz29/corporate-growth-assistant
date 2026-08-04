export const queryKeys = {
  auth: {
    all: ["auth"] as const,
    profile: () => [...auth.all, "profile"] as const,
    emailPreferences: () => [...auth.all, "email-preferences"] as const,
  },
  users: {
    all: ["users"] as const,
    educations: () => [...users.all, "educations"] as const,
    education: (id: string) => [...users.educations(), id] as const,
    workExperiences: () => [...users.all, "work-experiences"] as const,
    workExperience: (id: string) => [...users.workExperiences(), id] as const,
    skills: () => [...users.all, "skills"] as const,
    skill: (id: string) => [...users.skills(), id] as const,
    projects: () => [...users.all, "projects"] as const,
    project: (id: string) => [...users.projects(), id] as const,
  },
  jobAds: {
    all: ["job-ads"] as const,
    list: () => [...jobAds.all, "list"] as const,
    detail: (id: string) => [...jobAds.all, "detail", id] as const,
  },
  ats: {
    all: ["ats"] as const,
    score: (jobAdId: string) => [...ats.all, "score", jobAdId] as const,
    scores: () => [...ats.all, "scores"] as const,
  },
  resumes: {
    all: ["resumes"] as const,
    list: () => [...resumes.all, "list"] as const,
    byJob: (jobAdId: string) => [...resumes.all, "byJob", jobAdId] as const,
    templates: () => [...resumes.all, "templates"] as const,
    generate: (jobAdId: string, templateId: string) =>
      [...resumes.all, "generate", jobAdId, templateId] as const,
  },
} as const;

// Destructure for shorthand in hook files
const { auth, users, jobAds, ats, resumes } = queryKeys;
