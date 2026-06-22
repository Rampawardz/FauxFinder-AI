import api from "./api";

export const createReport = async (
  profileId,
  reason,
  severity = "LOW",
  reporterId = null
) => {
  const normalizedSeverity = ["LOW", "MEDIUM", "HIGH"].includes(
    String(severity).toUpperCase()
  )
    ? String(severity).toUpperCase()
    : "LOW";

  const res = await api.post("/reports", {
    profileId,
    reporterId,
    reason,
    severity: normalizedSeverity,
  });
  return res.data;
};

export const getReports = async () => {
  const res = await api.get("/reports");
  return res.data;
};
