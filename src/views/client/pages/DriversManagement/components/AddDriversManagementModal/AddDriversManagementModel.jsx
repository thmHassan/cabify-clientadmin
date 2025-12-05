import { ErrorMessage, Field, Form, Formik } from "formik";
import { useState } from "react";
import _ from "lodash";
import FormLabel from "../../../../../../components/ui/FormLabel/FormLabel";
import FormSelection from "../../../../../../components/ui/FormSelection/FormSelection";
import { unlockBodyScroll } from "../../../../../../utils/functions/common.function";
import Button from "../../../../../../components/ui/Button/Button";

const AddDriversManagementModal = ({ initialValue = {}, setIsOpen }) => {
  const [submitError, setSubmitError] = useState(null);
  const [formData, setFormData] = useState(initialValue);

  return (
    <div>
      <Formik
        initialValues={{}}
      // validationSchema={COMPANY_VALIDATION_SCHEMA}
      // onSubmit={onSubmit}
      // validateOnChange={true}
      // validateOnBlur={true}
      // enableReinitialize={true}
      >
        {({ values, setFieldValue }) => {
          return (
            <Form>
              <div className="text-xl sm:text-2xl lg:text-[26px] leading-7 sm:leading-8 lg:leading-9 font-semibold text-[#252525] mb-4 sm:mb-6 lg:mb-7 text-center mx-auto max-w-full sm:max-w-[85%] lg:max-w-[75%] w-full px-2">
                <span className="w-full text-center block truncate">
                  Add New Driver
                </span>
              </div>
              {submitError && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {submitError}
                </div>
              )}
              <div className="flex flex-wrap gap-5 mb-6 sm:mb-[60px]">
                <div className="w-[calc((100%-20px)/2)]">
                  <FormLabel htmlFor="firstName">First Name</FormLabel>
                  <div className="sm:h-16 h-14">
                    <Field
                      type="text"
                      name="firstName"
                      className="sm:px-5 px-4 sm:py-[21px] py-4 border border-[#8D8D8D] rounded-lg w-full h-full shadow-[-4px_4px_6px_0px_#0000001F] placeholder:text-[#6C6C6C] sm:text-base text-sm leading-[22px] font-semibold"
                      placeholder="Enter first name"
                    />
                  </div>
                  <ErrorMessage
                    name="name"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
                <div className="w-[calc((100%-20px)/2)]">
                  <FormLabel htmlFor="lasttName">Last Name</FormLabel>
                  <div className="sm:h-16 h-14">
                    <Field
                      type="text"
                      name="lastName"
                      className="sm:px-5 px-4 sm:py-[21px] py-4 border border-[#8D8D8D] rounded-lg w-full h-full shadow-[-4px_4px_6px_0px_#0000001F] placeholder:text-[#6C6C6C] sm:text-base text-sm leading-[22px] font-semibold"
                      placeholder="Enter last name"
                    />
                  </div>
                  <ErrorMessage
                    name="name"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
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
                  <ErrorMessage
                    name="email"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
                <div className="w-[calc((100%-20px)/2)]">
                  <FormLabel htmlFor="mobile-number">Mobile Number</FormLabel>
                  <div className="sm:h-16 h-14">
                    <Field
                      type="text"
                      name="mobileNumber"
                      className="sm:px-5 px-4 sm:py-[21px] py-4 border border-[#8D8D8D] rounded-lg w-full h-full shadow-[-4px_4px_6px_0px_#0000001F] placeholder:text-[#6C6C6C] sm:text-base text-sm leading-[22px] font-semibold"
                      placeholder="Enter Phone Number"
                    />
                  </div>
                  <ErrorMessage
                    name="phoneNumber"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
                <div className="w-[calc((100%-20px)/2)]">
                  <FormLabel htmlFor="address">Address</FormLabel>
                  <div className="sm:h-16 h-14">
                    <Field
                      type="text"
                      name="address"
                      className="sm:px-5 px-4 sm:py-[21px] py-4 border border-[#8D8D8D] rounded-lg w-full h-full shadow-[-4px_4px_6px_0px_#0000001F] placeholder:text-[#6C6C6C] sm:text-base text-sm leading-[22px] font-semibold"
                      placeholder="Enter Address"
                    />
                  </div>
                  <ErrorMessage
                    name="phoneNumber"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
                <div className="w-[calc((100%-20px)/2)]">
                  <FormLabel htmlFor="driver-license-number">Driver's License Number</FormLabel>
                  <div className="sm:h-16 h-14">
                    <Field
                      type="text"
                      name="driverLicenseNumber"
                      className="sm:px-5 px-4 sm:py-[21px] py-4 border border-[#8D8D8D] rounded-lg w-full h-full shadow-[-4px_4px_6px_0px_#0000001F] placeholder:text-[#6C6C6C] sm:text-base text-sm leading-[22px] font-semibold"
                      placeholder="Enter Driver's License Number"
                    />
                  </div>
                  <ErrorMessage
                    name="phoneNumber"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
                <div className="w-[calc((100%-20px)/2)]">
                  <FormLabel htmlFor="assignedVahicle">Assigned Vehicle</FormLabel>
                  <div className="sm:h-16 h-14">
                    <FormSelection
                      label="Select Status"
                      name="assignedVahicle"
                      value={values.status}
                      onChange={(val) => setFieldValue("status", val)}
                      placeholder="Any Vahicle"
                      options={[]}
                    />
                  </div>
                  <ErrorMessage
                    name="status"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
                <div className="w-[calc((100%-20px)/2)]">
                  <FormLabel htmlFor="status">Status</FormLabel>
                  <div className="sm:h-16 h-14">
                    <FormSelection
                      label="Select Status"
                      name="status"
                      value={values.status}
                      onChange={(val) => setFieldValue("status", val)}
                      placeholder="Select Status"
                      options={[]}
                    />
                  </div>
                  <ErrorMessage
                    name="status"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
                <div className="w-[calc((100%-20px)/2)]">
                  <FormLabel htmlFor="joinedDate">Joined Date</FormLabel>
                  <div className="sm:h-16 h-14">
                    <FormSelection
                      label="Select Status"
                      name="joinedDate"
                      value={values.status}
                      onChange={(val) => setFieldValue("status", val)}
                      placeholder="Select Date"
                      options={[]}
                    />
                  </div>
                  <ErrorMessage
                    name="status"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
                <div className="w-[calc((100%-20px)/2)]">
                  <FormLabel htmlFor="subCompany">Sub Company</FormLabel>
                  <div className="sm:h-16 h-14">
                    <FormSelection
                      label="Select Status"
                      name="subCompany"
                      value={values.status}
                      onChange={(val) => setFieldValue("status", val)}
                      placeholder="select Sub Company"
                      options={[]}
                    />
                  </div>
                  <ErrorMessage
                    name="status"
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
          );
        }}
      </Formik>
    </div>
  );
};

export default AddDriversManagementModal;
