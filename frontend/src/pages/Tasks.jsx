import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import {
    ListTodo,
    Pencil,
    Plus,
    Search,
    Trash2,
    X,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { getProjects } from "../api/projectApi";
import {
    createTask,
    deleteTask,
    getTasksByProject,
    getTasksPaginated,
    searchTasks,
    updateTask,
} from "../api/taskApi";
import { getErrorMessage } from "../utils/errors";

const PAGE_SIZE = 10;

const STATUS_OPTIONS = ["TODO", "IN_PROGRESS", "DONE"];
const PRIORITY_OPTIONS = ["LOW", "MEDIUM", "HIGH"];

function emptyForm(defaultProjectId, defaultUserId) {
    return {
        title: "",
        description: "",
        status: "TODO",
        priority: "MEDIUM",
        dueDate: "",
        projectId: defaultProjectId || "",
        assignedUserId: defaultUserId || "",
    };
}

function tomorrowIso() {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date.toISOString().slice(0, 10);
}

function statusBadgeClass(status) {
    if (status === "DONE") return "badge badge-done";
    if (status === "IN_PROGRESS") return "badge badge-in-progress";
    return "badge badge-todo";
}

function priorityBadgeClass(priority) {
    if (priority === "HIGH") return "badge badge-priority-high";
    if (priority === "LOW") return "badge badge-priority-low";
    return "badge badge-priority-medium";
}

function statusLabel(status) {
    if (status === "IN_PROGRESS") return "In Progress";
    if (status === "DONE") return "Done";
    return "To Do";
}

function isOverdue(task) {
    if (!task.dueDate || task.status === "DONE") return false;
    return new Date(task.dueDate) < new Date(new Date().toDateString());
}

function Tasks() {
    const { user, isAdmin } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();

    const [tasks, setTasks] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    const [projects, setProjects] = useState([]);

    const [projectFilter, setProjectFilter] = useState(searchParams.get("projectId") || "");
    const [statusFilter, setStatusFilter] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [activeSearch, setActiveSearch] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [modalOpen, setModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [formData, setFormData] = useState(emptyForm());
    const [formError, setFormError] = useState("");
    const [saving, setSaving] = useState(false);

    const [deletingId, setDeletingId] = useState(null);

    const projectsById = useMemo(() => {
        const map = new Map();
        projects.forEach((project) => map.set(String(project.id), project.name));
        return map;
    }, [projects]);

    useEffect(() => {
        getProjects(0, 100)
            .then((data) => setProjects(data?.content ?? []))
            .catch(() => setProjects([]));
    }, []);

    const loadTasks = async () => {
        setLoading(true);
        setError("");

        try {
            let list;
            let usesPagination = false;

            if (activeSearch) {
                list = await searchTasks(activeSearch);
            } else if (projectFilter) {
                list = await getTasksByProject(projectFilter);
            } else {
                const data = await getTasksPaginated(page, PAGE_SIZE, "id");
                list = data?.content ?? [];
                setTotalPages(data?.totalPages ?? 0);
                setTotalElements(data?.totalElements ?? 0);
                usesPagination = true;
            }

            if (!usesPagination) {
                setTotalPages(1);
                setTotalElements(Array.isArray(list) ? list.length : 0);
            }

            const filtered = (Array.isArray(list) ? list : []).filter((task) => {
                if (statusFilter && task.status !== statusFilter) return false;
                if (activeSearch && projectFilter && String(task.projectId) !== String(projectFilter)) {
                    return false;
                }
                return true;
            });

            setTasks(filtered);
        } catch (loadError) {
            setError(getErrorMessage(loadError, "Couldn't load tasks."));
            setTasks([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadTasks();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, projectFilter, statusFilter, activeSearch]);

    const handleProjectFilterChange = (value) => {
        setProjectFilter(value);
        setPage(0);

        const next = new URLSearchParams(searchParams);
        if (value) next.set("projectId", value);
        else next.delete("projectId");
        setSearchParams(next, { replace: true });
    };

    const handleSearchSubmit = (event) => {
        event.preventDefault();
        setPage(0);
        setActiveSearch(searchTerm.trim());
    };

    const clearSearch = () => {
        setSearchTerm("");
        setActiveSearch("");
        setPage(0);
    };

    const openCreateModal = () => {
        setEditingTask(null);
        setFormData(emptyForm(projectFilter, user?.id));
        setFormError("");
        setModalOpen(true);
    };

    const openEditModal = (task) => {
        setEditingTask(task);
        setFormData({
            title: task.title || "",
            description: task.description || "",
            status: task.status || "TODO",
            priority: task.priority || "MEDIUM",
            dueDate: task.dueDate || "",
            projectId: task.projectId ?? "",
            assignedUserId: task.assignedUserId ?? "",
        });
        setFormError("");
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingTask(null);
    };

    const handleFormChange = (event) => {
        const { name, value } = event.target;
        setFormData((previous) => ({ ...previous, [name]: value }));
    };

    const handleSave = async (event) => {
        event.preventDefault();
        setSaving(true);
        setFormError("");

        const payload = {
            ...formData,
            projectId: Number(formData.projectId),
            assignedUserId: Number(formData.assignedUserId),
        };

        try {
            if (editingTask) {
                await updateTask(editingTask.id, payload);
            } else {
                await createTask(payload);
            }

            closeModal();
            await loadTasks();
        } catch (saveError) {
            setFormError(getErrorMessage(saveError, "Couldn't save task."));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (task) => {
        if (!window.confirm(`Delete task "${task.title}"? This cannot be undone.`)) {
            return;
        }

        setDeletingId(task.id);
        setError("");

        try {
            await deleteTask(task.id);
            await loadTasks();
        } catch (deleteError) {
            setError(getErrorMessage(deleteError, "Couldn't delete task."));
        } finally {
            setDeletingId(null);
        }
    };

    const showingPagination = !activeSearch && !projectFilter && totalPages > 1;

    return (
        <>

            <div className="page-header">
                <div>
                    <h1>Tasks</h1>
                    <p>Track work across every project, from to-do to done.</p>
                </div>

                <button className="primary-button" onClick={openCreateModal}>
                    <Plus size={18} />
                    New Task
                </button>
            </div>

            {error && <div className="error-banner">{error}</div>}

            <div className="filter-bar">

                <form className="search-box wide" onSubmit={handleSearchSubmit}>
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search tasks by title..."
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                    />
                    {activeSearch && (
                        <button type="button" className="icon-button" onClick={clearSearch}>
                            <X size={16} />
                        </button>
                    )}
                </form>

                <select
                    className="filter-select"
                    value={projectFilter}
                    onChange={(event) => handleProjectFilterChange(event.target.value)}
                >
                    <option value="">All Projects</option>
                    {projects.map((project) => (
                        <option key={project.id} value={project.id}>
                            {project.name}
                        </option>
                    ))}
                </select>

                <select
                    className="filter-select"
                    value={statusFilter}
                    onChange={(event) => {
                        setStatusFilter(event.target.value);
                        setPage(0);
                    }}
                >
                    <option value="">All Statuses</option>
                    {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                            {statusLabel(status)}
                        </option>
                    ))}
                </select>

            </div>

            <div className="dashboard-card table-card">

                {loading ? (
                    <p className="empty-hint">Loading tasks...</p>
                ) : tasks.length === 0 ? (
                    <div className="empty-state">
                        <ListTodo size={32} />
                        <p>No tasks match the current filters.</p>
                    </div>
                ) : (
                    <div className="table-scroll">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Project</th>
                                    <th>Status</th>
                                    <th>Priority</th>
                                    <th>Due Date</th>
                                    <th>Assignee</th>
                                    <th aria-label="Actions" />
                                </tr>
                            </thead>
                            <tbody>
                                {tasks.map((task) => (
                                    <tr key={task.id}>
                                        <td>
                                            <strong>{task.title}</strong>
                                        </td>
                                        <td className="muted-cell">
                                            {projectsById.get(String(task.projectId)) ||
                                                `#${task.projectId}`}
                                        </td>
                                        <td>
                                            <span className={statusBadgeClass(task.status)}>
                                                {statusLabel(task.status)}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={priorityBadgeClass(task.priority)}>
                                                {task.priority}
                                            </span>
                                        </td>
                                        <td className={isOverdue(task) ? "overdue-cell" : "muted-cell"}>
                                            {task.dueDate
                                                ? new Date(task.dueDate).toLocaleDateString()
                                                : "-"}
                                        </td>
                                        <td className="muted-cell">
                                            User #{task.assignedUserId}
                                        </td>
                                        <td>
                                            <div className="row-actions">

                                                <button
                                                    className="icon-button"
                                                    title="Edit task"
                                                    onClick={() => openEditModal(task)}
                                                >
                                                    <Pencil size={16} />
                                                </button>

                                                {isAdmin && (
                                                    <button
                                                        className="icon-button danger"
                                                        title="Delete task"
                                                        onClick={() => handleDelete(task)}
                                                        disabled={deletingId === task.id}
                                                    >
                                                        <Trash2 size={16} />
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

                {showingPagination && (
                    <div className="pagination">
                        <button
                            className="page-button"
                            disabled={page === 0}
                            onClick={() => setPage((p) => Math.max(0, p - 1))}
                        >
                            Prev
                        </button>

                        <span className="page-status">
                            Page {page + 1} of {totalPages} &middot; {totalElements} total
                        </span>

                        <button
                            className="page-button"
                            disabled={page >= totalPages - 1}
                            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                        >
                            Next
                        </button>
                    </div>
                )}

            </div>

            {modalOpen && (
                <div className="modal-backdrop" onClick={closeModal}>
                    <div className="modal" onClick={(event) => event.stopPropagation()}>

                        <div className="modal-header">
                            <h2>{editingTask ? "Edit Task" : "New Task"}</h2>
                            <button className="icon-button" onClick={closeModal}>
                                <X size={18} />
                            </button>
                        </div>

                        {formError && <div className="error-banner">{formError}</div>}

                        <form onSubmit={handleSave}>

                            <div className="field">
                                <label htmlFor="task-title">Title</label>
                                <input
                                    id="task-title"
                                    name="title"
                                    type="text"
                                    value={formData.title}
                                    onChange={handleFormChange}
                                    required
                                />
                            </div>

                            <div className="field">
                                <label htmlFor="task-description">Description</label>
                                <textarea
                                    id="task-description"
                                    name="description"
                                    rows={3}
                                    value={formData.description}
                                    onChange={handleFormChange}
                                />
                            </div>

                            <div className="field-row">

                                <div className="field">
                                    <label htmlFor="task-status">Status</label>
                                    <select
                                        id="task-status"
                                        name="status"
                                        value={formData.status}
                                        onChange={handleFormChange}
                                    >
                                        {STATUS_OPTIONS.map((status) => (
                                            <option key={status} value={status}>
                                                {statusLabel(status)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="field">
                                    <label htmlFor="task-priority">Priority</label>
                                    <select
                                        id="task-priority"
                                        name="priority"
                                        value={formData.priority}
                                        onChange={handleFormChange}
                                    >
                                        {PRIORITY_OPTIONS.map((priority) => (
                                            <option key={priority} value={priority}>
                                                {priority}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                            </div>

                            <div className="field-row">

                                <div className="field">
                                    <label htmlFor="task-dueDate">Due Date</label>
                                    <input
                                        id="task-dueDate"
                                        name="dueDate"
                                        type="date"
                                        min={tomorrowIso()}
                                        value={formData.dueDate}
                                        onChange={handleFormChange}
                                        required
                                    />
                                </div>

                                <div className="field">
                                    <label htmlFor="task-projectId">Project</label>
                                    <select
                                        id="task-projectId"
                                        name="projectId"
                                        value={formData.projectId}
                                        onChange={handleFormChange}
                                        required
                                    >
                                        <option value="" disabled>
                                            Select a project
                                        </option>
                                        {projects.map((project) => (
                                            <option key={project.id} value={project.id}>
                                                {project.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                            </div>

                            <div className="field">
                                <label htmlFor="task-assignedUserId">Assignee User ID</label>
                                <input
                                    id="task-assignedUserId"
                                    name="assignedUserId"
                                    type="number"
                                    min="1"
                                    value={formData.assignedUserId}
                                    onChange={handleFormChange}
                                    required
                                />
                            </div>

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={closeModal}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="primary-button"
                                    disabled={saving}
                                >
                                    {saving ? "Saving..." : "Save Task"}
                                </button>
                            </div>

                        </form>

                    </div>
                </div>
            )}

        </>
    );
}

export default Tasks;
