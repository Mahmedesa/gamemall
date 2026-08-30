import api from "./axios";

export const login = (data) => {
    return api.post("/api/auth/login", data);
};

export const registerUser = (data) => {
    return api.post("/api/auth/register/user", data);
};

export const registerCustomer = (data) => {
    return api.post("/api/auth/register/customer", data);
};

export const registerVendor = (data) => {
    return api.post("/api/auth/register/vendor", data);
};

export const getMe = () => {
    return api.get("/api/auth/me");
};

export const logout = () => {
    return api.post("/api/auth/logout");
};