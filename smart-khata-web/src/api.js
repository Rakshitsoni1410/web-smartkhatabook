import axios from "axios";

// ─────────────────────────────────────────────────────────────────────────
// One shared axios instance for the whole app.
//
// Your backend's authUser middleware reads the token from a header
// literally named "token" (not the more common "Authorization: Bearer"),
// so the interceptor below matches that exactly. If you ever change the
// backend to expect "Authorization: Bearer <token>" instead, this is the
// ONLY place you'd need to update — every screen using `api` picks it up
// automatically.
// ─────────────────────────────────────────────────────────────────────────

const api = axios.create({
    baseURL: "https://backend-of-smartkhata-book-vkcv.vercel.app", // update if your Render URL differs
});

// Attach the token to every outgoing request, if one is saved.
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.token = token;
    }
    return config;
});

// If the backend ever says "not authorized" (expired/invalid token),
// clear stale auth data and bounce the user back to login automatically —
// instead of every page having to check this manually.
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const message = error.response?.data?.message;
        const isAuthError =
            error.response?.status === 401 ||
            message === "Not Authorized Login Again";

        if (isAuthError) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            // Avoid an infinite redirect loop if we're already on the login page.
            if (window.location.pathname !== "/") {
                window.location.href = "/";
            }
        }
        return Promise.reject(error);
    }
);

export default api;