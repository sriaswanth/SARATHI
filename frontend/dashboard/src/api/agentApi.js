import api from "./axios";

export const getAgents = async () => {
  const response = await api.get("/agents");
  return response.data;
};