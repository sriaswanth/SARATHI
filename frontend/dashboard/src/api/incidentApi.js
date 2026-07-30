import api from "./axios";

export const getIncidents = async (params = {}) => {
  const response = await api.get("/incidents", { params });
  return response.data;
};

export const getIncidentById = async (id) => {
  const response = await api.get(`/incidents/${id}`);
  return response.data;
};

export const createIncident = async (data) => {
  const response = await api.post("/incidents", data);
  return response.data;
};

export const updateIncident = async (id, data) => {
  const response = await api.put(`/incidents/${id}`, data);
  return response.data;
};

export const deleteIncident = async (id) => {
  const response = await api.delete(`/incidents/${id}`);
  return response.data;
};
export const reportIncident = async (text) => {
  const response = await api.post("/api/report-incident", { text });
  return response.data;
};