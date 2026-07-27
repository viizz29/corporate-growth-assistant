import api from "./client";

export type JobAd = {
  id: string;
  title: string;
  description: string;
  requirements: string;
  location: string;
  language: "en" | "hi";
  createdAt: string;
  updatedAt: string;
};

export type JobAdInput = {
  title: string;
  description: string;
  requirements: string;
  location?: string;
  language: "en" | "hi";
};

export const listJobAdsApi = async (): Promise<JobAd[]> => {
  const response = await api.get("/api/v1/job-ads");
  return response.data;
};

export const getJobAdApi = async (id: string): Promise<JobAd> => {
  const response = await api.get(`/api/v1/job-ads/${id}`);
  return response.data;
};

export const createJobAdApi = async (data: JobAdInput): Promise<JobAd> => {
  const response = await api.post("/api/v1/job-ads", data);
  return response.data;
};

export const updateJobAdApi = async (
  id: string,
  data: Partial<JobAdInput>,
): Promise<JobAd> => {
  const response = await api.patch(`/api/v1/job-ads/${id}`, data);
  return response.data;
};

export const deleteJobAdApi = async (id: string): Promise<void> => {
  await api.delete(`/api/v1/job-ads/${id}`);
};
