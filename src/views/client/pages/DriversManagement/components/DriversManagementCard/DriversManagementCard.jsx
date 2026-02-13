
import React, { useEffect, useState } from "react";
import UserDropdown from "../../../../../../components/shared/UserDropdown";
import Button from "../../../../../../components/ui/Button/Button";
import ThreeDotsIcon from "../../../../../../components/svg/ThreeDotsIcon";
import { apieditDriverStatus } from "../../../../../../services/DriverManagementService";
import toast from "react-hot-toast";
import { getTenantData } from "../../../../../../utils/functions/tokenEncryption";
import SettlementAmountModel from "../SettlementAmountModel";
import Modal from "../../../../../../components/shared/Modal/Modal";

const DriverManagementCard = ({ driver, onEdit, onDelete, onStatusChange }) => {
    const [status, setStatus] = useState(driver?.status || "pending");
    const [loading, setLoading] = useState(false);
    const [currencySymbol, setCurrencySymbol] = useState("₹");
    const [isSettlementOpen, setIsSettlementOpen] = useState(false);

    const currencySymbols = {
        INR: "₹",
        USD: "$",
        EUR: "€",
        GBP: "£",
        AUD: "A$",
        CAD: "C$",
        AED: "د.إ",
    };

    const actionOptions = [
        {
            label: "Edit",
            onClick: () => onEdit(driver),
        },
        {
            label: "Delete",
            onClick: () => onDelete(driver),
        },
    ];

    const getStatusOptions = () => {
        const statuses = [
            { value: "accepted", label: "Accept" },
            { value: "rejected", label: "Reject" },
            { value: "pending", label: "Pending" },
        ];

        return statuses
            .filter(s => s.value !== status)
            .map(s => ({
                label: s.label,
                onClick: () => handleStatusChange(s.value),
            }));
    };

    const handleStatusChange = async (newStatus) => {
        if (newStatus === status) return;
        setLoading(true);

        try {
            const response = await apieditDriverStatus({
                id: driver.id,
                status: newStatus,
            });

            if (response?.data?.success === 1) {
                setStatus(newStatus);

                toast.success(`Driver status changed to ${newStatus}`, {
                    duration: 4000,
                });

                if (onStatusChange) {
                    onStatusChange(driver.id, newStatus);
                }
            } else {
                toast.error(
                    response?.data?.message || "Failed to update driver status",
                    { duration: 4000 }
                );
            }
        } catch (error) {
            toast.error(
                error?.response?.data?.message ||
                error?.message ||
                "Something went wrong",
                { duration: 4000 }
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const tenant = getTenantData();

        if (tenant?.currency) {
            setCurrencySymbol(currencySymbols[tenant.currency] || tenant.currency);
        }
    }, []);

    return (
        <div className="bg-white rounded-[15px] p-4 gap-2 flex items-center justify-between hover:shadow-md overflow-x-auto">
            <div className="flex items-center gap-3">
                <div className="w-60">
                    <p className="font-semibold text-xl">{driver.name}</p>
                    <p className="text-[10px]">{driver.email}</p>
                    <p className="text-xs">{driver.phone}</p>
                </div>
            </div>
            <div className="flex items-center justify-center gap-3">
                <div className="inline-flex flex-col px-4 py-2 rounded-full bg-gray-100 text-left whitespace-nowrap">
                    <p className="text-xs text-center text-gray-500">Vehicle Type</p>
                    <p className="text-black text-center font-semibold text-sm">{driver.vahicleType || "Bike"}</p>
                </div>

                <div className="inline-flex flex-col px-4 py-2 rounded-full bg-gray-100 text-left whitespace-nowrap">
                    <p className="text-xs text-center text-gray-500">Change Req</p>
                    <p className="text-black text-center font-semibold text-sm">
                        {Number(driver.vehicle_change_request) > 0 ? "Yes" : "No"}
                    </p>
                </div>

                <div className="inline-flex flex-col px-4 py-2 rounded-full bg-gray-100 text-left whitespace-nowrap">
                    <p className="text-xs text-center text-gray-500">Referral Code</p>
                    <p className="text-black text-center font-semibold text-sm">{driver.referralCode || "123456"}</p>
                </div>

                <div className="inline-flex flex-col px-4 py-2 rounded-full bg-[#006FFF1A] text-left whitespace-nowrap">
                    <p className="text-xs text-center text-gray-500">Wallet Balance</p>
                    <p className="text-black text-center text-[#1F41BB] font-semibold text-sm"> {currencySymbol} {driver.wallet_balance || "0"}</p>
                </div>

                <UserDropdown options={getStatusOptions()} itemData={driver}>
                    <div
                        className={`${status === "accepted"
                            ? "bg-[#10B981] text-white"
                            : status === "rejected"
                                ? "bg-[#FF4747] text-white"
                                : "bg-[#F5C60B] text-white"
                            } text-center xl:h-10 lg:h-10 md:h-10 h-10 w-28 xl:py-3 lg:py-3 md:py-3 py-1 rounded-full flex items-center justify-center cursor-pointer`}
                    >
                        <p className="font-semibold text-sm">
                            {loading ? "Updating..." : status.charAt(0).toUpperCase() + status.slice(1)}
                        </p>
                        <svg
                            className="w-4 h-4 text-white ml-2"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </UserDropdown>

                <div>
                    <Button
                        type="filled"
                        className="py-2 px-2 rounded-md w-full sm:w-auto"
                        onClick={() => setIsSettlementOpen(true)}
                    >
                        Settlement Amount
                    </Button>
                </div>

                <UserDropdown options={actionOptions} itemData={driver}>
                    <Button className="w-10 h-10 bg-[#EFEFEF] rounded-full flex justify-center items-center">
                        <ThreeDotsIcon />
                    </Button>
                </UserDropdown>
            </div>

            <Modal isOpen={isSettlementOpen} onClose={() => setIsSettlementOpen(false)}>
                <SettlementAmountModel driver={driver} onClose={() => setIsSettlementOpen(false)} />
            </Modal>
        </div>
    );
};

export default DriverManagementCard;