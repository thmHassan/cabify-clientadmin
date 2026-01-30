import React from "react";
import UserDropdown from "../../../../../../components/shared/UserDropdown";
import Button from "../../../../../../components/ui/Button/Button";
import ThreeDotsIcon from "../../../../../../components/svg/ThreeDotsIcon";

const Chip = ({ label }) => (
    <div className="flex items-center gap-2 px-4 py-2 bg-[#F4F4F4] rounded-full">
        <div className="w-4 h-4 flex items-center justify-center rounded-sm bg-[#10B981]">
            <svg
                className="w-3 h-3 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
            >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
        </div>
        <span className="text-sm font-medium text-[#4A4A4A]">{label}</span>
    </div>
);

const DriverDocumentCard = ({ doc, onEdit, onDelete }) => {
    const actionOptions = [
        { label: "Edit", onClick: () => onEdit(doc) },
        { label: "Delete", onClick: () => onDelete(doc) },
    ];

    return (
        <div className="bg-white rounded-[15px] px-5 py-4 border border-[#E9E9E9] hover:shadow-md transition">
            <div className="flex items-center gap-6">

                {/* LEFT : Document Name */}
                <div className="min-w-[200px] text-base font-semibold text-[#252525]">
                    {doc.name}
                </div>

                {/* CENTER : Chips */}
                <div className="flex flex-wrap gap-3 flex-1">
                    {doc.frontPhoto && <Chip label="Front Photo" />}
                    {doc.backPhoto && <Chip label="Back Photo" />}
                    {doc.issueDate && <Chip label="Issue Date" />}
                    {doc.expiryDate && <Chip label="Expiry Date" />}
                    {doc.numberField && <Chip label="Has Number" />}
                </div>

                {/* RIGHT : Action */}
                <UserDropdown options={actionOptions} itemData={doc}>
                    <Button className="w-10 h-10 bg-[#EFEFEF] rounded-full flex justify-center items-center">
                        <ThreeDotsIcon />
                    </Button>
                </UserDropdown>

            </div>
        </div>
    );
};

export default DriverDocumentCard;
