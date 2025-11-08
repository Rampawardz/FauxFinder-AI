import api from "./api";

export const getProfiles = async () => {
  const res = await api.get("/profiles");
  return res.data;
};

export const predictProfile = async (id) => {
  const res = await api.post(`/profiles/${id}/predict`);
  return res.data;
};

export const analyzeProfile = async ({
  profile_pic,
  nums_length_username,
  fullname_words,
  nums_length_fullname,
  name_equals_username,
  description_length,
  external_URL,
  private: isPrivate,
  posts,
  followers,
  follows
}) => {
  const res = await api.post("/profiles/analyze", {
    profile_pic,
    nums_length_username,
    fullname_words,
    nums_length_fullname,
    name_equals_username,
    description_length,
    external_URL,
    private: isPrivate,
    posts,
    followers,
    follows
  });
  return res.data;
};
