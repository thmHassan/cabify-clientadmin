import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
    apiCollectDriverCommission,
    apiGetDriverCommissionEntries,
} from "../../../../../../services/DriverManagementService";
import AppLogoLoader from "../../../../../../components/shared/AppLogoLoader";
import Button from "../../../../../../components/ui/Button/Button";
import { getTenantData } from "../../../../../../utils/functions/tokenEncryption";
import Pagination from "../../../../../../components/ui/Pagination/Pagination";
import { PAGE_SIZE_OPTIONS } from "../../../../../../constants/selectOptions";

const LockIcon = () => (
    <svg
        className="w-4 h-4 text-gray-400"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
    >
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
);

const SettlementAmountModel = ({ onClose, driver, packageType }) => {
    const [loading, setLoading] = useState(true);
    const [collecting, setCollecting] = useState(false);
    const [commissionData, setCommissionData] = useState(null);
    const [currencySymbol, setCurrencySymbol] = useState("₹");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const currencySymbols = {
        INR: "₹",
        USD: "$",
        EUR: "€",
        GBP: "£",
        AUD: "A$",
        CAD: "C$",
        AED: "د.إ",
    };

    const activePackageType = packageType || commissionData?.package_type;
    const isPercentageBased = activePackageType === "commission_without_topup";

    useEffect(() => {
        const tenant = getTenantData();
        if (tenant?.currency) {
            setCurrencySymbol(currencySymbols[tenant.currency] || tenant.currency);
        }
    }, []);

    useEffect(() => {
        if (driver?.id) fetchCommissionEntries(1);
    }, [driver?.id]);

    const fetchCommissionEntries = async (page = 1, limit = itemsPerPage) => {
        if (!driver?.id) return;
        setLoading(true);
        try {
            const response = await apiGetDriverCommissionEntries(
                driver.id,
                page,
                limit
            );
            if (response?.data?.success === 1) {
                setCommissionData(response.data.data);
                setCurrentPage(page);
            } else {
                toast.error(
                    response?.data?.message || "Failed to fetch commission data",
                    { duration: 4000 }
                );
            }
        } catch (error) {
            console.log("Commission fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCollectCommission = async (entry) => {
        if (entry.is_locked) {
            toast.error("Please collect the previous entry first.", {
                duration: 3000,
            });
            return;
        }
        if (!driver?.id) return;

        setCollecting(true);
        try {
            const response = await apiCollectDriverCommission(driver.id);
            if (response?.data?.success === 1) {
                toast.success("Commission collected successfully!", {
                    duration: 4000,
                });
                await fetchCommissionEntries(currentPage);
                setTimeout(() => window.location.reload(), 1500);
            } else {
                toast.error(
                    response?.data?.message || "Failed to collect commission",
                    { duration: 4000 }
                );
            }
        } catch (error) {
            toast.error(
                error?.response?.data?.message ||
                error?.message ||
                "Failed to collect commission",
                { duration: 4000 }
            );
        } finally {
            setCollecting(false);
        }
    };

    const handlePageChange = (page) => fetchCommissionEntries(page, itemsPerPage);

    const handleItemsPerPageChange = (limit) => {
        setItemsPerPage(limit);
        fetchCommissionEntries(1, limit);
    };

    const formatDate = (dateString) => {
        if (!dateString) return "Not Set";
        try {
            return new Date(dateString).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
            });
        } catch {
            return "Invalid Date";
        }
    };

    const validEntries =
        commissionData?.commission_entries?.filter(
            (entry) => parseFloat(entry.amount) > 0
        ) || [];

    const totalUncollected = commissionData?.total_uncollected_amount || "0";
    const totalEntries = commissionData?.total_uncollected_entries || 0;
    const packageDays = commissionData?.package_days || "-";
    const packagePercentage = commissionData?.package_percentage || "-";
    const packageAmount = commissionData?.package_amount || "-";

    return (
        <div className="bg-white rounded-2xl max-w-4xl w-full mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 border-b border-gray-200">
                <div>
                    <h2 className="text-xl sm:text-2xl font-semibold text-[#252525]">
                        {driver?.name || "Driver"}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Commission Settlement</p>
                </div>

                {!loading && commissionData && (
                    <div className="flex flex-col items-end gap-1">
                        <span
                            className={`text-xs font-semibold px-3 py-1 rounded-full ${isPercentageBased
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-green-100 text-green-700"
                                }`}
                        >
                            {isPercentageBased
                                ? `% Commission · ${packagePercentage}% per ${packageDays} days`
                                : `Fixed · ${currencySymbol}${packageAmount} per ${packageDays} days`}
                        </span>
                        {totalEntries > 0 && (
                            <p className="text-sm text-gray-500">
                                Total Due:{" "}
                                <span className="font-semibold text-red-600">
                                    {currencySymbol}
                                    {totalUncollected}
                                </span>{" "}
                                {/* ({totalEntries}{" "}
                                {totalEntries === 1 ? "entry" : "entries"}) */}
                            </p>
                        )}
                    </div>
                )}
            </div>

            <div className="p-4 sm:p-6">
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <AppLogoLoader />
                    </div>
                ) : validEntries.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500 font-medium text-lg">
                            No commission entries available
                        </p>
                        <p className="text-gray-400 text-sm mt-2">
                            {isPercentageBased
                                ? "Commission will appear once the driver completes rides."
                                : "Commission will appear after package cycle completes."}
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Sequential warning banner — shown only if more than 1 entry */}
                        {validEntries.length > 1 && (
                            <div className="flex items-center gap-2 mb-4 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-lg">
                                <LockIcon />
                                <p className="text-xs text-amber-700 font-medium">
                                    Entries must be collected in order. Collect
                                    the first entry to unlock the next one.
                                </p>
                            </div>
                        )}

                        <div className="space-y-3 mb-4">
                            {validEntries.map((entry, index) => {
                                const isLocked = entry.is_locked === true;
                                const isCollectible =
                                    entry.is_collectible === true;

                                return (
                                    <div
                                        key={index}
                                        className={`border rounded-xl p-4 transition-all duration-200 ${isLocked
                                                ? "bg-gray-50 border-gray-200 opacity-60"
                                                : "bg-white border-[#E9E9E9] hover:shadow-md"
                                            }`}
                                    >

                                        <div className="block lg:hidden space-y-3">
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-1.5">
                                                    <p className="text-xs font-semibold text-gray-500">
                                                        Cycle #{entry.entry_number}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs text-gray-500 mb-1">
                                                        Amount Due
                                                    </p>
                                                    <p
                                                        className={`font-semibold ${isLocked
                                                                ? "text-gray-400"
                                                                : "text-red-600"
                                                            }`}
                                                    >
                                                        {currencySymbol}
                                                        {entry.amount}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-1">
                                                        Cycle Period
                                                    </p>
                                                    <p className="text-sm font-medium text-[#333333]">
                                                        {entry.days_in_cycle} days
                                                    </p>
                                                </div>
                                                {isPercentageBased &&
                                                    entry.total_rides !== undefined && (
                                                        <div>
                                                            <p className="text-xs text-gray-500 mb-1">
                                                                Total Rides
                                                            </p>
                                                            <p className="text-sm font-medium text-[#333333]">
                                                                {entry.total_rides}
                                                            </p>
                                                        </div>
                                                    )}
                                                {isPercentageBased &&
                                                    entry.total_rides_amount !==
                                                    undefined && (
                                                        <div>
                                                            <p className="text-xs text-gray-500 mb-1">
                                                                Rides Amount
                                                            </p>
                                                            <p className="text-sm font-medium text-[#333333]">
                                                                {currencySymbol}
                                                                {
                                                                    entry.total_rides_amount
                                                                }
                                                            </p>
                                                        </div>
                                                    )}
                                                {isPercentageBased &&
                                                    entry.commission_percentage !==
                                                    undefined && (
                                                        <div>
                                                            <p className="text-xs text-gray-500 mb-1">
                                                                Commission %
                                                            </p>
                                                            <p className="text-sm font-medium text-[#333333]">
                                                                {
                                                                    entry.commission_percentage
                                                                }
                                                                %
                                                            </p>
                                                        </div>
                                                    )}
                                            </div>

                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">
                                                    Date Range
                                                </p>
                                                <p className="text-sm font-medium text-[#333333]">
                                                    {formatDate(
                                                        entry.cycle_start_date
                                                    )}{" "}
                                                    →{" "}
                                                    {formatDate(
                                                        entry.cycle_end_date
                                                    )}
                                                </p>
                                            </div>

                                            <div className="flex justify-end pt-2 border-t border-gray-100">
                                                {isLocked ? (
                                                    <div className="flex items-center gap-1.5 px-4 py-1.5 bg-gray-100 rounded-lg">
                                                        <LockIcon />
                                                        <span className="text-xs text-gray-400 font-medium">
                                                            Locked
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <Button
                                                        type="filled"
                                                        onClick={() =>
                                                            handleCollectCommission(
                                                                entry
                                                            )
                                                        }
                                                        disabled={
                                                            collecting || loading
                                                        }
                                                        className="px-4 py-1.5 rounded-lg text-xs font-medium disabled:opacity-50"
                                                    >
                                                        {collecting
                                                            ? "Collecting..."
                                                            : "Collect"}
                                                    </Button>
                                                )}
                                            </div>
                                        </div>

                                        {/* ── Desktop View ── */}
                                        <div className="hidden lg:flex items-center justify-between gap-3 overflow-x-auto">
                                            {/* Cycle # */}
                                            <div className="inline-flex flex-col px-3 py-2 rounded-full bg-gray-100 text-center whitespace-nowrap min-w-[80px]">
                                                <p className="text-xs text-gray-500">
                                                    Cycle
                                                </p>
                                                <div className="flex items-center justify-center gap-1">
                                                    <p className="text-black font-semibold text-sm">
                                                        #{entry.entry_number}
                                                    </p>
                                                    {isLocked && <LockIcon />}
                                                </div>
                                            </div>

                                            {/* Period */}
                                            <div className="inline-flex flex-col px-3 py-2 rounded-full bg-gray-100 text-center whitespace-nowrap min-w-[100px]">
                                                <p className="text-xs text-gray-500">
                                                    Period
                                                </p>
                                                <p className="text-black font-semibold text-sm">
                                                    {entry.days_in_cycle} days
                                                </p>
                                            </div>

                                            {/* Date Range */}
                                            <div className="inline-flex flex-col px-3 py-2 rounded-full bg-gray-100 text-center whitespace-nowrap min-w-[220px]">
                                                <p className="text-xs text-gray-500">
                                                    Date Range
                                                </p>
                                                <p className="text-black font-semibold text-sm">
                                                    {formatDate(
                                                        entry.cycle_start_date
                                                    )}{" "}
                                                    →{" "}
                                                    {formatDate(
                                                        entry.cycle_end_date
                                                    )}
                                                </p>
                                            </div>

                                            {/* % Based: Rides count */}
                                            {isPercentageBased &&
                                                entry.total_rides !== undefined && (
                                                    <div className="inline-flex flex-col px-3 py-2 rounded-full bg-gray-100 text-center whitespace-nowrap min-w-[80px]">
                                                        <p className="text-xs text-gray-500">
                                                            Rides
                                                        </p>
                                                        <p className="text-black font-semibold text-sm">
                                                            {entry.total_rides}
                                                        </p>
                                                    </div>
                                                )}

                                            {/* % Based: Rides amount */}
                                            {isPercentageBased &&
                                                entry.total_rides_amount !==
                                                undefined && (
                                                    <div className="inline-flex flex-col px-3 py-2 rounded-full bg-gray-100 text-center whitespace-nowrap min-w-[120px]">
                                                        <p className="text-xs text-gray-500">
                                                            Rides Amount
                                                        </p>
                                                        <p className="text-black font-semibold text-sm">
                                                            {currencySymbol}
                                                            {
                                                                entry.total_rides_amount
                                                            }
                                                        </p>
                                                    </div>
                                                )}

                                            {/* % Based: Commission % */}
                                            {isPercentageBased &&
                                                entry.commission_percentage !==
                                                undefined && (
                                                    <div className="inline-flex flex-col px-3 py-2 rounded-full bg-blue-50 text-center whitespace-nowrap min-w-[90px]">
                                                        <p className="text-xs text-gray-500">
                                                            Commission
                                                        </p>
                                                        <p className="text-blue-700 font-bold text-sm">
                                                            {
                                                                entry.commission_percentage
                                                            }
                                                            %
                                                        </p>
                                                    </div>
                                                )}

                                            {/* Amount Due */}
                                            <div
                                                className={`inline-flex flex-col px-3 py-2 rounded-full text-center whitespace-nowrap min-w-[110px] ${isLocked
                                                        ? "bg-gray-100"
                                                        : "bg-red-50"
                                                    }`}
                                            >
                                                <p className="text-xs text-gray-500">
                                                    Amount Due
                                                </p>
                                                <p
                                                    className={`font-bold text-sm ${isLocked
                                                            ? "text-gray-400"
                                                            : "text-red-600"
                                                        }`}
                                                >
                                                    {currencySymbol}
                                                    {entry.amount}
                                                </p>
                                            </div>

                                            {/* Action button */}
                                            <div className="whitespace-nowrap">
                                                {isLocked ? (
                                                    <div className="flex items-center gap-1.5 px-5 py-2 bg-gray-100 rounded-lg cursor-not-allowed">
                                                        <LockIcon />
                                                        <span className="text-xs text-gray-400 font-medium">
                                                            Locked
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <Button
                                                        type="filled"
                                                        onClick={() =>
                                                            handleCollectCommission(
                                                                entry
                                                            )
                                                        }
                                                        disabled={
                                                            collecting || loading
                                                        }
                                                        className="px-6 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                                                    >
                                                        {collecting
                                                            ? "Collecting..."
                                                            : "Collect"}
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {commissionData?.pagination?.total > 0 && (
                            <div className="border-t border-gray-200 pt-4">
                                <Pagination
                                    currentPage={commissionData.pagination.page}
                                    totalPages={
                                        commissionData.pagination.total_pages
                                    }
                                    itemsPerPage={commissionData.pagination.limit}
                                    onPageChange={handlePageChange}
                                    onItemsPerPageChange={handleItemsPerPageChange}
                                    itemsPerPageOptions={PAGE_SIZE_OPTIONS}
                                />
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* ── Footer ── */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
                <Button
                    type="filledGray"
                    onClick={onClose}
                    className="px-6 py-2 rounded-lg"
                >
                    Close
                </Button>
            </div>
        </div>
    );
};

export default SettlementAmountModel;