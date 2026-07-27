import api from "./client";

export type AtsRecommendation = {
  type: "skill" | "project";
  message: string;
  details?: string;
};

export type AtsScore = {
  userId: string;
  jobAdId: string;
  atsScore: number;
  recommendations: AtsRecommendation[];
  computedAt: string;
};

export const computeAtsScoreApi = async (jobAdId: string): Promise<AtsScore> => {
  const response = await api.post("/api/v1/ats/score", { jobAdId });
  return response.data;
};

export const getAtsScoreApi = async (jobAdId: string): Promise<AtsScore> => {
  const response = await api.get(`/api/v1/ats/score/${jobAdId}`);
  return response.data;
};
