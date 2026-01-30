import { Field, Form, Formik } from "formik";
import Button from "../../../../../../components/ui/Button/Button";
import FormLabel from "../../../../../../components/ui/FormLabel";

const DocumentRequestModel = ({ document, handleCloseModal }) => {
    return (
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
            <Formik
                initialValues={{
                    name: document?.driver_detail?.name || "",
                    email: document?.driver_detail?.email || "",
                    phone: `${document?.driver_detail?.country_code || "+91"} ${document?.driver_detail?.phone_no || ""}`,
                    driverStatus: document?.driver_detail?.status || "",
                    documentId: document?.document_id || "",
                    documentStatus: document?.status || "",
                    documentNumber: document?.has_number_field || "",
                    expiryDate: document?.has_expiry_date || "",
                    issueDate: document?.has_issue_date || "",
                    vehicleType: document?.driver_detail?.vehicle_type || "",
                    plateNumber: document?.driver_detail?.plate_no || "",
                    color: document?.driver_detail?.color || "",
                    seats: document?.driver_detail?.seats || "",
                }}
                onSubmit={() => { }}
            >
                {() => (
                    <Form>
                        {/* Header */}
                        <div className="flex justify-between items-center mb-6 pb-4 border-b">
                            <h2 className="text-xl sm:text-2xl lg:text-[26px] leading-7 sm:leading-8 lg:leading-9 font-semibold text-[#252525]">
                                Document Details
                            </h2>
                            <button
                                type="button"
                                onClick={handleCloseModal}
                                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                            >
                                ×
                            </button>
                        </div>

                        <div className="mb-6">
                            <div className="flex flex-wrap gap-5 mb-4">
                                <div className="w-[calc((100%-20px)/2)]">
                                    <FormLabel htmlFor="name">Name</FormLabel>
                                    <div className="sm:h-16 h-14">
                                        <Field
                                            type="text"
                                            name="name"
                                            disabled
                                            className="sm:px-5 px-4 sm:py-[21px] py-4 border border-[#8D8D8D] rounded-lg w-full h-full shadow-[-4px_4px_6px_0px_#0000001F] placeholder:text-[#6C6C6C] sm:text-base text-sm leading-[22px] font-semibold bg-gray-50"
                                        />
                                    </div>
                                </div>

                                <div className="w-[calc((100%-20px)/2)]">
                                    <FormLabel htmlFor="email">Email</FormLabel>
                                    <div className="sm:h-16 h-14">
                                        <Field
                                            type="email"
                                            name="email"
                                            disabled
                                            className="sm:px-5 px-4 sm:py-[21px] py-4 border border-[#8D8D8D] rounded-lg w-full h-full shadow-[-4px_4px_6px_0px_#0000001F] placeholder:text-[#6C6C6C] sm:text-base text-sm leading-[22px] font-semibold bg-gray-50"
                                        />
                                    </div>
                                </div>

                                <div className="w-[calc((100%-20px)/2)]">
                                    <FormLabel htmlFor="phone">Phone</FormLabel>
                                    <div className="sm:h-16 h-14">
                                        <Field
                                            type="text"
                                            name="phone"
                                            disabled
                                            className="sm:px-5 px-4 sm:py-[21px] py-4 border border-[#8D8D8D] rounded-lg w-full h-full shadow-[-4px_4px_6px_0px_#0000001F] placeholder:text-[#6C6C6C] sm:text-base text-sm leading-[22px] font-semibold bg-gray-50"
                                        />
                                    </div>
                                </div>

                                  {document?.has_number_field && (
                                    <div className="w-[calc((100%-20px)/2)]">
                                        <FormLabel htmlFor="documentNumber">Document Number</FormLabel>
                                        <div className="sm:h-16 h-14">
                                            <Field
                                                type="text"
                                                name="documentNumber"
                                                disabled
                                                className="sm:px-5 px-4 sm:py-[21px] py-4 border border-[#8D8D8D] rounded-lg w-full h-full shadow-[-4px_4px_6px_0px_#0000001F] placeholder:text-[#6C6C6C] sm:text-base text-sm leading-[22px] font-semibold bg-gray-50"
                                            />
                                        </div>
                                    </div>
                                )}

                                {document?.has_expiry_date && (
                                    <div className="w-[calc((100%-20px)/2)]">
                                        <FormLabel htmlFor="expiryDate">Expiry Date</FormLabel>
                                        <div className="sm:h-16 h-14">
                                            <Field
                                                type="text"
                                                name="expiryDate"
                                                disabled
                                                className="sm:px-5 px-4 sm:py-[21px] py-4 border border-[#8D8D8D] rounded-lg w-full h-full shadow-[-4px_4px_6px_0px_#0000001F] placeholder:text-[#6C6C6C] sm:text-base text-sm leading-[22px] font-semibold bg-gray-50"
                                            />
                                        </div>
                                    </div>
                                )}

                                {document?.has_issue_date && (
                                    <div className="w-[calc((100%-20px)/2)]">
                                        <FormLabel htmlFor="issueDate">Issue Date</FormLabel>
                                        <div className="sm:h-16 h-14">
                                            <Field
                                                type="text"
                                                name="issueDate"
                                                disabled
                                                className="sm:px-5 px-4 sm:py-[21px] py-4 border border-[#8D8D8D] rounded-lg w-full h-full shadow-[-4px_4px_6px_0px_#0000001F] placeholder:text-[#6C6C6C] sm:text-base text-sm leading-[22px] font-semibold bg-gray-50"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer Buttons */}
                        <div className="mt-6 pt-4 border-t flex justify-end gap-3">
                            <Button
                                onClick={handleCloseModal}
                                type="filledGray"
                                className="px-6 py-2 rounded-lg"
                            >
                                Close
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default DocumentRequestModel;