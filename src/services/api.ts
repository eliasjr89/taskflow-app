import axios from "axios";

const getBaseUrl = () => {
  // Use root URL to control path construction manually in interceptor
  const url = "http://localhost:3000";
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
    // Robust URL handling: Ensure /taskflow prefix exists exactly once
    if (config.url) {
      if (!config.url.match(/^\/?taskflow/)) {
        const path = config.url.startsWith("/") ? config.url : `/${config.url}`;
        config.url = `/taskflow${path}`;
      }
    }

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

// Response interceptor to handle common errors like 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
