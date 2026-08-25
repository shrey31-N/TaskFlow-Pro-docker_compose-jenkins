import { useAuth } from "../context/AuthContext";
import AdminDashboard from "./AdminDashboard";
import MemberDashboard from "./MemberDashboard";

function Dashboard() {
    const { isAdmin } = useAuth();

    return isAdmin ? <AdminDashboard /> : <MemberDashboard />;
}

export default Dashboard;
