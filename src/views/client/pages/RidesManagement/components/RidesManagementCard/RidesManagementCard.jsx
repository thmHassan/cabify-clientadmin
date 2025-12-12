import React from "react";

const RidesManagementCard = ({ ride }) => {
    const statusColors = {
        pending: "bg-yellow-500 text-white",
        cancelled: "bg-red-500 text-white",
        completed: "bg-green-500 text-white",
        arrived: "bg-blue-500 text-white",
        waiting: "bg-purple-500 text-white",
        default: "bg-gray-100 text-gray-600"
    };

    return (
        <div className="bg-white rounded-[15px] p-4 flex items-center justify-between hover:shadow-md">

            <div className="flex items-start gap-3 w-40">
                <div>
                    <p className="font-semibold text-xl text-center">{ride.id}</p>
                    <p
                        className={`text-[10px] px-3 py-1 rounded-full inline-block 
                        ${statusColors[ride.booking_status] || statusColors.default}`}
                    >
                        {ride.booking_status}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-3">

                <div className="inline-flex flex-col px-4 py-2 rounded-full bg-gray-100">
                    <p className="text-xs text-gray-500 text-center">Driver</p>
                    <p className="text-black font-semibold text-sm">{ride.driver}</p>
                </div>

                <div className="inline-flex flex-col px-4 py-2 rounded-full bg-gray-100">
                    <p className="text-xs text-gray-500 text-center">Customer</p>
                    <p className="text-black font-semibold text-sm">{ride.name}</p>
                </div>

                <div className="inline-flex flex-col px-4 py-2 rounded-full bg-gray-100">
                    <p className="text-xs text-gray-500 text-center">Route</p>
                    <p className="text-black font-semibold text-sm">
                        {ride.pickup_location} → {ride.destination_location}
                    </p>
                </div>

                <div className="inline-flex flex-col px-4 py-2 rounded-full bg-gray-100">
                    <p className="text-xs text-gray-500 text-center">Time</p>
                    <p className="text-black font-semibold text-sm">{ride.pickup_time}</p>
                </div>

                <div className="inline-flex flex-col px-4 py-2 rounded-full bg-gray-100">
                    <p className="text-xs text-gray-500 text-center">Fare</p>
                    <p className="text-black font-semibold text-sm">₹ {ride.booking_amount}</p>
                </div>

                <div className="inline-flex flex-col px-4 py-2 rounded-full bg-gray-100">
                    <p className="text-xs text-gray-500 text-center">Distance</p>
                    <p className="text-black font-semibold text-sm">{ride.distance} km</p>
                </div>

            </div>
        </div>
    );
};

export default RidesManagementCard;
