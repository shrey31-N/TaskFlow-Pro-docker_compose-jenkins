import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    CalendarDays,
    CheckCircle2,
    Clock,
    FolderKanban,
    ListTodo,
    Plus,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { getProjects } from "../api/projectApi";
import { getTasks } from "../api/taskApi";
import { getErrorMessage } from "../utils/errors";

function statusLabel(status) {
    if (status === "IN_PROGRESS") return "In Progress";
    if (status === "DONE") return "Done";
    return "To Do";
}

function formatDueDate(dueDate) {
    if (!dueDate) return "No due date";

    try {
        return new Date(dueDate).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
        });
    } catch {
        return dueDate;
    }
}

function Dashboard() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [projectCount, setProjectCount] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const displayName = user?.fullName || "there";

    useEffect(() => {
        let cancelled = false;

        async function loadDashboardData() {
            setLoading(true);
            setError("");

            try {
                const [projectPage, allTasks] = await Promise.all([
                    getProjects(0, 1),
                    getTasks(),
                ]);

                if (cancelled) return;

                setProjectCount(projectPage?.totalElements ?? 0);
                setTasks(Array.isArray(allTasks) ? allTasks : []);
            } catch (loadError) {
                if (!cancelled) {
                    setError(getErrorMessage(loadError, "Couldn't load dashboard data."));
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        loadDashboardData();

        return () => {
            cancelled = true;
        };
    }, []);

    const totalTasks = tasks.length;
    const doneTasks = tasks.filter((task) => task.status === "DONE").length;
    const inProgressTasks = tasks.filter((task) => task.status === "IN_PROGRESS").length;
    const todoTasks = tasks.filter((task) => task.status === "TODO").length;

    const donePercent = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0;
    const inProgressPercent = totalTasks ? Math.round((inProgressTasks / totalTasks) * 100) : 0;
    const todoPercent = totalTasks ? Math.max(0, 100 - donePercent - inProgressPercent) : 0;

    const upcomingTasks = tasks
        .filter((task) => task.status !== "DONE" && task.dueDate)
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
        .slice(0, 5);

    return (
        <>

            <div className="page-header">

                <div>
                    <h1>Dashboard</h1>
                    <p>
                        Welcome back, {displayName}! Here&apos;s what&apos;s
                        happening with your projects.
                    </p>
                </div>

                <button
                    className="primary-button"
                    onClick={() => navigate("/projects")}
                >
                    <Plus size={18} />
                    New Project
                </button>

            </div>

            {error && <div className="error-banner">{error}</div>}

            <div className="stats-grid">

                <StatCard
                    title="Total Projects"
                    value={loading ? "-" : projectCount}
                    caption="across your workspace"
                    icon={<FolderKanban size={21} />}
                    type="purple"
                />

                <StatCard
                    title="Total Tasks"
                    value={loading ? "-" : totalTasks}
                    caption="across all projects"
                    icon={<ListTodo size={21} />}
                    type="green"
                />

                <StatCard
                    title="Completed Tasks"
                    value={loading ? "-" : doneTasks}
                    caption={totalTasks ? `${donePercent}% of total` : "no tasks yet"}
                    icon={<CheckCircle2 size={21} />}
                    type="blue"
                />

                <StatCard
                    title="Pending Tasks"
                    value={loading ? "-" : todoTasks + inProgressTasks}
                    caption="to do + in progress"
                    icon={<CalendarDays size={21} />}
                    type="orange"
                />

            </div>

            <div className="dashboard-grid">

                <div className="dashboard-card task-summary">

                    <div className="card-header">
                        <div>
                            <h2>Task Breakdown</h2>
                            <span>Current workload by status</span>
                        </div>
                    </div>

                    <div className="donut-container">

                        <div
                            className="donut"
                            style={{
                                background: totalTasks
                                    ? `conic-gradient(#7654f6 0 ${donePercent}%, #f6a623 ${donePercent}% ${donePercent + inProgressPercent}%, #ec4899 ${donePercent + inProgressPercent}% 100%)`
                                    : "#e7e7eb",
                            }}
                        >
                            <div className="donut-inner">
                                <strong>{totalTasks}</strong>
                                <span>Total Tasks</span>
                            </div>
                        </div>

                        <div className="legend">

                            <Legend
                                label="Done"
                                value={doneTasks}
                                percent={`${donePercent}%`}
                                className="purple"
                            />

                            <Legend
                                label="In Progress"
                                value={inProgressTasks}
                                percent={`${inProgressPercent}%`}
                                className="orange"
                            />

                            <Legend
                                label="To Do"
                                value={todoTasks}
                                percent={`${todoPercent}%`}
                                className="pink"
                            />

                        </div>

                    </div>

                </div>

                <div className="dashboard-card activity-card">

                    <div className="card-header">
                        <div>
                            <h2>Upcoming Deadlines</h2>
                            <span>Open tasks with the nearest due dates</span>
                        </div>

                        <button className="text-button" onClick={() => navigate("/tasks")}>
                            View All
                        </button>
                    </div>

                    <div className="activity-list">

                        {!loading && upcomingTasks.length === 0 && (
                            <p className="empty-hint">
                                No upcoming due dates - you&apos;re all caught up.
                            </p>
                        )}

                        {upcomingTasks.map((task) => (
                            <div className="activity-item" key={task.id}>

                                <div className="activity-icon">
                                    <Clock size={17} />
                                </div>

                                <div className="activity-info">
                                    <strong>{task.title}</strong>
                                    <span>{statusLabel(task.status)}</span>
                                </div>

                                <time>{formatDueDate(task.dueDate)}</time>

                            </div>
                        ))}

                    </div>

                </div>

            </div>

        </>
    );
}


/* STAT CARD */

function StatCard({ title, value, caption, icon, type }) {
    return (
        <div className="stat-card">

            <div className={`stat-icon ${type}`}>{icon}</div>

            <div className="stat-content">
                <span>{title}</span>
                <strong>{value}</strong>

                <div className="stat-change">
                    <span>{caption}</span>
                </div>
            </div>

        </div>
    );
}


/* LEGEND */

function Legend({ label, value, percent, className }) {
    return (
        <div className="legend-item">

            <div className="legend-left">
                <span className={`legend-dot ${className}`} />
                <span>{label}</span>
            </div>

            <strong>
                {value}
                <small>({percent})</small>
            </strong>

        </div>
    );
}

export default Dashboard;
