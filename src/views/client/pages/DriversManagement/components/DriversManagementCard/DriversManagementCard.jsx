import React from "react";

const DriverManagementCard = ({ driver }) => {
    return (
        <div
            className="bg-white rounded-[15px] p-4 gap-2 flex items-center justify-between hover:shadow-md overflow-x-auto"
        >
            <div className="flex items-center gap-3">
                <div className="w-60">
                    <p className="font-semibold text-xl">{driver.name}</p>
                    <p className="text-[10px]">{driver.email}</p>
                    <p className="text-xs">{driver.phone}</p>
                </div>
            </div>
            <div className="flex items-center justify-center gap-3 flex-wrap">

                <div className="inline-flex flex-col px-4 py-2 rounded-full bg-gray-100 text-left whitespace-nowrap">
                    <p className="text-xs text-gray-500">Vehicle Type</p>
                    <p className="text-black font-semibold text-sm">{driver.vahicleType}</p>
                </div>

                <div className="inline-flex flex-col px-4 py-2 rounded-full bg-gray-100 text-left whitespace-nowrap">
                    <p className="text-xs text-gray-500">Change Req</p>
                    <p className="text-black font-semibold text-sm">{driver.changeReq}</p>
                </div>

                <div className="inline-flex flex-col px-4 py-2 rounded-full bg-gray-100 text-left whitespace-nowrap">
                    <p className="text-xs text-gray-500">Referral Code</p>
                    <p className="text-black font-semibold text-sm">{driver.referralCode}</p>
                </div>

                <div className="inline-flex flex-col px-4 py-2 rounded-full bg-gray-100 text-left whitespace-nowrap">
                    <p className="text-xs text-gray-500">Wallet Balance</p>
                    <p className="text-black font-semibold text-sm">{driver.walletBalance}</p>
                </div>
                <div className="cursor-pointer p-3 bg-gray-100 rounded-full hover:bg-gray-200">
                    <svg width="5" height="14" viewBox="0 0 5 20" fill="none">
                        <circle cx="2.5" cy="3" r="2.5" fill="#7B7B7B" />
                        <circle cx="2.5" cy="10" r="2.5" fill="#7B7B7B" />
                        <circle cx="2.5" cy="17" r="2.5" fill="#7B7B7B" />
                    </svg>
                </div>

            </div>
        </div>
    );
};

export default DriverManagementCard;
