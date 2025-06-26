import api from "./index";

export const login = (credentials) => {
  return api.post("/auth/login", credentials);
};

export const register = (userData) => {
  return api.post("/auth/register", userData);
};

export const getUserInfo = () => {
  return api.get("/auth/profile");
};

export const updateProfile = (userData) => {
  return api.put("/auth/profile", userData);
};

export const changePassword = (passwordData) => {
  return api.put("/auth/password", passwordData);
};
