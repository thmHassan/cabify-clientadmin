import React, { useState } from "react";
import { apiSaveUpdatePassword } from "../../../../../../services/SettingsConfigurationServices";
import toast from 'react-hot-toast';

const Security = () => {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!currentPassword || !newPassword) {
            toast.error("All fields are required");
            return;
        }

        if (newPassword.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        try {
            setLoading(true);

            const formData = new FormData();
            formData.append("current_password", currentPassword);
            formData.append("new_password", newPassword);

            const response = await apiSaveUpdatePassword(formData);

            if (response?.data?.error === 0) {
                toast.success(response?.data?.message || "Password updated successfully");

                setCurrentPassword("");
                setNewPassword("");
            } else {
                // toast.error(response?.data?.message || "Failed to update password");
            }
        } catch (error) {
            const errorMsg =
                error?.response?.data?.message ||
                error?.message ||
                "Something went wrong";

            toast.error(errorMsg);
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
                    <label className="block text-sm font-medium mb-1">Current Password</label>
                    <input
                        type="password"
                        placeholder="Enter current password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="sm:px-5 px-4 sm:py-[21px] py-4 border border-[#8D8D8D] rounded-lg w-full h-10 shadow-[-4px_4px_6px_0px_#0000001F] placeholder:text-[#6C6C6C] sm:text-base text-sm leading-[22px] font-semibold disabled:bg-gray-50"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">New Password</label>
                    <input
                        type="password"
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="sm:px-5 px-4 sm:py-[21px] py-4 border border-[#8D8D8D] rounded-lg w-full h-10 shadow-[-4px_4px_6px_0px_#0000001F] placeholder:text-[#6C6C6C] sm:text-base text-sm leading-[22px] font-semibold disabled:bg-gray-50"
                    />
                </div>
            </div>

            <div className="flex gap-4 mt-6">
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="px-4 py-2 bg-[#1F41BB] text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? "Saving..." : "Save Changes"}
                </button>

                <button
                    type="button"
                    onClick={() => {
                        setCurrentPassword("");
                        setNewPassword("");
                    }}
                    className="px-4 py-2 border border-[#1F41BB] rounded-lg text-[#1F41BB]"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default Security;
