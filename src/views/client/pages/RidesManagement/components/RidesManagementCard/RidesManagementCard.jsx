import React from "react";
import UserDropdown from "../../../../../../components/shared/UserDropdown";
import Button from "../../../../../../components/ui/Button/Button";
import ThreeDotsIcon from "../../../../../../components/svg/ThreeDotsIcon";

const RidesManagementCard = ({ ride, onView }) => {

    const statusColors = {
        pending: "bg-yellow-500 text-white",
        cancelled: "bg-red-500 text-white",
        completed: "bg-green-500 text-white",
        arrived: "bg-blue-500 text-white",
        waiting: "bg-purple-500 text-white",
        default: "bg-gray-100 text-gray-600"
    };

    const actionOptions = [
        {
            label: "View",
            onClick: () => onView(ride),
        },
    ];

    return (

        <div className="bg-white rounded-[15px] p-4 mx-4 hover:shadow-md w-full overflow-x-auto">
            <div className="flex items-center gap-3">

                <div className="flex flex-col gap-2 flex-shrink-0">
                    <div className="w-52">
                        <p className="font-semibold text-xl">{ride.booking_id}</p>
                        <p
                            className={`text-[10px] px-4 py-2 font-bold rounded-full inline-block
                        ${statusColors[ride.booking_status] || statusColors.default}`}
                        >
                            {ride.booking_status}
                        </p>
                    </div>
                </div>

                <div className="inline-flex flex-col px-4 py-2 rounded-full bg-gray-100 flex-shrink-0">
                    <p className="text-xs font-semibold text-gray-500 text-center">Driver</p>
                    <p className="text-black text-center text-sm">{ride.driver|| "driver name"}</p>
                </div>

                <div className="inline-flex flex-col px-4 py-2 rounded-full bg-gray-100 flex-shrink-0">
                    <p className="text-xs font-semibold text-gray-500 text-center">Customer</p>
                    <p className="text-black text-center text-sm">{ride.name}</p>
                </div>

                <div className="inline-flex flex-col px-4 py-2 rounded-full bg-gray-100 flex-shrink-0">
                    <p className="text-xs font-semibold text-gray-500 text-center">Route</p>
                    <p className="flex flex-col text-black text-center text-sm">
                        <span>{ride.pickup_location}</span>
                        <span>{ride.destination_location}</span>
                    </p>
                </div>

                <div className="inline-flex flex-col px-4 py-2 rounded-full bg-gray-100 flex-shrink-0">
                    <p className="text-xs font-semibold text-gray-500 text-center">Time</p>
                    <p className="text-black text-center text-sm">{ride.pickup_time}</p>
                </div>

                <div className="inline-flex flex-col px-4 py-2 rounded-full bg-gray-100 flex-shrink-0">
                    <p className="text-xs font-semibold text-gray-500 text-center">Fare</p>
                    <p className="text-black text-center text-sm">₹ {ride.booking_amount}</p>
                </div>

                <div className="inline-flex flex-col px-4 py-2 rounded-full bg-gray-100 flex-shrink-0">
                    <p className="text-xs font-semibold text-gray-500 text-center">Distance</p>
                    <p className="text-black text-center text-sm">{ride.distance} km</p>
                </div>

                <UserDropdown options={actionOptions} itemData={ride}>
                    <Button className="w-10 h-10 bg-[#EFEFEF] rounded-full flex justify-center items-center">
                        <ThreeDotsIcon />
                    </Button>
                </UserDropdown>
            </div>
        </div>

    );
};

export default RidesManagementCard;
