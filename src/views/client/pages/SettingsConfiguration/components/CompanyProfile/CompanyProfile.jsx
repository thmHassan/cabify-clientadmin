import React, { useCallback, useEffect, useState } from "react";
import { apiSaveCompanyProfile } from "../../../../../../services/SettingsConfigurationServices";
import { apiGetCompanyProfile } from "../../../../../../services/SettingsConfigurationServices";
import toast from "react-hot-toast";

const CompanyProfile = () => {
    const [companyProfileData, setCompanyProfileData] = useState({});
    const [tableLoading, setTableLoading] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({});

    const timeZoneOptions = [
        { value: "UTC", label: "UTC" },
        { value: "Asia/Kolkata", label: "Asia/Kolkata (IST)" },
        { value: "Asia/Dubai", label: "Asia/Dubai" },
        { value: "Europe/London", label: "Europe/London" },
        { value: "Europe/Paris", label: "Europe/Paris" },
        { value: "America/New_York", label: "America/New_York" },
        { value: "America/Los_Angeles", label: "America/Los_Angeles" },
    ];

    // ✅ Phone number validation — only digits, 7 to 15 characters
    const phoneRegex = /^[0-9]{7,15}$/;

    const phoneFields = [
        { key: "company_phone_no", label: "Mobile Number" },
        { key: "support_contact_no", label: "Support Contact Number" },
        { key: "support_emergency_no", label: "Support Emergency Number" },
        { key: "support_rescue_number", label: "Support Rescue Number" },
    ];

    const validatePhoneFields = (data) => {
        const errors = {};

        phoneFields.forEach(({ key, label }) => {
            const value = data[key] || "";
            if (!value.trim()) {
                errors[key] = `${label} is required`;
            } else if (!phoneRegex.test(value.trim())) {
                errors[key] = `${label} must be a valid phone number (7–15 digits)`;
            }
        });

        return errors;
    };

    const fetchCompanieProfile = useCallback(async () => {
        setTableLoading(true);
        try {
            const response = await apiGetCompanyProfile();
            if (response?.data?.success === 1) {
                const companyData = response?.data?.data;
                setCompanyProfileData(companyData || {});
            }
        } catch (error) {
            setCompanyProfileData({});
        } finally {
            setTableLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCompanieProfile();
    }, [fetchCompanieProfile, refreshTrigger]);

    // ✅ Handle change + clear error on input
    const handleChange = (field, value) => {
        setCompanyProfileData((prev) => ({ ...prev, [field]: value }));

        // Clear field error on change
        if (fieldErrors[field]) {
            setFieldErrors((prev) => {
                const updated = { ...prev };
                delete updated[field];
                return updated;
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // ✅ Validate phone fields before submitting
        const errors = validatePhoneFields(companyProfileData);
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        setFieldErrors({});
        setIsSubmitting(true);

        const formData = new FormData();
        formData.append("company_name", companyProfileData.company_name || "");
        formData.append("company_email", companyProfileData.company_email || "");
        formData.append("company_phone_no", companyProfileData.company_phone_no || "");
        formData.append("company_business_license", companyProfileData.company_business_license || "");
        formData.append("company_business_address", companyProfileData.company_business_address || "");
        formData.append("company_timezone", companyProfileData.company_timezone || "");
        formData.append("company_description", companyProfileData.company_description || "");
        formData.append("support_rescue_number", companyProfileData.support_rescue_number || "");
        formData.append("support_emergency_no", companyProfileData.support_emergency_no || "");
        formData.append("support_contact_no", companyProfileData.support_contact_no || "");

        try {
            const response = await apiSaveCompanyProfile(formData);

            if (response?.data?.success === 1) {
                toast.success("Company profile updated successfully");
                setRefreshTrigger((prev) => prev + 1);
            } else {
                const msg = response?.data?.message || "Failed to save changes";
                toast.error(msg);
                setError(msg);
            }
        } catch (err) {
            const errorMsg =
                err?.response?.data?.message ||
                "An error occurred while saving the company profile";
            toast.error(errorMsg);
            setError(errorMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    // ✅ Reusable input class with error highlight
    const inputClass = (fieldKey) =>
        `sm:px-5 px-4 sm:py-[21px] py-4 border rounded-lg w-full h-10 shadow-[-4px_4px_6px_0px_#0000001F] placeholder:text-[#6C6C6C] sm:text-base text-sm leading-[22px] font-semibold disabled:bg-gray-50 ${fieldErrors[fieldKey] ? "border-red-500" : "border-[#8D8D8D]"
        }`;

    return (
        <div className="w-full mx-auto">
            <h2 className="text-2xl font-semibold text-gray-800">Company Profile</h2>
            <p className="text-gray-500 mb-6">Update your company information and branding</p>

            <form className="grid gap-3" onSubmit={handleSubmit}>

                {/* Row 1: Company Name + Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Company Name</label>
                        <input
                            type="text"
                            value={companyProfileData?.company_name || ""}
                            placeholder="Enter Name"
                            className={inputClass("company_name")}
                            onChange={(e) => handleChange("company_name", e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input
                            type="email"
                            value={companyProfileData?.company_email || ""}
                            placeholder="Enter Email"
                            className={inputClass("company_email")}
                            onChange={(e) => handleChange("company_email", e.target.value)}
                        />
                    </div>
                </div>

                {/* Row 2: Mobile Number + Business License */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Mobile Number</label>
                        <input
                            type="text"
                            value={companyProfileData?.company_phone_no || ""}
                            placeholder="Enter Mobile Number"
                            className={inputClass("company_phone_no")}
                            onChange={(e) => handleChange("company_phone_no", e.target.value)}
                        />
                        {fieldErrors.company_phone_no && (
                            <p className="text-red-500 text-xs mt-1">{fieldErrors.company_phone_no}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Business License</label>
                        <input
                            type="text"
                            value={companyProfileData?.company_business_license || ""}
                            placeholder="Enter Business License"
                            className={inputClass("company_business_license")}
                            onChange={(e) => handleChange("company_business_license", e.target.value)}
                        />
                    </div>
                </div>

                {/* Row 3: Business Address + Timezone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Business Address</label>
                        <input
                            type="text"
                            value={companyProfileData?.company_business_address || ""}
                            placeholder="Enter Business Address"
                            className={inputClass("company_business_address")}
                            onChange={(e) => handleChange("company_business_address", e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Time Zone</label>
                        <select
                            value={companyProfileData?.company_timezone || ""}
                            onChange={(e) => handleChange("company_timezone", e.target.value)}
                            className="sm:px-5 px-4 py-3 border border-[#8D8D8D] rounded-lg w-full shadow-[-4px_4px_6px_0px_#0000001F] text-sm font-semibold disabled:bg-gray-50"
                        >
                            <option value="">Select Time Zone</option>
                            {timeZoneOptions.map((tz) => (
                                <option key={tz.value} value={tz.value}>
                                    {tz.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* ✅ Support Contact Number with error */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Support Contact Number</label>
                        <input
                            type="text"
                            value={companyProfileData?.support_contact_no || ""}
                            placeholder="Enter Support Contact Number"
                            className={inputClass("support_contact_no")}
                            onChange={(e) => handleChange("support_contact_no", e.target.value)}
                        />
                        {fieldErrors.support_contact_no && (
                            <p className="text-red-500 text-xs mt-1">{fieldErrors.support_contact_no}</p>
                        )}
                    </div>

                    {/* ✅ Support Emergency Number with error */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Support Emergency Number</label>
                        <input
                            type="text"
                            value={companyProfileData?.support_emergency_no || ""}
                            placeholder="Enter Support Emergency Number"
                            className={inputClass("support_emergency_no")}
                            onChange={(e) => handleChange("support_emergency_no", e.target.value)}
                        />
                        {fieldErrors.support_emergency_no && (
                            <p className="text-red-500 text-xs mt-1">{fieldErrors.support_emergency_no}</p>
                        )}
                    </div>

                    {/* ✅ Support Rescue Number with error */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Support Rescue Number</label>
                        <input
                            type="text"
                            value={companyProfileData?.support_rescue_number || ""}
                            placeholder="Enter Support Rescue Number"
                            className={inputClass("support_rescue_number")}
                            onChange={(e) => handleChange("support_rescue_number", e.target.value)}
                        />
                        {fieldErrors.support_rescue_number && (
                            <p className="text-red-500 text-xs mt-1">{fieldErrors.support_rescue_number}</p>
                        )}
                    </div>
                </div>

                {/* Company Description */}
                <div>
                    <label className="block text-sm font-medium mb-1">Company Description</label>
                    <textarea
                        rows="3"
                        value={companyProfileData?.company_description || ""}
                        placeholder="Enter Description"
                        className="sm:px-5 px-4 sm:py-[21px] py-4 border border-[#8D8D8D] rounded-lg w-full shadow-[-4px_4px_6px_0px_#0000001F] placeholder:text-[#6C6C6C] sm:text-base text-sm leading-[22px] font-semibold disabled:bg-gray-50"
                        onChange={(e) => handleChange("company_description", e.target.value)}
                    />
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <div className="flex justify-end space-x-4 pt-4">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-[#1F41BB] text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        {isSubmitting ? "Saving..." : "Save Changes"}
                    </button>

                    <button
                        type="button"
                        className="px-4 py-2 border border-[#1F41BB] rounded-lg text-[#1F41BB]"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CompanyProfile;