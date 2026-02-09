import { ErrorMessage, Field, Form, Formik } from "formik";
import { useState } from "react";
import FormLabel from "../../../../../../components/ui/FormLabel/FormLabel";
import Password from "../../../../../../components/elements/CustomPassword/Password";
import { unlockBodyScroll } from "../../../../../../utils/functions/common.function";
import Button from "../../../../../../components/ui/Button/Button";
import { apiCreateUser } from "../../../../../../services/UserService";
import { USER_VALIDATION_SCHEMA } from "../../../../validators/pages/user.validation";
import toast from "react-hot-toast";

const AddUserModel = ({ initialValue = {}, setIsOpen, onUserCreated }) => {
    const [submitError, setSubmitError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (values) => {
        setIsLoading(true);

        try {
            const formData = new FormData();
            formData.append("name", values.name || "");
            formData.append("email", values.email || "");
            formData.append("country_code", values.countryCode || "");
            formData.append("phone_no", values.phoneNumber || "");
            formData.append("password", values.password || "");
            formData.append("address", values.address || "");
            formData.append("city", values.city || "");

            const response = await apiCreateUser(formData);

            if (response?.data?.error === 1) {
                toast.error(response?.data?.message || "Something went wrong", {
                    duration: 5000,
                });
                return;
            }

            toast.success(
                response?.data?.message || "User created successfully",
                {
                    duration: 5000,
                }
            );

            if (onUserCreated) {
                onUserCreated();
            }

            unlockBodyScroll();
            setIsOpen({ type: "new", isOpen: false });

        } catch (error) {
            toast.error(
                error?.response?.data?.message ||
                error?.message ||
                "Server error",
                {
                    duration: 5000,
                }
            );
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div>
            <Formik
                initialValues={{
                    name: initialValue.name || '',
                    email: initialValue.email || '',
                    countryCode: initialValue.countryCode || '',
                    phoneNumber: initialValue.phoneNumber || '',
                    password: initialValue.password || '',
                    address: initialValue.address || '',
                    city: initialValue.city || '',
                }}
                validationSchema={USER_VALIDATION_SCHEMA}
                onSubmit={handleSubmit}
                validateOnChange={true}
                validateOnBlur={true}
            >
                {({ values, setFieldValue }) => (
                    <Form>
                        <div className="text-xl sm:text-2xl lg:text-[26px] leading-7 sm:leading-8 lg:leading-9 font-semibold text-[#252525] mb-4 sm:mb-6 lg:mb-7 text-center mx-auto max-w-full sm:max-w-[85%] lg:max-w-[75%] w-full px-2">
                            <span className="w-full text-center block truncate">
                                Add User
                            </span>
                        </div>

                        {submitError && (
                            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                                {submitError}
                            </div>
                        )}

                        <div className="flex flex-wrap gap-5 mb-6 sm:mb-[60px]">
                            <div className="w-[calc((100%-20px)/2)]">
                                <FormLabel htmlFor="name">Name</FormLabel>
                                <div className="sm:h-16 h-14">
                                    <Field
                                        type="text"
                                        name="name"
                                        className="sm:px-5 px-4 sm:py-[21px] py-4 border border-[#8D8D8D] rounded-lg w-full h-full shadow-[-4px_4px_6px_0px_#0000001F] placeholder:text-[#6C6C6C] sm:text-base text-sm leading-[22px] font-semibold"
                                        placeholder="Enter Name"
                                    />
                                </div>
                                <ErrorMessage name="name" component="div" className="text-red-500 text-sm mt-1" />
                            </div>

                            <div className="w-[calc((100%-20px)/2)]">
                                <FormLabel htmlFor="email">Email</FormLabel>
                                <div className="sm:h-16 h-14">
                                    <Field
                                        type="text"
                                        name="email"
                                        className="sm:px-5 px-4 sm:py-[21px] py-4 border border-[#8D8D8D] rounded-lg w-full h-full shadow-[-4px_4px_6px_0px_#0000001F] placeholder:text-[#6C6C6C] sm:text-base text-sm leading-[22px] font-semibold"
                                        placeholder="Enter Email"
                                    />
                                </div>
                                <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
                            </div>
                            <div className="w-[calc((100%-20px)/2)]">
                                <FormLabel htmlFor="phoneNumber">Phone Number</FormLabel>

                                <div className="flex items-center border border-[#8D8D8D] rounded-lg shadow-[-4px_4px_6px_0px_#0000001F] overflow-hidden sm:h-16 h-14">

                                    {/* Country Code */}
                                    <Field
                                        as="select"
                                        name="countryCode"
                                        className="h-full px-3 sm:px-4 bg-gray-100 border-r border-[#8D8D8D] outline-none text-sm sm:text-base font-semibold"
                                    >
                                        <option value="+91">+91</option>
                                        <option value="+1">+1</option>
                                        <option value="+44">+44</option>
                                        <option value="+971">+971</option>
                                    </Field>

                                    {/* Phone Number */}
                                    <Field
                                        type="text"
                                        name="phoneNumber"
                                        className="flex-1 h-full sm:px-5 px-4 outline-none placeholder:text-[#6C6C6C] sm:text-base text-sm font-semibold"
                                        placeholder="Enter phone number"
                                    />
                                </div>

                                <ErrorMessage name="countryCode" component="div" className="text-red-500 text-sm mt-1" />
                                <ErrorMessage name="phoneNumber" component="div" className="text-red-500 text-sm mt-1" />
                            </div>

                            {/* <div className="w-[calc((100%-20px)/2)]">
                                <FormLabel htmlFor="countryCode">Country Code</FormLabel>
                                <div className="sm:h-16 h-14">
                                    <Field
                                        type="text"
                                        name="countryCode"
                                        className="sm:px-5 px-4 sm:py-[21px] py-4 border border-[#8D8D8D] rounded-lg w-full h-full shadow-[-4px_4px_6px_0px_#0000001F]"
                                        placeholder="+91"
                                    />
                                </div>
                                <ErrorMessage name="countryCode" component="div" className="text-red-500 text-sm mt-1" />
                            </div>

                            <div className="w-[calc((100%-20px)/2)]">
                                <FormLabel htmlFor="phone-number">Phone Number</FormLabel>
                                <div className="sm:h-16 h-14">
                                    <Field
                                        type="text"
                                        name="phoneNumber"
                                        className="sm:px-5 px-4 sm:py-[21px] py-4 border border-[#8D8D8D] rounded-lg w-full h-full shadow-[-4px_4px_6px_0px_#0000001F] placeholder:text-[#6C6C6C] sm:text-base text-sm leading-[22px] font-semibold"
                                        placeholder="Enter Phone Number"
                                    />
                                </div>
                                <ErrorMessage name="phoneNumber" component="div" className="text-red-500 text-sm mt-1" />
                            </div> */}

                            <div className="w-full sm:w-[calc((100%-20px)/2)]">
                                <FormLabel htmlFor="password">Password</FormLabel>
                                <div className="sm:h-16 h-14">
                                    <Password
                                        name="password"
                                        className="sm:px-5 px-4 sm:py-[21px] py-4 !select-none border border-[#8D8D8D] rounded-lg w-full h-14 sm:h-16 shadow-[-4px_4px_6px_0px_#0000001F] placeholder:text-[#6C6C6C] sm:text-base text-sm leading-[22px] font-semibold"
                                        placeholder="Enter password"
                                        autoComplete="off"
                                    />
                                </div>
                                <ErrorMessage name="password" component="div" className="text-red-500 text-sm mt-1" />
                            </div>

                            <div className="w-[calc((100%-20px)/2)]">
                                <FormLabel htmlFor="address">Address</FormLabel>
                                <div className="sm:h-16 h-14">
                                    <Field
                                        type="text"
                                        name="address"
                                        className="sm:px-5 px-4 sm:py-[21px] py-4 border border-[#8D8D8D] rounded-lg w-full h-full shadow-[-4px_4px_6px_0px_#0000001F] placeholder:text-[#6C6C6C] sm:text-base text-sm leading-[22px] font-semibold"
                                        placeholder="Enter address"
                                    />
                                </div>
                                <ErrorMessage name="address" component="div" className="text-red-500 text-sm mt-1" />
                            </div>

                            <div className="w-[calc((100%-20px)/2)]">
                                <FormLabel htmlFor="city">City</FormLabel>
                                <div className="sm:h-16 h-14">
                                    <Field
                                        type="text"
                                        name="city"
                                        className="sm:px-5 px-4 sm:py-[21px] py-4 border border-[#8D8D8D] rounded-lg w-full h-full shadow-[-4px_4px_6px_0px_#0000001F] placeholder:text-[#6C6C6C] sm:text-base text-sm leading-[22px] font-semibold"
                                        placeholder="Enter city"
                                    />
                                </div>
                                <ErrorMessage name="city" component="div" className="text-red-500 text-sm mt-1" />
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
                                <span>{isLoading ? 'Creating...' : 'Submit'}</span>
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default AddUserModel;