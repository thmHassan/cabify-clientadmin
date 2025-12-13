import React, { useState } from "react";
import { apiSaveUpdatePassword } from "../../../../../../services/SettingsConfigurationServices";

const Security = () => {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!currentPassword || !newPassword) {
            console.error("All fields are required");
            return;
        }

        if (newPassword.length < 6) {
            console.error("Password must be at least 6 characters");
            return;
        }

        try {
            setLoading(true);

            const formData = new FormData();
            formData.append("current_password", currentPassword);
            formData.append("new_password", newPassword);

            const response = await apiSaveUpdatePassword(formData);

            if (response?.success === true || response?.success === 1) {
                console.log("Password updated successfully");

                setCurrentPassword("");
                setNewPassword("");
            } else {
                console.error(response?.message || "Failed to update password");
            }
        } catch (error) {
            console.error(
                error?.response?.data?.message || error.message || "API Error"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full mx-auto">
            <h2 className="text-xl font-semibold">Security Settings</h2>
            <p className="text-gray-600 mt-1 font-semibold">
                Manage your account security and access controls
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                    <label className="font-medium">Current Password</label>
                    <input
                        type="password"
                        placeholder="Enter current password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full border rounded-lg px-4 py-3 mt-1 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="font-medium">New Password</label>
                    <input
                        type="password"
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full border rounded-lg px-4 py-3 mt-1 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            <div className="flex gap-4 mt-6">
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? "Saving..." : "Save Changes"}
                </button>

                <button
                    type="button"
                    onClick={() => {
                        setCurrentPassword("");
                        setNewPassword("");
                    }}
                    className="border border-blue-600 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default Security;
