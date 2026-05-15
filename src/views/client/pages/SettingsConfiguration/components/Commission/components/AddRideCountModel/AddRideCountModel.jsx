import { ErrorMessage, Field, Form, Formik } from "formik";
import React, { useState, useEffect } from "react";
import { unlockBodyScroll } from "../../../../../../../../utils/functions/common.function";
import Button from "../../../../../../../../components/ui/Button/Button";
import FormLabel from "../../../../../../../../components/ui/FormLabel/FormLabel";
import { apiCreateRideCount, apiEditRideCount } from "../../../../../../../../services/SettingsConfigurationServices";
import toast from 'react-hot-toast';
import { RIDE_COUNT_VALIDATION_SCHEMA } from "../../../../../../validators/pages/package.validation";

const AddRideCountModel = ({ initialValue = {}, setIsOpen, onPackageCreated }) => {
    const [submitError, setSubmitError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);

    useEffect(() => {
        setIsEditMode(!!initialValue?.id);
    }, [initialValue]);

    const handleSubmit = async (values) => {
        setIsLoading(true);

        const toastId = toast.loading(
            isEditMode ? "Updating package..." : "Adding package..."
        );

        const formData = new FormData();
        formData.append("package_type", "ride_count_price");
        formData.append("package_ride_count", values.package_ride_count);
        formData.append("package_amount", values.package_amount);

        if (isEditMode && values.id) {
            formData.append("id", values.id);
        }

        try {
            const response = isEditMode
                ? await apiEditRideCount(formData)
                : await apiCreateRideCount(formData);

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
                    package_ride_count: initialValue?.package_ride_count || "",
                    package_amount: initialValue?.package_amount || "",
                }}
                onSubmit={handleSubmit}
                enableReinitialize={true}
                validateOnChange={true}
                validateOnBlur={true}
                validationSchema={RIDE_COUNT_VALIDATION_SCHEMA}
            >
                {() => (
                    <div className="w-96">
                        <Form>
                            <div className="text-xl sm:text-2xl lg:text-[26px] leading-7 sm:leading-8 lg:leading-9 font-semibold text-[#252525] mb-4 sm:mb-6 lg:mb-7 text-center mx-auto max-w-full sm:max-w-[85%] lg:max-w-[75%] w-full px-2">
                                <span className="w-full text-center block truncate">
                                    {isEditMode ? "Edit Ride Count" : "Add New Ride Count"}
                                </span>
                            </div>
                            {submitError && (
                                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                                    {submitError}
                                </div>
                            )}
                            <div className="mb-6 sm:mb-[60px]">
                                <div className="w-full mb-4">
                                    <FormLabel htmlFor="package_ride_count">Ride Count</FormLabel>
                                    <Field
                                        type="number"
                                        name="package_ride_count"
                                        className="sm:px-5 px-4 sm:py-[21px] py-4 border border-[#8D8D8D] rounded-lg w-full h-full shadow-[-4px_4px_6px_0px_#0000001F] placeholder:text-[#6C6C6C] sm:text-base text-sm leading-[22px] font-semibold"
                                        placeholder="Enter Ride Count"
                                    />
                                    <ErrorMessage
                                        name="package_ride_count"
                                        component="div"
                                        className="text-red-500 text-sm mt-1"
                                    />
                                </div>

                                <div className="w-full mb-4">
                                    <FormLabel htmlFor="package_amount">Package Amount</FormLabel>
                                    <Field
                                        type="number"
                                        step="0.01"
                                        name="package_amount"
                                        className="sm:px-5 px-4 sm:py-[21px] py-4 border border-[#8D8D8D] rounded-lg w-full h-full shadow-[-4px_4px_6px_0px_#0000001F] placeholder:text-[#6C6C6C] sm:text-base text-sm leading-[22px] font-semibold"
                                        placeholder="Enter Package Amount"
                                    />
                                    <ErrorMessage
                                        name="package_amount"
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
                                    <span>{isLoading ? (isEditMode ? "Updating..." : "Adding...") : (isEditMode ? "Update" : "Add")}</span>
                                </Button>
                            </div>
                        </Form>
                    </div>
                )}
            </Formik>
        </div>
    );
};

export default AddRideCountModel;
