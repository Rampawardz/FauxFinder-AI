import api from "./api";

export const getProfiles = async () => {
  const res = await api.get("/profiles");
  return res.data;
};

export const analyzeProfile = async (payload) => {
  const res = await api.post("/profiles/analyze", payload);
  return res.data;
};
