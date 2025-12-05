import React from "react";

const RidesManagementCard = ({ ride }) => {
    return (
        <div
            className="bg-white rounded-[15px] p-4 gap-2 flex items-center justify-between hover:shadow-md overflow-x-auto"
        >
            <div className="flex items-center gap-3">
                <div className="w-60">
                    <p className="font-semibold text-xl">{ride.id}</p>
                    <p className="text-[10px]">{ride.status}</p>
                </div>
            </div>

            <div className="flex items-center justify-center gap-3 flex-wrap">

                <div className="inline-flex flex-col px-4 py-2 rounded-full bg-gray-100 text-left whitespace-nowrap">
                    <p className="text-xs text-gray-500">Driver Name</p>
                    <p className="text-black font-semibold text-sm">{ride.driverName}</p>
                </div>

                <div className="inline-flex flex-col px-4 py-2 rounded-full bg-gray-100 text-left whitespace-nowrap">
                    <p className="text-xs text-gray-500">Customer Name</p>
                    <p className="text-black font-semibold text-sm">{ride.customerName}</p>
                </div>

                <div className="inline-flex flex-col px-4 py-2 rounded-full bg-gray-100 text-left whitespace-nowrap">
                    <p className="text-xs text-gray-500">Route</p>
                    <p className="text-black font-semibold text-sm">{ride.route}</p>
                </div>

                <div className="inline-flex flex-col px-4 py-2 rounded-full bg-gray-100 text-left whitespace-nowrap">
                    <p className="text-xs text-gray-500">Time</p>
                    <p className="text-black font-semibold text-sm">{ride.time}</p>
                </div>

                <div className="inline-flex flex-col px-4 py-2 rounded-full bg-gray-100 text-left whitespace-nowrap">
                    <p className="text-xs text-gray-500">Fare</p>
                    <p className="text-black font-semibold text-sm">{ride.fare}</p>
                </div>

                <div className="inline-flex flex-col px-4 py-2 rounded-full bg-gray-100 text-left whitespace-nowrap">
                    <p className="text-xs text-gray-500">Distance</p>
                    <p className="text-black font-semibold text-sm">{ride.distance}</p>
                </div>

            </div>
        </div>
    );
};

export default RidesManagementCard;
