import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { apiGetPackageHistory } from "../../../../../../services/DriverManagementService";
import AppLogoLoader from "../../../../../../components/shared/AppLogoLoader";
import Button from "../../../../../../components/ui/Button/Button";
import { getTenantData } from "../../../../../../utils/functions/tokenEncryption";

const PackageHistoryModal = ({ onClose, driver }) => {
    console.log("PackageHistoryModal driver----", driver);
    const [loading, setLoading] = useState(true);
    const [packageHistoryData, setPackageHistoryData] = useState(null);
    const [packageType, setPackageType] = useState(null);
    console.log("packageType----", packageType);
    const [currencySymbol, setCurrencySymbol] = useState("₹");

    const currencySymbols = {
        INR: "₹",
        USD: "$",
        EUR: "€",
        GBP: "£",
        AUD: "A$",
        CAD: "C$",
        AED: "د.إ",
    };

    useEffect(() => {
        const tenant = getTenantData();
        if (tenant?.currency) {
            setCurrencySymbol(currencySymbols[tenant.currency] || tenant.currency);
        }
    }, []);

    useEffect(() => {
        if (driver?.id) fetchPackageHistory();
    }, [driver?.id]);

    const fetchPackageHistory = async () => {
        if (!driver?.id) return;
        setLoading(true);
        try {
            const response = await apiGetPackageHistory(driver.id);
            console.log("response response:----", response);
            if (response?.data?.success === 1) {
                setPackageHistoryData(response.data.data);
                setPackageType(response.data.package_type);
            } else {
                toast.error(
                    response?.data?.message || "Failed to fetch package history",
                    { duration: 4000 }
                );
            }
        } catch (error) {
            console.log("Package history fetch error:", error);
            toast.error(
                error?.response?.data?.message || "Something went wrong",
                { duration: 4000 }
            );
        } finally {
            setLoading(false);
        }
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

    const packageEntries = packageHistoryData || [];
    const totalAmount = packageEntries.reduce((sum, entry) => sum + parseFloat(entry.amount || 0), 0);

    return (
        <div className="bg-white rounded-2xl max-w-4xl w-full mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 border-b border-gray-200">
                <div>
                    <h2 className="text-xl sm:text-2xl font-semibold text-[#252525]">
                        {driver?.name || "Driver"}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Package History</p>
                    
                    {!loading && (
                        <div className="mt-3 space-y-1">
                            <p className="text-xs text-gray-600">
                                <span className="font-medium">Email:</span> {driver?.email || 'N/A'}
                            </p>
                            <p className="text-xs text-gray-600">
                                <span className="font-medium">Phone:</span> {driver?.phone_no || driver?.phone || 'N/A'}
                            </p>
                            {packageType && (
                                <p className="text-xs text-gray-600">
                                    <span className="font-medium">Package Type:</span> {packageType}
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {!loading && packageEntries.length > 0 && (
                    <div className="flex flex-col items-end gap-1">
                        <p className="text-sm text-gray-500">
                            Total Amount:{" "}
                            <span className="font-semibold text-green-600">
                                {currencySymbol}
                                {totalAmount.toFixed(2)}
                            </span>
                        </p>
                        <p className="text-xs text-gray-400">
                            ({packageEntries.length} {packageEntries.length === 1 ? "entry" : "entries"})
                        </p>
                    </div>
                )}
            </div>

            <div className="p-4 sm:p-6">
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <AppLogoLoader />
                    </div>
                ) : packageEntries.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500 font-medium text-lg">
                            No package history available
                        </p>
                        <p className="text-gray-400 text-sm mt-2">
                            Package history will appear once the driver has completed package cycles.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3 mb-4">
                        {packageEntries.map((entry, index) => (
                            <div
                                key={index}
                                className="border border-[#E9E9E9] rounded-xl p-4 bg-white hover:shadow-md transition-all duration-200"
                            >
                                {/* Mobile View */}
                                <div className="block lg:hidden space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-1.5">
                                            <p className="text-xs font-semibold text-gray-500">
                                                Entry #{index + 1}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-gray-500 mb-1">
                                                Amount
                                            </p>
                                            <p className="font-semibold text-green-600">
                                                {currencySymbol}
                                                {parseFloat(entry.amount || 0).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">
                                            Period
                                        </p>
                                        <p className="text-sm font-medium text-[#333333]">
                                            {formatDate(entry.cycle_start_date)} → {formatDate(entry.cycle_end_date)}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">
                                            Description
                                        </p>
                                        <p className="text-sm font-medium text-[#333333]">
                                            {entry.description || 'Package entry'}
                                        </p>
                                    </div>
                                </div>

                                {/* Desktop View */}
                                <div className="hidden lg:flex items-center justify-between gap-3 overflow-x-auto">
                                    {/* Entry # */}
                                    <div className="inline-flex flex-col px-3 py-2 rounded-full bg-gray-100 text-center whitespace-nowrap min-w-[80px]">
                                        <p className="text-xs text-gray-500">
                                            Entry
                                        </p>
                                        <p className="text-black font-semibold text-sm">
                                            #{index + 1}
                                        </p>
                                    </div>

                                    {/* Period */}
                                    <div className="inline-flex flex-col px-3 py-2 rounded-full bg-gray-100 text-left whitespace-nowrap min-w-[220px]">
                                        <p className="text-xs text-gray-500">
                                            Period
                                        </p>
                                        <p className="text-black font-semibold text-sm">
                                            {formatDate(entry.cycle_start_date)} → {formatDate(entry.cycle_end_date)}
                                        </p>
                                    </div>

                                    {/* Description */}
                                    <div className="inline-flex flex-col px-3 py-2 rounded-full bg-gray-100 text-left whitespace-nowrap min-w-[200px] max-w-[300px]">
                                        <p className="text-xs text-gray-500">
                                            Description
                                        </p>
                                        <p className="text-black font-semibold text-sm truncate">
                                            {entry.description || 'Package entry'}
                                        </p>
                                    </div>

                                    {/* Amount */}
                                    <div className="inline-flex flex-col px-3 py-2 rounded-full bg-green-50 text-center whitespace-nowrap min-w-[110px]">
                                        <p className="text-xs text-gray-500">
                                            Amount
                                        </p>
                                        <p className="text-green-700 font-bold text-sm">
                                            {currencySymbol}
                                            {parseFloat(entry.amount || 0).toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
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

export default PackageHistoryModal;
