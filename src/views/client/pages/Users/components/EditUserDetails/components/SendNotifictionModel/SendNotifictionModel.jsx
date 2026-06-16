import { ErrorMessage, Field, Form, Formik } from "formik";
import { apiSendUserNotifiction } from "../../../../../../../../services/UserService";
import { unlockBodyScroll } from "../../../../../../../../utils/functions/common.function";
import FormLabel from "../../../../../../../../components/ui/FormLabel";
import Button from "../../../../../../../../components/ui/Button/Button";
import { useState } from "react";


const SendNotifictionModel = ({ setIsOpen, userId }) => {
    const [submitError, setSubmitError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    console.log("userId===", userId);

    const closeModal = () => {
        unlockBodyScroll();
        setIsOpen({
            type: "new",
            isOpen: false,
        });
    };

    const handleSubmit = async (values, { resetForm }) => {
        setIsLoading(true);
        setSubmitError(null);

        try {
            const formData = new FormData();
            formData.append("user_id", userId);
            formData.append("title", values.title);
            formData.append("body", values.description);

            const response = await apiSendUserNotifiction(formData);

            if (response?.data?.success === 1 || response?.status === 200) {
                resetForm();
                closeModal();
            } else {
                setSubmitError(response?.data?.message || "Failed to send notification");
            }
        } catch (error) {
            setSubmitError(
                error?.response?.data?.message || "Error sending notification"
            );
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div>
            <Formik
                initialValues={{
                    title: "",
                    description: "",
                }}
                onSubmit={handleSubmit}
            >
                {({ values, setFieldValue }) => {
                    return (
                        <div className="w-96">
                            <Form>
                                <div className="text-xl sm:text-2xl lg:text-[26px] leading-7 sm:leading-8 lg:leading-9 font-semibold text-[#252525] mb-4 sm:mb-6 lg:mb-7 text-center mx-auto max-w-full sm:max-w-[85%] lg:max-w-[75%] w-full px-2">
                                    <span className="w-full text-center block truncate">
                                        Send Notification
                                    </span>
                                </div>
                                {submitError && (
                                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm leading-snug">
                                        {submitError}
                                    </div>
                                )}
                                <div className="flex flex-col gap-1">
                                    <FormLabel htmlFor="title">Title</FormLabel>
                                    <Field
                                        name="title"
                                        className="sm:px-5 px-4 sm:py-[21px] py-4 border border-[#8D8D8D] rounded-lg w-full min-h-[56px] shadow-[-4px_4px_6px_0px_#0000001F] placeholder:text-[#6C6C6C] sm:text-base text-sm leading-[22px] font-semibold"
                                        placeholder="Enter Title"
                                    />
                                    <div className="min-h-[20px]">
                                        <ErrorMessage
                                            name="title"
                                            component="div"
                                            className="text-red-500 text-sm mt-1 block leading-snug"
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1 mt-4 mb-6">
                                    <FormLabel htmlFor="description">Description</FormLabel>
                                    <Field
                                        as="textarea"
                                        name="description"
                                        rows={4}
                                        className="w-full min-h-[120px] border border-[#8D8D8D] rounded-lg px-4 py-3 shadow-[-4px_4px_6px_0px_#0000001F] placeholder:text-[#6C6C6C] sm:text-base text-sm leading-[22px] font-semibold resize-y"
                                        placeholder="Write description"
                                    />
                                    <div className="min-h-[20px]">
                                        <ErrorMessage
                                            name="description"
                                            component="div"
                                            className="text-red-500 text-sm mt-1 block leading-snug"
                                        />
                                    </div>
                                </div>
                                <div className="pt-4 flex flex-col sm:flex-row gap-3 sm:gap-5 justify-end">
                                    <Button
                                        btnSize="md"
                                        onClick={closeModal}
                                        className="!px-10 border border-[#1F41BB] text-[#1F41BB] font-bold pt-4 pb-[15px] leading-[25px] w-full sm:w-auto"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        btnType="submit"
                                        btnSize="md"
                                        type="filled"
                                        disabled={isLoading}
                                    >
                                        <span>{isLoading ? "Sending..." : "Send Notification"}</span>
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

export default SendNotifictionModel;
