import React from "react";

const RideHistory = ({ user }) => {
    const statusColors = {
        Rescheduled: "bg-[#F59E0B] text-white",
        Cancelled: "bg-[#FF4747] text-white",
        Onboarding: "bg-[#10B981] text-white",
    };

    return (
        <div
            className="bg-white rounded-[15px] p-4 flex items-center justify-between hover:shadow-md overflow-x-auto"
        >
            <div className="flex items-center gap-3">
                <div className="w-60">
                    <p className="font-semibold text-xl">{user.id}</p>
                    <p
                        className={`
                            text-[10px] px-3 py-1 rounded-full inline-block 
                            ${statusColors[user.status] || "bg-gray-100 text-gray-600"}
                        `}
                    >
                        {user.status}
                    </p>
                </div>
            </div>
            <div className="flex items-center justify-center gap-3">

                <div className="inline-flex flex-col px-4 py-2 rounded-full bg-gray-100 text-left whitespace-nowrap">
                    <p className="text-xs text-center text-gray-500">Driver Name</p>
                    <p className="text-black font-semibold text-sm">{user.driverName}</p>
                </div>

                <div className="inline-flex flex-col px-4 py-2 rounded-full bg-gray-100 text-left whitespace-nowrap">
                    <p className="text-xs text-center text-gray-500">Customer Name</p>
                    <p className="text-black font-semibold text-sm">{user.customerName}</p>
                </div>

                <div className="inline-flex flex-col px-4 py-2 rounded-full bg-gray-100 text-left whitespace-nowrap">
                    <p className="text-xs text-center text-gray-500">Route</p>
                    <p className="text-black font-semibold text-sm">{user.route}</p>
                </div>

                <div className="inline-flex flex-col px-4 py-2 rounded-full bg-gray-100 text-left whitespace-nowrap">
                    <p className="text-xs text-center text-gray-500">Time</p>
                    <p className="text-black font-semibold text-sm">{user.time}</p>
                </div>
                <div className="inline-flex flex-col px-4 py-2 rounded-full bg-gray-100 text-left whitespace-nowrap">
                    <p className="text-xs text-center text-gray-500">Fare</p>
                    <p className="text-black font-semibold text-sm">{user.fare}</p>
                </div>
                <div className="inline-flex flex-col px-4 py-2 rounded-full bg-gray-100 text-left whitespace-nowrap">
                    <p className="text-xs text-center text-gray-500">Distance</p>
                    <p className="text-black font-semibold text-sm">{user.distance}</p>
                </div>
            </div>
        </div>
    );
};

export default RideHistory;
