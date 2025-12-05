import React from "react";

const TicketsCard = ({ tickets }) => {
    return (
        <div
            className="bg-white rounded-[15px] p-4 flex items-center justify-between hover:shadow-md overflow-x-auto"
        >
            <div className="flex items-center gap-3">
                <div className="w-60">
                    <p className="font-semibold text-xl">{tickets.id}</p>
                    <p className="text-[10px]">Customer : {tickets.customer}</p>
                    <p className="text-xs">{tickets.date}</p>
                </div>
            </div>
            <div className="flex items-center justify-center gap-3">

                <div className="inline-flex flex-col px-4 py-2 rounded-full bg-gray-100 text-left whitespace-nowrap">
                    <p className="text-xs text-center text-gray-500">Subject</p>
                    <p className="text-black  text-sm">{tickets.subject}</p>
                </div>

                <div className="inline-flex w-40 flex-col px-4 py-2 rounded-full bg-gray-100 text-left break-all">
                    <p className="text-black text-[10px] break-all">
                        {tickets.note}
                    </p>
                </div>

                <div className={
                    tickets.status === "Closed"
                        ? "bg-[#b1f7d8] border border-green-500 text-green-700 xl:h-12 lg:h-12 md:h-12 h-12 w-28 xl:py-4 lg:py-4 md:py-3 py-2 text-center rounded-full"
                        : "bg-[#faadad] border border-red-500 text-red-700 xl:h-12 lg:h-12 md:h-12 h-12 w-28 xl:py-4 lg:py-4 md:py-3 py-2 text-center rounded-full"
                }>
                    <p className="text-black font-semibold text-sm">{tickets.status}</p>
                </div>

                <div className="inline-flex flex-col px-4 py-3 rounded-full border border-[#1F41BB]  text-left whitespace-nowrap">
                    <p className="text-xs text-[#1F41BB]">{tickets.reply}</p>
                </div>
            </div>
        </div>
    );
};

export default TicketsCard;
