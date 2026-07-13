import React, { useEffect, useMemo, useState } from "react";
import { apiGetBookingSystem } from "../../../../../../services/AddBookingServices";
import {
    apiGetDispatchSystem,
    apiSaveDispatchSystem,
    apiSavePassword,
} from "../../../../../../services/SettingsConfigurationServices";
import toast from "react-hot-toast";
import Button from "../../../../../../components/ui/Button/Button";
import CardContainer from "../../../../../../components/shared/CardContainer";
import { useSocket } from "../../../../../../components/routes/SocketProvider";

const RETRY_STEP_KEY = "show_only_after_not_selected_in_auto_dispatch";
const HIDDEN_TRY_STEP_KEYS = new Set([
    "show_only_after_not_selected_in_auto_dispatch_first_try",
    "show_only_after_not_selected_in_auto_dispatch_second_try",
    "show_only_after_not_selected_in_auto_dispatch_third_try",
]);

const isRetryFollowUp = (followUp) => followUp.stepKey === RETRY_STEP_KEY;

const getThirdTryChild = (followUp) =>
    followUp.children?.find((child) =>
        child.stepKey === "show_only_after_not_selected_in_auto_dispatch_third_try"
    );

const applyDefaultThirdTry = (state, followUp) => {
    if (!isRetryFollowUp(followUp) || !state[followUp.key]) return state;

    const nextState = { ...state };
    const thirdTryChild = getThirdTryChild(followUp);

    followUp.children?.forEach((child) => {
        if (HIDDEN_TRY_STEP_KEYS.has(child.stepKey)) {
            nextState[child.key] = child.key === thirdTryChild?.key;
        }
    });

    return nextState;
};

const DEFAULT_SYSTEM_PRIORITIES = {
    auto_dispatch_plot_base: 1,
    bidding_fixed_fare_plot_base: 2,
    auto_dispatch_nearest_driver: 3,
    manual_dispatch_only: 4,
    bidding: 5,
};

const DEFAULT_RELEASE_SETTINGS = {
    enabled: true,
    lead_minutes: 60,
    mode: "auto_then_bidding",
    modes: ["auto_dispatch", "bidding", "auto_then_bidding", "manual_review"],
};

const RELEASE_MODE_LABELS = {
    auto_dispatch: "Auto Dispatch",
    bidding: "Bidding",
    auto_then_bidding: "Auto then Bidding",
    manual_review: "Manual Review",
};

const RELEASE_LEAD_PRESETS = [15, 30, 60, 120];
const DEFAULT_DRIVER_JOB_START_WINDOW_MINUTES = 120;
const DRIVER_JOB_START_WINDOW_PRESETS = [60, 120, 180, 240];

const normalizeReleaseSettings = (raw) => {
    const value = raw && typeof raw === "object" ? raw : {};
    const leadMinutes = Number(value.lead_minutes);
    const mode = value.mode || DEFAULT_RELEASE_SETTINGS.mode;
    const modes =
        Array.isArray(value.modes) && value.modes.length
            ? value.modes
            : DEFAULT_RELEASE_SETTINGS.modes;

    return {
        enabled: value.enabled !== false && value.enabled !== 0 && value.enabled !== "0",
        lead_minutes: Number.isFinite(leadMinutes)
            ? Math.max(0, Math.min(Math.round(leadMinutes), 1440))
            : DEFAULT_RELEASE_SETTINGS.lead_minutes,
        mode: modes.includes(mode) ? mode : DEFAULT_RELEASE_SETTINGS.mode,
        modes,
    };
};

const normalizeDriverJobStartWindowMinutes = (value) => {
    const minutes = Number(value);
    return Number.isFinite(minutes)
        ? Math.max(0, Math.min(Math.round(minutes), 1440))
        : DEFAULT_DRIVER_JOB_START_WINDOW_MINUTES;
};

const getDispatchItem = (systemKey) =>
    dispatchData.find((item) => item.systemKey === systemKey);

const getSystemKeyForFollowUpKey = (followUpKey) => {
    for (const dispatchItem of dispatchData) {
        for (const followUp of dispatchItem.followUps) {
            if (followUp.key === followUpKey) {
                return dispatchItem.systemKey;
            }
            if (followUp.children?.some((child) => child.key === followUpKey)) {
                return dispatchItem.systemKey;
            }
        }
    }
    return null;
};

const clearSystemFollowUps = (systemKey, state) => {
    const dispatchItem = getDispatchItem(systemKey);
    if (!dispatchItem) return state;

    const nextState = { ...state };
    dispatchItem.followUps.forEach((followUp) => {
        nextState[followUp.key] = false;
        followUp.children?.forEach((child) => {
            nextState[child.key] = false;
        });
    });
    return nextState;
};

const systemHasEnabledFollowUps = (systemKey, state) => {
    const dispatchItem = getDispatchItem(systemKey);
    if (!dispatchItem) return false;

    return dispatchItem.followUps.some((followUp) => {
        if (state[followUp.key]) return true;
        return followUp.children?.some((child) => state[child.key]);
    });
};

const clearOtherDispatchSystems = (activeSystemKey, state) =>
    dispatchData.reduce((nextState, dispatchItem) => {
        if (dispatchItem.systemKey === activeSystemKey) {
            return nextState;
        }
        return clearSystemFollowUps(dispatchItem.systemKey, nextState);
    }, state);

const dispatchData = [
    {
        type: "auto_dispatch",
        systemKey: "auto_dispatch_plot_base",
        followUps: [
            {
                label: "Immediately show on dispatcher panel",
                key: "p1_immediate",
                stepKey: "immediately_show_on_dispatcher_panel",
                type: "toggle",
                group: "p1_main",
            },
            {
                label: "Show only after not selected in auto dispatch",
                key: "p1_retry",
                stepKey: "show_only_after_not_selected_in_auto_dispatch",
                type: "toggle",
                group: "p1_main",
                children: [
                    { label: "First try", key: "p1_first", stepKey: "show_only_after_not_selected_in_auto_dispatch_first_try" },
                    { label: "Second try", key: "p1_second", stepKey: "show_only_after_not_selected_in_auto_dispatch_second_try" },
                    { label: "Third try onwards", key: "p1_third", stepKey: "show_only_after_not_selected_in_auto_dispatch_third_try" },
                ],
            },
            { label: "Put in bidding panel", key: "p1_bidding", stepKey: "put_in_bidding_panel", type: "checkbox" },
        ],
    },
    {
        type: "bidding",
        systemKey: "bidding_fixed_fare_plot_base",
        followUps: [
            { label: "Wait Time ___ seconds", key: "p2_wait", stepKey: "wait_time_seconds", type: "toggle", group: "p2_main" },
            { label: "Immediately show on dispatcher panel", key: "p2_immediate", stepKey: "immediately_show_on_dispatcher_panel", type: "toggle", group: "p2_main" },
            {
                label: "Shows up after first rejection or wait time elapsed",
                key: "p2_reject",
                stepKey: "shows_up_after_first_rejection_or_wait_time_elapsed",
                type: "toggle",
                group: "p2_main",
            },
        ],
    },
    {
        type: "auto_dispatch",
        systemKey: "auto_dispatch_nearest_driver",
        followUps: [
            // { label: "Wait Time ___ seconds", key: "p3_wait", stepKey: "wait_time_seconds", type: "toggle", group: "p3_main" },
            { label: "Immediately show on dispatcher panel", key: "p3_immediate", stepKey: "immediately_show_on_dispatcher_panel", type: "toggle", group: "p3_main" },
            {
                label: "Show only after not selected in auto dispatch",
                key: "p3_retry",
                stepKey: "show_only_after_not_selected_in_auto_dispatch",
                type: "toggle",
                group: "p3_main",
                children: [
                    { label: "First try", key: "p3_first", stepKey: "show_only_after_not_selected_in_auto_dispatch_first_try" },
                    { label: "Second try", key: "p3_second", stepKey: "show_only_after_not_selected_in_auto_dispatch_second_try" },
                    { label: "Third try onwards", key: "p3_third", stepKey: "show_only_after_not_selected_in_auto_dispatch_third_try" },
                ],
            },
            { label: "Put in bidding panel", key: "p3_bidding", stepKey: "put_in_bidding_panel", type: "checkbox" },
        ],
    },
    {
        type: "auto_dispatch",
        systemKey: "manual_dispatch_only",
        followUps: [
            { label: "Manual Dispatch Only", key: "p4_manual", stepKey: "manual_dispatch_only" },
        ],
    },
    {
        type: "bidding",
        systemKey: "bidding",
        followUps: [
            { label: "Immediately show on dispatcher panel", key: "p5_immediate", stepKey: "immediately_show_on_dispatcher_panel", type: "toggle", group: "p5_main" },
            {
                label: "Show only after not selected in auto dispatch",
                key: "p5_retry",
                stepKey: "show_only_after_not_selected_in_auto_dispatch",
                type: "toggle",
                group: "p5_main",
                children: [
                    { label: "If not received bid in first 10 seconds", key: "p5_10s", stepKey: "if_not_received_bid_in_first_10_seconds" },
                    { label: "First try", key: "p5_first", stepKey: "show_only_after_not_selected_in_auto_dispatch_first_try" },
                    { label: "Second try", key: "p5_second", stepKey: "show_only_after_not_selected_in_auto_dispatch_second_try" },
                    { label: "Third try onwards", key: "p5_third", stepKey: "show_only_after_not_selected_in_auto_dispatch_third_try" },
                ],
            },
        ],
    },
];

const DispatchSystem = () => {
    const [checkedState, setCheckedState] = useState({});
    const [systemStatus, setSystemStatus] = useState({});
    const [bookingSystem, setBookingSystem] = useState(null);
    const [adminDispatchSystem, setAdminDispatchSystem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showWarning, setShowWarning] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [password, setPassword] = useState("");
    const [verifying, setVerifying] = useState(false);
    const [selectedDispatchSystem, setSelectedDispatchSystem] = useState(null);
    const [releaseSettings, setReleaseSettings] = useState(DEFAULT_RELEASE_SETTINGS);
    const [driverJobStartWindowMinutes, setDriverJobStartWindowMinutes] = useState(
        DEFAULT_DRIVER_JOB_START_WINDOW_MINUTES
    );
    const socket = useSocket();

    const getSystemDisplayName = (key) =>
    ({
        auto_dispatch_plot_base: "Auto Dispatch Plot Based",
        bidding_fixed_fare_plot_base: "Bidding Fixed Fare - Plot Based",
        auto_dispatch_nearest_driver: "Auto Dispatch Nearest Driver",
        manual_dispatch_only: "Manual Dispatch Only",
        bidding: "Bidding",
        bidding_fixed_fare_nearest_driver: "Bidding Fixed Fare - Nearest Driver",
    }[key] || key);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        const newSystemStatus = {};

        dispatchData.forEach((p) => {
            if (p.systemKey === "manual_dispatch_only") {
                newSystemStatus[p.systemKey] = !!checkedState["p4_manual"];
            } else {
                const hasAnyEnabled = p.followUps.some((f) => {
                    if (checkedState[f.key]) return true;
                    if (f.children) {
                        return f.children.some((c) => checkedState[c.key]);
                    }
                    return false;
                });
                newSystemStatus[p.systemKey] = hasAnyEnabled;
            }
        });

        setSystemStatus(newSystemStatus);
    }, [checkedState]);

    const isAnyOptionConfigured = useMemo(() => {
        if (!selectedDispatchSystem || !systemStatus[selectedDispatchSystem]) {
            return false;
        }

        if (selectedDispatchSystem === "manual_dispatch_only") {
            return true;
        }

        const dispatchItem = dispatchData.find((d) => d.systemKey === selectedDispatchSystem);
        if (!dispatchItem) return false;

        return dispatchItem.followUps.some((f) => {
            if (checkedState[f.key]) return true;
            if (f.children) {
                return f.children.some((c) => checkedState[c.key]);
            }
            return false;
        });
    }, [selectedDispatchSystem, systemStatus, checkedState]);

    const fetchData = async () => {
        try {
            const bookingRes = await apiGetBookingSystem();
            let companyBookingSystem = null;
            let companyAdminDispatchSystem = null;

            if (bookingRes?.data?.success === 1) {
                companyBookingSystem = bookingRes.data.company_booking_system;
                companyAdminDispatchSystem = bookingRes.data.company_admin_dispatch_sytem;

                setBookingSystem(companyBookingSystem);
                setAdminDispatchSystem(companyAdminDispatchSystem);
            }

            const dispatchRes = await apiGetDispatchSystem();
            if (dispatchRes?.data?.success === 1) {
                const initial = {};
                setReleaseSettings(
                    normalizeReleaseSettings(dispatchRes.data.release_settings)
                );
                setDriverJobStartWindowMinutes(
                    normalizeDriverJobStartWindowMinutes(
                        dispatchRes.data.driver_job_start_window_minutes
                    )
                );

                dispatchRes.data.data.forEach((item) => {
                    dispatchData.forEach((p) => {
                        if (p.systemKey !== item.dispatch_system) return;

                        if (p.systemKey === "manual_dispatch_only") {
                            if (item.steps === null || item.steps === "manual_only" || item.steps === "manual_dispatch_only") {
                                p.followUps.forEach((f) => {
                                    initial[f.key] = item.status === "enable";
                                });
                            }
                            return;
                        }

                        p.followUps.forEach((f) => {
                            if (f.stepKey === item.steps) {
                                initial[f.key] = item.status === "enable";
                            }

                            let hasEnabledChild = false;
                            f.children?.forEach((c) => {
                                if (c.stepKey === item.steps) {
                                    initial[c.key] = item.status === "enable";
                                    if (item.status === "enable") {
                                        hasEnabledChild = true;
                                    }
                                }
                            });

                            if (hasEnabledChild && f.children) {
                                initial[f.key] = true;
                            }
                        });
                    });
                });

                const activeSystem =
                    dispatchData.find((dispatchItem) =>
                        systemHasEnabledFollowUps(dispatchItem.systemKey, initial)
                    )?.systemKey || null;

                const normalizedInitial = activeSystem
                    ? clearOtherDispatchSystems(
                        activeSystem,
                        dispatchData.reduce((state, dispatchItem) => {
                            dispatchItem.followUps.forEach((followUp) => {
                                Object.assign(state, applyDefaultThirdTry(state, followUp));
                            });
                            return state;
                        }, initial)
                    )
                    : dispatchData.reduce((state, dispatchItem) => {
                        dispatchItem.followUps.forEach((followUp) => {
                            Object.assign(state, applyDefaultThirdTry(state, followUp));
                        });
                        return state;
                    }, initial);

                setSelectedDispatchSystem(activeSystem);
                setCheckedState(normalizedInitial);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const getFilteredDispatchData = () => {
        if (!adminDispatchSystem) return [];

        if (adminDispatchSystem === "both") {
            if (!bookingSystem || bookingSystem === "both") return dispatchData;
            return dispatchData.filter((d) => d.type === bookingSystem);
        }

        return dispatchData.filter((d) => d.type === adminDispatchSystem);
    };

    const filteredDispatchData = getFilteredDispatchData();

    const toggle = (key) => {
        setCheckedState((prev) => {
            const willEnable = !prev[key];
            let nextState = { ...prev, [key]: willEnable };

            if (willEnable) {
                const systemKey = getSystemKeyForFollowUpKey(key);
                if (systemKey) {
                    setSelectedDispatchSystem(systemKey);
                    nextState = clearOtherDispatchSystems(systemKey, nextState);
                    nextState[key] = true;
                }
            }

            return nextState;
        });
    };

    const handleToggleGroupChange = (group, selectedKey) => {
        setCheckedState((prev) => {
            const willEnable = !prev[selectedKey];
            let newState = { ...prev };

            dispatchData.forEach((p) => {
                p.followUps.forEach((f) => {
                    if (f.group === group) {
                        if (f.key === selectedKey) {
                            newState[f.key] = willEnable;
                        } else {
                            newState[f.key] = false;
                        }
                    }
                });
            });

            if (willEnable) {
                const systemKey = getSystemKeyForFollowUpKey(selectedKey);
                if (systemKey) {
                    setSelectedDispatchSystem(systemKey);
                    newState = clearOtherDispatchSystems(systemKey, newState);
                    newState[selectedKey] = true;
                }
            }

            dispatchData.forEach((p) => {
                p.followUps.forEach((followUp) => {
                    if (followUp.group === group && followUp.key === selectedKey) {
                        Object.assign(newState, applyDefaultThirdTry(newState, followUp));
                    }
                });
            });

            return newState;
        });
    };

    const handleDispatchSystemSelect = (systemKey) => {
        setSelectedDispatchSystem(systemKey);
        setCheckedState((prev) => {
            let nextState = dispatchData.reduce(
                (state, item) => clearSystemFollowUps(item.systemKey, state),
                prev
            );

            if (systemKey === "manual_dispatch_only") {
                nextState.p4_manual = true;
            }

            return nextState;
        });
    };

    const updateReleaseSettings = (updates) => {
        setReleaseSettings((prev) => normalizeReleaseSettings({ ...prev, ...updates }));
    };

    const handleSave = () => {
        setShowWarning(true);
    };

    const handleConfirmSave = () => {
        setShowWarning(false);
        setShowPasswordModal(true);
    };

    const handlePasswordSubmit = async () => {
        if (!password.trim()) {
            toast.error("Please enter your password");
            return;
        }

        setVerifying(true);
        try {
            const formData = new FormData();
            formData.append("password", password);

            const passwordRes = await apiSavePassword(formData);

            if (passwordRes?.data?.success === 1) {
                await saveDispatchSystem();
                setShowPasswordModal(false);
                setPassword("");
            } else {
                toast.error("Incorrect password");
            }
        } catch {
            toast.error("Password verification failed");
        } finally {
            setVerifying(false);
        }
    };

    const saveDispatchSystem = async () => {
        setSaving(true);
        try {
            const formData = new FormData();
            formData.append("selected_dispatch_system", selectedDispatchSystem || "");

            dispatchData.forEach((p, i) => {
                const isSystemEnabled =
                    selectedDispatchSystem === p.systemKey && !!systemStatus[p.systemKey];

                formData.append(
                    `${p.systemKey}[status]`,
                    isSystemEnabled ? "enable" : "disable"
                );

                formData.append(
                    `${p.systemKey}[priority]`,
                    DEFAULT_SYSTEM_PRIORITIES[p.systemKey] || i + 1
                );

                p.followUps.forEach((f) => {
                    if (f.stepKey) {
                        const shouldEnable = isSystemEnabled && checkedState[f.key];
                        formData.append(
                            `${p.systemKey}[${f.stepKey}]`,
                            shouldEnable ? "enable" : "disable"
                        );
                    }
                    f.children?.forEach((c) => {
                        let shouldEnable =
                            isSystemEnabled && checkedState[c.key];

                        if (
                            isRetryFollowUp(f) &&
                            checkedState[f.key] &&
                            HIDDEN_TRY_STEP_KEYS.has(c.stepKey)
                        ) {
                            shouldEnable =
                                c.stepKey ===
                                "show_only_after_not_selected_in_auto_dispatch_third_try";
                        }

                        formData.append(
                            `${p.systemKey}[${c.stepKey}]`,
                            shouldEnable ? "enable" : "disable"
                        );
                    });
                });
            });

            if (socket?.id) {
                formData.append("socket_id", socket.id);
            }

            formData.append(
                "auto_release[enabled]",
                releaseSettings.enabled ? "1" : "0"
            );
            formData.append(
                "auto_release[lead_minutes]",
                String(releaseSettings.lead_minutes)
            );
            formData.append("auto_release[mode]", releaseSettings.mode);
            formData.append(
                "driver_job_start_window_minutes",
                String(normalizeDriverJobStartWindowMinutes(driverJobStartWindowMinutes))
            );

            const res = await apiSaveDispatchSystem(formData);
            if (res?.data?.success === 1) {
                toast.success(
                    "Dispatch system saved successfully. Connected company users will be notified to refresh."
                );
            } else {
                toast.error("Save failed");
            }
        } catch {
            toast.error("Something went wrong");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-10">
                <span className="text-gray-500 text-sm">Loading...</span>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-6">
            <CardContainer className="p-4 sm:p-5 bg-[#F5F5F5]">
                <div className="flex flex-col gap-5">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div>
                            <h2 className="font-semibold text-base">Future Job Release</h2>
                            <p className="text-sm text-gray-600 mt-1">
                                Company default for when scheduled bookings are released to drivers.
                            </p>
                        </div>
                        <label className="flex items-center gap-3 text-sm font-medium">
                            <span>{releaseSettings.enabled ? "Enabled" : "Disabled"}</span>
                            <div className="relative inline-block w-11 h-6">
                                <input
                                    type="checkbox"
                                    checked={releaseSettings.enabled}
                                    onChange={(e) =>
                                        updateReleaseSettings({ enabled: e.target.checked })
                                    }
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </div>
                        </label>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Release before pickup
                            </label>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <input
                                    type="number"
                                    min="0"
                                    max="1440"
                                    value={releaseSettings.lead_minutes}
                                    disabled={!releaseSettings.enabled}
                                    onChange={(e) =>
                                        updateReleaseSettings({
                                            lead_minutes: e.target.value,
                                        })
                                    }
                                    className="w-full sm:w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                />
                                <div className="flex flex-wrap gap-2">
                                    {RELEASE_LEAD_PRESETS.map((minutes) => (
                                        <button
                                            key={minutes}
                                            type="button"
                                            disabled={!releaseSettings.enabled}
                                            onClick={() =>
                                                updateReleaseSettings({
                                                    lead_minutes: minutes,
                                                })
                                            }
                                            className={`px-3 py-2 rounded-md border text-sm disabled:opacity-50 ${
                                                releaseSettings.lead_minutes === minutes
                                                    ? "bg-blue-600 text-white border-blue-600"
                                                    : "bg-white text-gray-700 border-gray-300"
                                            }`}
                                        >
                                            {minutes < 60 ? `${minutes} min` : `${minutes / 60} hr`}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Default release mode
                            </label>
                            <select
                                value={releaseSettings.mode}
                                disabled={!releaseSettings.enabled}
                                onChange={(e) =>
                                    updateReleaseSettings({ mode: e.target.value })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                            >
                                {releaseSettings.modes.map((mode) => (
                                    <option key={mode} value={mode}>
                                        {RELEASE_MODE_LABELS[mode] || mode}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="lg:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Driver job start window
                            </label>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <input
                                    type="number"
                                    min="0"
                                    max="1440"
                                    value={driverJobStartWindowMinutes}
                                    onChange={(e) =>
                                        setDriverJobStartWindowMinutes(e.target.value)
                                    }
                                    onBlur={(e) =>
                                        setDriverJobStartWindowMinutes(
                                            normalizeDriverJobStartWindowMinutes(e.target.value)
                                        )
                                    }
                                    className="w-full sm:w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <div className="flex flex-wrap gap-2">
                                    {DRIVER_JOB_START_WINDOW_PRESETS.map((minutes) => (
                                        <button
                                            key={minutes}
                                            type="button"
                                            onClick={() =>
                                                setDriverJobStartWindowMinutes(minutes)
                                            }
                                            className={`px-3 py-2 rounded-md border text-sm ${
                                                normalizeDriverJobStartWindowMinutes(driverJobStartWindowMinutes) === minutes
                                                    ? "bg-blue-600 text-white border-blue-600"
                                                    : "bg-white text-gray-700 border-gray-300"
                                            }`}
                                        >
                                            {minutes / 60} hr
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <p className="text-sm text-gray-600">
                        {releaseSettings.enabled
                            ? `Future jobs release ${releaseSettings.lead_minutes} minutes before pickup by default using ${RELEASE_MODE_LABELS[releaseSettings.mode] || releaseSettings.mode}. Dispatchers can still override this per booking.`
                            : "Future jobs stay held for manual review unless a dispatcher releases them on the booking."}
                        {" "}
                        Drivers can mark arrived or start scheduled jobs up to {normalizeDriverJobStartWindowMinutes(driverJobStartWindowMinutes)} minutes before pickup.
                    </p>
                </div>
            </CardContainer>

            {filteredDispatchData.map((p) => (
                <CardContainer key={p.systemKey} className="p-3 sm:p-4 lg:p-5 bg-[#F5F5F5]">
                    <div className="w-full">
                        <div className="flex flex-row gap-3 items-start">
                            <div className="flex gap-3 mt-1.5">
                                <input
                                    type="radio"
                                    name="dispatch_system"
                                    checked={selectedDispatchSystem === p.systemKey}
                                    className="h-4 w-4"
                                    onChange={() => handleDispatchSystemSelect(p.systemKey)}
                                />
                                {/* <input
                                    type="checkbox"
                                    checked={!!systemStatus[p.systemKey]}
                                    className="h-4 w-4"
                                    onChange={(e) => {
                                        const isChecked = e.target.checked;
                                        setSystemStatus((prev) => ({
                                            ...prev,
                                            [p.systemKey]: isChecked,
                                        }));

                                        if (!isChecked) {
                                            const newState = { ...checkedState };
                                            p.followUps.forEach((f) => {
                                                newState[f.key] = false;
                                                f.children?.forEach((c) => {
                                                    newState[c.key] = false;
                                                });
                                            });
                                            setCheckedState(newState);
                                        }
                                    }}
                                /> */}
                                
                            </div>
                            <div className="flex-1">
                                <h2 className="font-semibold pb-3">
                                    {getSystemDisplayName(p.systemKey)}
                                </h2>

                                {p.followUps.map((f) => (
                                    <div key={f.key} className="mb-2 py-2">
                                        <label className="flex gap-2 text-sm items-center">
                                            {f.type === "toggle" ? (
                                                <div className="relative inline-block w-10 h-5">
                                                    <input
                                                        type="checkbox"
                                                        checked={!!checkedState[f.key]}
                                                        onChange={() =>
                                                            handleToggleGroupChange(f.group, f.key)
                                                        }
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-10 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                                                </div>
                                            ) : (
                                                <input
                                                    type="checkbox"
                                                    checked={!!checkedState[f.key]}
                                                    onChange={() => toggle(f.key)}
                                                    className="h-4 w-4"
                                                />
                                            )}
                                            {f.label}
                                        </label>

                                        {f.children && checkedState[f.key] && (
                                            <div className="ml-6 mt-3 space-y-2">
                                                {f.children
                                                    .filter(
                                                        (child) =>
                                                            !(
                                                                isRetryFollowUp(f) &&
                                                                HIDDEN_TRY_STEP_KEYS.has(child.stepKey)
                                                            )
                                                    )
                                                    .map((c) => (
                                                    <label key={c.key} className="flex gap-2 text-sm">
                                                        <input
                                                            type="checkbox"
                                                            checked={!!checkedState[c.key]}
                                                            onChange={() => toggle(c.key)}
                                                            className="h-4 w-4"
                                                        />
                                                        {c.label}
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </CardContainer>
            ))}

            <div className="flex justify-end pt-4 gap-2">
                <Button type="filledGray" btnSize="md">
                    Cancel
                </Button>
                <Button
                    type="filled"
                    btnSize="md"
                    onClick={handleSave}
                    disabled={saving || !isAnyOptionConfigured}
                >
                    {saving ? "Saving..." : "Save"}
                </Button>
            </div>

            {/* Warning Modal */}
            {showWarning && (
                <div className="fixed inset-0 bg-black bg-opacity-5 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold mb-4">Confirm Changes</h3>
                        <p className="text-gray-600 mb-6">
                            The changes you make will affect the entire system. Are you sure you
                            want to proceed?
                        </p>
                        <div className="flex justify-end gap-3">
                            <Button
                                type="filledGray"
                                btnSize="md"
                                onClick={() => setShowWarning(false)}
                            >
                                No
                            </Button>
                            <Button type="filled" btnSize="md" onClick={handleConfirmSave}>
                                Yes
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Password Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-black bg-opacity-5 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold mb-4">Enter Your Password</h3>
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter your password"
                                onKeyPress={(e) => {
                                    if (e.key === "Enter") {
                                        handlePasswordSubmit();
                                    }
                                }}
                            />
                        </div>
                        <div className="flex justify-end gap-3">
                            <Button
                                type="filledGray"
                                btnSize="md"
                                onClick={() => {
                                    setShowPasswordModal(false);
                                    setPassword("");
                                }}
                                disabled={verifying}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="filled"
                                btnSize="md"
                                onClick={handlePasswordSubmit}
                                disabled={verifying}
                            >
                                {verifying ? "Verifying..." : "Submit"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DispatchSystem;
