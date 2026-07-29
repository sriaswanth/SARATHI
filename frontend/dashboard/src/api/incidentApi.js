import api from "./axios";

export const getIncidents = async () => {
  const response = await api.get("/incidents");
  return response.data;
};

export const getIncidentById = async (id) => {
  const response = await api.get(`/incidents/${id}`);
  return response.data;
};