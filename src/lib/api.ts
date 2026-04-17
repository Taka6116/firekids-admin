import axios, { isAxiosError } from "axios";

import { getJwtToken } from "@/lib/auth";
import { API_BASE_URL } from "@/lib/constants";

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
});

apiClient.interceptors.request.use(async (config) => {
  const token = await getJwtToken();
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (error: unknown) => {
    if (
      isAxiosError(error) &&
      error.response?.status === 401 &&
      typeof window !== "undefined"
    ) {
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);
