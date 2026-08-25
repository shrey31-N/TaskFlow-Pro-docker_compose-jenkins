import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { registerAdmin } from "../api/authApi";
import { getErrorMessage } from "../utils/errors";

import heroImage from "../assets/hero.png";

function Register() {

    const navigate = useNavigate();
    const { register } = useAuth();
    const { isDark } = useTheme();

    // Account type only changes which endpoint gets called on submit:
    // Member -> POST /api/users/register (always creates a Member).
    // Admin  -> POST /api/users/register-admin, which the backend rejects
    // unless adminSecretKey matches ADMIN_SECRET_KEY. There is no way to
    // get an Admin account out of this form without that key - selecting
    // "Admin" here does not grant anything by itself.
    const [accountType, setAccountType] = useState("MEMBER");

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        password: "",
        adminSecretKey: "",
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

            if (accountType === "ADMIN") {
                const { fullName, email, phone, password, adminSecretKey } = formData;
                await registerAdmin({ fullName, email, phone, password, adminSecretKey });

                setSuccess("Admin account created successfully! You can now log in.");
                setTimeout(() => navigate("/"), 1200);
            } else {
                const { fullName, email, phone, password } = formData;
                const result = await register({ fullName, email, phone, password });

                setSuccess("Account created successfully!");

                setTimeout(() => {
                    // If registration also logged the user in (returned a
                    // token), skip straight to the dashboard instead of
                    // sending them back to the login form.
                    navigate(result?.token ? "/dashboard" : "/");
                }, 1000);
            }

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
                            <label>Account Type</label>
                            <div className="account-type-toggle">
                                <label className="radio-option">
                                    <input
                                        type="radio"
                                        name="accountType"
                                        value="MEMBER"
                                        checked={accountType === "MEMBER"}
                                        onChange={() => setAccountType("MEMBER")}
                                    />
                                    Member
                                </label>
                                <label className="radio-option">
                                    <input
                                        type="radio"
                                        name="accountType"
                                        value="ADMIN"
                                        checked={accountType === "ADMIN"}
                                        onChange={() => setAccountType("ADMIN")}
                                    />
                                    Admin
                                </label>
                            </div>
                        </div>

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

                        {accountType === "ADMIN" && (
                            <div className="field">
                                <label htmlFor="register-adminSecretKey">Admin Secret Key</label>
                                <input
                                    id="register-adminSecretKey"
                                    type="password"
                                    name="adminSecretKey"
                                    value={formData.adminSecretKey}
                                    onChange={handleChange}
                                    autoComplete="off"
                                    required
                                />
                            </div>
                        )}

                        <button
                            type="submit"
                            className="primary-button auth-submit"
                            disabled={loading}
                        >
                            {loading
                                ? "Creating account..."
                                : accountType === "ADMIN"
                                    ? "Create Admin Account"
                                    : "Create Account"}
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
