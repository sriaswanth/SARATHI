import api from "./axios";

export const getHospitals = async () => {
  const response = await api.get("/hospitals");
  return response.data;
};