import { useEffect, useState } from "react";
import { getTenantData } from "../../../../../utils/functions/tokenEncryption";

const ContactUsCard = ({ contact }) => {
    const tenant = getTenantData();
    const timeZone = tenant?.time_zone || "UTC";

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date
            .toLocaleString("en-GB", {
                timeZone: timeZone,
                weekday: "short",
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            })
            .replace(",", "");
    };

    const capitalizeFirst = (value) => {
        if (!value) return "-";
        return value.charAt(0).toUpperCase() + value.slice(1);
    };

    return (
        <div className="bg-white rounded-[15px] p-4 gap-[13px] flex items-center justify-between hover:shadow-md overflow-x-auto">

            <div className="inline-flex flex-col px-4 py-2 rounded-full bg-[#EFEFEF] whitespace-nowrap">
                <div className="w-[60px]">
                    <p className="text-xs text-center text-[#6C6C6C]">ID</p>
                    <p className="text-[#333333] text-center font-semibold text-sm">
                        #{contact?.id}
                    </p>
                </div>
            </div>

            <div className="inline-flex flex-col px-4 py-2 rounded-full bg-[#EFEFEF]">
                <div className="w-[150px]">
                    <p className="text-xs text-center text-[#6C6C6C]">Message</p>
                    <p className="text-[#333333] text-center font-semibold text-sm line-clamp-2">
                        {capitalizeFirst(contact?.user_type)}
                    </p>
                </div>
            </div>

            <div className="inline-flex flex-col px-4 py-2 rounded-full bg-[#EFEFEF] whitespace-nowrap">
                <div className="w-[80px]">
                    <p className="text-xs text-center text-[#6C6C6C]">User ID</p>
                    <p className="text-[#333333] text-center font-semibold text-sm">
                        {contact?.user_id}
                    </p>
                </div>
            </div>

            <div className="inline-flex flex-col px-4 py-2 rounded-full bg-[#EFEFEF]">
                <div className="w-[280px]">
                    <p className="text-xs text-center text-[#6C6C6C]">Message</p>
                    <p className="text-[#333333] text-center font-semibold text-sm line-clamp-2">
                        {capitalizeFirst(contact?.message)}
                    </p>
                </div>
            </div>

            <div className="inline-flex flex-col px-4 py-2 rounded-full bg-[#EFEFEF]">
                <div className="w-[160px]">
                    <p className="text-xs text-center text-[#6C6C6C]">Submitted At</p>
                    <p className="text-[#333333] text-center font-semibold text-sm line-clamp-2">
                        {formatDate(contact?.created_at)}
                    </p>
                </div>
            </div>
        </div >
    );
};

export default ContactUsCard;