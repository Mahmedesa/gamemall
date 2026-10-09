import api from "./axios";

/**
 * Get all layout items for a vendor store
 */
export const getStoreLayout = async (storeId) => {
    const response = await api.get("/api/vendor/store-layout", {
        params: {
            store_id: storeId,
        },
    });

    return response.data;
};

/**
 * Create a new layout item
 */
export const createStoreLayoutItem = async (storeId, itemData) => {
    const response = await api.post("/api/vendor/store-layout", {
        store_id: storeId,
        ...itemData,
    });

    return response.data;
};

/**
 * Update an existing layout item
 */
export const updateStoreLayoutItem = async (
    storeId,
    itemId,
    itemData
) => {
    const response = await api.post(
        "/api/vendor/store-layout/update",
        {
            store_id: storeId,
            item_id: itemId,
            ...itemData,
        }
    );

    return response.data;
};

/**
 * Delete a layout item
 */
export const deleteStoreLayoutItem = async (
    storeId,
    itemId
) => {
    const response = await api.post(
        "/api/vendor/store-layout/delete",
        {
            store_id: storeId,
            item_id: itemId,
        }
    );

    return response.data;
};

