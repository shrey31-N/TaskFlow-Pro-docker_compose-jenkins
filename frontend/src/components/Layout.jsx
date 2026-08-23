import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { getUnreadCount } from "../api/notificationApi";

import Sidebar from "./Sidebar";
import Header from "./Header";

const UNREAD_POLL_MS = 30000;

// The shared authenticated-app shell: sidebar + topbar wrap an <Outlet />
// so every protected page (Dashboard, Projects, Tasks, Notifications,
// Profile) reuses the exact same chrome instead of duplicating it.
function Layout() {

    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { isDark } = useTheme();

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    // Not wrapped in useCallback: it's re-created each render, which is
    // fine here since it's only ever invoked from the effect below (on
    // mount/user change and on the poll interval) or as an on-demand
    // refresh passed down to pages via the Outlet context.
    async function refreshUnreadCount() {
        if (!user?.id) {
            return;
        }

        try {
            const { count } = await getUnreadCount(user.id);
            setUnreadCount(count ?? 0);
        } catch {
            // Best-effort - notification-service being down shouldn't
            // break the rest of the shell.
        }
    }

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        refreshUnreadCount();

        const interval = setInterval(refreshUnreadCount, UNREAD_POLL_MS);
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id]);

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <div className={isDark ? "app dark" : "app"}>

            {sidebarOpen && (
                <div
                    className="mobile-overlay"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <Sidebar
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                unreadCount={unreadCount}
                onLogout={handleLogout}
            />

            <main className="main">

                <Header
                    onMenuClick={() => setSidebarOpen(true)}
                    unreadCount={unreadCount}
                    onLogout={handleLogout}
                />

                <section className="content">
                    <Outlet context={{ refreshUnreadCount }} />
                </section>

            </main>

        </div>
    );
}

export default Layout;
