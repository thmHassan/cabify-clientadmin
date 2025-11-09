import { ErrorMessage, Field, Form, Formik } from "formik";
import React, { useRef, useState } from "react";
import ImageUploadIcon from "../../../../../../components/svg/ImageUploadIcon";
import _ from "lodash";
import FormLabel from "../../../../../../components/ui/FormLabel/FormLabel";
import FormSelection from "../../../../../../components/ui/FormSelection/FormSelection";
import Password from "../../../../../../components/elements/CustomPassword/Password";
import { unlockBodyScroll } from "../../../../../../utils/functions/common.function";
import Button from "../../../../../../components/ui/Button/Button";

const AddDispatcherModal = ({ initialValue = {}, setIsOpen }) => {
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [submitError, setSubmitError] = useState(null);
  const [formData, setFormData] = useState(initialValue);
  const fileInputRef = useRef(null);
  const handlePickImage = () => {
    fileInputRef.current?.click();
  };
  const handleImageChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    // Optionally, validate file type/size here
    setFormData((prev) => ({ ...prev, picture: file }));
    const objectUrl = URL.createObjectURL(file);
    setImagePreviewUrl((prevUrl) => {
      if (prevUrl) URL.revokeObjectURL(prevUrl);
      return objectUrl;
    });
  };
  console.log(formData, "formData=====");
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
              <div
                className="w-20 h-20 sm:w-[100px] sm:h-[100px] lg:w-[120px] lg:h-[120px] rounded-full bg-[#EEEEEE] flex justify-center items-center mx-auto mb-4 sm:mb-5 overflow-hidden cursor-pointer"
                onClick={handlePickImage}
                title="Click to upload"
              >
                {imagePreviewUrl ? (
                  <img
                    src={imagePreviewUrl}
                    alt="Company"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageUploadIcon />
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>
              <div className="text-xl sm:text-2xl lg:text-[26px] leading-7 sm:leading-8 lg:leading-9 font-semibold text-[#252525] mb-4 sm:mb-6 lg:mb-7 text-center mx-auto max-w-full sm:max-w-[85%] lg:max-w-[75%] w-full px-2">
                <span className="w-full text-center block truncate">
                  Add Dispatcher
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
                  <FormLabel htmlFor="phone-number">Phone Number</FormLabel>
                  <div className="sm:h-16 h-14">
                    <Field
                      type="text"
                      name="phoneNumber"
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
                  <FormLabel htmlFor="shift">Shift</FormLabel>
                  <div className="sm:h-16 h-14">
                    <FormSelection
                      label="Select Shift"
                      name="status"
                      value={values.status}
                      onChange={(val) => setFieldValue("shift", val)}
                      placeholder="Select Shift"
                      options={[]}
                    />
                  </div>
                  <ErrorMessage
                    name="shift"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
                <div className="w-full sm:w-[calc((100%-20px)/2)]">
                  <FormLabel htmlFor="password">Password</FormLabel>
                  <div className="sm:h-16 h-14">
                    <Password
                      name="password"
                      className="sm:px-5 px-4 sm:py-[21px] py-4 !select-none border border-[#8D8D8D] rounded-lg w-full h-14 sm:h-16 shadow-[-4px_4px_6px_0px_#0000001F] placeholder:text-[#6C6C6C] sm:text-base text-sm leading-[22px] font-semibold"
                      placeholder="Enter password"
                      autoComplete="off"
                      //   disabled={type === "edit"}
                    />
                  </div>
                  <ErrorMessage
                    name="password"
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
                  <span>Submit</span>
                </Button>
              </div>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
};

export default AddDispatcherModal;
