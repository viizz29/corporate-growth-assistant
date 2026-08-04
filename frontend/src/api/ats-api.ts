import api from "./client";

export type AtsRecommendation = {
  type: "skill" | "experience" | "education" | "project";
  message: string;
  details?: string;
};

export type AtsAiFeedback = {
  currentScore: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  improvementAreas: Array<{ area: string; detail: string }>;
  skillRecommendations: Array<{ skill: string; why: string }>;
  projectSuggestions: Array<{
    name: string;
    description: string;
    skills: string[];
    why: string;
  }>;
  rawResponse?: string;
};

export type AtsScore = {
  userId: string;
  jobAdId: string;
  atsScore: number;
  recommendations: AtsRecommendation[];
  aiFeedback: AtsAiFeedback | null;
  computedAt: string;
  atsThreshold: number;
};

export const computeAtsScoreApi = async (jobAdId: string): Promise<AtsScore> => {
  const response = await api.post("/api/v1/ats/score", { jobAdId });
  return response.data;
};

export const getAtsScoreApi = async (jobAdId: string): Promise<AtsScore> => {
  const response = await api.get(`/api/v1/ats/score/${jobAdId}`);
  return response.data;
};

export const listAtsScoresApi = async (): Promise<AtsScore[]> => {
  const response = await api.get("/api/v1/ats/scores");
  return response.data;
};
