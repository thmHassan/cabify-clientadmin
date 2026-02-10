import React, { useEffect, useState } from "react";
import { apiGetBookingSystem } from "../../../../../../services/AddBookingServices";
import {
    apiGetDispatchSystem,
    apiSaveDispatchSystem,
    apiSavePassword,
} from "../../../../../../services/SettingsConfigurationServices";
import toast from "react-hot-toast";
import Button from "../../../../../../components/ui/Button/Button";
import CardContainer from "../../../../../../components/shared/CardContainer";

const dispatchData = [
    {
        priority: "Priority 1",
        type: "auto_dispatch",
        systemKey: "auto_dispatch_plot_base",
        followUps: [
            { label: "Immediately show on dispatcher panel", key: "p1_immediate", stepKey: "immediately_show_on_dispatcher_panel", type: "toggle", group: "p1_main" },
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
        priority: "Priority 2",
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
        priority: "Priority 3",
        type: "auto_dispatch",
        systemKey: "auto_dispatch_nearest_driver",
        followUps: [
            { label: "Wait Time ___ seconds", key: "p3_wait", stepKey: "wait_time_seconds", type: "toggle", group: "p3_main" },
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
        priority: "Priority 4",
        type: "auto_dispatch",
        systemKey: "manual_dispatch_only",
        followUps: [
            { label: "Manual Dispatch Only (disables all others)", key: "p4_manual", stepKey: "manual_dispatch_only" },
        ],
    },
    {
        priority: "Priority 5",
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
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [priorities, setPriorities] = useState({});
    const [showWarning, setShowWarning] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [password, setPassword] = useState("");
    const [verifying, setVerifying] = useState(false);

    const getSystemDisplayName = (key) => ({
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
            // For manual_dispatch_only, check if the main checkbox (p4_manual) is enabled
            if (p.systemKey === "manual_dispatch_only") {
                newSystemStatus[p.systemKey] = !!checkedState["p4_manual"];
            } else {
                // For other systems, check if any follow-up is enabled
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

    const fetchData = async () => {
        try {
            const bookingRes = await apiGetBookingSystem();
            if (bookingRes?.data?.success === 1) {
                setBookingSystem(bookingRes.data.company_admin_dispatch_sytem);
            }

            const dispatchRes = await apiGetDispatchSystem();
            if (dispatchRes?.data?.success === 1) {
                const initial = {};
                const initialPriorities = {};

                dispatchRes.data.data.forEach((item) => {
                    dispatchData.forEach((p) => {
                        if (p.systemKey === item.dispatch_system) {
                            if (item.priority) {
                                initialPriorities[p.systemKey] = parseInt(item.priority);
                            }

                            // Special handling for manual_dispatch_only
                            if (item.steps === null && p.systemKey === "manual_dispatch_only") {
                                p.followUps.forEach((f) => {
                                    if (!f.stepKey || f.stepKey === "manual_dispatch_only") {
                                        initial[f.key] = item.status === "enable";
                                    }
                                });
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
                        }
                    });
                });

                const filteredData = dispatchData.filter((d) =>
                    bookingRes.data.company_admin_dispatch_sytem === "both" ? true : d.type === bookingRes.data.company_admin_dispatch_sytem
                );

                filteredData.forEach((p, index) => {
                    if (!initialPriorities[p.systemKey]) {
                        initialPriorities[p.systemKey] = index + 1;
                    }
                });

                setCheckedState(initial);
                setPriorities(initialPriorities);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const toggle = (key) =>
        setCheckedState((p) => ({ ...p, [key]: !p[key] }));

    const handleToggleGroupChange = (group, selectedKey) => {
        setCheckedState((prev) => {
            const newState = { ...prev };

            dispatchData.forEach((p) => {
                p.followUps.forEach((f) => {
                    if (f.group === group) {
                        if (f.key === selectedKey) {
                            newState[f.key] = !prev[selectedKey];
                        } else {
                            newState[f.key] = false;
                        }
                    }
                });
            });

            return newState;
        });
    };

    const handlePriorityChange = (systemKey, newPriority) => {
        setPriorities((prev) => ({
            ...prev,
            [systemKey]: parseInt(newPriority)
        }));
    };

    const handleSave = async () => {
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
        } catch (e) {
            toast.error("Password verification failed");
        } finally {
            setVerifying(false);
        }
    };

    const saveDispatchSystem = async () => {
        setSaving(true);
        try {
            const formData = new FormData();

            dispatchData.forEach((p, i) => {
                formData.append(
                    `${p.systemKey}[status]`,
                    systemStatus[p.systemKey] ? "enable" : "disable"
                );

                formData.append(
                    `${p.systemKey}[priority]`,
                    priorities[p.systemKey] || i + 1
                );

                p.followUps.forEach((f) => {
                    if (f.stepKey) {
                        const shouldEnable = systemStatus[p.systemKey] && checkedState[f.key];
                        formData.append(
                            `${p.systemKey}[${f.stepKey}]`,
                            shouldEnable ? "enable" : "disable"
                        );
                    }
                    f.children?.forEach((c) => {
                        const shouldEnable = systemStatus[p.systemKey] && checkedState[c.key];
                        formData.append(
                            `${p.systemKey}[${c.stepKey}]`,
                            shouldEnable ? "enable" : "disable"
                        );
                    });
                });
            });

            const res = await apiSaveDispatchSystem(formData);
            res?.data?.success === 1
                ? toast.success("Dispatch system saved successfully")
                : toast.error("Save failed");
        } catch {
            toast.error("Something went wrong");
        } finally {
            setSaving(false);
        }
    };

    const filteredDispatchData = dispatchData.filter((d) =>
        bookingSystem === "both" ? true : d.type === bookingSystem
    );

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-6">
            {filteredDispatchData.map((p, i) => (
                <CardContainer key={p.systemKey} className="p-3 sm:p-4 lg:p-5 bg-[#F5F5F5]">
                    <div className="w-full">
                        <div className="flex flex-row gap-3 items-start">
                            <div className="flex gap-3 mt-1.5">
                                <input
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
                                                if (f.children) {
                                                    f.children.forEach((c) => {
                                                        newState[c.key] = false;
                                                    });
                                                }
                                            });
                                            setCheckedState(newState);
                                        }
                                    }}
                                />
                            </div>
                            <div className="flex-1">
                                <h2 className="font-semibold pb-3">
                                    {getSystemDisplayName(p.systemKey)} (Priority {priorities[p.systemKey] || i + 1})
                                </h2>

                                <div className="mb-4">
                                    <label className="text-sm text-gray-600 block mb-1">Select Priority</label>
                                    <select
                                        value={priorities[p.systemKey] || i + 1}
                                        onChange={(e) => handlePriorityChange(p.systemKey, e.target.value)}
                                        className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        {[1, 2, 3, 4, 5].map((priority) => (
                                            <option key={priority} value={priority}>
                                                Priority {priority}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {p.followUps.map((f) => (
                                    <div key={f.key} className="mb-2 py-2">
                                        <label className="flex gap-2 text-sm items-center">
                                            {f.type === "toggle" ? (
                                                <div className="relative inline-block w-10 h-5">
                                                    <input
                                                        type="checkbox"
                                                        checked={!!checkedState[f.key]}
                                                        onChange={() => handleToggleGroupChange(f.group, f.key)}
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
                                            <div className="ml-6 mt-1 space-y-2 mt-3">
                                                {f.children.map((c) => (
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
                <Button
                    type="filledGray"
                    btnSize="md"
                >
                    Cancel
                </Button>

                <Button
                    type="filled"
                    btnSize="md"
                    onClick={handleSave}
                    disabled={saving}
                >
                    {saving ? "Saving..." : "Save"}
                </Button>
            </div>

            {showWarning && (
                <div className="fixed inset-0 bg-black bg-opacity-5 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold mb-4">Confirm Changes</h3>
                        <p className="text-gray-600 mb-6">
                            The changes you make will affect the entire system. Are you sure you want to proceed?
                        </p>
                        <div className="flex justify-end gap-3">
                            <Button
                                type="filledGray"
                                btnSize="md"
                                onClick={() => setShowWarning(false)}
                            >
                                No
                            </Button>
                            <Button
                                type="filled"
                                btnSize="md"
                                onClick={handleConfirmSave}
                            >
                                Yes
                            </Button>
                        </div>
                    </div>
                </div>
            )}

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
                                    if (e.key === 'Enter') {
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