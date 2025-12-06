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
                    <p className="text-[10px]">{revenue.date}</p>
                </div>
            </div>
            <div className="flex items-center justify-center gap-3">

                <div className="inline-flex flex-col px-4 py-2 rounded-full bg-gray-100 text-left whitespace-nowrap">
                    <p className="text-xs text-center text-gray-500">User Name</p>
                    <p className="text-black text-center font-semibold text-sm">{revenue.usernName}</p>
                </div>

                <div className="inline-flex flex-col px-4 py-2 rounded-full bg-gray-100 text-left whitespace-nowrap">
                    <p className="text-xs text-center text-gray-500">Driver NAme</p>
                    <p className="text-black text-center font-semibold text-sm">{revenue.driverName}</p>
                </div>

                <div className="inline-flex flex-col px-4 py-2 rounded-full bg-gray-100 text-left whitespace-nowrap">
                    <p className="text-xs text-center text-gray-500">Amount</p>
                    <p className="text-black text-center font-semibold text-sm">{revenue.amount}</p>
                </div>

                {/* <div className="inline-flex flex-col px-4 py-2 rounded-full bg-[#006FFF1A] text-left whitespace-nowrap">
                    <p className="text-xs text-center text-gray-500">Wallet Balance</p>
                    <p className="text-black text-center text-[#1F41BB] font-semibold text-sm">{revenue.walletBalance}</p>
                </div> */}

                <div className={
                    revenue.status === "Active"
                        ? "bg-[#10B981] text-white text-center xl:h-10 lg:h-10 md:h-10 h-10 w-28 xl:py-3 lg:py-3 md:py-3 py-1 rounded-full"
                        : "bg-[#FF4747] text-white text-center xl:h-10 lg:h-10 md:h-10 h-10 w-28 xl:py-3 lg:py-3 md:py-3 py-1 rounded-full"
                }>
                    <p className="font-semibold text-sm">{revenue.status}</p>
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
