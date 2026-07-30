import api from "./axios";

export const getAmbulances = async (params = {}) => {
  const response = await api.get("/ambulances", { params });
  return response.data;
};

export const createAmbulance = async (data) => {
  const response = await api.post("/ambulances", data);
  return response.data;
};

export const updateAmbulance = async (id, data) => {
  const response = await api.put(`/ambulances/${id}`, data);
  return response.data;
};

export const deleteAmbulance = async (id) => {
  const response = await api.delete(`/ambulances/${id}`);
  return response.data;
};