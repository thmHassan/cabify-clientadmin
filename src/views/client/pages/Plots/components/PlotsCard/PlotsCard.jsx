import React from "react";
import UserDropdown from "../../../../../../components/shared/UserDropdown";
import Button from "../../../../../../components/ui/Button/Button";
import ThreeDotsIcon from "../../../../../../components/svg/ThreeDotsIcon";

const PlotsCard = ({ plot, onEdit, onDelete }) => {
    const actionOptions = [
        {
            label: "Edit",
            onClick: () => onEdit(plot),
        },
        {
            label: "Delete",
            onClick: () => onDelete(plot),
        },
    ];
    return (
        <div className="flex items-center justify-between bg-white rounded-xl p-4 border hover:shadow transition">
            <div className="text-lg font-semibold text-[#252525]">
                {plot.name}
            </div>
            <UserDropdown options={actionOptions} itemData={plot}>
                <Button className="w-10 h-10 bg-[#EFEFEF] rounded-full flex justify-center items-center">
                    <ThreeDotsIcon />
                </Button>
            </UserDropdown>
        </div>
    );
};

export default PlotsCard;
