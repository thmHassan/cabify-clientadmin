import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { apiCollectAccount, apiGetAccountRideHistory } from "../../../../../../services/AccountService";
import Button from "../../../../../../components/ui/Button/Button";
import Pagination from "../../../../../../components/ui/Pagination/Pagination";
import { PAGE_SIZE_OPTIONS } from "../../../../../../constants/selectOptions";
import { getTenantData } from "../../../../../../utils/functions/tokenEncryption";

const AccountRideHistory = ({ account, handleClose }) => {
    const [rideHistory, setRideHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [collecting, setCollecting] = useState(false);
    const [distanceUnit, setDistanceUnit] = useState("Miles");
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

    const handleCollectAmount = async () => {
        try {
            setCollecting(true);

            const formData = new FormData();
            formData.append("account_id", account?.id);

            const response = await apiCollectAccount(formData);

            if (response?.data?.success === 1 || response?.status === 200) {
                toast.success("Amount collected successfully");
                fetchRideHistory();
                handleClose();
            } else {
                toast.error(response?.data?.message || "Failed to collect amount");
            }
        } catch (error) {
            console.error("Collect error:", error);
            toast.error("Something went wrong while collecting");
        } finally {
            setCollecting(false);
        }
    };

    useEffect(() => {
        if (account?.id) {
            fetchRideHistory();
        }
    }, [account]);

    const fetchRideHistory = async () => {
        setLoading(true);
        try {
            const response = await apiGetAccountRideHistory(account.id);

            if (response?.data?.success === 1) {
                setRideHistory(response?.data?.data || []);
            } else {
                setRideHistory([]);
                toast.error("Failed to fetch ride history");
            }
        } catch (error) {
            console.error("Error fetching ride history:", error);
            setRideHistory([]);
            toast.error("Error fetching ride history");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const tenant = getTenantData();

        if (tenant?.units) {
            const unit = tenant.units.toLowerCase() === "km" ? "Km" : "Miles";
            setDistanceUnit(unit);
        }

        if (tenant?.currency) {
            setCurrencySymbol(currencySymbols[tenant.currency] || tenant.currency);
        }
    }, []);

    const formatDistance = (distanceInMeters) => {
        if (!distanceInMeters) return "-";

        if (distanceUnit === "Km") {
            return `${(distanceInMeters / 1000).toFixed(2)}km`;
        }

        return `${(distanceInMeters / 1609.34).toFixed(2)} Miles`;
    };

    const totalPages = Math.ceil(rideHistory.length / itemsPerPage);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    const paginatedRideHistory = rideHistory.slice(startIndex, endIndex);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleItemsPerPageChange = (limit) => {
        setItemsPerPage(limit);
        setCurrentPage(1);
    };

    const calculateTotalAmount = () => {
        return rideHistory.reduce((sum, ride) => sum + parseFloat(ride.offered_amount || 0), 0).toFixed(2);
    };

    return (
        <div className="bg-white rounded-2xl max-w-4xl w-full mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 border-b border-gray-200">
                <h2 className="text-xl sm:text-2xl font-semibold text-[#252525]">
                    {account?.name || "Account"}
                </h2>

                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Total Amount:</span>
                        <span className="text-lg font-semibold text-[#252525]">
                            {currencySymbol}{calculateTotalAmount()}
                        </span>
                    </div>
                    <Button
                        type="filled"
                        onClick={handleCollectAmount}
                        disabled={collecting || loading}
                        className="px-6 py-2 rounded-lg text-sm font-medium bg-[#4F46E5] hover:bg-[#4338CA] text-white disabled:opacity-50"
                    >
                        {collecting ? "Collecting..." : "Collect"}
                    </Button>
                    <Button
                        type="filledGray"
                        onClick={handleClose}
                        className="px-6 py-2 rounded-lg"
                    >
                        Close
                    </Button>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6">
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4F46E5]"></div>
                    </div>
                ) : paginatedRideHistory.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        No ride history available
                    </div>
                ) : (
                    <>
                        <div className="space-y-3 mb-6">
                            {paginatedRideHistory.map((ride, index) => (
                                <div
                                    key={ride.id || index}
                                    className="bg-white border border-[#E9E9E9] rounded-xl p-4 hover:shadow-md transition-shadow duration-200"
                                >
                                    {/* Mobile Layout */}
                                    <div className="block lg:hidden space-y-3">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Booking ID</p>
                                                <p className="font-semibold text-[#333333]">
                                                    {ride?.booking_id || "N/A"}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-gray-500 mb-1">Fare</p>
                                                <p className="font-semibold text-[#333333]">
                                                    {currencySymbol}{ride?.offered_amount || "0"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Customer Name</p>
                                                <p className="text-sm font-medium text-[#333333] truncate">
                                                    {ride?.name || "-"}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Time</p>
                                                <p className="text-sm font-medium text-[#333333]">
                                                    {ride?.pickup_time || "-"}
                                                </p>
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Route</p>
                                            <p className="text-sm font-medium text-[#333333]">
                                                {ride?.pickup_location?.substring(0, 20) || "-"}... to {ride?.destination_location?.substring(0, 20) || "-"}...
                                            </p>
                                        </div>

                                        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Distance</p>
                                                <p className="text-sm font-medium text-[#333333]">
                                                    {formatDistance(ride?.distance || "0")}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Desktop Layout */}
                                    <div className="hidden lg:flex items-center justify-between gap-4">
                                        <div className="min-w-[120px]">
                                            <p className="text-xs text-gray-500 mb-1">Booking ID</p>
                                            <p className="font-semibold text-[#333333] text-sm">
                                                {ride?.booking_id || "N/A"}
                                            </p>
                                        </div>

                                        <div className="flex-1 min-w-[140px]">
                                            <p className="text-xs text-gray-500 mb-1 text-center">Customer Name</p>
                                            <p className="text-[#333333] text-center font-medium text-sm truncate px-2">
                                                {ride?.name || "-"}
                                            </p>
                                        </div>

                                        <div className="flex-1 min-w-[200px]">
                                            <p className="text-xs text-gray-500 mb-1 text-center">Route</p>
                                            <p className="text-[#333333] text-center font-medium text-xs truncate px-2">
                                                {ride?.pickup_location?.substring(0, 15) || "-"}... to {ride?.destination_location?.substring(0, 15) || "-"}...
                                            </p>
                                        </div>

                                        <div className="min-w-[140px]">
                                            <p className="text-xs text-gray-500 mb-1 text-center">Time</p>
                                            <p className="text-[#333333] text-center font-medium text-sm">
                                                {ride?.pickup_time || "-"}
                                            </p>
                                        </div>

                                        <div className="min-w-[100px]">
                                            <p className="text-xs text-gray-500 mb-1 text-center">Distance</p>
                                            <p className="text-[#333333] text-center font-medium text-sm">
                                                {formatDistance(ride?.distance || "0")}
                                            </p>
                                        </div>

                                        <div className="min-w-[100px]">
                                            <p className="text-xs text-gray-500 mb-1 text-center">Fare</p>
                                            <p className="text-[#333333] text-center font-semibold text-sm">
                                                {currencySymbol}{ride?.offered_amount || "0"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {rideHistory.length > 0 && (
                            <div className="border-t border-gray-200 pt-4">
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    itemsPerPage={itemsPerPage}
                                    onPageChange={handlePageChange}
                                    onItemsPerPageChange={handleItemsPerPageChange}
                                    itemsPerPageOptions={PAGE_SIZE_OPTIONS}
                                />
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default AccountRideHistory;