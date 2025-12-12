import React from "react";

const CancellationsCard = ({ cancellations }) => {
  return (
    <div className="bg-white rounded-[15px] p-4 gap-2 flex items-center justify-between hover:shadow-md overflow-x-auto">

      {/* ID */}
      <div className="flex items-center gap-3">
        <p className="font-semibold text-xl">{cancellations.id}</p>
      </div>

      {/* USER NAME */}
      <div className="inline-flex flex-col px-4 py-2 rounded-full bg-gray-100 whitespace-nowrap">
        <p className="text-xs text-gray-500">Name</p>
        <p className="text-black font-semibold text-sm">{cancellations.name}</p>
      </div>

      {/* DRIVER NAME */}
      <div className="inline-flex flex-col px-4 py-2 rounded-full bg-gray-100 whitespace-nowrap">
        <p className="text-xs text-gray-500">PickupLocation</p>
        <p className="text-black font-semibold text-sm">{cancellations.pickup_location}</p>
      </div>

      {/* SERVICE */}
      <div className="inline-flex flex-col px-4 py-2 rounded-full bg-gray-100 whitespace-nowrap">
        <p className="text-xs text-gray-500">Service</p>
        <p className="text-black font-semibold text-sm">{cancellations.booking_type}</p>
      </div>

      {/* AMOUNT */}
      <div className="inline-flex flex-col px-4 py-2 rounded-full bg-gray-100 whitespace-nowrap">
        <p className="text-xs text-gray-500">Amount</p>
        <p className="text-black font-semibold text-sm">${cancellations.booking_amount}</p>
      </div>

      {/* REASON */}
      <div className="inline-flex flex-col px-4 py-2 rounded-full bg-gray-100 whitespace-nowrap">
        <p className="text-xs text-gray-500">Reason</p>
        <p className="text-black font-semibold text-sm">
          {cancellations.cancel_reason}
        </p>
      </div>

      {/* CANCELLED BY */}
      <div className="inline-flex flex-col px-4 py-2 rounded-full bg-gray-100 whitespace-nowrap">
        <p className="text-xs text-gray-500">Cancelled By</p>
        <p className="text-black font-semibold text-sm">
          {cancellations.cancelled_by}
        </p>
      </div>

      {/* INITIATED AT */}
      <div className="inline-flex flex-col px-4 py-2 rounded-full bg-gray-100 whitespace-nowrap">
        <p className="text-xs text-gray-500">Initiated At</p>
        <p className="text-black font-semibold text-sm">
          {new Date(cancellations.created_at).toLocaleString("en-GB")}
        </p>
      </div>

    </div>
  );
};

export default CancellationsCard;
