import { ErrorMessage, Field, Form, Formik } from "formik";
import React, { useEffect, useState } from "react";
import * as Yup from "yup";
import { unlockBodyScroll } from "../../../../../../utils/functions/common.function";
import Button from "../../../../../../components/ui/Button/Button";
import { apiCreateDriveDocument, apiEditDriverDocument } from "../../../../../../services/DriversDocumentServices";
import { DRIVER_DOCUMENT_VALIDATION_SCHEMA } from "../../../../validators/pages/driver.validation";
import FormLabel from "../../../../../../components/ui/FormLabel/FormLabel";
import toast from "react-hot-toast";

const AddDriverDocumentModel = ({ initialValue = {}, setIsOpen, onDocumentCreated }) => {
    const [submitError, setSubmitError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);

    useEffect(() => {
        setIsEditMode(!!initialValue?.id);
    }, [initialValue]);

    const handleSubmit = async (values, { resetForm }) => {
        setIsLoading(true);
        setSubmitError(null);

        try {
            const formDataObj = new FormData();

            if (isEditMode) formDataObj.append("id", initialValue.id);

            formDataObj.append("document_name", values.documentName || "");
            formDataObj.append("front_photo", values.frontPhoto ? "yes" : "no");
            formDataObj.append("back_photo", values.backPhoto ? "yes" : "no");
            formDataObj.append("profile_photo", values.issuePhoto ? "yes" : "no");
            formDataObj.append("has_issue_date", values.issueDate ? "yes" : "no");
            formDataObj.append("has_expiry_date", values.expiryDate ? "yes" : "no");
            formDataObj.append("has_number_field", values.numberField ? "yes" : "no");

            const response = isEditMode
                ? await apiEditDriverDocument(formDataObj)
                : await apiCreateDriveDocument(formDataObj);

            if (response?.data?.success === 1 || response?.status === 200) {
                toast.success(
                    isEditMode
                        ? "Driver document updated successfully"
                        : "Driver document created successfully"
                );

                onDocumentCreated?.();
                unlockBodyScroll();
                setIsOpen({ type: "new", isOpen: false });
                resetForm();
            } else {
                toast.error(
                    response?.data?.message ||
                    `Failed to ${isEditMode ? "update" : "create"} driver document`
                );
            }
        } catch (error) {
            toast.error(
                error?.response?.data?.message ||
                error?.message ||
                `Error ${isEditMode ? "updating" : "creating"} driver document`
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <Formik
                initialValues={{
                    documentName: initialValue?.document_name || "",
                    frontPhoto: initialValue?.front_photo === 'yes' ? true : false,
                    backPhoto: initialValue?.back_photo === 'yes' ? true : false,
                    issueDate: initialValue?.has_issue_date === 'yes' ? true : false,
                    expiryDate: initialValue?.has_expiry_date === 'yes' ? true : false,
                    numberField: initialValue?.has_number_field === 'yes' ? true : false,
                    issuePhoto: initialValue?.profile_photo === 'yes' ? true : false,
                    at_least_one: false,
                }}
                validationSchema={DRIVER_DOCUMENT_VALIDATION_SCHEMA}
                onSubmit={handleSubmit}
                validateOnChange={true}
                validateOnBlur={true}
                enableReinitialize={true}
            >
                {({ values, setFieldValue }) => {
                    return (
                        <div className="w-96">
                            <Form>
                                <div className="text-xl sm:text-2xl lg:text-[26px] leading-7 sm:leading-8 lg:leading-9 font-semibold text-[#252525] mb-4 sm:mb-6 lg:mb-7 text-center mx-auto max-w-full sm:max-w-[85%] lg:max-w-[75%] w-full px-2">
                                    <span className="w-full text-center block truncate">
                                        {isEditMode ? 'Edit Driver Document' : 'Add New Driver Document'}
                                    </span>
                                </div>
                                <div className="mb-6 sm:mb-[60px]">
                                    <div className="w-full mb-4">
                                        <FormLabel htmlFor="documentName">Document Name</FormLabel>
                                        <div className="sm:h-16 h-14">
                                            <Field
                                                type="text"
                                                name="documentName"
                                                className="sm:px-5 px-4 sm:py-[21px] py-4 border border-[#8D8D8D] rounded-lg w-full h-full shadow-[-4px_4px_6px_0px_#0000001F] placeholder:text-[#6C6C6C] sm:text-base text-sm leading-[22px] font-semibold"
                                                placeholder="Enter Document Name"
                                            />
                                        </div>
                                        <ErrorMessage
                                            name="documentName"
                                            component="div"
                                            className="text-red-500 text-sm mt-1"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-3 mb-8 ">
                                        <label className="flex items-center gap-3 border border-[#D8D8D8] rounded-lg p-3 shadow-sm cursor-pointer">
                                            <Field
                                                type="checkbox"
                                                name="frontPhoto"
                                                className="w-5 h-5"
                                            />
                                            <span className="font-medium text-gray-700">Front Photo</span>
                                        </label>
                                        <label className="flex items-center gap-3 border border-[#D8D8D8] rounded-lg p-3 shadow-sm cursor-pointer">
                                            <Field
                                                type="checkbox"
                                                name="backPhoto"
                                                className="w-5 h-5"
                                            />
                                            <span className="font-medium text-gray-700">Back Photo</span>
                                        </label>
                                        <label className="flex items-center gap-3 border border-[#D8D8D8] rounded-lg p-3 shadow-sm cursor-pointer">
                                            <Field
                                                type="checkbox"
                                                name="issuePhoto"
                                                className="w-5 h-5"
                                            />
                                            <span className="font-medium text-gray-700">Issue Date</span>
                                        </label>
                                        <label className="flex items-center gap-3 border border-[#D8D8D8] rounded-lg p-3 shadow-sm cursor-pointer">
                                            <Field
                                                type="checkbox"
                                                name="expiryDate"
                                                className="w-5 h-5"
                                            />
                                            <span className="font-medium text-gray-700">Expiry Date</span>
                                        </label>
                                        <label className="flex items-center gap-3 border border-[#D8D8D8] rounded-lg p-3 shadow-sm cursor-pointer">
                                            <Field
                                                type="checkbox"
                                                name="numberField"
                                                className="w-5 h-5"
                                            />
                                            <span className="font-medium text-gray-700">
                                                Number Field (PHC, License, Bank Account etc.)
                                            </span>
                                        </label>
                                    </div>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3 sm:gap-5 justify-end">
                                    <Button
                                        btnSize="md"
                                        type="filledGray"
                                        className="!px-10 pt-4 pb-[15px] leading-[25px] w-full sm:w-auto"
                                        onClick={() => {
                                            unlockBodyScroll();
                                            setIsOpen({ type: "new", isOpen: false });
                                        }}
                                    >
                                        <span>Cancel</span>
                                    </Button>
                                    <Button
                                        btnType="submit"
                                        btnSize="md"
                                        type="filled"
                                        className="!px-10 pt-4 pb-[15px] leading-[25px] w-full sm:w-auto"
                                        disabled={isLoading}
                                    >
                                        <span>{isLoading ? (isEditMode ? "Updating..." : "Creating...") : (isEditMode ? "Update" : "Create")}</span>
                                    </Button>
                                </div>
                            </Form>
                        </div>
                    );
                }}
            </Formik>
        </div>
    );
};

export default AddDriverDocumentModel;
