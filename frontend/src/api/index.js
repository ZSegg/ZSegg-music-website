import axios from "axios";
import { ElMessage } from "element-plus";

const api = axios.create({
  baseURL: "/api",
  timeout: 10000,
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      switch (status) {
        case 401:
          console.warn("认证失败:", data.message);
          break;
        case 403:
          ElMessage.error("权限不足");
          break;
        case 404:
          ElMessage.error("请求的资源不存在");
          break;
        case 500:
          ElMessage.error("服务器内部错误");
          break;
        default:
          ElMessage.error(data.message || "请求失败");
      }
    } else {
      ElMessage.error("网络错误，请检查网络连接");
    }
    return Promise.reject(error);
  }
);

export default api;
