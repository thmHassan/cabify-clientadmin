import React, { useCallback, useEffect, useState } from "react";
import { apiGetMobileAppSetting, apiSaveMobileAppSetting } from "../../../../../../services/SettingsConfigurationServices";

const Toggle = ({ label, checked, onChange }) => (
    <div className="flex items-center justify-between py-2">
        <span className="text-sm text-gray-700">{label}</span>
        <label className="relative inline-flex items-center cursor-pointer">
            <input
                type="checkbox"
                className="sr-only peer"
                checked={checked}
                onChange={onChange}
            />
            <div className={`w-10 h-5 bg-gray-300 rounded-full peer peer-checked:bg-blue-600 
                      peer-focus:ring-2 peer-focus:ring-blue-300 transition-all ${checked ? "" : ""}`}></div>
            <div className={`absolute left-[2px] top-[2px] w-4 h-4 bg-white rounded-full 
                      transition-all peer-checked:translate-x-5 ${checked ? "-ml-[2px]" : ""}`}></div>
        </label>
    </div>
);

const Section = ({ title, children }) => (
    <div className="bg-white rounded-xl border p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-600 mb-4">{title}</h3>
        <div className="grid md:grid-cols-2 gap-x-16 gap-y-2">{children}</div>
    </div>
);

const MobileApp = () => {
    const [mobileAppSettingData, setMobileAppSettingData] = useState({});
    const [tableLoading, setTableLoading] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const fetchMobileAppSetting = useCallback(async () => {
        setTableLoading(true);
        try {
            const response = await apiGetMobileAppSetting();
            if (response?.data?.success === 1) {
                const companyData = response?.data?.data;
                setMobileAppSettingData(companyData || {});
            }
        } catch (error) {
            setMobileAppSettingData({});
        } finally {
            setTableLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMobileAppSetting();
    }, [fetchMobileAppSetting, refreshTrigger]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        const formData = new FormData();
        formData.append("company_name", mobileAppSettingData.company_name);
        formData.append("company_email", mobileAppSettingData.company_email);
        formData.append("company_phone_no", mobileAppSettingData.company_phone_no);
        formData.append("company_business_license", mobileAppSettingData.company_business_license);
        formData.append("company_business_address", mobileAppSettingData.company_business_address);
        formData.append("company_timezone", mobileAppSettingData.company_timezone);
        formData.append("company_description", mobileAppSettingData.company_description);

        try {
            const response = await apiSaveMobileAppSetting(formData);
            if (response?.data?.success === 1) {
            } else {
                setError("Failed to save changes.");
            }
        } catch (err) {
            setError("An error occurred while saving the company profile.");
        } finally {
            setIsSubmitting(false);
        }
    };
    return (
        <div className="w-full mx-auto mt-4 grid gap-4">
            <h2 className="text-xl font-semibold">Mobile App Settings</h2>
            <p className="text-sm text-gray-500">
                Configure mobile app features and permissions
            </p>

            {/* SECTION 1 */}
            <Section title="Title Goes Here" >
                <Toggle label="Meter For Acc Jobs" />
                <Toggle label="Enable Call Customer" />
                <Toggle label="Meter Waiting Charges" />
                <Toggle label="Enable Company Cars" />
                <Toggle label="Enable Bidding" checked />
                <Toggle label="Enable Manual Fares" checked />
                <Toggle label="Enable Fare Meter" checked />
                <Toggle label="Auto Dispatch" checked />
                <Toggle label="Enable Logout Authorisation" />
                <Toggle label="Bidding" checked />
                <Toggle label="Enable Recover Job" checked />
                <Toggle label="Plot Based" checked />
            </Section>

            {/* SECTION 2 */}
            <Section title="Title Goes Here">
                <Toggle label="Disable Panic Button" />
                <Toggle label="Disable Driver Rank" />
                <Toggle label="Disable Change Job Plot" checked />
                <Toggle label="Disable On Break" checked />
                <Toggle label="Ignore Arrive Action" />
            </Section>

            {/* SECTION 3 */}
            <Section title="Title Goes Here">
                <Toggle label="Show Plots" />
                <Toggle label="Show Completed Jobs" />
                <Toggle label="Show Navigation" checked />
                <Toggle label="Show Customer Mobile Number" checked />
                <Toggle label="Show On Zone Changes" checked />
                <Toggle label="Show Alert On Job Late" checked />
                <Toggle label="Disable Reject Job" />
                <Toggle label="Disable No Pickup" />
                <Toggle label="Disable Job Auth" />
                <Toggle label="Hide Details on Job Offer" />
            </Section>
            <div className="w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

                    {/* Break Duration */}
                    <div className="">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                            Break Duration
                        </h2>

                        <label className="block text-gray-600 font-medium mb-2">
                            Minutes
                        </label>
                        <div className="relative">
                            <select className="
              w-full border border-gray-300 rounded-xl px-4 py-3
              text-gray-800 bg-white appearance-none cursor-pointer
              focus:ring-2 focus:ring-blue-300 focus:border-blue-400
            ">
                                <option>All</option>
                            </select>

                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                                ▼
                            </span>
                        </div>
                    </div>

                    {/* Job Notification Timeout */}
                    <div className="">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                            Job Notification Timeout
                        </h2>

                        {/* Seconds */}
                        <label className="block text-gray-600 font-medium mb-2">
                            Seconds
                        </label>
                        <div className="relative mb-6">
                            <select className="
              w-full border border-gray-300 rounded-xl px-4 py-3
              text-gray-800 bg-white appearance-none cursor-pointer
              focus:ring-2 focus:ring-blue-300 focus:border-blue-400
            ">
                                <option>30</option>
                            </select>

                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                                ▼
                            </span>
                        </div>

                        {/* Type */}
                        <label className="block text-gray-600 font-medium mb-2">
                            Type
                        </label>
                        <div className="relative">
                            <select className="
              w-full border border-gray-300 rounded-xl px-4 py-4
              text-gray-800 bg-white appearance-none cursor-pointer
              focus:ring-2 focus:ring-blue-300 focus:border-blue-400
            ">
                                <option>Show Pickup/Destination</option>
                            </select>

                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                                ▼
                            </span>
                        </div>
                    </div>

                </div>
            </div>

        </div>
    );
}



export default MobileApp;