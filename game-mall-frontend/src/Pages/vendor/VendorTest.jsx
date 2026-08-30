import { useEffect, useState } from "react";
import { getVendorStores } from "../../Api/vendorApi";

function VendorTest() {
    const [stores, setStores] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStores = async () => {
            try {
                const response = await getVendorStores();

                console.log("Stores response:", response.data);

                if (response.data.success) {
                    setStores(response.data.data);
                } else {
                    setError(response.data.message);
                }

            } catch (error) {
                console.error("Stores error:", error);

                setError(
                    error.response?.data?.message ||
                    "Failed to load stores"
                );
            } finally {
                setLoading(false);
            }
        };

        loadStores();
    }, []);

    if (loading) {
        return <h2>Loading stores...</h2>;
    }

    return (
        <div>
            <h1>Vendor Stores</h1>

            {error && (
                <p>{error}</p>
            )}

            {stores.length === 0 && !error && (
                <p>No stores found.</p>
            )}

            {stores.map((store) => (
                <div key={store.store_id}>
                    <h3>{store.store_name}</h3>

                    <pre>
                        {JSON.stringify(
                            store,
                            null,
                            2
                        )}
                    </pre>
                </div>
            ))}
        </div>
    );
}

export default VendorTest;