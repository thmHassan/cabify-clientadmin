import React, { useEffect, useState } from "react";
import UserDropdown from "../../../../../../components/shared/UserDropdown";
import Button from "../../../../../../components/ui/Button/Button";
import ThreeDotsIcon from "../../../../../../components/svg/ThreeDotsIcon";
import { getTenantData } from "../../../../../../utils/functions/tokenEncryption";

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

    const [distanceUnit, setDistanceUnit] = useState("Miles");

    useEffect(() => {
        const tenant = getTenantData();

        if (tenant?.units) {
            const unit = tenant.units.toLowerCase() === "km" ? "Km" : "Miles";
            setDistanceUnit(unit);
        }

    }, []);

    const formatDistance = (distanceInMeters) => {
        if (!distanceInMeters) return "-";

        if (distanceUnit === "Km") {
            return `${(distanceInMeters / 1000).toFixed(2)} Km`;
        }

        return `${(distanceInMeters / 1609.34).toFixed(2)} Miles`;
    };

    const capitalizeFirst = (value) => {
        if (!value) return "-";
        return value.charAt(0).toUpperCase() + value.slice(1);
    };

    return (
        <div
            className="bg-white rounded-[15px] p-4 gap-2 flex items-center justify-between hover:shadow-md overflow-auto"
        >
            <div className="flex gap-2">
                <div className="w-[100px] h-[60px]">
                    <img
                        src={`${import.meta.env.VITE_BACKEND_URL}${vehicle.vehicle_image}`}
                        className="w-full h-full rounded-md border-[1px] border-[#D7D7D7]"
                        alt="vehicle"
                    />
                </div>
                <div className="w-60">
                    <p className="font-semibold text-xl text-[#333333]">{vehicle.vehicle_type_name}</p>
                </div>
            </div>
            <div className="flex items-center justify-center gap-3">

                <div className="inline-flex flex-col px-4 py-2 rounded-full bg-[#EFEFEF] text-left whitespace-nowrap w-[140px]">
                    <p className="text-xs text-center text-[#6C6C6C]">Minimum Distance</p>
                    <p className="text-[#333333] font-semibold text-sm text-center">{vehicle.minimum_distance || "-"}</p>
                    {/* <p className="text-[#333333] font-semibold text-sm text-center">{formatDistance(vehicle.minimum_distance || "-")}</p> */}
                </div>

                <div className="inline-flex flex-col px-4 py-2 rounded-full bg-[#EFEFEF] text-left whitespace-nowrap w-[150px]">
                    <p className="text-xs text-center text-[#6C6C6C]">Mileage System</p>
                    <p className="text-[#333333] font-semibold text-sm text-center">{vehicle.mileage_system || "-"}</p>
                </div>

                <div className="inline-flex flex-col px-4 py-2 rounded-full bg-[#EFEFEF] text-left w-[165px]">
                    <p className="text-xs text-center text-[#6C6C6C]">Features</p>

                    {vehicle?.attributes && Object.keys(vehicle.attributes).length > 0 ? (
                        <p className="text-[#333333] font-semibold text-sm text-center truncate">
                            {Object.keys(vehicle.attributes)
                                .map((key) => capitalizeFirst(key))
                                .join(", ")}
                        </p>
                    ) : (
                        <p className="text-[#333333] font-semibold text-sm text-center">-</p>
                    )}
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
