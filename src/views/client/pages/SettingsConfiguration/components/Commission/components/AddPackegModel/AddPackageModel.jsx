import { ErrorMessage, Field, Form, Formik } from "formik";
import React, { useState, useEffect } from "react";
import { unlockBodyScroll } from "../../../../../../../../utils/functions/common.function";
import Button from "../../../../../../../../components/ui/Button/Button";
import FormLabel from "../../../../../../../../components/ui/FormLabel/FormLabel";
import FormSelection from "../../../../../../../../components/ui/FormSelection/FormSelection";
import { apiCreatePackageToPup, apiEditPackageToPup } from "../../../../../../../../services/SettingsConfigurationServices";
import toast from 'react-hot-toast';
import { PACKAGE_VALIDATION_SCHEMA } from "../../../../../../validators/pages/package.validation";

const AddPackageModel = ({ initialValue = {}, setIsOpen, onPackageCreated }) => {
    const [submitError, setSubmitError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);

    useEffect(() => {
        setIsEditMode(!!initialValue?.id);
    }, [initialValue]);

    const durationTypeOptions = [
        { value: "day", label: "Day" },
        { value: "week", label: "Week" },
        { value: "month", label: "Month" },
    ];

    const handleSubmit = async (values) => {
        setIsLoading(true);

        const toastId = toast.loading(
            isEditMode ? "Updating package..." : "Adding package..."
        );

        const formData = new FormData();
        formData.append("package_name", values.packageName);
        formData.append("package_type", values.packageType);
        formData.append("package_duration", values.packageDuration);
        formData.append("package_duration_unit", values.durationType);
        formData.append("package_price", values.packagePrice);

        if (isEditMode && values.id) {
            formData.append("id", values.id);
        }

        try {
            const response = isEditMode
                ? await apiEditPackageToPup(formData)
                : await apiCreatePackageToPup(formData);

            if (response?.data?.success === 1) {
                toast.success(
                    response?.data?.message ||
                    (isEditMode
                        ? "Package updated successfully"
                        : "Package added successfully"),
                    { id: toastId }
                );

                onPackageCreated?.();
                unlockBodyScroll();
                setIsOpen({ type: "new", isOpen: false });
            } else {
                toast.error(
                    response?.data?.message ||
                    `Failed to ${isEditMode ? "update" : "add"} package`,
                    { id: toastId }
                );
            }
        } catch (error) {
            toast.error(
                error?.response?.data?.message ||
                error?.message ||
                "Something went wrong",
                { id: toastId }
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <Formik
                initialValues={{
                    id: initialValue?.id || null,
                    packageName: initialValue?.package_name || "",
                    packageType: initialValue?.package_type || "",
                    packageDuration: initialValue?.package_duration || "",
                    durationType: initialValue?.package_duration_unit || "",
                    packagePrice: initialValue?.package_price || "",
                }}
                onSubmit={handleSubmit}
                enableReinitialize={true}
                validateOnChange={true}
                validateOnBlur={true}
                validationSchema={PACKAGE_VALIDATION_SCHEMA}
            >
                {({ values, setFieldValue }) => (
                    <div className="w-96">
                        <Form>
                            <div className="text-xl sm:text-2xl lg:text-[26px] leading-7 sm:leading-8 lg:leading-9 font-semibold text-[#252525] mb-4 sm:mb-6 lg:mb-7 text-center mx-auto max-w-full sm:max-w-[85%] lg:max-w-[75%] w-full px-2">
                                <span className="w-full text-center block truncate">
                                    {isEditMode ? "Edit Package" : "Add New Package"}
                                </span>
                            </div>
                            {submitError && (
                                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                                    {submitError}
                                </div>
                            )}
                            <div className="mb-6 sm:mb-[60px]">
                                <div className="w-full mb-4">
                                    <FormLabel htmlFor="packageName">Package Name</FormLabel>
                                    <Field
                                        type="text"
                                        name="packageName"
                                        className="sm:px-5 px-4 sm:py-[21px] py-4 border border-[#8D8D8D] rounded-lg w-full h-full shadow-[-4px_4px_6px_0px_#0000001F] placeholder:text-[#6C6C6C] sm:text-base text-sm leading-[22px] font-semibold"
                                        placeholder="Enter Package Name"
                                    />
                                    <ErrorMessage
                                        name="packageName"
                                        component="div"
                                        className="text-red-500 text-sm mt-1"
                                    />
                                </div>

                                <div className="w-full mb-4">
                                    <FormLabel htmlFor="packageType">Package Type</FormLabel>
                                    <Field
                                        type="text"
                                        name="packageType"
                                        className="sm:px-5 px-4 sm:py-[21px] py-4 border border-[#8D8D8D] rounded-lg w-full h-full shadow-[-4px_4px_6px_0px_#0000001F] placeholder:text-[#6C6C6C] sm:text-base text-sm leading-[22px] font-semibold"
                                        placeholder="Enter Package Type"
                                    />
                                    <ErrorMessage
                                        name="packageType"
                                        component="div"
                                        className="text-red-500 text-sm mt-1"
                                    />
                                </div>

                                <div className="w-full mb-4">
                                    <FormLabel htmlFor="packageDuration">Package Duration</FormLabel>
                                    <FormSelection
                                        label="Select Duration Type"
                                        name="packageDuration"
                                        value={values.packageDuration}
                                        options={durationTypeOptions}
                                        onChange={(val) => setFieldValue("packageDuration", val)}
                                        placeholder="Select Duration Type"
                                    />
                                    <ErrorMessage
                                        name="durationType"
                                        component="div"
                                        className="text-red-500 text-sm mt-1"
                                    />
                                </div>

                                <div className="w-full mb-4">
                                    <FormLabel htmlFor="packagePrice">Package Price</FormLabel>
                                    <Field
                                        type="text"
                                        name="packagePrice"
                                        className="sm:px-5 px-4 sm:py-[21px] py-4 border border-[#8D8D8D] rounded-lg w-full h-full shadow-[-4px_4px_6px_0px_#0000001F] placeholder:text-[#6C6C6C] sm:text-base text-sm leading-[22px] font-semibold"
                                        placeholder="Enter Package Price"
                                    />
                                    <ErrorMessage
                                        name="packagePrice"
                                        component="div"
                                        className="text-red-500 text-sm mt-1"
                                    />
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
                                    <span>{isLoading ? (isEditMode ? "Updating..." : "Adding...") : (isEditMode ? "Update Package" : "Add Package")}</span>
                                </Button>
                            </div>
                        </Form>
                    </div>
                )}
            </Formik>
        </div>
    );
};

export default AddPackageModel;
