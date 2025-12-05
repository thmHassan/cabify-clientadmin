import { ErrorMessage, Field, Form, Formik } from "formik";
import React, { useRef, useState } from "react";
import _ from "lodash";
import FormLabel from "../../../../../../components/ui/FormLabel/FormLabel";
import { unlockBodyScroll } from "../../../../../../utils/functions/common.function";
import Button from "../../../../../../components/ui/Button/Button";

const AddDriverDocumentModel = ({ initialValue = {}, setIsOpen }) => {
    const [submitError, setSubmitError] = useState(null);
    const [formData, setFormData] = useState(initialValue);
    console.log(formData, "formData=====");
    return (
        <div>
            <Formik
                initialValues={{
                    documentName: "",
                    frontPhoto: false,
                    backPhoto: false,
                    issueDate: false,
                    expiryDate: false,
                    numberField: false,
                }}
                onSubmit={(values) => {
                    console.log("Submitted: ", values);
                }}
            >
                {({ values, setFieldValue }) => {
                    return (
                        <Form>
                            <div className="text-xl sm:text-2xl lg:text-[26px] leading-7 sm:leading-8 lg:leading-9 font-semibold text-[#252525] mb-4 sm:mb-6 lg:mb-7 text-center mx-auto max-w-full sm:max-w-[85%] lg:max-w-[75%] w-full px-2">
                                <span className="w-full text-center block truncate">
                                    Add Document Type
                                </span>
                            </div>
                            {submitError && (
                                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                                    {submitError}
                                </div>
                            )}
                            <div className="mb-6 sm:mb-[60px]">
                                <div className="w-[calc((100%-20px)/2)] mb-4">
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
                                        name="name"
                                        component="div"
                                        className="text-red-500 text-sm mt-1"
                                    />
                                </div>
                                <div className="flex flex-col gap-3 mb-8 w-[calc((100%-20px)/2)]">
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
                                        <span className="font-medium text-gray-700">Issue Photo</span>
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
                                >
                                    <span>Add Driver</span>
                                </Button>
                            </div>
                        </Form>
                    );
                }}
            </Formik>
        </div>
    );
};

export default AddDriverDocumentModel;
