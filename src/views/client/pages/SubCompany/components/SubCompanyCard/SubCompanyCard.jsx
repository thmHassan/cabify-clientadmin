import React, { useState } from "react";
import UserDropdown from "../../../../../../components/shared/UserDropdown";
import Button from "../../../../../../components/ui/Button/Button";
import ThreeDotsIcon from "../../../../../../components/svg/ThreeDotsIcon";
import { apiSendSubCompanyInvoice } from "../../../../../../services/SubCompanyServices";
import toast from "react-hot-toast";

const SubCompantCard = ({ company, onEdit, onDelete }) => {
    const [isInvoiceLoading, setIsInvoiceLoading] = useState(false);
    const actionOptions = [
        {
            label: "Edit",
            onClick: () => onEdit(company),
        },
        {
            label: "Delete",
            onClick: () => onDelete(company),
        },
    ];

    const capitalizeFirst = (value) => {
        if (!value) return "-";
        return value.charAt(0).toUpperCase() + value.slice(1);
    };

    const handleDownloadInvoice = async () => {
        setIsInvoiceLoading(true);
        try {
            const response = await apiSendSubCompanyInvoice(company.id);
            if (response?.data?.success === 1 && response.data.pdf_base64) {
                const linkSource = `data:application/pdf;base64,${response.data.pdf_base64}`;
                const downloadLink = document.createElement("a");
                downloadLink.href = linkSource;
                downloadLink.download = `invoice-${company.id}.pdf`;
                downloadLink.click();
                console.log("sub-company downloadLink---", downloadLink);
                toast.success("Invoice downloaded and sent to sub-company's email!");
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
                <p className="font-semibold text-xl">{capitalizeFirst(company.name)}</p>
            </div>

            <div className="flex items-center justify-center gap-3 flex-wrap">
                <div className="inline-flex flex-col px-4 py-2 rounded-full bg-gray-100 text-left whitespace-nowrap">
                    <p className="text-black font-semibold text-sm">{company.email}</p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <div>
                    <Button
                        type="filled"
                        className="py-2 px-3 rounded-md w-full sm:w-auto bg-[#4CAF50] hover:bg-[#45a049] text-white h-full"
                        onClick={handleDownloadInvoice}
                        disabled={isInvoiceLoading}
                    >
                        {isInvoiceLoading ? "Sending..." : "Invoice"}
                    </Button>
                </div>
                <UserDropdown options={actionOptions} itemData={company}>
                    <Button className="w-10 h-10 bg-[#EFEFEF] rounded-full flex justify-center items-center">
                        <ThreeDotsIcon />
                    </Button>
                </UserDropdown>
            </div>
        </div>
    );
};

export default SubCompantCard;
