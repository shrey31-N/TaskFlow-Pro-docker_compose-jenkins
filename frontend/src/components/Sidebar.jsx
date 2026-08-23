import { NavLink } from "react-router-dom";

import {
    Bell,
    CheckCircle2,
    FolderKanban,
    LayoutDashboard,
    ListTodo,
    LogOut,
    UserCircle,
    Users,
    X,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

function Sidebar({ open, onClose, unreadCount, onLogout }) {
    const { isAdmin } = useAuth();

    const navigation = [
        { name: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
        { name: "Projects", to: "/projects", icon: FolderKanban },
        { name: "Tasks", to: "/tasks", icon: ListTodo },
        {
            name: "Notifications",
            to: "/notifications",
            icon: Bell,
            badge: unreadCount > 0 ? unreadCount : null,
        },
        // Admin-only - the backend also enforces this independently on
        // both endpoints the Users page calls.
        ...(isAdmin ? [{ name: "Users", to: "/users", icon: Users }] : []),
    ];

    const navClass = ({ isActive }) =>
        isActive ? "nav-item active" : "nav-item";

    return (
        <aside className={open ? "sidebar open" : "sidebar"}>

            <div className="sidebar-header">

                <div className="brand">
                    <div className="brand-icon">
                        <CheckCircle2 size={22} />
                    </div>

                    <span>
                        TaskFlow <strong>Pro</strong>
                    </span>
                </div>

                <button
                    className="mobile-close"
                    onClick={onClose}
                    aria-label="Close menu"
                >
                    <X size={20} />
                </button>

            </div>

            <div className="sidebar-section">

                <p className="section-title">WORKSPACE</p>

                <nav>

                    {navigation.map((item) => {
                        const Icon = item.icon;

                        return (
                            <NavLink
                                key={item.name}
                                to={item.to}
                                className={navClass}
                                onClick={onClose}
                            >
                                <Icon size={19} />
                                <span>{item.name}</span>

                                {item.badge != null && (
                                    <span className="nav-badge">
                                        {item.badge > 99 ? "99+" : item.badge}
                                    </span>
                                )}
                            </NavLink>
                        );
                    })}

                </nav>

            </div>

            <div className="sidebar-bottom">

                <NavLink
                    to="/profile"
                    className={navClass}
                    onClick={onClose}
                >
                    <UserCircle size={19} />
                    <span>Profile</span>
                </NavLink>

                <button className="nav-item logout" onClick={onLogout}>
                    <LogOut size={19} />
                    <span>Logout</span>
                </button>

            </div>

        </aside>
    );
}

export default Sidebar;
