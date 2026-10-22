import api from "./client";

export type ContactDetail = {
  userId: string;
  email: string;
  phone: string;
  linkedinUrl: string;
  githubUrl: string;
  gender: "Male" | "Female" | "Others";
  createdAt: string;
  updatedAt: string;
};

export type ContactDetailInput = {
  email: string;
  phone: string;
  linkedinUrl: string;
  githubUrl: string;
  gender: "Male" | "Female" | "Others";
};

export const getContactDetailApi = async (): Promise<ContactDetail> => {
  const response = await api.get(`/api/v1/users/contact-details`);
  return response.data;
};

export const updateContactDetailApi = async (
  data: Partial<ContactDetailInput>,
): Promise<ContactDetail> => {
  const response = await api.patch(`/api/v1/users/contact-details`, data);
  return response.data;
};
