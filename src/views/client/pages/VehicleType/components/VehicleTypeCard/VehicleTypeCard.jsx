import React from "react";
import UserDropdown from "../../../../../../components/shared/UserDropdown";
import Button from "../../../../../../components/ui/Button/Button";
import ThreeDotsIcon from "../../../../../../components/svg/ThreeDotsIcon";

const VehicleTypeCard = ({ vehicle, onEdit }) => {
    const actionOptions = [
        {
            label: "View",
            onClick: () => alert(`Viewing ${vehicle.name}`),
        },
        {
            label: "Edit",
            onClick: () => onEdit(vehicle),
        },
        {
            label: "Delete",
            onClick: () => alert(`Deleting ${vehicle.name}`),
        },
    ];
    return (
        <div
            className="bg-white rounded-[15px] p-4 gap-2 flex items-center justify-between hover:shadow-md overflow-x-auto"
        >
            <div className="flex items-center gap-3">
                <img
                    src={vehicle.picture}
                    className="w-14 h-14 rounded-md object-cover"
                    alt=""
                />
                <div className="w-60">
                    <p className="font-semibold text-xl">{vehicle.name}</p>
                </div>
            </div>
            <div className="flex items-center justify-center gap-3 flex-wrap">

                <div className="inline-flex flex-col px-4 py-2 rounded-full bg-gray-100 text-left whitespace-nowrap">
                    <p className="text-black font-semibold text-sm">{vehicle.seats}</p>
                </div>

                <div className="inline-flex flex-col px-4 py-2 rounded-full bg-gray-100 text-left whitespace-nowrap">
                    <p className="text-black font-semibold text-sm">{vehicle.cubic}</p>
                </div>

                <div className="inline-flex flex-col px-4 py-2 rounded-full bg-[#1F41BB] text-white text-left whitespace-nowrap">
                    <p className="text-white font-semibold text-sm">View</p>
                </div>

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
