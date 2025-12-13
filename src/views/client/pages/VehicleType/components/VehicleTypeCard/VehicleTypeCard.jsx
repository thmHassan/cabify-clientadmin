import React from "react";
import UserDropdown from "../../../../../../components/shared/UserDropdown";
import Button from "../../../../../../components/ui/Button/Button";
import ThreeDotsIcon from "../../../../../../components/svg/ThreeDotsIcon";

const VehicleTypeCard = ({ vehicle, onEdit, onDelete }) => {
    const actionOptions = [
        {
            label: "Edit",
            onClick: () => onEdit(vehicle),
        },
        {
            label: "Delete",
            onClick: () => onDelete(vehicle),
        },
    ];
    return (
        <div
            className="bg-white rounded-[15px] p-4 gap-2 flex items-center justify-between hover:shadow-md overflow-x-auto"
        >
            <div className="flex items-center gap-3">
                <img
                    src={`${import.meta.env.VITE_BACKEND_URL}${vehicle.vehicle_image}`}
                    className="w-14 h-14 rounded-md object-cover"
                    alt="vehicle"
                />
                <div className="w-60">
                    <p className="font-semibold text-xl">{vehicle.vehicle_type_name}</p>
                </div>
            </div>
            <div className="flex items-center justify-center gap-3 flex-wrap">

                <div className="inline-flex flex-col px-4 py-2 rounded-full bg-gray-100 text-left whitespace-nowrap">
                    <p className="text-xs text-center text-gray-500">Distance</p>
                    <p className="text-black font-semibold text-sm">{vehicle.minimum_distance}</p>
                </div>

                <div className="inline-flex flex-col px-4 py-2 rounded-full bg-gray-100 text-left whitespace-nowrap">
                    <p className="text-xs text-center text-gray-500">System</p>
                    <p className="text-black font-semibold text-sm">{vehicle.mileage_system}</p>
                </div>

                <Button
                    type="filled"
                    btnSize="md"
                    onClick={() => onEdit(vehicle)}
                    className="px-6 py-2"
                >
                    <span>View</span>
                </Button>

                <UserDropdown options={actionOptions} itemData={vehicle}>
                    <Button className="w-10 h-10 bg-[#EFEFEF] rounded-full flex justify-center items-center">

                        <ThreeDotsIcon />
                    </Button>
                </UserDropdown>

            </div>
        </div>
    );
};

export default VehicleTypeCard;
