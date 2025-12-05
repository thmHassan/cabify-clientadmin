import React from "react";
import UserDropdown from "../../../../../../components/shared/UserDropdown";
import Button from "../../../../../../components/ui/Button/Button";
import ThreeDotsIcon from "../../../../../../components/svg/ThreeDotsIcon";

const DriverDocumentCard = ({ doc, onEdit }) => {
    const actionOptions = [
        {
            label: "View",
            onClick: () => alert(`Viewing ${doc.name}`),
        },
        {
            label: "Edit",
            onClick: () => onEdit(doc), // call parent handler
        },
        {
            label: "Delete",
            onClick: () => alert(`Deleting ${doc.name}`),
        },
    ];
    return (
        <div className="bg-white rounded-[15px] p-4 flex items-center justify-between hover:shadow-md transition border border-[#E9E9E9]">
            <div className="text-lg font-semibold text-[#252525] min-w-[150px]">
                {doc.name}
            </div>
            <div className="flex items-center gap-3 flex-wrap">

                {doc.frontPhoto && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-[#F4F4F4] rounded-full">
                        <span className="text-green-600 text-sm">✔</span>
                        <span className="text-sm font-medium">Front Photo</span>
                    </div>
                )}

                {doc.backPhoto && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-[#F4F4F4] rounded-full">
                        <span className="text-green-600 text-sm">✔</span>
                        <span className="text-sm font-medium">Back Photo</span>
                    </div>
                )}

                {doc.issueDate && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-[#F4F4F4] rounded-full">
                        <span className="text-green-600 text-sm">✔</span>
                        <span className="text-sm font-medium">Issue Date</span>
                    </div>
                )}

                {doc.expiryDate && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-[#F4F4F4] rounded-full">
                        <span className="text-green-600 text-sm">✔</span>
                        <span className="text-sm font-medium">Expiry Date</span>
                    </div>
                )}
            </div>

            <UserDropdown options={actionOptions} itemData={doc}>
                <Button className="w-10 h-10 bg-[#EFEFEF] rounded-full flex justify-center items-center">
                    <ThreeDotsIcon />
                </Button>
            </UserDropdown>
        </div>
    );
};

export default DriverDocumentCard;
