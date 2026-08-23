// The backend's error envelope is {timestamp, status, error, message, path}.
// This pulls a human-readable message out of that shape (or an axios
// network-level error) so pages can show something useful.
export function getErrorMessage(error, fallback = "Something went wrong. Please try again.") {
    return (
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        fallback
    );
}
