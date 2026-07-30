import api from "./axios";

export const getAgents = async () => {
  const response = await api.get("/agents");
  return response.data;
};

export const createAgent = async (data) => {
  const response = await api.post("/agents", data);
  return response.data;
};

export const updateAgent = async (id, data) => {
  const response = await api.put(`/agents/${id}`, data);
  return response.data;
};

export const deleteAgent = async (id) => {
  const response = await api.delete(`/agents/${id}`);
  return response.data;
};