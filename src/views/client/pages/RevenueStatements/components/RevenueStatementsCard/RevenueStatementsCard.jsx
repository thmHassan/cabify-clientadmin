import UserDropdown from "../../../../../../components/shared/UserDropdown";
import Button from "../../../../../../components/ui/Button/Button";
import ThreeDotsIcon from "../../../../../../components/svg/ThreeDotsIcon";
import { useEffect, useState } from "react";
import { getTenantData } from "../../../../../../utils/functions/tokenEncryption";

const RevenueStatementsCard = ({ revenue, onEdit }) => {
    const [currencySymbol, setCurrencySymbol] = useState("₹");

    const currencySymbols = {
        INR: "₹",
        USD: "$",
        EUR: "€",
        GBP: "£",
        AUD: "A$",
        CAD: "C$",
        AED: "د.إ",
    };

    useEffect(() => {
        const tenant = getTenantData();

        if (tenant?.currency) {
            setCurrencySymbol(currencySymbols[tenant.currency] || tenant.currency);
        }
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${day}-${month}-${year} at ${hours}:${minutes}`;
    };

    const getPaymentMethod = (method) => {
        if (!method) return "N/A";
        if (method === "cash") return "Cash";
        if (method === "card") return "Credit Card";
        if (method === "online") return "Online";
        return method;
    };

    const getPaymentStatus = (status) => {
        if (!status) return "N/A";
        if (status === "pending") return "Pending";
        if (status === "paid") return "Paid";
        if (status === "failed") return "Failed";
        return status;
    };

    const actionOptions = [
        {
            label: "View",
            onClick: () => alert(`Viewing ride ${revenue.booking_id}`),
        },
        {
            label: "Edit",
            onClick: () => onEdit && onEdit(revenue),
        },
        {
            label: "Delete",
            onClick: () => alert(`Deleting ride ${revenue.booking_id}`),
        },
    ];

    return (
        <div
            className="bg-white rounded-[15px] p-4 gap-2 flex items-center justify-between hover:shadow-md overflow-x-auto"
        >
            <div className="flex items-center gap-3">
                <div className="w-60">
                    <p className="font-semibold text-xl">{revenue.booking_id || "N/A"}</p>
                    <div className="inline-flex flex-col px-4 py-2 rounded-full bg-[#EFEFEF] text-left whitespace-nowrap">
                        <p className="text-[#333333] text-center font-semibold text-sm">
                            {formatDate(revenue.created_at)}
                        </p>
                    </div>
                </div>
            </div>
            <div className="flex items-center justify-center gap-3">

                <div className="inline-flex flex-col px-4 py-2 rounded-full bg-[#EFEFEF] text-left whitespace-nowrap w-[165px]">
                    <p className="text-xs text-center text-[#6C6C6C]">User Name</p>
                    <p className="text-[#333333] text-center font-semibold text-sm">
                        {revenue.name || "N/A"}
                    </p>
                </div>

                <div className="inline-flex flex-col px-4 py-2 rounded-full bg-[#EFEFEF] text-left whitespace-nowrap w-[165px]">
                    <p className="text-xs text-center text-[#6C6C6C]">Driver Name</p>
                    <p className="text-[#333333] text-center font-semibold text-sm">
                        {revenue.driver_detail?.name || revenue.driver || "N/A"}
                    </p>
                </div>

                <div className="w-[180px]">
                    <p className="text-[#333333] text-start font-semibold text-lg">
                        {currencySymbol} {revenue.offered_amount || revenue.booking_amount || "0"}
                    </p>

                    <div className="flex gap-1">
                        <div className={
                            revenue.payment_status === "paid"
                                ? "bg-[#10B981] text-white text-center py-2 px-3 rounded-full"
                                : revenue.payment_status === "failed"
                                    ? "bg-[#FF4747] text-white text-center py-2 px-3 rounded-full"
                                    : "bg-[#FFA500] text-white text-center py-2 px-3 rounded-full"
                        }>
                            <p className="font-semibold text-sm capitalize">
                                {getPaymentStatus(revenue.payment_status)}
                            </p>
                        </div>
                        <div className="inline-flex flex-col px-4 py-2 rounded-full bg-[#EFEFEF] text-left whitespace-nowrap">
                            <p className="text-[#333333] text-center text-sm">
                                {getPaymentMethod(revenue.payment_method)}
                            </p>
                        </div>
                    </div>
                </div>
                {/* <UserDropdown options={actionOptions} itemData={revenue}>
                    <Button className="w-10 h-10 bg-[#EFEFEF] rounded-full flex justify-center items-center">
                        <ThreeDotsIcon />
                    </Button>
                </UserDropdown> */}
            </div>
        </div>
    );
};

export default RevenueStatementsCard;