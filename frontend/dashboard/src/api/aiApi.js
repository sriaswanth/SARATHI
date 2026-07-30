import api from "./axios";

export const prioritizeComplaint = async (data) => {
  const response = await api.post("/ai/prioritize", data);
  return response.data;
};

export const recommendAllocation = async (data) => {
  const response = await api.post("/ai/recommend", data);
  return response.data;
};
