import { ErrorMessage, Field, Form, Formik } from "formik";
import React, { useRef, useState } from "react";
import _ from "lodash";
import { unlockBodyScroll } from "../../../../../../../../utils/functions/common.function";
import Button from "../../../../../../../../components/ui/Button/Button";
import FormLabel from "../../../../../../../../components/ui/FormLabel/FormLabel";
import FormSelection from "../../../../../../../../components/ui/FormSelection/FormSelection";


const AddPackageModel = ({ initialValue = {}, setIsOpen }) => {
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
                        <div className="w-96">
                            <Form>
                                <div className="text-xl sm:text-2xl lg:text-[26px] leading-7 sm:leading-8 lg:leading-9 font-semibold text-[#252525] mb-4 sm:mb-6 lg:mb-7 text-center mx-auto max-w-full sm:max-w-[85%] lg:max-w-[75%] w-full px-2">
                                    <span className="w-full text-center block truncate">
                                        Add New Package
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
                                        <div className="sm:h-16 h-14">
                                            <Field
                                                type="text"
                                                name="packageName"
                                                className="sm:px-5 px-4 sm:py-[21px] py-4 border border-[#8D8D8D] rounded-lg w-full h-full shadow-[-4px_4px_6px_0px_#0000001F] placeholder:text-[#6C6C6C] sm:text-base text-sm leading-[22px] font-semibold"
                                                placeholder="Enter Package Name"
                                            />
                                        </div>
                                        <ErrorMessage
                                            name="packageName"
                                            component="div"
                                            className="text-red-500 text-sm mt-1"
                                        />
                                    </div>
                                    <div className="w-full mb-4">
                                        <FormLabel htmlFor="packageDuration">Package Duration</FormLabel>
                                        <div className="sm:h-16 h-14">
                                            <Field
                                                type="text"
                                                name="packageDuration"
                                                className="sm:px-5 px-4 sm:py-[21px] py-4 border border-[#8D8D8D] rounded-lg w-full h-full shadow-[-4px_4px_6px_0px_#0000001F] placeholder:text-[#6C6C6C] sm:text-base text-sm leading-[22px] font-semibold"
                                                placeholder="Enter Package Duration"
                                            />
                                        </div>
                                        <ErrorMessage
                                            name="packageDuration"
                                            component="div"
                                            className="text-red-500 text-sm mt-1"
                                        />
                                    </div>
                                     <div className="w-full">
                                        <FormLabel htmlFor="durationType">Duration Type</FormLabel>
                                        <div className="sm:h-16 h-14">
                                            <FormSelection
                                                label="Select Duration Type"
                                                name="durationType"
                                                value={values.status}
                                                onChange={(val) => setFieldValue("durationType", val)}
                                                placeholder="Select Duration Type"
                                                options={[]}
                                            />
                                        </div>
                                        <ErrorMessage
                                            name="shift"
                                            component="div"
                                            className="text-red-500 text-sm mt-1"
                                        />
                                    </div>
                                    <div className="w-full mb-4">
                                        <FormLabel htmlFor="packagePrice">Package Price</FormLabel>
                                        <div className="sm:h-16 h-14">
                                            <Field
                                                type="text"
                                                name="packagePrice"
                                                className="sm:px-5 px-4 sm:py-[21px] py-4 border border-[#8D8D8D] rounded-lg w-full h-full shadow-[-4px_4px_6px_0px_#0000001F] placeholder:text-[#6C6C6C] sm:text-base text-sm leading-[22px] font-semibold"
                                                placeholder="Enter Package Price"
                                            />
                                        </div>
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
                                    >
                                        <span>Add Driver</span>
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

export default AddPackageModel;
