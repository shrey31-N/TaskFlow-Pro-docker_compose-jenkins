import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    ChevronLeft,
    ChevronRight,
    FolderKanban,
    ListTodo,
    Pencil,
    Plus,
    Search,
    Trash2,
    X,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import {
    createProject,
    deleteProject,
    getProjects,
    searchProjects,
    updateProject,
} from "../api/projectApi";
import { getErrorMessage } from "../utils/errors";

const PAGE_SIZE = 5;

const STATUS_OPTIONS = ["ACTIVE", "COMPLETED", "ARCHIVED"];

const EMPTY_FORM = {
    name: "",
    description: "",
    status: "ACTIVE",
};

function statusBadgeClass(status) {
    if (status === "ACTIVE") return "badge badge-active";
    if (status === "COMPLETED") return "badge badge-completed";
    return "badge badge-archived";
}

function Projects() {
    const navigate = useNavigate();
    const { user, isAdmin } = useAuth();

    const [projects, setProjects] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    const [searchTerm, setSearchTerm] = useState("");
    const [activeSearch, setActiveSearch] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [modalOpen, setModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [formError, setFormError] = useState("");
    const [saving, setSaving] = useState(false);

    const [deletingId, setDeletingId] = useState(null);

    const loadProjects = async () => {
        setLoading(true);
        setError("");

        try {
            if (activeSearch) {
                const results = await searchProjects(activeSearch);
                setProjects(Array.isArray(results) ? results : []);
                setTotalPages(1);
                setTotalElements(Array.isArray(results) ? results.length : 0);
            } else {
                const data = await getProjects(page, PAGE_SIZE);
                setProjects(data?.content ?? []);
                setTotalPages(data?.totalPages ?? 0);
                setTotalElements(data?.totalElements ?? 0);
            }
        } catch (loadError) {
            setError(getErrorMessage(loadError, "Couldn't load projects."));
            setProjects([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadProjects();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, activeSearch]);

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
        setEditingProject(null);
        setFormData(EMPTY_FORM);
        setFormError("");
        setModalOpen(true);
    };

    const openEditModal = (project) => {
        setEditingProject(project);
        setFormData({
            name: project.name || "",
            description: project.description || "",
            status: project.status || "ACTIVE",
        });
        setFormError("");
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingProject(null);
    };

    const handleFormChange = (event) => {
        const { name, value } = event.target;
        setFormData((previous) => ({ ...previous, [name]: value }));
    };

    const handleSave = async (event) => {
        event.preventDefault();
        setSaving(true);
        setFormError("");

        try {
            if (editingProject) {
                await updateProject(editingProject.id, formData);
            } else {
                await createProject({ ...formData, ownerId: user?.id });
            }

            closeModal();
            await loadProjects();
        } catch (saveError) {
            setFormError(getErrorMessage(saveError, "Couldn't save project."));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (project) => {
        if (!window.confirm(`Delete project "${project.name}"? This cannot be undone.`)) {
            return;
        }

        setDeletingId(project.id);
        setError("");

        try {
            await deleteProject(project.id);
            await loadProjects();
        } catch (deleteError) {
            setError(getErrorMessage(deleteError, "Couldn't delete project."));
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <>

            <div className="page-header">
                <div>
                    <h1>Projects</h1>
                    <p>Create and manage the projects your team is working on.</p>
                </div>

                <button className="primary-button" onClick={openCreateModal}>
                    <Plus size={18} />
                    New Project
                </button>
            </div>

            {error && <div className="error-banner">{error}</div>}

            <div className="filter-bar">
                <form className="search-box wide" onSubmit={handleSearchSubmit}>
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search projects by name..."
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                    />
                    {activeSearch && (
                        <button type="button" className="icon-button" onClick={clearSearch}>
                            <X size={16} />
                        </button>
                    )}
                </form>
            </div>

            <div className="dashboard-card table-card">

                {loading ? (
                    <p className="empty-hint">Loading projects...</p>
                ) : projects.length === 0 ? (
                    <div className="empty-state">
                        <FolderKanban size={32} />
                        <p>
                            {activeSearch
                                ? `No projects match "${activeSearch}".`
                                : "No projects yet. Create your first one to get started."}
                        </p>
                    </div>
                ) : (
                    <div className="table-scroll">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Description</th>
                                    <th>Status</th>
                                    <th>Updated</th>
                                    <th aria-label="Actions" />
                                </tr>
                            </thead>
                            <tbody>
                                {projects.map((project) => (
                                    <tr key={project.id}>
                                        <td>
                                            <strong>{project.name}</strong>
                                        </td>
                                        <td className="truncate-cell">
                                            {project.description || "-"}
                                        </td>
                                        <td>
                                            <span className={statusBadgeClass(project.status)}>
                                                {project.status}
                                            </span>
                                        </td>
                                        <td className="muted-cell">
                                            {project.updatedAt
                                                ? new Date(project.updatedAt).toLocaleDateString()
                                                : "-"}
                                        </td>
                                        <td>
                                            <div className="row-actions">

                                                <button
                                                    className="icon-button"
                                                    title="View tasks"
                                                    onClick={() =>
                                                        navigate(`/tasks?projectId=${project.id}`)
                                                    }
                                                >
                                                    <ListTodo size={16} />
                                                </button>

                                                <button
                                                    className="icon-button"
                                                    title="Edit project"
                                                    onClick={() => openEditModal(project)}
                                                >
                                                    <Pencil size={16} />
                                                </button>

                                                {isAdmin && (
                                                    <button
                                                        className="icon-button danger"
                                                        title="Delete project"
                                                        onClick={() => handleDelete(project)}
                                                        disabled={deletingId === project.id}
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

                {!activeSearch && totalPages > 1 && (
                    <div className="pagination">
                        <button
                            className="page-button"
                            disabled={page === 0}
                            onClick={() => setPage((p) => Math.max(0, p - 1))}
                        >
                            <ChevronLeft size={16} />
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
                            <ChevronRight size={16} />
                        </button>
                    </div>
                )}

            </div>

            {modalOpen && (
                <div className="modal-backdrop" onClick={closeModal}>
                    <div className="modal" onClick={(event) => event.stopPropagation()}>

                        <div className="modal-header">
                            <h2>{editingProject ? "Edit Project" : "New Project"}</h2>
                            <button className="icon-button" onClick={closeModal}>
                                <X size={18} />
                            </button>
                        </div>

                        {formError && <div className="error-banner">{formError}</div>}

                        <form onSubmit={handleSave}>

                            <div className="field">
                                <label htmlFor="project-name">Name</label>
                                <input
                                    id="project-name"
                                    name="name"
                                    type="text"
                                    value={formData.name}
                                    onChange={handleFormChange}
                                    required
                                />
                            </div>

                            <div className="field">
                                <label htmlFor="project-description">Description</label>
                                <textarea
                                    id="project-description"
                                    name="description"
                                    rows={3}
                                    value={formData.description}
                                    onChange={handleFormChange}
                                />
                            </div>

                            <div className="field">
                                <label htmlFor="project-status">Status</label>
                                <select
                                    id="project-status"
                                    name="status"
                                    value={formData.status}
                                    onChange={handleFormChange}
                                >
                                    {STATUS_OPTIONS.map((status) => (
                                        <option key={status} value={status}>
                                            {status}
                                        </option>
                                    ))}
                                </select>
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
                                    {saving ? "Saving..." : "Save Project"}
                                </button>
                            </div>

                        </form>

                    </div>
                </div>
            )}

        </>
    );
}

export default Projects;
