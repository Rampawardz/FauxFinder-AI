import api from "./api";

export const createReport = async (profileId, reason, severity, token) => {
  const config = token
    ? { headers: { Authorization: `Bearer ${token}` } }
    : undefined;
  const res = await api.post("/reports", { profileId, reason, severity }, config);
  return res.data;
};

export const getReports = async (token) => {
  const config = token
    ? { headers: { Authorization: `Bearer ${token}` } }
    : undefined;
  const res = await api.get("/reports", config);
  return res.data;
};
