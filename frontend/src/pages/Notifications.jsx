import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";

import { Bell, Check, Trash2 } from "lucide-react";

import { useAuth } from "../context/AuthContext";
import {
    deleteNotification,
    getNotificationsByUser,
    markAsRead,
} from "../api/notificationApi";
import { getErrorMessage } from "../utils/errors";

function formatTimestamp(createdAt) {
    if (!createdAt) return "";

    try {
        return new Date(createdAt).toLocaleString(undefined, {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
        });
    } catch {
        return createdAt;
    }
}

function Notifications() {
    const { user } = useAuth();
    const { refreshUnreadCount } = useOutletContext() ?? {};

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [busyId, setBusyId] = useState(null);

    const loadNotifications = async () => {
        if (!user?.id) return;

        setLoading(true);
        setError("");

        try {
            const data = await getNotificationsByUser(user.id);
            const sorted = Array.isArray(data)
                ? [...data].sort(
                      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                  )
                : [];
            setNotifications(sorted);
        } catch (loadError) {
            setError(getErrorMessage(loadError, "Couldn't load notifications."));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadNotifications();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id]);

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    const handleMarkRead = async (notification) => {
        if (notification.isRead) return;

        setBusyId(notification.id);

        try {
            const updated = await markAsRead(notification.id);

            setNotifications((previous) =>
                previous.map((item) =>
                    item.id === notification.id ? { ...item, ...updated, isRead: true } : item
                )
            );

            refreshUnreadCount?.();
        } catch (updateError) {
            setError(getErrorMessage(updateError, "Couldn't mark notification as read."));
        } finally {
            setBusyId(null);
        }
    };

    const handleDelete = async (notification) => {
        setBusyId(notification.id);
        setError("");

        try {
            await deleteNotification(notification.id);

            setNotifications((previous) =>
                previous.filter((item) => item.id !== notification.id)
            );

            refreshUnreadCount?.();
        } catch (deleteError) {
            setError(getErrorMessage(deleteError, "Couldn't delete notification."));
        } finally {
            setBusyId(null);
        }
    };

    return (
        <>

            <div className="page-header">
                <div>
                    <h1>Notifications</h1>
                    <p>
                        {unreadCount > 0
                            ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
                            : "You're all caught up."}
                    </p>
                </div>
            </div>

            {error && <div className="error-banner">{error}</div>}

            <div className="dashboard-card table-card">

                {loading ? (
                    <p className="empty-hint">Loading notifications...</p>
                ) : notifications.length === 0 ? (
                    <div className="empty-state">
                        <Bell size={32} />
                        <p>No notifications yet.</p>
                    </div>
                ) : (
                    <div className="notification-list">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={
                                    notification.isRead
                                        ? "notification-item"
                                        : "notification-item unread"
                                }
                                onClick={() => handleMarkRead(notification)}
                            >

                                <div className="notification-icon">
                                    <Bell size={17} />
                                </div>

                                <div className="notification-info">
                                    <strong>{notification.title}</strong>
                                    <span>{notification.message}</span>
                                    <time>{formatTimestamp(notification.createdAt)}</time>
                                </div>

                                <div className="row-actions">

                                    {!notification.isRead && (
                                        <button
                                            className="icon-button"
                                            title="Mark as read"
                                            disabled={busyId === notification.id}
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                handleMarkRead(notification);
                                            }}
                                        >
                                            <Check size={16} />
                                        </button>
                                    )}

                                    <button
                                        className="icon-button danger"
                                        title="Delete notification"
                                        disabled={busyId === notification.id}
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            handleDelete(notification);
                                        }}
                                    >
                                        <Trash2 size={16} />
                                    </button>

                                </div>

                            </div>
                        ))}
                    </div>
                )}

            </div>

        </>
    );
}

export default Notifications;
