import {
    BrowserRouter,
    Routes,
    Route,
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Tasks from "./pages/Tasks";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import Users from "./pages/Users";

import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

function App() {
    return (
        <BrowserRouter>
            <ThemeProvider>
                <AuthProvider>

                    <Routes>

                        <Route path="/" element={<Login />} />
                        <Route path="/register" element={<Register />} />

                        <Route element={<ProtectedRoute />}>
                            <Route element={<Layout />}>
                                <Route path="/dashboard" element={<Dashboard />} />
                                <Route path="/projects" element={<Projects />} />
                                <Route path="/tasks" element={<Tasks />} />
                                <Route path="/notifications" element={<Notifications />} />
                                <Route path="/profile" element={<Profile />} />
                                <Route path="/users" element={<Users />} />
                            </Route>
                        </Route>

                    </Routes>

                </AuthProvider>
            </ThemeProvider>
        </BrowserRouter>
    );
}

export default App;
