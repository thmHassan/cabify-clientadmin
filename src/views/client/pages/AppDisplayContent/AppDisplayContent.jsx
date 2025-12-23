import { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import _ from "lodash";
import {
    apiGetAppContent,
    apiSaveAppDisplayContent,
} from "../../../../services/AppDisplayContentServices";
import AppLogoLoader from "../../../../components/shared/AppLogoLoader";
import PageTitle from "../../../../components/ui/PageTitle/PageTitle";
import CardContainer from "../../../../components/shared/CardContainer";
import FormLabel from "../../../../components/ui/FormLabel";
import Button from "../../../../components/ui/Button/Button";

const AppDisplayContent = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [appContentData, setAppContentData] = useState({
        about_us: "",
        terms_conditions: "",
        privacy_policy: "",
    });

    const getAppDisplayContent = async () => {
        try {
            setIsLoading(true);
            const response = await apiGetAppContent();

            if (response?.data?.success) {
                const data = response.data.data;

                setAppContentData({
                    about_us: data.about_us || "",
                    terms_conditions: data.terms_conditions || "",
                    privacy_policy: data.privacy_policy || "",
                });
            }
        } catch (error) {
            console.error("Get app content error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        getAppDisplayContent();
    }, []);

    const handleFormSubmit = async (values, { setSubmitting }) => {
        try {
            setSubmitting(true);
            await apiSaveAppDisplayContent(values);
            await getAppDisplayContent();
        } catch (error) {
            console.error("Save app content error:", error);
        } finally {
            setSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <AppLogoLoader />
            </div>
        );
    }

    return (
        <div className="px-4 py-5 sm:p-6 lg:p-7 2xl:p-10 min-h-[calc(100vh-85px)]">
            <PageTitle title="App Display Content" />

            <CardContainer className="p-4 mt-5">
                <Formik
                    enableReinitialize
                    initialValues={appContentData}
                    onSubmit={handleFormSubmit}
                >
                    {({ isSubmitting }) => (
                        <Form className="grid grid-cols-1 gap-5">
                            <div className="flex flex-wrap gap-5 mb-6 sm:mb-[60px]">
                                <div className="w-[calc((100%-20px)/2)]">
                                    <FormLabel htmlFor="about_us">About Us</FormLabel>
                                    <div className="sm:h-16 h-14">
                                        <Field
                                            type="text"
                                            name="about_us"
                                            className="sm:px-5 px-4 sm:py-[21px] py-4 border border-[#8D8D8D] rounded-lg w-full h-full shadow-[-4px_4px_6px_0px_#0000001F] placeholder:text-[#6C6C6C] sm:text-base text-sm leading-[22px] font-semibold"
                                            placeholder="Enter About Us"
                                        />
                                    </div>
                                    <ErrorMessage
                                        name="about_us"
                                        component="div"
                                        className="text-red-500 text-sm mt-1"
                                    />
                                </div>
                                <div className="w-[calc((100%-20px)/2)]">
                                    <FormLabel htmlFor="terms_conditions">Terms & Conditions</FormLabel>
                                    <div className="sm:h-16 h-14">
                                        <Field
                                            type="text"
                                            name="terms_conditions"
                                            className="sm:px-5 px-4 sm:py-[21px] py-4 border border-[#8D8D8D] rounded-lg w-full h-full shadow-[-4px_4px_6px_0px_#0000001F] placeholder:text-[#6C6C6C] sm:text-base text-sm leading-[22px] font-semibold"
                                            placeholder="Enter Terms Conditions"
                                        />
                                    </div>
                                    <ErrorMessage
                                        name="terms_conditions"
                                        component="div"
                                        className="text-red-500 text-sm mt-1"
                                    />
                                </div>
                                <div className="w-[calc((100%-20px)/2)]">
                                    <FormLabel htmlFor="privacy_policy">Privacy Policy</FormLabel>
                                    <div className="sm:h-16 h-14">
                                        <Field
                                            type="text"
                                            name="privacy_policy"
                                            className="sm:px-5 px-4 sm:py-[21px] py-4 border border-[#8D8D8D] rounded-lg w-full h-full shadow-[-4px_4px_6px_0px_#0000001F] placeholder:text-[#6C6C6C] sm:text-base text-sm leading-[22px] font-semibold"
                                            placeholder="Enter Privacy Policy"
                                        />
                                    </div>
                                    <ErrorMessage
                                        name="privacy_policy"
                                        component="div"
                                        className="text-red-500 text-sm mt-1"
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-5 justify-end">
                                <Button
                                    btnType="submit"
                                    btnSize="md"
                                    type="filled"
                                    className="!px-10 pt-4 pb-[15px] leading-[25px] w-full sm:w-auto"
                                    disabled={isSubmitting}
                                >
                                    <span>SAVE</span>
                                </Button>
                            </div>

                        </Form>
                    )}
                </Formik>
            </CardContainer>
        </div>
    );
};

export default AppDisplayContent;
