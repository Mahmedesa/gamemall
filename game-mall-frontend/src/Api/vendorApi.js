import api from "./axios";

export const getVendorStores = () => {
    return api.get("/api/vendor/stores");
};