import axios from "axios";

const api = axios.create({
  baseURL:
    "https://backend-of-smartkhata-book-vkcv.vercel.app",
});

// ==========================================
// ATTACH TOKEN
// ==========================================

api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("token");

    if (token) {
      config.headers.token = token;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ==========================================
// AUTOMATIC LOGOUT
// ==========================================

api.interceptors.response.use(
  (response) => response,

  (error) => {
    const status =
      error.response?.status;

    const code =
      error.response?.data?.code;

    const authErrorCodes = [
      "SESSION_EXPIRED",
      "TOKEN_EXPIRED",
      "INVALID_TOKEN",
      "AUTH_FAILED",
      "USER_NOT_FOUND",
      "NO_TOKEN",
    ];

    const shouldLogout =
      status === 401 &&
      authErrorCodes.includes(code);

    if (shouldLogout) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      if (
        window.location.pathname !== "/"
      ) {
        window.location.href = "/";
      }
    }

    return Promise.reject(error);
  }
);

export default api;