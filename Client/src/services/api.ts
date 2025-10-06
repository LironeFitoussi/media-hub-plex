import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        "ngrok-skip-browser-warning": "1",
        "Content-Type": "application/json",
    },
    withCredentials: true,
    timeout: 10000,
});

export default api;