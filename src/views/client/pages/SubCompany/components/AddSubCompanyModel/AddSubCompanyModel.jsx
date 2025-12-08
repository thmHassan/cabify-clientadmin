import { ErrorMessage, Field, Form, Formik } from "formik";
import React, { useRef, useState, useEffect } from "react";
import * as Yup from "yup";
import _ from "lodash";
import FormLabel from "../../../../../../components/ui/FormLabel/FormLabel";
import { unlockBodyScroll } from "../../../../../../utils/functions/common.function";
import Button from "../../../../../../components/ui/Button/Button";
import { apiCreateSubCompany, apiEditSubCompany } from "../../../../../../services/SubCompanyServices";

const SUB_COMPANY_VALIDATION_SCHEMA = Yup.object().shape({
    name: Yup.string()
        .required("Sub company name is required")
        .min(2, "Name must be at least 2 characters"),
    email: Yup.string()
        .email("Invalid email format")
        .required("Email is required"),
});

const AddSubCompanyModel = ({ initialValue = {}, setIsOpen, onSubCompanyCreated }) => {
    const [submitError, setSubmitError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);

    useEffect(() => {
        setIsEditMode(!!initialValue?.id);
    }, [initialValue]);

    const handleSubmit = async (values) => {
        setIsLoading(true);
        setSubmitError(null);

        try {
            const formDataObj = new FormData();

            if (isEditMode) {
                formDataObj.append('id', initialValue.id);
            }

            formDataObj.append('name', values.name || '');
            formDataObj.append('email', values.email || '');
            const response = isEditMode
                ? await apiEditSubCompany(formDataObj)
                : await apiCreateSubCompany(formDataObj);

            if (response?.data?.success === 1 || response?.status === 200) {
                if (onSubCompanyCreated) {
                    onSubCompanyCreated();
                }
                unlockBodyScroll();
                setIsOpen({ type: "new", isOpen: false });
            } else {
                setSubmitError(response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} sub-company`);
            }
        } catch (error) {
            console.error(`Sub-company ${isEditMode ? 'edit' : 'creation'} error:`, error);
            setSubmitError(error?.response?.data?.message || error?.message || `Error ${isEditMode ? 'updating' : 'creating'} sub-company`);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div>
            <Formik
                initialValues={{
                    name: initialValue?.name || "",
                    email: initialValue?.email || "",
                }}
                validationSchema={SUB_COMPANY_VALIDATION_SCHEMA}
                onSubmit={handleSubmit}
            >
                {({ values, setFieldValue }) => {
                    return (
                        <div className="w-96">
                            <Form>
                                <div className="text-xl sm:text-2xl lg:text-[26px] leading-7 sm:leading-8 lg:leading-9 font-semibold text-[#252525] mb-4 sm:mb-6 lg:mb-7 text-center mx-auto max-w-full sm:max-w-[85%] lg:max-w-[75%] w-full px-2">
                                    <span className="w-full text-center block truncate">
                                        {isEditMode ? 'Edit Sub Company' : 'Add Sub Company'}
                                    </span>
                                </div>
                                {submitError && (
                                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                                        {submitError}
                                    </div>
                                )}
                                <div className="mb-6 sm:mb-[60px]">
                                    <div className="w-full mb-4">
                                        <FormLabel htmlFor="name">Sub Company Name</FormLabel>
                                        <div className="sm:h-16 h-14">
                                            <Field
                                                type="text"
                                                name="name"
                                                className="sm:px-5 px-4 sm:py-[21px] py-4 border border-[#8D8D8D] rounded-lg w-full h-full shadow-[-4px_4px_6px_0px_#0000001F] placeholder:text-[#6C6C6C] sm:text-base text-sm leading-[22px] font-semibold"
                                                placeholder="Enter Sub Company Name"
                                            />
                                        </div>
                                        <ErrorMessage
                                            name="name"
                                            component="div"
                                            className="text-red-500 text-sm mt-1"
                                        />
                                    </div>
                                    <div className="w-full mb-4">
                                        <FormLabel htmlFor="email">Sub Company Email</FormLabel>
                                        <div className="sm:h-16 h-14">
                                            <Field
                                                type="email"
                                                name="email"
                                                className="sm:px-5 px-4 sm:py-[21px] py-4 border border-[#8D8D8D] rounded-lg w-full h-full shadow-[-4px_4px_6px_0px_#0000001F] placeholder:text-[#6C6C6C] sm:text-base text-sm leading-[22px] font-semibold"
                                                placeholder="Enter Sub Company Email"
                                            />
                                        </div>
                                        <ErrorMessage
                                            name="email"
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
                                        <span>{isLoading ? (isEditMode ? "Updating..." : "Creating...") : (isEditMode ? "Update" : "Add")}</span>
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

export default AddSubCompanyModel;
