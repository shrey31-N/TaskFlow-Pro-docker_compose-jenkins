import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import {
    getProfile,
    loginUser,
    registerUser,
} from "../api/authApi";

const AuthContext = createContext(null);

function readStoredUser() {
    const raw = localStorage.getItem("user");

    if (!raw) {
        return null;
    }

    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

export function AuthProvider({ children }) {

    const [token, setToken] = useState(
        localStorage.getItem("token")
    );

    const [user, setUser] = useState(readStoredUser);

    const persistSession = (data) => {

        const nextUser =
            data.user ?? {
                id: data.id,
                fullName: data.fullName,
                email: data.email,
                role: data.role,
            };

        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(nextUser));

        setToken(data.token);
        setUser(nextUser);

        return { ...data, user: nextUser };
    };

    const login = async (email, password) => {
        const data = await loginUser({ email, password });
        return persistSession(data);
    };

    const register = async (userData) => {
        const data = await registerUser(userData);

        // Some backends log the user in immediately on registration
        // (returning a token); others just confirm the account was
        // created. Only persist a session if we actually got a token.
        if (data?.token) {
            return persistSession(data);
        }

        return data;
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setToken(null);
        setUser(null);
    };

    // Called after profile edits (name/phone/avatar) so the cached user
    // stays in sync without a full re-login.
    const updateUser = (nextUser) => {
        localStorage.setItem("user", JSON.stringify(nextUser));
        setUser(nextUser);
    };

    // Best-effort refresh of the cached profile whenever we have a token -
    // both on initial load (token read from localStorage) AND right after
    // a fresh login/register (token just set via persistSession), since
    // login/register only return {token}, not the full user profile. Not
    // wired to any loading gate on purpose - if the backend isn't up yet,
    // or the call fails for any other non-401 reason, we just keep
    // whatever was already in state/localStorage instead of breaking the
    // app. A 401 is still handled globally by the axios response
    // interceptor.
    useEffect(() => {
        if (!token) {
            return;
        }

        getProfile()
            .then((profile) => {
                localStorage.setItem("user", JSON.stringify(profile));
                setUser(profile);
            })
            .catch(() => {
                // Ignore - keep the cached user/token as-is.
            });
    }, [token]);

    const isAuthenticated = Boolean(token);
    const isAdmin = user?.role === "ADMIN";

    return (
        <AuthContext.Provider
            value={{
                token,
                user,
                login,
                register,
                logout,
                updateUser,
                isAuthenticated,
                isAdmin,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

// This hook is tightly coupled to AuthProvider above and always used together.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    return useContext(AuthContext);
}
