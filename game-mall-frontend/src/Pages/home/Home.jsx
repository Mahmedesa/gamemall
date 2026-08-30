import { useEffect, useState } from "react";
import { getStatus } from "../../Api/statusApi";

function Home() {
    const [status, setStatus] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadStatus = async () => {
            try {
                const response = await getStatus();

                setStatus(response.data);
            } catch (error) {
                console.error(error);

                setError("Failed to connect to API");
            }
        };

        loadStatus();
    }, []);

    return (
        <div>
            <h1>GameMall</h1>

            {status && (
                <pre>
                    {JSON.stringify(status, null, 2)}
                </pre>
            )}

            {error && (
                <p>{error}</p>
            )}
        </div>
    );
}

export default Home;