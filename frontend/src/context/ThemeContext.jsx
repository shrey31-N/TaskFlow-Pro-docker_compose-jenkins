import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

const ThemeContext = createContext(null);

const STORAGE_KEY = "theme";

function readStoredTheme() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);

        if (stored === "dark" || stored === "light") {
            return stored;
        }
    } catch {
        // localStorage unavailable (private mode, etc.) - fall through.
    }

    if (
        typeof window !== "undefined" &&
        window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ) {
        return "dark";
    }

    return "light";
}

export function ThemeProvider({ children }) {

    const [theme, setTheme] = useState(readStoredTheme);

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, theme);
        } catch {
            // Ignore - theme just won't persist across reloads.
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme((previous) => (previous === "dark" ? "light" : "dark"));
    };

    const isDark = theme === "dark";

    return (
        <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

// This hook is tightly coupled to ThemeProvider above and always used together.
// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
    return useContext(ThemeContext);
}
