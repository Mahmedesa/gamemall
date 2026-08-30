import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import "./Login.css";

function Login() {
    const { login } = useAuth();

    const [form, setForm] = useState({
        username: "",
        password: "",
    });

    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });

        if (error) {
            setError(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError(null);
        setLoading(true);

        try {
            const user = await login(form);

            console.log("Logged in:", user);

            /*
             * Remember me
             *
             * Authentication itself is already handled
             * by AuthContext/localStorage.
             *
             * This flag can be used later when we build
             * session persistence logic.
             */
            localStorage.setItem(
                "gamemall_remember",
                rememberMe ? "1" : "0"
            );

            console.log(
                `Welcome ${user.username} (${user.account_type})`
            );

            /*
             * Temporary navigation.
             *
             * Later we will replace this with
             * role-based dashboard navigation.
             */
            if (user.account_type === "vendor") {
                window.location.href = "/vendor";
            } else if (user.account_type === "customer") {
                window.location.href = "/mall";
            } else {
                window.location.href = "/";
            }

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

    const handleForgotPassword = (e) => {
        e.preventDefault();

        alert(
            "Password recovery will be available soon."
        );
    };

    const handleCreateAccount = (e) => {
        e.preventDefault();

        alert(
            "Registration page will be available soon."
        );
    };

    const handleSocialLogin = (provider) => {
        alert(
            `${provider} login will be available soon.`
        );
    };

    return (
        <div className="login-page">

            {/* Background overlays */}
            <div className="login-background-overlay"></div>
            <div className="login-background-glow glow-one"></div>
            <div className="login-background-glow glow-two"></div>

            {/* Top Branding */}
            <header className="login-brand">

                <div className="brand-icon">
                    G
                </div>

                <div className="brand-text">
                    <h1>GAMEMALL</h1>
                    <span>VIRTUAL GAMING MALL</span>
                </div>

            </header>

            {/* Side Navigation */}
            <aside className="mall-side-nav left-nav">

                <div className="side-nav-line"></div>

                <span>DISCOVER</span>
                <span>SHOP</span>
                <span>PLAY</span>
                <span>CONNECT</span>

                <div className="side-game-icon">
                    🎮
                </div>

            </aside>

            <aside className="mall-side-nav right-nav">

                <div className="side-nav-line"></div>

                <span>YOUR</span>
                <span>ULTIMATE</span>
                <span>GAMING</span>
                <span>DESTINATION</span>

                <div className="side-game-icon">
                    ◈
                </div>

            </aside>

            {/* Login Card */}
            <main className="login-container">

                <div className="login-card">

                    {/* Card Header */}
                    <div className="login-card-header">

                        <div className="controller-icon">
                            🎮
                        </div>

                        <div className="header-line">
                            <span></span>
                            <span></span>
                        </div>

                        <h2>WELCOME BACK</h2>

                        <p>
                            Enter the Virtual Mall
                        </p>

                    </div>

                    {/* Login Form */}
                    <form
                        className="login-form"
                        onSubmit={handleSubmit}
                    >

                        {/* Username */}
                        <div className="input-group">

                            <div className="input-icon">
                                👤
                            </div>

                            <input
                                type="text"
                                name="username"
                                placeholder="Username"
                                value={form.username}
                                onChange={handleChange}
                                autoComplete="username"
                                required
                            />

                        </div>

                        {/* Password */}
                        <div className="input-group">

                            <div className="input-icon">
                                🔒
                            </div>

                            <input
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                name="password"
                                placeholder="Password"
                                value={form.password}
                                onChange={handleChange}
                                autoComplete="current-password"
                                required
                            />

                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() =>
                                    setShowPassword(
                                        !showPassword
                                    )
                                }
                                aria-label={
                                    showPassword
                                        ? "Hide password"
                                        : "Show password"
                                }
                            >
                                {showPassword
                                    ? "◉"
                                    : "◌"}
                            </button>

                        </div>

                        {/* Error */}
                        {error && (
                            <div className="login-error">
                                <span>!</span>
                                <p>{error}</p>
                            </div>
                        )}

                        {/* Options */}
                        <div className="login-options">

                            <label className="remember-option">

                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) =>
                                        setRememberMe(
                                            e.target.checked
                                        )
                                    }
                                />

                                <span className="custom-checkbox">
                                    {rememberMe && "✓"}
                                </span>

                                <span>
                                    Remember me
                                </span>

                            </label>

                            <button
                                type="button"
                                className="forgot-button"
                                onClick={
                                    handleForgotPassword
                                }
                            >
                                Forgot password?
                            </button>

                        </div>

                        {/* Login Button */}
                        <button
                            type="submit"
                            className="login-button"
                            disabled={loading}
                        >

                            {loading ? (
                                <>
                                    <span className="spinner"></span>
                                    ENTERING MALL...
                                </>
                            ) : (
                                <>
                                    LOGIN
                                    <span className="button-arrow">
                                        →
                                    </span>
                                </>
                            )}

                        </button>

                    </form>

                    {/* Register */}
                    <div className="register-section">

                        <span>
                            Don't have an account?
                        </span>

                        <button
                            type="button"
                            onClick={
                                handleCreateAccount
                            }
                        >
                            Create one
                        </button>

                    </div>

                    {/* Divider */}
                    <div className="login-divider">

                        <span></span>

                        <p>OR</p>

                        <span></span>

                    </div>

                    {/* Social Login */}
                    <div className="social-login">

                        <button
                            type="button"
                            onClick={() =>
                                handleSocialLogin(
                                    "Google"
                                )
                            }
                            aria-label="Continue with Google"
                        >
                            <span className="google-icon">
                                G
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                handleSocialLogin(
                                    "Discord"
                                )
                            }
                            aria-label="Continue with Discord"
                        >
                            <span>
                                ◈
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                handleSocialLogin(
                                    "Steam"
                                )
                            }
                            aria-label="Continue with Steam"
                        >
                            <span>
                                ◉
                            </span>
                        </button>

                    </div>

                </div>

            </main>

            {/* Bottom status */}
            <div className="mall-status">

                <span className="status-dot"></span>

                <span>
                    VIRTUAL MALL ONLINE
                </span>

            </div>

        </div>
    );
}

export default Login;