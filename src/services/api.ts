import axios from "axios";
import { logger } from "../utils/logger";

const getBaseUrl = () => {
  // Use VITE_API_BASE_URL from environment or fallback to localhost
  const url = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
  return url;
};

const api = axios.create({
  baseURL: getBaseUrl(),
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add the auth token header to requests and normalize URL
api.interceptors.request.use(
  (config) => {
    logger.debug(
      `Realizando petición: ${config.method?.toUpperCase()} ${config.url}`,
    );
    // Robust URL handling: Ensure /taskflow prefix exists exactly once
    if (config.url) {
      if (!config.url.match(/^\/?taskflow/)) {
        const path = config.url.startsWith("/") ? config.url : `/${config.url}`;
        config.url = `/taskflow${path}`;
      }
    }

    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    logger.debug(
      `Respuesta recibida de: ${response.config.url}`,
      response.data,
    );
    return response;
  },
  (error: any) => {
    logger.error(
      `Error en respuesta (${error.response?.status}): ${error.config?.url}`,
      error.response?.data,
    );
    // Only redirect to login on 401 (Unauthorized) which implies invalid/expired token.
    // 403 (Forbidden) should be handled by the component (e.g. show error message)
    if (error.response && error.response.status === 401) {
      logger.warn("Sesión expirada o inválida. Redirigiendo a login.");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      window.location.href = "/";
    }

    if (error.response && error.response.status === 403) {
      logger.warn(
        "Acceso denegado (RBAC): El usuario no tiene permisos suficientes.",
      );
    }
    return Promise.reject(error);
  },
);

export default api;
