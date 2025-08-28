// lib/axiosClient.ts
import axios from "axios";
import Cookies from "js-cookie";
import { backend_url } from "@/config";

const axiosClient = axios.create({
  baseURL: backend_url,
});

// Request Interceptor – Add Bearer token + No-cache
axiosClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get("auth_token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor – Refresh token on 401
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refresh_token = Cookies.get("refresh_token");
        if (!refresh_token) throw new Error("Missing refresh token");
        const res = await axios.post(`${backend_url}/auth/refresh`, {
          refresh_token,
        });

        const newToken = res.data.token;
        Cookies.set("auth_token", newToken);

        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
        return axiosClient(originalRequest);
      } catch (refreshError) {
        console.error("Refresh token failed:", refreshError);

        Cookies.remove("auth_token");
        Cookies.remove("refresh_token");

        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
