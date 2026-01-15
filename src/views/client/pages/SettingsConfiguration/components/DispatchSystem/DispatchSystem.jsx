import React, { useEffect, useState } from "react";
import { apiGetBookingSystem } from "../../../../../../services/AddBookingServices";
import { apiGetDispatchSystem, apiSaveDispatchSystem } from "../../../../../../services/SettingsConfigurationServices";
import toast from 'react-hot-toast';
import Button from "../../../../../../components/ui/Button/Button";

const dispatchData = [
    {
        priority: "Priority 1",
        type: "auto_dispatch",
        systemKey: "auto_dispatch_plot_base",
        followUps: [
            { label: "Immediately show on dispatcher panel", key: "p1_immediate", stepKey: "immediately_show_on_dispatcher_panel" },
            {
                label: "Show only after not selected in auto dispatch",
                key: "p1_retry",
                children: [
                    { label: "First try", key: "p1_first", stepKey: "show_only_after_not_selected_in_auto_dispatch_first_try" },
                    { label: "Second try", key: "p1_second", stepKey: "show_only_after_not_selected_in_auto_dispatch_second_try" },
                    { label: "Third try onwards", key: "p1_third", stepKey: "show_only_after_not_selected_in_auto_dispatch_third_try" },
                ],
            },
            { label: "Put in bidding panel", key: "p1_bidding", stepKey: "put_in_bidding_panel" },
        ],
    },
    {
        priority: "Priority 2",
        type: "bidding",
        systemKey: "bidding_fixed_fare_plot_base",
        followUps: [
            { label: "Wait Time ___ seconds", key: "p2_wait", stepKey: "wait_time_seconds" },
            { label: "Immediately show on dispatcher panel", key: "p2_immediate", stepKey: "immediately_show_on_dispatcher_panel" },
            { label: "Shows up after first rejection or wait time elapsed", key: "p2_reject", stepKey: "shows_up_after_first_rejection_or_wait_time_elapsed" },
        ],
    },
    {
        priority: "Priority 3",
        type: "auto_dispatch",
        systemKey: "auto_dispatch_nearest_driver",
        followUps: [
            { label: "Immediately show on dispatcher panel", key: "p3_immediate", stepKey: "immediately_show_on_dispatcher_panel" },
            {
                label: "Show only after not selected in auto dispatch",
                key: "p3_retry",
                children: [
                    { label: "First try", key: "p3_first", stepKey: "show_only_after_not_selected_in_auto_dispatch_first_try" },
                    { label: "Second try", key: "p3_second", stepKey: "show_only_after_not_selected_in_auto_dispatch_second_try" },
                    { label: "Third try onwards", key: "p3_third", stepKey: "show_only_after_not_selected_in_auto_dispatch_third_try" },
                ],
            },
            { label: "Put in bidding panel", key: "p3_bidding", stepKey: "put_in_bidding_panel" },
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
            { label: "Immediately show on dispatcher panel", key: "p5_immediate", stepKey: "immediately_show_on_dispatcher_panel" },
            {
                label: "Show only after not selected in auto dispatch",
                key: "p5_retry",
                children: [
                    { label: "If not received bid in first 10 seconds", key: "p5_10s", stepKey: "if_not_received_bid_in_first_10_seconds" },
                    { label: "First try", key: "p5_first", stepKey: "show_only_after_not_selected_in_auto_dispatch_first_try" },
                    { label: "Second try", key: "p5_second", stepKey: "show_only_after_not_selected_in_auto_dispatch_second_try" },
                    { label: "Third try onwards", key: "p5_third", stepKey: "show_only_after_not_selected_in_auto_dispatch_third_try" },
                ],
            },
        ],
    },
    {
        priority: "Priority 6",
        type: "bidding",
        systemKey: "bidding_fixed_fare_nearest_driver",
        followUps: [
            { label: "Wait Time ___ seconds", key: "p6_wait", stepKey: "wait_time_seconds" },
            { label: "Immediately show on dispatcher panel", key: "p6_immediate", stepKey: "immediately_show_on_dispatcher_panel" },
            { label: "Shows up after first rejection or wait time elapsed", key: "p6_reject", stepKey: "shows_up_after_first_rejection_or_wait_time_elapsed" },
        ],
    },
];

const DispatchSystem = () => {
    const [checkedState, setCheckedState] = useState({});
    const [bookingSystem, setBookingSystem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    const getSystemDisplayName = (systemKey) => {
        const displayNames = {
            "auto_dispatch_plot_base": "Auto Dispatch Plot Based",
            "bidding_fixed_fare_plot_base": "Bidding Fixed Fare - Plot Based (Will go from nearest to farthest driver every x seconds if not selected. If they reject immediately shows to next one. Incase they are already seeing a ride request both can show with a timer difference so 1 person doesn't reject them)",
            "auto_dispatch_nearest_driver": "Auto Dispatch nearest driver",
            "manual_dispatch_only": "Manual Dispatch Only",
            "bidding": "Bidding",
            "bidding_fixed_fare_nearest_driver": "Bidding Fixed Fare - Nearest Driver"
        };
        return displayNames[systemKey] || systemKey;
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const bookingRes = await apiGetBookingSystem();
            if (bookingRes?.data?.success === 1) {
                setBookingSystem(bookingRes.data.company_booking_system);
            }

            const dispatchRes = await apiGetDispatchSystem();
            if (dispatchRes?.data?.success === 1) {
                const configData = dispatchRes.data.data;
                const initialState = {};

                configData.forEach((item) => {
                    dispatchData.forEach((priority) => {
                        if (priority.systemKey === item.dispatch_system) {
                            priority.followUps.forEach((followUp) => {
                                if (followUp.stepKey === item.steps) {
                                    initialState[followUp.key] = item.status === "enable";
                                }
                                if (followUp.children) {
                                    followUp.children.forEach((child) => {
                                        if (child.stepKey === item.steps) {
                                            initialState[child.key] = item.status === "enable";
                                        }
                                    });
                                }
                            });
                        }
                    });

                    if (item.dispatch_system === "manual_dispatch_only") {
                        initialState["p4_manual"] = item.status === "enable";
                    }
                });

                setCheckedState(initialState);
            }
        } catch (err) {
            console.error("Error fetching data:", err);
        } finally {
            setLoading(false);
        }
    };

    const filteredDispatchData = dispatchData.filter((item) => {
        if (bookingSystem === "both") return true;
        return item.type === bookingSystem;
    });

    const currentPriority = filteredDispatchData[currentIndex];
    const isFirst = currentIndex === 0;
    const isLast = currentIndex === filteredDispatchData.length - 1;

    const toggle = (key) => {
        setCheckedState((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const formData = new FormData();

            dispatchData.forEach((priority) => {
                const systemKey = priority.systemKey;

                if (systemKey === "manual_dispatch_only") {
                    const followUp = priority.followUps[0];
                    const status = checkedState[followUp.key] ? "enable" : "disable";
                    formData.append(systemKey, status);
                    return;
                }

                priority.followUps.forEach((followUp) => {
                    if (followUp.stepKey) {
                        const status = checkedState[followUp.key] ? "enable" : "disable";
                        formData.append(`${systemKey}[${followUp.stepKey}]`, status);
                    }

                    if (followUp.children) {
                        followUp.children.forEach((child) => {
                            const status = checkedState[child.key] ? "enable" : "disable";
                            formData.append(`${systemKey}[${child.stepKey}]`, status);
                        });
                    }
                });
            });

            const response = await apiSaveDispatchSystem(formData);

            if (response?.data?.success === 1) {
                toast.success("Dispatch system saved successfully!");
            } else {
                toast.error("Failed to save dispatch system. Please try again.");
            }
        } catch (err) {
            console.error("Error saving dispatch system:", err);
            alert("An error occurred while saving. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="text-center py-10">Loading...</div>;
    }

    if (!currentPriority) return null;

    return (
        <div className="max-w-3xl mx-auto p-4 md:p-6">
            <div>
                {/* TITLE */}
                <h2 className="text-lg font-semibold pb-3">
                    {getSystemDisplayName(currentPriority.systemKey)}
                    <span className="text-sm font-medium"> (Priority {currentIndex + 1})</span>
                </h2>

                {/* FOLLOW UPS */}
                <div className="space-y-3">
                    {currentPriority.followUps.map((item) => (
                        <div key={item.key}>
                            <label className="flex gap-2 text-sm text-gray-700">
                                <input
                                    type="checkbox"
                                    checked={!!checkedState[item.key]}
                                    onChange={() => toggle(item.key)}
                                    className="h-4 w-4 text-green-600"
                                />
                                {item.label}
                            </label>

                            {item.children && (
                                <div className="ml-6 mt-2 space-y-1">
                                    {item.children.map((child) => (
                                        <label
                                            key={child.key}
                                            className="flex gap-2 text-sm text-gray-600"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={!!checkedState[child.key]}
                                                onChange={() => toggle(child.key)}
                                                className="h-4 w-4 text-green-600"
                                            />
                                            {child.label}
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* FOOTER BUTTONS */}
                <div>
                    <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                        {!isFirst && !isLast && (
                            <Button
                                btnSize="md"
                                type="filledGray"
                                onClick={() => setCurrentIndex((p) => p - 1)}
                            >
                                Back
                            </Button>
                        )}

                        {!isLast && (
                            <Button
                                btnSize="md"
                                type="filled"
                                onClick={() => setCurrentIndex((p) => p + 1)}
                            >
                                Go to next Priority
                            </Button>
                        )}
                    </div>

                    <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                        {isLast && (
                            <>
                                <Button
                                    btnSize="md"
                                    type="filledGray"
                                    onClick={() => setCurrentIndex(0)}
                                >
                                    Cancel
                                </Button>

                                <Button
                                    btnSize="md"
                                    type="filled"
                                    onClick={handleSave}
                                    disabled={saving}
                                >
                                    {saving ? "Saving..." : "Save"}
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DispatchSystem;