import { useState } from "react";
import Button from "../../../../../components/ui/Button/Button";
import Modal from "../../../../../components/shared/Modal/Modal";
import { getTenantData } from "../../../../../utils/functions/tokenEncryption";
import { lockBodyScroll, unlockBodyScroll } from "../../../../../utils/functions/common.function";
import ContactUsDetailModal from "../components/ContactUsDetailModal";

const ContactUsCard = ({ contact, onResponded }) => {
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const tenant = getTenantData();
    const timeZone = tenant?.time_zone || "UTC";

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date
            .toLocaleString("en-GB", {
                timeZone: timeZone,
                weekday: "short",
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            })
            .replace(",", "");
    };

    const capitalizeFirst = (value) => {
        if (!value) return "-";
        return value.charAt(0).toUpperCase() + value.slice(1);
    };

    const handleViewClick = () => {
        lockBodyScroll();
        setIsViewModalOpen(true);
    };

    const handleCloseModal = () => {
        unlockBodyScroll();
        setIsViewModalOpen(false);
    };

    const statusClass =
        contact?.status === "responded"
            ? "bg-[#10B981] text-white"
            : contact?.status === "pending"
              ? "bg-[#F5C60B] text-white"
              : "bg-gray-200 text-gray-700";

    return (
        <>
            <div className="bg-white rounded-[15px] p-4 gap-[13px] flex items-center justify-between hover:shadow-md overflow-x-auto">
                <div className="inline-flex flex-col px-4 py-2 rounded-full bg-[#EFEFEF] whitespace-nowrap">
                    <div className="w-[60px]">
                        <p className="text-xs text-center text-[#6C6C6C]">ID</p>
                        <p className="text-[#333333] text-center font-semibold text-sm">
                            #{contact?.id}
                        </p>
                    </div>
                </div>

                <div className="inline-flex flex-col px-4 py-2 rounded-full bg-[#EFEFEF]">
                    <div className="w-[100px]">
                        <p className="text-xs text-center text-[#6C6C6C]">User Type</p>
                        <p className="text-[#333333] text-center font-semibold text-sm">
                            {capitalizeFirst(contact?.user_type)}
                        </p>
                    </div>
                </div>

                <div className="inline-flex flex-col px-4 py-2 rounded-full bg-[#EFEFEF] whitespace-nowrap">
                    <div className="w-[80px]">
                        <p className="text-xs text-center text-[#6C6C6C]">User ID</p>
                        <p className="text-[#333333] text-center font-semibold text-sm">
                            {contact?.user_id}
                        </p>
                    </div>
                </div>

                <div className="inline-flex flex-col px-4 py-2 rounded-full bg-[#EFEFEF]">
                    <div className="w-[280px]">
                        <p className="text-xs text-center text-[#6C6C6C]">Message</p>
                        <p className="text-[#333333] text-center font-semibold text-sm line-clamp-2">
                            {contact?.message || "-"}
                        </p>
                    </div>
                </div>

                <div className="inline-flex flex-col px-4 py-2 rounded-full whitespace-nowrap">
                    <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full text-center ${statusClass}`}
                    >
                        {capitalizeFirst(contact?.status)}
                    </span>
                </div>

                <div className="inline-flex flex-col px-4 py-2 rounded-full bg-[#EFEFEF]">
                    <div className="w-[160px]">
                        <p className="text-xs text-center text-[#6C6C6C]">Submitted At</p>
                        <p className="text-[#333333] text-center font-semibold text-sm line-clamp-2">
                            {formatDate(contact?.created_at)}
                        </p>
                    </div>
                </div>

                <Button
                    type="filled"
                    className="px-6 py-2 rounded-md whitespace-nowrap"
                    onClick={handleViewClick}
                >
                    View
                </Button>
            </div>

            <Modal isOpen={isViewModalOpen} className="p-4 sm:p-6 lg:p-10">
                <ContactUsDetailModal
                    contactId={contact?.id}
                    onClose={handleCloseModal}
                    onResponded={onResponded}
                />
            </Modal>
        </>
    );
};

export default ContactUsCard;
