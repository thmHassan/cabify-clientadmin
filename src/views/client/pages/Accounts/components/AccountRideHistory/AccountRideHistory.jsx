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
    const [itemsPerPage, setItemsPerPage] = useState(3);
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
            return `${(distanceInMeters / 1000).toFixed(2)} Km`;
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

    return (
        <div className="bg-white rounded-lg max-w-5xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex gap-5 justify-between items-center pb-4 bg-white px-6 pt-6">

                <h2 className="text-2xl font-semibold text-[#252525]">{account?.name || "Account"}</h2>
                <div className="flex items-center gap-4 mt-2">
                    <p className="text-sm text-gray-600">
                        Total Amount: <span className="font-semibold text-[#252525]">${rideHistory.reduce((sum, ride) => sum + parseFloat(ride.offered_amount || 0), 0).toFixed(2)}</span>
                    </p>
                    <Button
                        type="filled"
                        onClick={handleCollectAmount}
                        disabled={collecting}
                        className="px-4 py-2 rounded-lg text-sm"
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
            <div className="px-6 pb-6">
                <div className="space-y-3">
                    {paginatedRideHistory.map((ride, index) => (
                        <div
                            key={ride.id || index}
                            className="bg-white border-[1px] border-[#E9E9E9] rounded-[15px] p-4 gap-[13px] flex items-center justify-between hover:shadow-md overflow-x-auto"
                        >
                            <div className="inline-flex flex-col px-4 py-2 min-w-[165px]">
                                <p className="text-[#333333] text-center font-semibold text-sm">
                                    {ride?.booking_id || "N/A"}
                                </p>
                            </div>

                            <div className="inline-flex flex-col px-4 py-2 rounded-full bg-[#EFEFEF] min-w-[165px]">
                                <p className="text-xs text-center text-[#6C6C6C] mb-1">Customer Name</p>
                                <p className="text-[#333333] text-center font-semibold text-sm truncate">
                                    {ride?.name || "-"}
                                </p>
                            </div>

                            <div className="inline-flex flex-col px-4 py-2 rounded-full bg-[#EFEFEF] min-w-[240px]">
                                <p className="text-xs text-center text-[#6C6C6C] mb-1">Route</p>
                                <p className="text-[#333333] text-center font-semibold text-xs truncate">
                                    {ride?.pickup_location?.substring(0, 15) || "-"}... to {ride?.destination_location?.substring(0, 15) || "-"}...
                                </p>
                            </div>

                            <div className="inline-flex flex-col px-4 py-2 rounded-full bg-[#EFEFEF] min-w-[200px]">
                                <p className="text-xs text-center text-[#6C6C6C] mb-1">Time</p>
                                <p className="text-[#333333] text-center font-semibold text-sm">
                                    {ride?.pickup_time || "-"}
                                </p>
                            </div>

                            <div className="inline-flex flex-col px-4 py-2 rounded-full bg-[#EFEFEF] min-w-[110px]">
                                <p className="text-xs text-center text-[#6C6C6C] mb-1">Distance</p>
                                <p className="text-[#333333] text-center font-semibold text-sm">
                                    {formatDistance(ride?.distance || "0")}
                                </p>
                            </div>

                            <div className="inline-flex flex-col px-4 py-2 rounded-full bg-[#EFEFEF] min-w-[107px]">
                                <p className="text-xs text-center text-[#6C6C6C] mb-1">Fare</p>
                                <p className="text-[#333333] text-center font-semibold text-sm">
                                    {currencySymbol} {ride?.offered_amount || "0"}
                                </p>
                            </div>
                        </div>
                    ))}
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        itemsPerPage={itemsPerPage}
                        onPageChange={handlePageChange}
                        onItemsPerPageChange={handleItemsPerPageChange}
                        itemsPerPageOptions={PAGE_SIZE_OPTIONS}
                    />
                </div>
            </div>
        </div>
    );
};

export default AccountRideHistory;