import React, { useState } from "react";
import UserDropdown from "../../../../../../components/shared/UserDropdown";
import Button from "../../../../../../components/ui/Button/Button";
import ThreeDotsIcon from "../../../../../../components/svg/ThreeDotsIcon";
import { apiSendAccountInvoice } from "../../../../../../services/AccountService";
import toast from "react-hot-toast";

const AccountCard = ({ account, onEdit, onView, onDelete }) => {
    const [isInvoiceLoading, setIsInvoiceLoading] = useState(false);

    const actionOptions = [
        {
            label: "View",
            onClick: () => onView(account),
        },
        {
            label: "Edit",
            onClick: () => onEdit(account),
        },
        {
            label: "Delete",
            onClick: () => onDelete(account),
        },
    ];

    const handleDownloadInvoice = async () => {
        setIsInvoiceLoading(true);
        try {
            const response = await apiSendAccountInvoice(account.id);
            if (response?.data?.success === 1 && response.data.pdf_base64) {
                const linkSource = `data:application/pdf;base64,${response.data.pdf_base64}`;
                const downloadLink = document.createElement("a");
                downloadLink.href = linkSource;
                downloadLink.download = `invoice-${account.id}.pdf`;
                downloadLink.click();
                console.log("account downloadLink---", downloadLink);
                toast.success("Invoice downloaded and sent to account's email!");
            } else {
                toast.error(response?.data?.message || "Failed to generate invoice", { duration: 4000 });
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || "Something went wrong", { duration: 4000 });
        } finally {
            setIsInvoiceLoading(false);
        }
    };
    return (

        <div
            className="bg-white rounded-[15px] p-4 gap-2 flex items-center justify-between hover:shadow-md overflow-x-auto"
        >
            <div className="flex items-center gap-3">
                <p className="font-semibold text-xl">{account.name}</p>
            </div>

            <div className="flex items-center gap-3">
                <div>
                    <Button
                        type="filled"
                        className="py-2 px-3 rounded-md w-full sm:w-auto h-full"
                        onClick={handleDownloadInvoice}
                        disabled={isInvoiceLoading}
                    >
                        {isInvoiceLoading ? "Sending..." : "Invoice"}
                    </Button>
                </div>

                <UserDropdown options={actionOptions} itemData={account}>
                    <Button className="w-10 h-10 bg-[#EFEFEF] rounded-full flex justify-center items-center">
                        <ThreeDotsIcon />
                    </Button>
                </UserDropdown>
            </div>
        </div>
    );
};

export default AccountCard;
