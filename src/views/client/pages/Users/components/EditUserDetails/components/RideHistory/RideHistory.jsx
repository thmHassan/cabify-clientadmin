import React, { useEffect, useState } from "react";
import { getTenantData } from "../../../../../../../../utils/functions/tokenEncryption";

const RideHistory = ({ user }) => {

    const currencySymbols = {
        INR: "₹",
        USD: "$",
        EUR: "€",
        GBP: "£",
        AUD: "A$",
        CAD: "C$",
        AED: "د.إ",
    };

    const [distanceUnit, setDistanceUnit] = useState("Miles");
    const [currencySymbol, setCurrencySymbol] = useState("₹");

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

    const statusColors = {
        pending: "bg-[#F5C60B] text-white",
        cancelled: "bg-[#E24B4B] text-white",
        ongoing: "bg-[#10B981] text-white",
    };

    const capitalizeFirst = (value) => {
        if (!value) return "-";
        return value.charAt(0).toUpperCase() + value.slice(1);
    };

    const formatAmount = (amount) => {
        if (amount === null || amount === undefined) return "-";
        return Number(amount).toFixed(2);
    };


    return (
        <div
            className="bg-white rounded-[15px] p-4 flex items-center justify-between hover:shadow-md overflow-x-auto"
        >
            <div className="flex items-center gap-3">
                <div className="w-60">
                    <p className="font-semibold text-xl">{user.booking_id}</p>
                    <p
                        className={`text-[10px] px-3 py-1 rounded-full inline-block 
                        ${statusColors[user.booking_status] || "bg-[#EFEFEF] text-gray-600"}`}
                    >
                        {capitalizeFirst(user.booking_status)}
                    </p>
                </div>
            </div>
            <div className="flex items-center justify-center gap-3">

                <div className="inline-flex flex-col px-4 py-2 rounded-full bg-[#EFEFEF] text-left whitespace-nowrap w-[160px]">
                    <p className="text-xs text-center text-[#6C6C6C]">Driver Name</p>
                    <p className="text-[#333333] text-center font-semibold text-sm">{capitalizeFirst(user?.driver_detail?.name || "-")}</p>
                </div>

                <div className="inline-flex flex-col px-4 py-2 rounded-full bg-[#EFEFEF] text-left whitespace-nowrap w-[160px]">
                    <p className="text-xs text-center text-[#6C6C6C]">Customer Name</p>
                    <p className="text-[#333333] text-center font-semibold text-sm">{capitalizeFirst(user.name)}</p>
                </div>

                <div className="inline-flex flex-col px-4 py-2 rounded-full bg-[#EFEFEF] text-left whitespace-nowrap w-[245px]">
                    <p className="text-xs text-center text-[#6C6C6C]">Route</p>
                    <p className="text-[#333333] text-center font-semibold text-sm">{user.route || "-"}</p>
                </div>

                <div className="inline-flex flex-col px-4 py-2 rounded-full bg-[#EFEFEF] text-left whitespace-nowrap w-[210px]">
                    <p className="text-xs text-center text-[#6C6C6C]">Time</p>
                    <p className="text-[#333333] text-center font-semibold text-sm">{user.pickup_time}</p>
                </div>
                <div className="inline-flex flex-col px-4 py-2 rounded-full bg-[#EFEFEF] text-left whitespace-nowrap w-[107px]">
                    <p className="text-xs text-center text-[#6C6C6C]">Fare</p>
                    <p className="text-[#333333] text-center font-semibold text-sm"> {currencySymbol} {formatAmount(user.booking_amount)}</p>
                </div>
                <div className="inline-flex flex-col px-4 py-2 rounded-full bg-[#EFEFEF] text-left whitespace-nowrap w-[110px]">
                    <p className="text-xs text-center text-[#6C6C6C]">Distance</p>
                    <p className="text-[#333333] text-center font-semibold text-sm">{formatDistance(user.distance)}</p>
                </div>
            </div>
        </div>
    );
};

export default RideHistory;
