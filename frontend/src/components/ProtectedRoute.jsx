import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Used as a layout route (see App.jsx): guards every nested route beneath
// it and renders an <Outlet /> instead of taking a `children` prop, so the
// authenticated shell (Layout) and its pages can be nested underneath it
// without each page re-checking auth itself.
function ProtectedRoute() {
    const { isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}

export default ProtectedRoute;
