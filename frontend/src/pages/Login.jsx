import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { getErrorMessage } from "../utils/errors";

import heroImage from "../assets/hero.png";

function Login() {

    const navigate = useNavigate();

    const { login } = useAuth();
    const { isDark } = useTheme();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {

        event.preventDefault();

        setError("");
        setLoading(true);

        try {

            await login(email, password);

            navigate("/dashboard");

        } catch (error) {

            setError(getErrorMessage(error, "Login failed"));

        } finally {

            setLoading(false);
        }
    };

    return (
        <div className={isDark ? "auth-page dark" : "auth-page"}>

            <div className="auth-hero">

                <div className="brand">
                    <div className="brand-icon">
                        <CheckCircle2 size={22} />
                    </div>
                    <span>
                        TaskFlow <strong>Pro</strong>
                    </span>
                </div>

                <img src={heroImage} alt="" className="auth-hero-image" />

                <h2>Plan, track and ship work together.</h2>
                <p>
                    Projects, tasks and notifications for your whole team, in
                    one place.
                </p>

            </div>

            <div className="auth-panel">

                <div className="auth-form">

                    <h1>Welcome back</h1>
                    <p className="auth-subtitle">
                        Sign in to continue to TaskFlow Pro.
                    </p>

                    {error && <div className="error-banner">{error}</div>}

                    <form onSubmit={handleSubmit}>

                        <div className="field">
                            <label htmlFor="login-email">Email</label>
                            <input
                                id="login-email"
                                type="email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                autoComplete="email"
                                required
                            />
                        </div>

                        <div className="field">
                            <label htmlFor="login-password">Password</label>
                            <input
                                id="login-password"
                                type="password"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                autoComplete="current-password"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="primary-button auth-submit"
                            disabled={loading}
                        >
                            {loading ? "Logging in..." : "Login"}
                        </button>

                    </form>

                    <p className="auth-footer">
                        Don&apos;t have an account?{" "}
                        <Link to="/register">Register</Link>
                    </p>

                </div>

            </div>

        </div>
    );
}

export default Login;
