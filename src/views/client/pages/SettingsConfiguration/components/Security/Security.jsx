import React from "react";

const Security = () => {
    return (
<div className="w-full mx-auto">
            {/* Header */}
            <h2 className="text-xl font-semibold">Security Settings</h2>
            <p className="text-gray-600 mt-1 font-semibold">
                Manage your account security and access controls
            </p>

            {/* Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">

                {/* Current Password */}
                <div>
                    <label className="font-medium">Current Password</label>
                    <div className="relative mt-1">
                        <input
                            placeholder="Enter Password"
                            className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            type="button"
                            className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                        >
                        </button>
                    </div>
                </div>

                {/* Confirm Password */}
                <div>
                    <label className="font-medium">Confirm Password</label>
                    <div className="relative mt-1">
                        <input
                            placeholder="Enter Password"
                            className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            type="button"
                            className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                        >
                        </button>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-6">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                    Save Changes
                </button>
                <button className="border border-blue-600 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50">
                    Cancel
                </button>
            </div>
        </div>    )
}

export default Security;