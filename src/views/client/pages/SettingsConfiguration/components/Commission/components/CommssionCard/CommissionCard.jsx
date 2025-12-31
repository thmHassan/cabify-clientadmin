import React from "react";
import UserDropdown from "../../../../../../../../components/shared/UserDropdown";
import Button from "../../../../../../../../components/ui/Button/Button";
import ThreeDotsIcon from "../../../../../../../../components/svg/ThreeDotsIcon";

const CommissionCard = ({ commission, onEdit, onDelete }) => {
    const actionOptions = [
        {
            label: "Edit",
            onClick: () => onEdit(commission),
        },
        {
            label: "Delete",
            onClick: () => onDelete(commission),
        },
    ];

    return (
        <div className="bg-white rounded-[15px] p-4 gap-2 flex items-center justify-between hover:shadow-md overflow-x-auto">
            <div className="flex items-center gap-3">
                <div className="w-auto">
                    <p className="font-semibold text-xl">{commission.package_name}</p>
                </div>
            </div>

            <div className="flex items-center justify-center gap-3">
                <div className="inline-flex flex-col px-4 py-2 rounded-full bg-[#EFEFEF] text-left whitespace-nowrap">
                    <p className="text-xs text-center text-[#6C6C6C]">Package Type</p>
                    <p className="text-[#333333] text-center font-semibold text-sm">{commission.package_type}</p>
                </div>

                <div className="inline-flex flex-col px-4 py-2 rounded-full bg-[#EFEFEF] text-left whitespace-nowrap">
                    <p className="text-xs text-center text-[#6C6C6C]">Duration</p>
                    <p className="text-[#333333] text-center font-semibold text-sm">{commission.package_duration}</p>
                </div>

                <div className="inline-flex flex-col px-4 py-2 rounded-full bg-[#EFEFEF] text-left whitespace-nowrap">
                    <p className="text-xs text-center text-[#6C6C6C]">Price</p>
                    <p className="text-[#333333] text-center font-semibold text-sm">${commission.package_price}</p>
                </div>

                <UserDropdown options={actionOptions} itemData={commission}>
                    <Button className="w-10 h-10 bg-[#EFEFEF] rounded-full flex justify-center items-center">
                        <ThreeDotsIcon />
                    </Button>
                </UserDropdown>
            </div>
        </div>
    );
};

export default CommissionCard;
