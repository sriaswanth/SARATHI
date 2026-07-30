import api from "./axios";

export const getDashboardStats = async () => {
  const response = await api.get("/dashboard");
  return response.data;
};

export const getDashboardTimeline = async () => {
  const response = await api.get("/dashboard/timeline");
  return response.data;
};