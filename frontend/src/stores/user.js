import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { login, register, getUserInfo } from "../api/auth";
import { adminLogin, getAdminInfo } from "../api/admin";
import { getCollections } from "../api/music";

export const useUserStore = defineStore(
  "user",
  () => {
    const user = ref(null);
    const token = ref(localStorage.getItem("token") || "");
    const collections = ref([]);

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
      collections.value = [];
      localStorage.removeItem("token");
    };

    const loadUserInfo = async () => {
      if (token.value) {
        try {
          // 尝试加载用户信息
          const response = await getUserInfo();
          if (response.success && response.data) {
            setUser(response.data);
          } else {
            throw new Error("获取用户信息失败");
          }
        } catch (error) {
          // 如果用户信息加载失败，尝试加载管理员信息
          try {
            const adminResponse = await getAdminInfo();
            if (adminResponse.success && adminResponse.data) {
              setUser({
                ...adminResponse.data,
                role: adminResponse.data.role || "ADMIN",
              });
            } else {
              throw new Error("获取管理员信息失败");
            }
          } catch (adminError) {
            // 如果管理员信息也加载失败，且是401错误，清除登录状态
            if (adminError.response?.status === 401) {
              logout();
            }
          }
        }
      }
    };

    const loadCollections = async () => {
      if (token.value && !isAdmin.value) {
        try {
          const response = await getCollections();
          collections.value = response.data || [];
        } catch (error) {
          console.error("加载收藏失败:", error);
          collections.value = [];
        }
      }
    };

    const addToCollections = (collection) => {
      collections.value.push(collection);
    };

    const removeFromCollections = (collectionId) => {
      const index = collections.value.findIndex((c) => c.id === collectionId);
      if (index !== -1) {
        collections.value.splice(index, 1);
      }
    };

    const isCollected = (relId, type) => {
      return collections.value.some(
        (c) => c.rel_id === relId && c.type === type
      );
    };

    return {
      user,
      token,
      collections,
      isLoggedIn,
      isAdmin,
      setUser,
      loginUser,
      loginAdmin,
      registerUser,
      logout,
      loadUserInfo,
      loadCollections,
      addToCollections,
      removeFromCollections,
      isCollected,
    };
  },
  {
    persist: true,
  }
);
