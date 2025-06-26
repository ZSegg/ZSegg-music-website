import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { login, register, getUserInfo } from "../api/auth";
import { adminLogin } from "../api/admin";

export const useUserStore = defineStore(
  "user",
  () => {
    const user = ref(null);
    const token = ref(localStorage.getItem("token") || "");

    const isLoggedIn = computed(() => !!token.value);
    const isAdmin = computed(
      () => user.value?.role === "ADMIN" || user.value?.role === "SUPER_ADMIN"
    );

    const setToken = (newToken) => {
      token.value = newToken;
      localStorage.setItem("token", newToken);
    };

    const setUser = (userData) => {
      user.value = userData;
    };

    const loginUser = async (credentials) => {
      try {
        const response = await login(credentials);
        setToken(response.token);
        setUser(response.user);
        return response;
      } catch (error) {
        throw error;
      }
    };

    const loginAdmin = async (credentials) => {
      try {
        const response = await adminLogin(credentials);
        if (response.success && response.token && response.admin) {
          setToken(response.token);
          setUser({ ...response.admin, role: response.admin.role || "ADMIN" });
        } else {
          throw new Error(response.message || "管理员登录失败");
        }
        return response;
      } catch (error) {
        throw error;
      }
    };

    const registerUser = async (userData) => {
      try {
        const response = await register(userData);
        setToken(response.token);
        setUser(response.user);
        return response;
      } catch (error) {
        throw error;
      }
    };

    const logout = () => {
      user.value = null;
      token.value = "";
      localStorage.removeItem("token");
    };

    const loadUserInfo = async () => {
      if (token.value) {
        try {
          const userData = await getUserInfo();
          setUser(userData);
        } catch (error) {
          logout();
        }
      }
    };

    return {
      user,
      token,
      isLoggedIn,
      isAdmin,
      loginUser,
      loginAdmin,
      registerUser,
      logout,
      loadUserInfo,
    };
  },
  {
    persist: true,
  }
);
