import api from "./client";
import { API_BASE_URL, BACKEND_SERVER } from "@/config";

export type ResumeTemplate = {
  id: string;
  name: string;
  language: "en" | "hi";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ResumeGenerateRequest = {
  jobAdId: string;
  resumeTemplateId: string;
  language?: "en" | "hi";
};

export type ResumeGenerateResponse = {
  previewId: string;
  previewUrl: string;
  generatedAt: string;
  atsScore: number;
};

export const listResumeTemplatesApi = async (): Promise<ResumeTemplate[]> => {
  const response = await api.get("/api/v1/resumes/templates");
  return response.data;
};

export const generateResumeApi = async (
  data: ResumeGenerateRequest,
): Promise<ResumeGenerateResponse> => {
  const response = await api.post("/api/v1/resumes/generate", data);
  return response.data;
};

export const getPreviewUrl = (previewId: string): string => {
  const base =
    import.meta.env.VITE_MOCK_API_ON === "true"
      ? ""
      : `${BACKEND_SERVER}${API_BASE_URL}`;
  return `${base}/api/v1/resumes/preview/${previewId}`;
};
