import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";

export const getApiBaseUrl = () => {
  const raw = import.meta.env.VITE_API_URL as string | undefined;
  // Backend default used when env var is not provided.
  return raw?.trim() ? raw.trim() : "http://localhost:5000";
};

export const createApiClient = (token?: string | null): AxiosInstance => {
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  return axios.create({
    baseURL: getApiBaseUrl(),
    headers,
  } satisfies AxiosRequestConfig);
};
