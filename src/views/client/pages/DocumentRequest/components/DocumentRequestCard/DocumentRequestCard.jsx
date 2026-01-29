import React, { useState } from "react";
import Button from "../../../../../../components/ui/Button/Button";
import { apiChangeDriverDocument } from "../../../../../../services/DriverManagementService";
import toast from "react-hot-toast";
import Modal from "../../../../../../components/shared/Modal/Modal";
import { lockBodyScroll, unlockBodyScroll } from "../../../../../../utils/functions/common.function";
import DocumentRequestModel from "../DocumentRequestModel";

const DocumentRequestCard = ({ document, onStatusChange }) => {
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    const handleDocumentStatusChange = async (status) => {
        try {
            setIsUpdating(true);

            const formDataObj = new FormData();
            formDataObj.append('driver_id', document.driver_id);
            formDataObj.append('driver_document_id', document.id); // ✅ Use document.id (which is 5 or 6)
            formDataObj.append('status', status);

            const response = await apiChangeDriverDocument(formDataObj);

            if (response?.data?.success === 1 || response?.status === 200) {
                toast.success(`Document ${status === 'verified' ? 'approved' : 'rejected'} successfully`);
                if (onStatusChange) {
                    onStatusChange();
                }
            } else {
                toast.error("Failed to update document");
            }
        } catch (error) {
            toast.error("Error updating document");
            console.error("Error updating document:", error);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleViewClick = () => {
        lockBodyScroll();
        setIsViewModalOpen(true);
    };

    const handleCloseModal = () => {
        unlockBodyScroll();
        setIsViewModalOpen(false);
    };

    return (
        <>
            <div className="bg-white rounded-[15px] p-4 gap-2 flex items-center justify-between hover:shadow-md overflow-x-auto">
                <div className="flex items-center gap-3">
                    <div className="w-60">
                        <p className="font-semibold text-xl">{document?.driver_detail?.name || "N/A"}</p>
                        <p className="text-[10px]">{document?.driver_detail?.email || "N/A"}</p>
                        <p className="text-xs">
                            {document?.driver_detail?.country_code || "+91"} {document?.driver_detail?.phone_no || "N/A"}
                        </p>
                    </div>
                </div>
                <div className="flex items-center justify-center gap-3">
                    <Button
                        onClick={() => handleDocumentStatusChange('verified')}
                        type="filledGreen"
                        className="px-[30px] py-[8px] rounded-[8px]"
                        disabled={isUpdating}
                    >
                        {isUpdating ? "Processing..." : "Approve"}
                    </Button>
                    <Button
                        onClick={() => handleDocumentStatusChange('failed')}
                        type="filledRed"
                        className="px-[30px] py-[10px] rounded-[8px]"
                        disabled={isUpdating}
                    >
                        Reject
                    </Button>
                    <Button
                        onClick={handleViewClick}
                        type="filled"
                        className="px-[30px] py-[10px] rounded-[8px]"
                    >
                        View
                    </Button>
                </div>
            </div>

            <Modal isOpen={isViewModalOpen} className="p-4 sm:p-6 lg:p-10">
                <DocumentRequestModel
                    document={document}
                    handleCloseModal={handleCloseModal}
                />
            </Modal>
        </>
    );
};

export default DocumentRequestCard;