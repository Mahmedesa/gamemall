import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

function Login() {
    const { login } = useAuth();

    const [form, setForm] = useState({
        username: "",
        password: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError(null);
        setLoading(true);

        try {
            const user = await login(form);

            console.log("Logged in:", user);

            alert(
                `Welcome ${user.username} (${user.account_type})`
            );
        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                error.message ||
                "Login failed"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1>GameMall Login</h1>

            <form onSubmit={handleSubmit}>
                <div>
                    <label>
                        Username
                    </label>

                    <input
                        type="text"
                        name="username"
                        value={form.username}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <label>
                        Password
                    </label>

                    <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        required
                    />
                </div>

                {error && (
                    <p>{error}</p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                >
                    {loading
                        ? "Logging in..."
                        : "Login"}
                </button>
            </form>
        </div>
    );
}

export default Login;