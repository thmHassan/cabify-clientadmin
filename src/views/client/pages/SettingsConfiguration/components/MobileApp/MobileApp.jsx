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
    // Mapping of toggle labels to API keys
    const toggleKeys = {
        "Meter For Acc Jobs": "mete_for_ac_jobs",
        "Enable Call Customer": "enable_call_cust",
        "Meter Waiting Charges": "meter_waiting_charges",
        "Enable Company Cars": "enable_company_cars",
        "Enable Bidding": "enable_bidding",
        "Enable Manual Fares": "enable_manual_fares",
        "Enable Fare Meter": "enable_fare_meter",
        "Auto Dispatch": "auto_dispatch",
        "Enable Logout Authorisation": "enable_logout_authorisation",
        "Bidding": "bidding",
        "Enable Recover Job": "enable_recover_job",
        "Plot Based": "plot_based",
        "Disable Panic Button": "disable_panic_button",
        "Disable Driver Rank": "disable_driver_rank",
        "Disable Change Job Plot": "disable_change_job_plot",
        "Disable On Break": "disable_on_break",
        "Ignore Arrive Action": "ignore_arrive_action",
        "Show Plots": "show_plots",
        "Show Completed Jobs": "show_completed_jobs",
        "Show Navigation": "show_navigation",
        "Show Customer Mobile Number": "show_customer_mobile_number",
        "Show On Zone Changes": "show_on_zone_changes",
        "Show Alert On Job Late": "show_alert_on_job_late",
        "Disable Reject Job": "disable_reject_job",
        "Disable No Pickup": "disable_no_pickup",
        "Disable Job Auth": "disable_job_auth",
        "Hide Details on Job Offer": "hide_details_on_job_offer"
    };

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
                const data = response?.data?.settings || response?.data?.data || {};
                setMobileAppSettingData(data);
            }
        } catch (error) {
            console.log("Error fetching mobile app settings:", error);
            setMobileAppSettingData({});
        } finally {
            setTableLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMobileAppSetting();
    }, [fetchMobileAppSetting, refreshTrigger]);

    const handleToggleChange = (label, checked) => {
        const key = toggleKeys[label];
        if (key) {
            setMobileAppSettingData(prev => ({
                ...prev,
                [key]: checked ? "enable" : "disable"
            }));
        }
    };

    const getToggleValue = (label) => {
        const key = toggleKeys[label];
        if (key && mobileAppSettingData[key]) {
            return mobileAppSettingData[key] === "enable";
        }
        return false;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        const formData = new FormData();
        
        // Append all toggle values in the format: keys['key_name'] = "enable"/"disable"
        Object.entries(toggleKeys).forEach(([label, key]) => {
            const value = mobileAppSettingData[key] || "disable";
            formData.append(`keys['${key}']`, value);
        });

        try {
            const response = await apiSaveMobileAppSetting(formData);
            if (response?.data?.success === 1) {
                setRefreshTrigger(prev => prev + 1);
            } else {
                setError("Failed to save changes.");
            }
        } catch (err) {
            setError("An error occurred while saving the mobile app settings.");
        } finally {
            setIsSubmitting(false);
        }
    };
    return (
        <form onSubmit={handleSubmit} className="w-full mx-auto mt-4 grid gap-4">
            <h2 className="text-xl font-semibold">Mobile App Settings</h2>
            <p className="text-sm text-gray-500">
                Configure mobile app features and permissions
            </p>

            {tableLoading ? (
                <div className="py-4 text-center text-gray-500">Loading settings...</div>
            ) : (
                <>
                    {/* SECTION 1 */}
                    <Section title="Title Goes Here" >
                        <Toggle 
                            label="Meter For Acc Jobs" 
                            checked={getToggleValue("Meter For Acc Jobs")}
                            onChange={(e) => handleToggleChange("Meter For Acc Jobs", e.target.checked)}
                        />
                        <Toggle 
                            label="Enable Call Customer" 
                            checked={getToggleValue("Enable Call Customer")}
                            onChange={(e) => handleToggleChange("Enable Call Customer", e.target.checked)}
                        />
                        <Toggle 
                            label="Meter Waiting Charges" 
                            checked={getToggleValue("Meter Waiting Charges")}
                            onChange={(e) => handleToggleChange("Meter Waiting Charges", e.target.checked)}
                        />
                        <Toggle 
                            label="Enable Company Cars" 
                            checked={getToggleValue("Enable Company Cars")}
                            onChange={(e) => handleToggleChange("Enable Company Cars", e.target.checked)}
                        />
                        <Toggle 
                            label="Enable Bidding" 
                            checked={getToggleValue("Enable Bidding")}
                            onChange={(e) => handleToggleChange("Enable Bidding", e.target.checked)}
                        />
                        <Toggle 
                            label="Enable Manual Fares" 
                            checked={getToggleValue("Enable Manual Fares")}
                            onChange={(e) => handleToggleChange("Enable Manual Fares", e.target.checked)}
                        />
                        <Toggle 
                            label="Enable Fare Meter" 
                            checked={getToggleValue("Enable Fare Meter")}
                            onChange={(e) => handleToggleChange("Enable Fare Meter", e.target.checked)}
                        />
                        <Toggle 
                            label="Auto Dispatch" 
                            checked={getToggleValue("Auto Dispatch")}
                            onChange={(e) => handleToggleChange("Auto Dispatch", e.target.checked)}
                        />
                        <Toggle 
                            label="Enable Logout Authorisation" 
                            checked={getToggleValue("Enable Logout Authorisation")}
                            onChange={(e) => handleToggleChange("Enable Logout Authorisation", e.target.checked)}
                        />
                        <Toggle 
                            label="Bidding" 
                            checked={getToggleValue("Bidding")}
                            onChange={(e) => handleToggleChange("Bidding", e.target.checked)}
                        />
                        <Toggle 
                            label="Enable Recover Job" 
                            checked={getToggleValue("Enable Recover Job")}
                            onChange={(e) => handleToggleChange("Enable Recover Job", e.target.checked)}
                        />
                        <Toggle 
                            label="Plot Based" 
                            checked={getToggleValue("Plot Based")}
                            onChange={(e) => handleToggleChange("Plot Based", e.target.checked)}
                        />
                    </Section>

                    {/* SECTION 2 */}
                    <Section title="Title Goes Here">
                        <Toggle 
                            label="Disable Panic Button" 
                            checked={getToggleValue("Disable Panic Button")}
                            onChange={(e) => handleToggleChange("Disable Panic Button", e.target.checked)}
                        />
                        <Toggle 
                            label="Disable Driver Rank" 
                            checked={getToggleValue("Disable Driver Rank")}
                            onChange={(e) => handleToggleChange("Disable Driver Rank", e.target.checked)}
                        />
                        <Toggle 
                            label="Disable Change Job Plot" 
                            checked={getToggleValue("Disable Change Job Plot")}
                            onChange={(e) => handleToggleChange("Disable Change Job Plot", e.target.checked)}
                        />
                        <Toggle 
                            label="Disable On Break" 
                            checked={getToggleValue("Disable On Break")}
                            onChange={(e) => handleToggleChange("Disable On Break", e.target.checked)}
                        />
                        <Toggle 
                            label="Ignore Arrive Action" 
                            checked={getToggleValue("Ignore Arrive Action")}
                            onChange={(e) => handleToggleChange("Ignore Arrive Action", e.target.checked)}
                        />
                    </Section>

                    {/* SECTION 3 */}
                    <Section title="Title Goes Here">
                        <Toggle 
                            label="Show Plots" 
                            checked={getToggleValue("Show Plots")}
                            onChange={(e) => handleToggleChange("Show Plots", e.target.checked)}
                        />
                        <Toggle 
                            label="Show Completed Jobs" 
                            checked={getToggleValue("Show Completed Jobs")}
                            onChange={(e) => handleToggleChange("Show Completed Jobs", e.target.checked)}
                        />
                        <Toggle 
                            label="Show Navigation" 
                            checked={getToggleValue("Show Navigation")}
                            onChange={(e) => handleToggleChange("Show Navigation", e.target.checked)}
                        />
                        <Toggle 
                            label="Show Customer Mobile Number" 
                            checked={getToggleValue("Show Customer Mobile Number")}
                            onChange={(e) => handleToggleChange("Show Customer Mobile Number", e.target.checked)}
                        />
                        <Toggle 
                            label="Show On Zone Changes" 
                            checked={getToggleValue("Show On Zone Changes")}
                            onChange={(e) => handleToggleChange("Show On Zone Changes", e.target.checked)}
                        />
                        <Toggle 
                            label="Show Alert On Job Late" 
                            checked={getToggleValue("Show Alert On Job Late")}
                            onChange={(e) => handleToggleChange("Show Alert On Job Late", e.target.checked)}
                        />
                        <Toggle 
                            label="Disable Reject Job" 
                            checked={getToggleValue("Disable Reject Job")}
                            onChange={(e) => handleToggleChange("Disable Reject Job", e.target.checked)}
                        />
                        <Toggle 
                            label="Disable No Pickup" 
                            checked={getToggleValue("Disable No Pickup")}
                            onChange={(e) => handleToggleChange("Disable No Pickup", e.target.checked)}
                        />
                        <Toggle 
                            label="Disable Job Auth" 
                            checked={getToggleValue("Disable Job Auth")}
                            onChange={(e) => handleToggleChange("Disable Job Auth", e.target.checked)}
                        />
                        <Toggle 
                            label="Hide Details on Job Offer" 
                            checked={getToggleValue("Hide Details on Job Offer")}
                            onChange={(e) => handleToggleChange("Hide Details on Job Offer", e.target.checked)}
                        />
                    </Section>
                </>
            )}
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

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div className="flex justify-start gap-3 pt-4">
                <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                    {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
                <button 
                    type="button"
                    className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-100"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}



export default MobileApp;