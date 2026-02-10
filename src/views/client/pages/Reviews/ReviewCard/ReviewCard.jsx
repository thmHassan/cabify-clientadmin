import React from "react";
import { useNavigate } from "react-router-dom";

const ReviewCard = ({ rating }) => {
    const navigate = useNavigate();

    const handleUserClick = () => {
        const userId = rating?.booking_detail?.user_detail?.id;
        if (userId) {
            navigate(`/users/${userId}`);
        }
    };

    const handleDriverClick = () => {
        const driverId = rating?.booking_detail?.driver_detail?.id;
        if (driverId) {
            navigate(`/driver-management/${driverId}`);
        }
    };

    return (
        <div
            className="bg-white rounded-[15px] p-4 gap-[70px] flex items-center hover:shadow-md overflow-x-auto"
        >
            <div className="flex items-center gap-3">
                <div className="inline-flex flex-col px-4 py-2 rounded-full bg-[#EFEFEF] text-left whitespace-nowrap">
                    <p className="text-xs text-center text-[#6C6C6C]">Ride ID</p>
                    <p className="text-[#333333] text-center font-semibold text-sm line-clamp-1">{rating?.booking_detail?.booking_id || "0"}</p>
                </div>
            </div>
            <div className="flex items-center justify-center gap-3">
                <div
                    onClick={handleUserClick}
                    className={`inline-flex flex-col px-4 py-2 rounded-full bg-[#EFEFEF] text-left whitespace-nowrap w-[165px] ${rating?.booking_detail?.user_detail?.id ? 'cursor-pointer hover:bg-[#E0E0E0] transition-colors' : ''
                        }`}
                >
                    <p className="text-xs text-center text-[#6C6C6C]">User Name</p>
                    <p className="text-[#333333] text-center font-semibold text-sm line-clamp-1">
                        {rating?.booking_detail?.user_detail?.name || "-"}
                    </p>
                </div>

                <div
                    onClick={handleDriverClick}
                    className={`inline-flex flex-col px-4 py-2 rounded-full bg-[#EFEFEF] text-left whitespace-nowrap w-[165px] ${rating?.booking_detail?.driver_detail?.id ? 'cursor-pointer hover:bg-[#E0E0E0] transition-colors' : ''
                        }`}
                >
                    <p className="text-xs text-center text-[#6C6C6C]">Driver Name</p>
                    <p className="text-[#333333] text-center font-semibold text-sm line-clamp-1">
                        {rating?.booking_detail?.driver_detail?.name || "-"}
                    </p>
                </div>

                <div className="inline-flex flex-col px-4 py-2 rounded-full bg-[#EFEFEF] text-left whitespace-nowrap w-[133px]">
                    <p className="text-xs text-center text-[#6C6C6C]">Driver Rating</p>
                    <p className="text-[#333333] text-center font-semibold text-sm line-clamp-1">{rating?.booking_detail?.driver_detail?.rating || "0"}</p>
                </div>
                <div className="inline-flex flex-col px-4 py-2 rounded-full bg-[#EFEFEF] w-[350px]">
                    <p className="text-xs text-[#6C6C6C]">User Comment</p>
                    <p className="text-[#333333] font-semibold text-[12px] line-clamp-2">
                        {rating.comment || "-"}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default ReviewCard;