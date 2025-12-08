import React from "react";
import UserDropdown from "../../../../../../components/shared/UserDropdown";
import Button from "../../../../../../components/ui/Button/Button";
import ThreeDotsIcon from "../../../../../../components/svg/ThreeDotsIcon";

const SubCompantCard = ({ company, onEdit, onDelete }) => {
    const actionOptions = [
        {
            label: "Edit",
            onClick: () => onEdit(company),
        },
        {
            label: "Delete",
            onClick: () => onDelete(company),
        },
    ];
    return (

        <div
            className="bg-white rounded-[15px] p-4 gap-2 flex items-center justify-between hover:shadow-md overflow-x-auto"
        >
            <div className="flex items-center gap-3">
                <p className="font-semibold text-xl">{company.name}</p>
            </div>

            <div className="flex items-center justify-center gap-3 flex-wrap">
                <div className="inline-flex flex-col px-4 py-2 rounded-full bg-gray-100 text-left whitespace-nowrap">
                    <p className="text-black font-semibold text-sm">{company.email}</p>
                </div>
            </div>
            <UserDropdown options={actionOptions} itemData={company}>
                <Button className="w-10 h-10 bg-[#EFEFEF] rounded-full flex justify-center items-center">
                    <ThreeDotsIcon />
                </Button>
            </UserDropdown>
        </div>
    );
};

export default SubCompantCard;
