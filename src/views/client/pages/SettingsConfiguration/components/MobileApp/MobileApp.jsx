import React, { useCallback, useEffect, useState } from "react";
import {
    apiGetMobileAppSetting,
    apiSaveMobileAppSetting,
} from "../../../../../../services/SettingsConfigurationServices";
import toast from "react-hot-toast";

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
            <div className="w-10 h-5 bg-gray-300 rounded-full peer-checked:bg-blue-600 transition-all"></div>
            <div className="absolute left-[2px] top-[2px] w-4 h-4 bg-white rounded-full transition-all peer-checked:translate-x-5"></div>
        </label>
    </div>
);

const Section = ({ children }) => (
    <div className="bg-[#F5F9FE] rounded-xl p-4 shadow-sm text-[#252525]">
        <div className="grid md:grid-cols-2 gap-x-16 gap-y-2 text-[#252525]">
            {children}
        </div>
    </div>
);

const MobileApp = () => {
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
        "Hide Details on Job Offer": "hide_details_on_job_offer",
    };

    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const fetchSettings = useCallback(async () => {
        setLoading(true);
        try {
            const res = await apiGetMobileAppSetting();

            if (res?.data?.success === 1) {
                const apiSettings = res.data.setting || [];


                const formatted = {};
                apiSettings.forEach((item) => {
                    const cleanKey = item.key.replace(/'/g, "");
                    formatted[cleanKey] = item.value;
                });

                setSettings(formatted);
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to load settings");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const handleToggleChange = (label, checked) => {
        const key = toggleKeys[label];
        setSettings((prev) => ({
            ...prev,
            [key]: checked ? "enable" : "disable",
        }));
    };

    const isChecked = (label) => {
        const key = toggleKeys[label];
        return settings[key] === "enable";
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        const formData = new FormData();
        Object.values(toggleKeys).forEach((key) => {
            formData.append(`keys['${key}']`, settings[key] || "disable");
        });

        try {
            const res = await apiSaveMobileAppSetting(formData);
            if (res?.data?.success === 1) {
                toast.success("Settings saved successfully");
                fetchSettings();
            } else {
                toast.error("Save failed");
            }
        } catch (err) {
            toast.error("Something went wrong");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <p className="text-center py-6">Loading settings...</p>;
    }

    return (
        <form onSubmit={handleSubmit} className="">
            <h2 className="text-2xl font-semibold text-[#252525]">Mobile App Settings</h2>
            <p className="text-[#6C6C6C] mb-6">Configure mobile app features and permissions</p>

            <Section>
                {Object.keys(toggleKeys).map((label) => (
                    <Toggle
                        key={label}
                        label={label}
                        checked={isChecked(label)}
                        onChange={(e) =>
                            handleToggleChange(label, e.target.checked)
                        }
                    />
                ))}
            </Section>

            <div className="flex justify-end gap-3 pt-4">
                <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-[#1F41BB] text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                    {saving ? "Saving..." : "Save Changes"}
                </button>
            </div>
        </form>
    );
};

export default MobileApp;