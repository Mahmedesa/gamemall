import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost/gmaemalling/server/public",

    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },

    withCredentials: true,
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(
            "gamemall_token"
        );

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;