import React from "react";

const CompanyProfile = () => {
    return (
        <div className="w-full mx-auto">
            <h2 className="text-2xl font-semibold text-gray-800">Company Profile</h2>
            <p className="text-gray-500 mb-6">
                Update your company information and branding
            </p>

            <form className="grid gap-3">
                {/* Row 1 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block font-medium text-gray-700 mb-1">
                            Company Name
                        </label>
                        <input
                            type="text"
                            placeholder="Enter Name"
                            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
                        />
                    </div>

                    <div>
                        <label className="block font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            placeholder="Enter Email"
                            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
                        />
                    </div>
                </div>

                {/* Row 2 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block font-medium text-gray-700 mb-1">
                            Mobile Number
                        </label>
                        <input
                            type="text"
                            placeholder="Enter Mobile Number"
                            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
                        />
                    </div>

                    <div>
                        <label className="block font-medium text-gray-700 mb-1">
                            Business License
                        </label>
                        <input
                            type="text"
                            placeholder="Enter Telephone Number"
                            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
                        />
                    </div>
                </div>

                {/* Row 3 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block font-medium text-gray-700 mb-1">
                            Business Address
                        </label>
                        <input
                            type="text"
                            placeholder="Enter Mobile Number"
                            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
                        />
                    </div>

                    <div>
                        <label className="block font-medium text-gray-700 mb-1">
                            Time Zone
                        </label>
                        <input
                            type="text"
                            placeholder="Enter time zone"
                            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
                        />
                    </div>
                </div>

                {/* Description */}
                <div>
                    <label className="block font-medium text-gray-700 mb-1">
                        Company Description
                    </label>
                    <textarea
                        rows="4"
                        placeholder="Enter Description"
                        className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
                    />
                </div>

                {/* Buttons */}
                <div className="flex space-x-4 pt-4">
                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
                    >
                        Save Changes
                    </button>

                    <button
                        type="button"
                        className="border border-gray-400 px-6 py-2 rounded-md hover:bg-gray-50 transition"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    )
}

export default CompanyProfile;