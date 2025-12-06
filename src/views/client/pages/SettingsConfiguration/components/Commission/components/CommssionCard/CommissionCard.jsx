import React from "react";
import UserDropdown from "../../../../../../../../components/shared/UserDropdown";
import Button from "../../../../../../../../components/ui/Button/Button";
import ThreeDotsIcon from "../../../../../../../../components/svg/ThreeDotsIcon";


const CommissionCard = ({ commission, onEdit }) => {
    const actionOptions = [
        {
            label: "View",
            onClick: () => alert(`Viewing ${commission.name}`),
        },
        {
            label: "Edit",
            onClick: () => onEdit(commission),
        },
        {
            label: "Delete",
            onClick: () => alert(`Deleting ${commission.name}`),
        },
    ];
    return (
        <div
            className="bg-white rounded-[15px] p-4 gap-2 flex items-center justify-between hover:shadow-md overflow-x-auto"
        >
            <div className="flex items-center gap-3">
                <div className="w-60">
                    <p className="font-semibold text-xl">{commission.name}</p>
                </div>
            </div>
            <div className="flex items-center justify-center gap-3 flex-wrap">

                <div className="inline-flex flex-col px-4 py-2 rounded-full bg-gray-100 text-left whitespace-nowrap">
                    <p className="text-xs text-center text-gray-500">Commission Type</p>
                    <p className="text-black font-semibold text-sm">{commission.type}</p>
                </div>

                <div className="inline-flex flex-col px-4 py-2 rounded-full bg-gray-100 text-left whitespace-nowrap">
                    <p className="text-xs text-center text-gray-500">Duration</p>
                    <p className="text-black font-semibold text-sm">{commission.duration}</p>
                </div>

                <div className="inline-flex flex-col px-4 py-2 rounded-full bg-gray-100 text-left whitespace-nowrap">
                    <p className="text-xs text-center text-gray-500">Price</p>
                    <p className="text-black font-semibold text-sm">${commission.price}</p>
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
