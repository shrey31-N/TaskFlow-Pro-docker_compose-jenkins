import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { getErrorMessage } from "../utils/errors";

import heroImage from "../assets/hero.png";

function Register() {

    const navigate = useNavigate();
    const { register } = useAuth();
    const { isDark } = useTheme();

    // Self-registration always creates a Member account - there's no
    // Account Type choice here. Promoting a Member to Admin is a separate,
    // admin-only action (backend: PUT /api/users/{id}/promote-to-admin),
    // not something you can grant yourself at signup.
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        password: "",
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (event) => {

        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {

        event.preventDefault();

        setError("");
        setSuccess("");
        setLoading(true);

        try {

            const result = await register(formData);

            setSuccess("Account created successfully!");

            setTimeout(() => {
                // If registration also logged the user in (returned a
                // token), skip straight to the dashboard instead of
                // sending them back to the login form.
                navigate(result?.token ? "/dashboard" : "/");
            }, 1000);

        } catch (error) {

            setError(getErrorMessage(error, "Registration failed"));

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

                <h2>Bring your team's work into one workspace.</h2>
                <p>
                    Create your account to start organizing projects and
                    tasks in minutes.
                </p>

            </div>

            <div className="auth-panel">

                <div className="auth-form">

                    <h1>Create your account</h1>
                    <p className="auth-subtitle">
                        Join TaskFlow Pro to start managing your work.
                    </p>

                    {error && <div className="error-banner">{error}</div>}
                    {success && <div className="success-banner">{success}</div>}

                    <form onSubmit={handleSubmit}>

                        <div className="field">
                            <label htmlFor="register-fullName">Full Name</label>
                            <input
                                id="register-fullName"
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                autoComplete="name"
                                required
                            />
                        </div>

                        <div className="field">
                            <label htmlFor="register-email">Email</label>
                            <input
                                id="register-email"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                autoComplete="email"
                                required
                            />
                        </div>

                        <div className="field">
                            <label htmlFor="register-phone">Phone</label>
                            <input
                                id="register-phone"
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                autoComplete="tel"
                                required
                            />
                        </div>

                        <div className="field">
                            <label htmlFor="register-password">Password</label>
                            <input
                                id="register-password"
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                autoComplete="new-password"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="primary-button auth-submit"
                            disabled={loading}
                        >
                            {loading ? "Creating account..." : "Create Account"}
                        </button>

                    </form>

                    <p className="auth-footer">
                        Already have an account? <Link to="/">Login</Link>
                    </p>

                </div>

            </div>

        </div>
    );
}

export default Register;
