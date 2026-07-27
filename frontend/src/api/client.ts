import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_MOCK_API_ON === "true"
      ? import.meta.env.VITE_API_BASE_URL || ""
      : `${import.meta.env.VITE_BACKEND_SERVER || "http://localhost:3000"}${import.meta.env.VITE_API_BASE_URL || ""}`,
  // headers: {
  //     "Content-Type": "application/json",
  // },
  withCredentials: true,
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // if (err.response?.status === 401) {
    //   window.location.href = "/login";
    // }
    return Promise.reject(err);
  },
);

export default api;
