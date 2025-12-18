import { ErrorMessage, Field, Form, Formik } from "formik";
import React, { useState } from "react";
import * as Yup from "yup";
import { apiAddWalletBalance } from "../../../../../../../../services/DriverManagementService";
import FormLabel from "../../../../../../../../components/ui/FormLabel";
import Button from "../../../../../../../../components/ui/Button/Button";
import { unlockBodyScroll } from "../../../../../../../../utils/functions/common.function";

const WALLET_BALANCE_VALIDATION_SCHEMA = Yup.object().shape({
    amount: Yup.number()
        .required("Amount is required")
        .positive("Amount must be greater than 0")
        .typeError("Amount must be a valid number"),
});

const AddWalletBalanceModel = ({ driverId, setIsOpen }) => {
    const [submitError, setSubmitError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (values, { resetForm }) => {
        setIsLoading(true);
        setSubmitError(null);

        try {
            const formDataObj = new FormData();
            formDataObj.append('id', driverId || '');
            formDataObj.append('amount', values.amount || '');

            const response = await apiAddWalletBalance(formDataObj);

            if (response?.data?.success === 1 || response?.status === 200) {
                unlockBodyScroll();
                setIsOpen(false);
                resetForm();
            } else {
                setSubmitError(response?.data?.message || "Failed to add wallet balance");
            }
        } catch (error) {
            setSubmitError(error?.response?.data?.message || error?.message || "Error adding wallet balance");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <Formik
                initialValues={{
                    amount: "",
                }}
                validationSchema={WALLET_BALANCE_VALIDATION_SCHEMA}
                onSubmit={handleSubmit}
                validateOnChange={true}
                validateOnBlur={true}
            >
                {() => {
                    return (
                        <div className="w-96">
                            <Form>
                                <div className="text-xl sm:text-2xl lg:text-[26px] leading-7 sm:leading-8 lg:leading-9 font-semibold text-[#252525] mb-4 sm:mb-6 lg:mb-7 text-center mx-auto max-w-full sm:max-w-[85%] lg:max-w-[75%] w-full px-2">
                                    <span className="w-full text-center block truncate">
                                        Add Wallet Balance
                                    </span>
                                </div>
                                {submitError && (
                                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                                        {submitError}
                                    </div>
                                )}
                                <div className="mb-6 sm:mb-[60px]">
                                    <div className="w-full mb-4">
                                        <FormLabel htmlFor="amount">Price</FormLabel>
                                        <div className="sm:h-16 h-14">
                                            <Field
                                                type="number"
                                                name="amount"
                                                step="0.01"
                                                min="0"
                                                className="sm:px-5 px-4 sm:py-[21px] py-4 border border-[#8D8D8D] rounded-lg w-full h-full shadow-[-4px_4px_6px_0px_#0000001F] placeholder:text-[#6C6C6C] sm:text-base text-sm leading-[22px] font-semibold"
                                                placeholder="$0.00"
                                            />
                                        </div>
                                        <ErrorMessage
                                            name="amount"
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
                                            setIsOpen(false);
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
                                        <span>{isLoading ? "Adding..." : "Transfer Balance"}</span>
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

export default AddWalletBalanceModel;
