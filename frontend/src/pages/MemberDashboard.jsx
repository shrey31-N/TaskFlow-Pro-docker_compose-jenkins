import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    CalendarDays,
    CheckCircle2,
    Clock,
    FolderKanban,
    ListTodo,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { getProjectById } from "../api/projectApi";
import { getTasksByUser } from "../api/taskApi";
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

function MemberDashboard() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [tasks, setTasks] = useState([]);
    const [myProjects, setMyProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const displayName = user?.fullName || "there";

    useEffect(() => {
        let cancelled = false;

        async function loadDashboardData() {
            setLoading(true);
            setError("");

            try {
                const myTasks = await getTasksByUser(user.id);
                const taskList = Array.isArray(myTasks) ? myTasks : [];

                if (cancelled) return;
                setTasks(taskList);

                const projectIds = [
                    ...new Set(taskList.map((task) => task.projectId).filter(Boolean)),
                ];

                const projectResults = await Promise.all(
                    projectIds.map((id) =>
                        getProjectById(id).catch(() => null)
                    )
                );

                if (cancelled) return;
                setMyProjects(projectResults.filter(Boolean));
            } catch (loadError) {
                if (!cancelled) {
                    setError(getErrorMessage(loadError, "Couldn't load dashboard data."));
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        if (user?.id) {
            loadDashboardData();
        }

        return () => {
            cancelled = true;
        };
    }, [user?.id]);

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
                    <h1>My Dashboard</h1>
                    <p>
                        Welcome back, {displayName}! Here&apos;s what&apos;s
                        happening with your tasks.
                    </p>
                </div>

            </div>

            {error && <div className="error-banner">{error}</div>}

            <div className="stats-grid">

                <StatCard
                    title="My Projects"
                    value={loading ? "-" : myProjects.length}
                    caption="assigned to you"
                    icon={<FolderKanban size={21} />}
                    type="purple"
                />

                <StatCard
                    title="My Tasks"
                    value={loading ? "-" : totalTasks}
                    caption="assigned to you"
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
                            <span>Your workload by status</span>
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
                            <span>Your open tasks with the nearest due dates</span>
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

            <div className="dashboard-card" style={{ marginTop: "24px" }}>

                <div className="card-header">
                    <div>
                        <h2>My Projects</h2>
                        <span>Projects containing tasks assigned to you</span>
                    </div>

                    <button className="text-button" onClick={() => navigate("/projects")}>
                        View All
                    </button>
                </div>

                <div className="activity-list">

                    {!loading && myProjects.length === 0 && (
                        <p className="empty-hint">
                            You don&apos;t have any assigned tasks yet.
                        </p>
                    )}

                    {myProjects.map((project) => (
                        <div className="activity-item" key={project.id}>

                            <div className="activity-icon">
                                <FolderKanban size={17} />
                            </div>

                            <div className="activity-info">
                                <strong>{project.name}</strong>
                                <span>{project.status}</span>
                            </div>

                        </div>
                    ))}

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

export default MemberDashboard;
