import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

import { ShieldCheck, Users as UsersIcon } from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { getAllUsers, promoteToAdmin } from "../api/authApi";
import { getErrorMessage } from "../utils/errors";

function roleBadgeClass(role) {
    return role === "ADMIN" ? "badge badge-active" : "badge badge-archived";
}

// Admin-only screen for managing who has Admin access. Registration can
// only ever create Members (see Register.jsx) - this page, backed by
// PUT /api/users/{id}/promote-to-admin, is the one place a Member becomes
// an Admin. The backend enforces the same restriction independently
// (SecurityConfig requires ROLE_ADMIN on both endpoints this page calls),
// so this redirect is a UX nicety, not the actual security boundary.
function Users() {
    const { user, isAdmin } = useAuth();

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [promotingId, setPromotingId] = useState(null);

    const loadUsers = async () => {
        setLoading(true);
        setError("");

        try {
            const data = await getAllUsers();
            setUsers(Array.isArray(data) ? data : []);
        } catch (loadError) {
            setError(getErrorMessage(loadError, "Couldn't load users."));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isAdmin) return;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAdmin]);

    if (!isAdmin) {
        return <Navigate to="/dashboard" replace />;
    }

    const handlePromote = async (targetUser) => {
        if (
            !window.confirm(
                `Make ${targetUser.fullName} an Admin? They'll be able to manage users, projects and tasks.`
            )
        ) {
            return;
        }

        setPromotingId(targetUser.id);
        setError("");
        setSuccess("");

        try {
            const updated = await promoteToAdmin(targetUser.id);

            setUsers((previous) =>
                previous.map((item) =>
                    item.id === targetUser.id ? { ...item, ...updated } : item
                )
            );

            setSuccess(`${targetUser.fullName} is now an Admin.`);
        } catch (promoteError) {
            setError(getErrorMessage(promoteError, "Couldn't promote this user."));
        } finally {
            setPromotingId(null);
        }
    };

    return (
        <>

            <div className="page-header">
                <div>
                    <h1>Users</h1>
                    <p>
                        {users.length > 0
                            ? `${users.length} user${users.length === 1 ? "" : "s"} · manage who has Admin access.`
                            : "Manage who has Admin access."}
                    </p>
                </div>
            </div>

            {error && <div className="error-banner">{error}</div>}
            {success && <div className="success-banner">{success}</div>}

            <div className="dashboard-card table-card">

                {loading ? (
                    <p className="empty-hint">Loading users...</p>
                ) : users.length === 0 ? (
                    <div className="empty-state">
                        <UsersIcon size={32} />
                        <p>No users yet.</p>
                    </div>
                ) : (
                    <div className="table-scroll">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Role</th>
                                    <th aria-label="Actions" />
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((item) => (
                                    <tr key={item.id}>
                                        <td>
                                            <strong>{item.fullName}</strong>
                                            {item.id === user?.id && (
                                                <span className="muted-cell"> (You)</span>
                                            )}
                                        </td>
                                        <td className="truncate-cell">{item.email}</td>
                                        <td className="muted-cell">{item.phone || "-"}</td>
                                        <td>
                                            <span className={roleBadgeClass(item.role)}>
                                                {item.role}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="row-actions">
                                                {item.role !== "ADMIN" && (
                                                    <button
                                                        className="icon-button"
                                                        title="Promote to Admin"
                                                        disabled={promotingId === item.id}
                                                        onClick={() => handlePromote(item)}
                                                    >
                                                        <ShieldCheck size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                               ))}
                            </tbody>
                        </table>
                    </div>
                )}

            </div>

        </>
    );
}

export default Users;
