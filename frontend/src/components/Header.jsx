import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    Bell,
    ChevronDown,
    LogOut,
    Menu,
    Moon,
    Search,
    Sun,
    UserCircle,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

function Header({ onMenuClick, unreadCount, onLogout }) {

    const navigate = useNavigate();
    const { user } = useAuth();
    const { isDark, toggleTheme } = useTheme();

    const [menuOpen, setMenuOpen] = useState(false);

    const displayName = user?.fullName || "there";
    const initial = displayName.charAt(0).toUpperCase();
    const roleLabel = user?.role === "ADMIN" ? "Admin" : "Member";

    return (
        <header className="topbar">

            <div className="topbar-left">

                <button
                    className="menu-button"
                    onClick={onMenuClick}
                    aria-label="Open menu"
                >
                    <Menu size={22} />
                </button>

                <div className="search-box">
                    <Search size={18} />
                    <input type="text" placeholder="Search projects, tasks..." />
                    <span className="search-shortcut">Ctrl K</span>
                </div>

            </div>

            <div className="topbar-right">

                <button
                    className="theme-button"
                    onClick={toggleTheme}
                    aria-label="Toggle theme"
                >
                    {isDark ? <Sun size={19} /> : <Moon size={19} />}
                </button>

                <button
                    className="notification-button"
                    onClick={() => navigate("/notifications")}
                    aria-label="Notifications"
                >
                    <Bell size={20} />
                    {unreadCount > 0 && <span className="notification-dot" />}
                </button>

                <div className="profile-menu">

                    <button
                        className="profile-mini"
                        onClick={() => setMenuOpen((open) => !open)}
                    >
                        <div className="avatar">
                            {user?.profileImageUrl ? (
                                <img src={user.profileImageUrl} alt={displayName} />
                            ) : (
                                initial
                            )}
                        </div>

                        <div className="profile-info">
                            <strong>{displayName}</strong>
                            <span>{roleLabel}</span>
                        </div>

                        <ChevronDown size={16} />
                    </button>

                    {menuOpen && (
                        <>
                            <div
                                className="dropdown-backdrop"
                                onClick={() => setMenuOpen(false)}
                            />

                            <div className="profile-dropdown">

                                <button
                                    onClick={() => {
                                        setMenuOpen(false);
                                        navigate("/profile");
                                    }}
                                >
                                    <UserCircle size={16} />
                                    Profile
                                </button>

                                <button
                                    className="dropdown-danger"
                                    onClick={() => {
                                        setMenuOpen(false);
                                        onLogout();
                                    }}
                                >
                                    <LogOut size={16} />
                                    Logout
                                </button>

                            </div>
                        </>
                    )}

                </div>

            </div>

        </header>
    );
}

export default Header;
