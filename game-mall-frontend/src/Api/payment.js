import api from "./axios";

export const getPaymentMethods = () => {
    return api.get("/api/payment/methods");
};

export const createPaymentTransaction = (data) => {
    return api.post("/api/payment/transactions", data);
};

export const getOrderPayment = (orderId) => {
    return api.get(`/api/payment/orders/${orderId}`);
};