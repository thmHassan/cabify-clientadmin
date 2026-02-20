import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { apiCollectDriverCommission, apiGetDriverCommissionEntries } from "../../../../../../services/DriverManagementService";
import AppLogoLoader from "../../../../../../components/shared/AppLogoLoader";
import Button from "../../../../../../components/ui/Button/Button";
import { getTenantData } from "../../../../../../utils/functions/tokenEncryption";
import Pagination from "../../../../../../components/ui/Pagination/Pagination";
import { PAGE_SIZE_OPTIONS } from "../../../../../../constants/selectOptions";

const SettlementAmountModel = ({ onClose, driver }) => {
    const [loading, setLoading] = useState(true);
    const [collecting, setCollecting] = useState(false);
    const [commissionData, setCommissionData] = useState(null);
    const [currencySymbol, setCurrencySymbol] = useState("₹");
    const [currentPage, setCurrentPage] = useState(1);
    const LIMIT = 10;
    const [itemsPerPage, setItemsPerPage] = useState(LIMIT);

    const currencySymbols = {
        INR: "₹", USD: "$", EUR: "€", GBP: "£",
        AUD: "A$", CAD: "C$", AED: "د.إ",
    };

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
            const response = await apiGetDriverCommissionEntries(driver.id, page, limit);
            if (response?.data?.success === 1) {
                setCommissionData(response.data.data);
                setCurrentPage(page);
            } else {
                toast.error(response?.data?.message || "Failed to fetch commission data", { duration: 4000 });
            }
        } catch (error) {
            // toast.error(
            //     error?.response?.data?.message || error?.message || "Failed to fetch commission entries",
            //     { duration: 4000 }
            // );
        } finally {
            setLoading(false);
        }
    };

    const handleCollectCommission = async (entry) => {
        if (!driver?.id) return;

        setCollecting(true);
        try {
            const response = await apiCollectDriverCommission(driver.id);
            if (response?.data?.success === 1) {
                toast.success("Commission collected successfully!", { duration: 4000 });
                await fetchCommissionEntries(currentPage);
                setTimeout(() => window.location.reload(), 1500);
            } else {
                toast.error(response?.data?.message || "Failed to collect commission", { duration: 4000 });
            }
        } catch (error) {
            toast.error(
                error?.response?.data?.message || error?.message || "Failed to collect commission",
                { duration: 4000 }
            );
        } finally {
            setCollecting(false);
        }
    };

    const handlePageChange = (page) => {
        fetchCommissionEntries(page, itemsPerPage);
    };

    const handleItemsPerPageChange = (limit) => {
        setItemsPerPage(limit);
        fetchCommissionEntries(1, limit);
    };

    const formatDate = (dateString) => {
        if (!dateString) return "Not Set";
        try {
            return new Date(dateString).toLocaleDateString('en-GB', {
                day: '2-digit', month: 'short', year: 'numeric'
            });
        } catch {
            return "Invalid Date";
        }
    };

    // Filter entries where amount > 0
    const validEntries = commissionData?.commission_entries?.filter(
        entry => parseFloat(entry.amount) > 0
    ) || [];

    return (
        <div className="bg-white rounded-2xl max-w-4xl w-full mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 border-b border-gray-200">
                <div>
                    <h2 className="text-xl sm:text-2xl font-semibold text-[#252525]">
                        {driver?.name || "Driver"}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Commission Settlement</p>
                </div>
            </div>

            <div className="p-4 sm:p-6">
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <AppLogoLoader />
                    </div>
                ) : validEntries.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500 font-medium text-lg">No commission entries available</p>
                        <p className="text-gray-400 text-sm mt-2">
                            Commission will appear here once the driver completes rides.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="space-y-3 mb-4">
                            {validEntries.map((entry, index) => (
                                <div
                                    key={index}
                                    className="bg-white border border-[#E9E9E9] rounded-xl p-4 hover:shadow-md transition-shadow duration-200"
                                >
                                    {/* Mobile View */}
                                    <div className="block lg:hidden space-y-3">
                                        <div className="flex justify-between items-start">
                                            <div className="text-right">
                                                <p className="text-xs text-gray-500 mb-1">Amount Due</p>
                                                <p className="font-semibold text-red-600">{currencySymbol}{entry.amount}</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Cycle Period</p>
                                                <p className="text-sm font-medium text-[#333333]">{entry.days_in_cycle} days</p>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Date Range</p>
                                            <p className="text-sm font-medium text-[#333333]">
                                                {formatDate(entry.cycle_start_date)} → {formatDate(entry.cycle_end_date)}
                                            </p>
                                        </div>
                                        {commissionData.package_type === 'commission_without_topup' && entry.total_rides_amount && (
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Rides Amount</p>
                                                <p className="text-sm font-medium text-[#333333]">{currencySymbol}{entry.total_rides_amount}</p>
                                            </div>
                                        )}
                                        <div className="flex justify-end pt-2 border-t border-gray-100">
                                            <Button
                                                type="filled"
                                                onClick={() => handleCollectCommission(entry)}
                                                disabled={collecting || loading}
                                                className="px-4 py-1.5 rounded-lg text-xs font-medium disabled:opacity-50"
                                            >
                                                {collecting ? "Collecting..." : "Collect"}
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Desktop View */}
                                    <div className="hidden lg:flex items-center justify-between gap-4 overflow-x-auto">
                                        <div className="inline-flex flex-col px-2 py-2 rounded-full bg-gray-100 text-center whitespace-nowrap min-w-[120px]">
                                            <p className="text-xs text-gray-500">Cycle Period</p>
                                            <p className="text-black font-semibold text-sm">{entry.days_in_cycle} days</p>
                                        </div>
                                        <div className="inline-flex flex-col px-2 py-2 rounded-full bg-gray-100 text-center whitespace-nowrap min-w-[230px]">
                                            <p className="text-xs text-gray-500">Date Range</p>
                                            <p className="text-black font-semibold text-sm">
                                                {formatDate(entry.cycle_start_date)} → {formatDate(entry.cycle_end_date)}
                                            </p>
                                        </div>
                                        {commissionData.package_type === 'commission_without_topup' && entry.total_rides_amount && (
                                            <div className="inline-flex flex-col px-2 py-2 rounded-full bg-gray-100 text-center whitespace-nowrap min-w-[130px]">
                                                <p className="text-xs text-gray-500">Rides Amount</p>
                                                <p className="text-black font-semibold text-sm">{currencySymbol}{entry.total_rides_amount}</p>
                                            </div>
                                        )}
                                        <div className="inline-flex flex-col px-2 py-2 rounded-full bg-red-50 text-center whitespace-nowrap min-w-[120px]">
                                            <p className="text-xs text-gray-500">Amount Due</p>
                                            <p className="text-red-600 font-bold text-sm">{currencySymbol}{entry.amount}</p>
                                        </div>
                                        <div className="whitespace-nowrap">
                                            <Button
                                                type="filled"
                                                onClick={() => handleCollectCommission(entry)}
                                                disabled={collecting || loading}
                                                className="px-6 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                                            >
                                                {collecting ? "Collecting..." : "Collect"}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {commissionData?.pagination?.total > 0 && (
                            <div className="border-t border-gray-200 pt-4">
                                <Pagination
                                    currentPage={commissionData.pagination.page}
                                    totalPages={commissionData.pagination.total_pages}
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

            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
                <Button type="filledGray" onClick={onClose} className="px-6 py-2 rounded-lg">
                    Close
                </Button>
            </div>
        </div>
    );
};

export default SettlementAmountModel;