import { ErrorMessage, Field, Form, Formik } from "formik";
import React, { useRef, useState, useEffect } from "react";
import * as Yup from "yup";
import _ from "lodash";
import FormLabel from "../../../../../../components/ui/FormLabel/FormLabel";
import { unlockBodyScroll } from "../../../../../../utils/functions/common.function";
import Button from "../../../../../../components/ui/Button/Button";
import { apiCreatePlot, apiEditPlot } from "../../../../../../services/PlotService";

const PLOT_VALIDATION_SCHEMA = Yup.object().shape({
    name: Yup.string()
        .required("Plot name is required")
        .min(2, "Plot name must be at least 2 characters"),
    coordinates: Yup.array()
        .of(Yup.array().of(Yup.number()))
        .min(2, "At least 2 coordinates are required")
        .required("Coordinates are required"),
});

const AddPlotsModel = ({ initialValue = {}, setIsOpen, onPlotsCreated }) => {
    const [submitError, setSubmitError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const mapRef = useRef(null);
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

            const featuresObj = {
                type: 'Feature',
                properties: {
                    name: values.name,
                },
                geometry: {
                    type: 'Polygon',
                    coordinates: values.coordinates || [],
                },
            };

            formDataObj.append('features', JSON.stringify(featuresObj));
            const response = isEditMode
                ? await apiEditPlot(formDataObj)
                : await apiCreatePlot(formDataObj);

            if (response?.data?.success === 1 || response?.status === 200) {
                if (onPlotsCreated) {
                    onPlotsCreated();
                }
                unlockBodyScroll();
                setIsOpen({ type: "new", isOpen: false });
            } else {
                setSubmitError(response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} plot`);
            }
        } catch (error) {
            console.error(`Plot ${isEditMode ? 'edit' : 'creation'} error:`, error);
            setSubmitError(error?.response?.data?.message || error?.message || `Error ${isEditMode ? 'updating' : 'creating'} plot`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <Formik
                initialValues={{
                    name: initialValue?.name || "",
                    coordinates: initialValue?.coordinates || [
                        [72.865475, 21.457506],
                        [72.601643, 21.319401],
                    ],
                }}
                validationSchema={PLOT_VALIDATION_SCHEMA}
                onSubmit={handleSubmit}
            >
                {({ values, setFieldValue }) => {
                    return (
                        <div className="w-96">
                            <Form>
                                <div className="text-xl sm:text-2xl lg:text-[26px] leading-7 sm:leading-8 lg:leading-9 font-semibold text-[#252525] mb-4 sm:mb-6 lg:mb-7 text-center mx-auto max-w-full sm:max-w-[85%] lg:max-w-[75%] w-full px-2">
                                    <span className="w-full text-center block truncate">
                                        {isEditMode ? 'Edit Plot' : 'Add New Plot'}
                                    </span>
                                </div>
                                {submitError && (
                                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                                        {submitError}
                                    </div>
                                )}
                                <div className="">
                                    <div className="w-full mb-4">
                                        <FormLabel htmlFor="name">Plot Name</FormLabel>
                                        <div className="sm:h-16 h-10">
                                            <Field
                                                type="text"
                                                name="name"
                                                className="sm:px-5 px-4 sm:py-[21px] py-3 border border-[#8D8D8D] rounded-lg w-full h-full shadow-[-4px_4px_6px_0px_#0000001F] placeholder:text-[#6C6C6C] sm:text-base text-sm leading-[22px] font-semibold"
                                                placeholder="Enter Plot Name"
                                            />
                                        </div>
                                        <ErrorMessage
                                            name="name"
                                            component="div"
                                            className="text-red-500 text-sm mt-1"
                                        />
                                    </div>
                                </div>
                                <div className="relative w-full h-[250px] rounded-xl overflow-hidden border border-gray-200">
                                    <iframe
                                        title="map"
                                        src="https://maps.google.com/maps?q=london&t=&z=11&ie=UTF8&iwloc=&output=embed"
                                        className="w-full h-full"
                                    ></iframe>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3 sm:gap-5 justify-end mt-3">
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

export default AddPlotsModel;
