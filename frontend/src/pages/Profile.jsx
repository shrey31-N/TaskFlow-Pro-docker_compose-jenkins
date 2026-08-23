import { useRef, useState } from "react";
import { Camera } from "lucide-react";

import { useAuth } from "../context/AuthContext";
import {
    changePassword,
    updateProfile,
    uploadProfileImage,
} from "../api/authApi";
import { getErrorMessage } from "../utils/errors";

function Profile() {
    const { user, updateUser } = useAuth();

    const [profileForm, setProfileForm] = useState({
        fullName: user?.fullName || "",
        phone: user?.phone || "",
    });
    const [profileSaving, setProfileSaving] = useState(false);
    const [profileError, setProfileError] = useState("");
    const [profileSuccess, setProfileSuccess] = useState("");

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [passwordSaving, setPasswordSaving] = useState(false);
    const [passwordError, setPasswordError] = useState("");
    const [passwordSuccess, setPasswordSuccess] = useState("");

    const [avatarUploading, setAvatarUploading] = useState(false);
    const [avatarError, setAvatarError] = useState("");
    const fileInputRef = useRef(null);

    const displayName = user?.fullName || "there";
    const initial = displayName.charAt(0).toUpperCase();

    const handleProfileChange = (event) => {
        const { name, value } = event.target;
        setProfileForm((previous) => ({ ...previous, [name]: value }));
    };

    const handleProfileSubmit = async (event) => {
        event.preventDefault();
        setProfileSaving(true);
        setProfileError("");
        setProfileSuccess("");

        try {
            const updated = await updateProfile(profileForm);
            updateUser(updated);
            setProfileSuccess("Profile updated.");
        } catch (error) {
            setProfileError(getErrorMessage(error, "Couldn't update profile."));
        } finally {
            setProfileSaving(false);
        }
    };

    const handlePasswordChange = (event) => {
        const { name, value } = event.target;
        setPasswordForm((previous) => ({ ...previous, [name]: value }));
    };

    const handlePasswordSubmit = async (event) => {
        event.preventDefault();
        setPasswordError("");
        setPasswordSuccess("");

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setPasswordError("New password and confirmation don't match.");
            return;
        }

        setPasswordSaving(true);

        try {
            await changePassword(passwordForm);
            setPasswordSuccess("Password changed successfully.");
            setPasswordForm({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
        } catch (error) {
            setPasswordError(getErrorMessage(error, "Couldn't change password."));
        } finally {
            setPasswordSaving(false);
        }
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleAvatarChange = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setAvatarUploading(true);
        setAvatarError("");

        try {
            const updated = await uploadProfileImage(file);
            updateUser(updated);
        } catch (error) {
            setAvatarError(getErrorMessage(error, "Couldn't upload image."));
        } finally {
            setAvatarUploading(false);
            event.target.value = "";
        }
    };

    return (
        <>

            <div className="page-header">
                <div>
                    <h1>Profile</h1>
                    <p>Manage your account details and security settings.</p>
                </div>
            </div>

            <div className="profile-grid">

                <div className="dashboard-card profile-card">

                    <div className="profile-avatar-block">

                        <button
                            className="avatar avatar-large"
                            onClick={handleAvatarClick}
                            disabled={avatarUploading}
                            title="Change profile photo"
                        >
                            {user?.profileImageUrl ? (
                                <img src={user.profileImageUrl} alt={displayName} />
                            ) : (
                                initial
                            )}

                            <span className="avatar-edit-badge">
                                <Camera size={13} />
                            </span>
                        </button>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={handleAvatarChange}
                        />

                        <div>
                            <strong>{displayName}</strong>
                            <p className="muted-cell">
                                {user?.email} &middot; {user?.role === "ADMIN" ? "Admin" : "Member"}
                            </p>
                        </div>

                    </div>

                    {avatarUploading && <p className="empty-hint">Uploading photo...</p>}
                    {avatarError && <div className="error-banner">{avatarError}</div>}

                </div>

                <div className="dashboard-card">

                    <div className="card-header">
                        <div>
                            <h2>Account Details</h2>
                            <span>Update your name and phone number</span>
                        </div>
                    </div>

                    {profileError && <div className="error-banner">{profileError}</div>}
                    {profileSuccess && <div className="success-banner">{profileSuccess}</div>}

                    <form onSubmit={handleProfileSubmit}>

                        <div className="field">
                            <label htmlFor="profile-email">Email</label>
                            <input id="profile-email" type="email" value={user?.email || ""} disabled />
                        </div>

                        <div className="field-row">

                            <div className="field">
                                <label htmlFor="profile-fullName">Full Name</label>
                                <input
                                    id="profile-fullName"
                                    name="fullName"
                                    type="text"
                                    value={profileForm.fullName}
                                    onChange={handleProfileChange}
                                    required
                                />
                            </div>

                            <div className="field">
                                <label htmlFor="profile-phone">Phone</label>
                                <input
                                    id="profile-phone"
                                    name="phone"
                                    type="text"
                                    value={profileForm.phone}
                                    onChange={handleProfileChange}
                                    required
                                />
                            </div>

                        </div>

                        <button
                            type="submit"
                            className="primary-button"
                            disabled={profileSaving}
                        >
                            {profileSaving ? "Saving..." : "Save Changes"}
                        </button>

                    </form>

                </div>

                <div className="dashboard-card">

                    <div className="card-header">
                        <div>
                            <h2>Change Password</h2>
                            <span>Choose a strong, unique password</span>
                        </div>
                    </div>

                    {passwordError && <div className="error-banner">{passwordError}</div>}
                    {passwordSuccess && <div className="success-banner">{passwordSuccess}</div>}

                    <form onSubmit={handlePasswordSubmit}>

                        <div className="field">
                            <label htmlFor="current-password">Current Password</label>
                            <input
                                id="current-password"
                                name="currentPassword"
                                type="password"
                                value={passwordForm.currentPassword}
                                onChange={handlePasswordChange}
                                autoComplete="current-password"
                                required
                            />
                        </div>

                        <div className="field-row">

                            <div className="field">
                                <label htmlFor="new-password">New Password</label>
                                <input
                                    id="new-password"
                                    name="newPassword"
                                    type="password"
                                    value={passwordForm.newPassword}
                                    onChange={handlePasswordChange}
                                    autoComplete="new-password"
                                    required
                                />
                            </div>

                            <div className="field">
                                <label htmlFor="confirm-password">Confirm Password</label>
                                <input
                                    id="confirm-password"
                                    name="confirmPassword"
                                    type="password"
                                    value={passwordForm.confirmPassword}
                                    onChange={handlePasswordChange}
                                    autoComplete="new-password"
                                    required
                                />
                            </div>

                        </div>

                        <button
                            type="submit"
                            className="primary-button"
                            disabled={passwordSaving}
                        >
                            {passwordSaving ? "Updating..." : "Change Password"}
                        </button>

                    </form>

                </div>

            </div>

        </>
    );
}

export default Profile;
