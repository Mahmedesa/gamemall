import api from "./axios";

export const getStatus = () => {
    return api.get("/api/status");
};