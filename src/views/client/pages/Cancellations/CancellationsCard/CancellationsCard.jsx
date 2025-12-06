import React from "react";

const Pill = ({ label, value }) => (
    <div className={`bg-[#F3F3F3] px-4 py-2 rounded-full text-sm flex flex-col text-center min-w-[120px]`}>
        <span className="text-[12px] text-gray-500 text-center">{label}</span>
        <span className="text-black whitespace-nowrap">{value}</span>
    </div>
);

const CancellationsCard = ({ review }) => {
    return (
        <div className="bg-white rounded-xl p-4 mt-5 flex flex-col gap-4 border border-[#E9E9E9] shadow-sm">

            <div className="flex flex-row gap-3">
                <div className="flex gap-10 overflow-x-auto w-full">
                    <div className="flex flex-col">
                        <Pill label="Ride ID" value={review.rideId} />
                    </div>
                    <div className="flex gap-4">
                        <Pill label="User Name" value={review.userName} />
                        <Pill label="Driver Name" value={review.driverName} />
                        <Pill label="Services" value={review.services} />
                        <Pill label="Amount" value={review.amount} />
                        <Pill label="Reason" value={review.reason} />
                        <Pill label="Cancelled By" value={review.cancelledBy} />
                        <Pill label="Initiated At" value={review.initiatedAt} />
                    </div>
                </div>
            </div>

        </div>
    );

};
export default CancellationsCard;