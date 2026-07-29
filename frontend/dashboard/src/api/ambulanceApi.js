import api from "./axios";

export const getAmbulances = async () => {
  const response = await api.get("/ambulances");
  return response.data;
};