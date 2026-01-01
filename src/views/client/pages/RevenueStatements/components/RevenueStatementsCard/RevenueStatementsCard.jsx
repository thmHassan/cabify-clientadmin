import React from "react";
import UserDropdown from "../../../../../../components/shared/UserDropdown";
import Button from "../../../../../../components/ui/Button/Button";
import ThreeDotsIcon from "../../../../../../components/svg/ThreeDotsIcon";

const RevenueStatementsCard = ({ revenue, onEdit }) => {
    const actionOptions = [
        {
            label: "View",
            onClick: () => alert(`Viewing ${revenue.name}`),
        },
        {
            label: "Edit",
            onClick: () => onEdit(revenue),
        },
        {
            label: "Delete",
            onClick: () => alert(`Deleting ${revenue.name}`),
        },
    ];
    return (
        <div
            className="bg-white rounded-[15px] p-4 gap-2 flex items-center justify-between hover:shadow-md overflow-x-auto"
        >
            <div className="flex items-center gap-3">
                <div className="w-60">
                    <p className="font-semibold text-xl">{revenue.bidNumber}</p>
                    <div className="inline-flex flex-col px-4 py-2 rounded-full bg-[#EFEFEF] text-left whitespace-nowrap">
                        <p className="text-[#333333] text-center font-semibold text-sm">{revenue.date}</p>
                    </div>
                </div>
            </div>
            <div className="flex items-center justify-center gap-3">

                <div className="inline-flex flex-col px-4 py-2 rounded-full bg-[#EFEFEF] text-left whitespace-nowrap w-[165px]">
                    <p className="text-xs text-center text-[#6C6C6C]">User Name</p>
                    <p className="text-[#333333] text-center font-semibold text-sm">{revenue.usernName}</p>
                </div>

                <div className="inline-flex flex-col px-4 py-2 rounded-full bg-[#EFEFEF] text-left whitespace-nowrap w-[165px]">
                    <p className="text-xs text-center text-[#6C6C6C]">Driver NAme</p>
                    <p className="text-[#333333] text-center font-semibold text-sm">{revenue.driverName}</p>
                </div>

                <div className="w-[180px]">
                    <p className="text-[#333333] text-start font-semibold text-lg">${revenue.amount}</p>

                    <div className="flex gap-1">
                        <div className={
                            revenue.status === "Paid"
                                ? "bg-[#10B981] text-white text-center py-2 px-3 rounded-full"
                                : "bg-[#FF4747] text-white text-center py-2 px-3 rounded-full"
                        }>
                            <p className="font-semibold text-sm">{revenue.status}</p>
                        </div>
                        <div className="inline-flex flex-col px-4 py-2 rounded-full bg-[#EFEFEF] text-left whitespace-nowrap">
                            <p className="text-[#333333] text-center  text-sm">{revenue.paymentStatus}</p>
                        </div>
                    </div>
                </div>
                <UserDropdown options={actionOptions} itemData={revenue}>
                    <Button className="w-10 h-10 bg-[#EFEFEF] rounded-full flex justify-center items-center">
                        <ThreeDotsIcon />
                    </Button>
                </UserDropdown>
            </div>
        </div>
    );
};

export default RevenueStatementsCard;
