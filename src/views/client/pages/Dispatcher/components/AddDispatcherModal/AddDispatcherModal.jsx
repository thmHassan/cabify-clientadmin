import { ErrorMessage, Field, Form, Formik } from "formik";
import React, { useEffect, useState } from "react";
import FormLabel from "../../../../../../components/ui/FormLabel/FormLabel";
import FormSelection from "../../../../../../components/ui/FormSelection/FormSelection";
import Password from "../../../../../../components/elements/CustomPassword/Password";
import Button from "../../../../../../components/ui/Button/Button";
import { apiCreateDispatcher, apiEditDispatcher } from "../../../../../../services/DispatcherService";
import { unlockBodyScroll } from "../../../../../../utils/functions/common.function";
import { DISPATCHER_VALIDATION_SCHEMA } from "../../../../validators/pages/dispatcher.validation";
import toast from "react-hot-toast";
import { useAppSelector } from "../../../../../../store";
import { getTenantData, getTenantId } from "../../../../../../utils/functions/tokenEncryption";
import { useSocket } from "../../../../../../components/routes/SocketProvider";

const AddDispatcherModal = ({ initialValue = {}, setIsOpen, onDispatcherCreated }) => {
  const [submitError, setSubmitError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const reduxUserId = useAppSelector((state) => state?.auth?.user?.id);
  const userId = reduxUserId || getTenantData()?.company_id || getTenantId() || null;

  useEffect(() => {
    setIsEditMode(!!initialValue?.id);
  }, [initialValue]);

  const handleSubmit = async (values) => {
    setIsLoading(true);

    try {
      const formDataObj = new FormData();

      if (isEditMode) {
        formDataObj.append("id", initialValue.id);
      }

      formDataObj.append("name", values.name || "");
      formDataObj.append("email", values.email || "");
      formDataObj.append("phone_no", values.phone_no || "");
      formDataObj.append("status", values.status || "");

      if (values.password) {
        formDataObj.append("password", values.password);
      }

      const response = isEditMode
        ? await apiEditDispatcher(formDataObj)
        : await apiCreateDispatcher(formDataObj);

      if (response?.data?.error === 1) {
        toast.error(response?.data?.message || "Something went wrong", {
          duration: 5000,
        });
        return;
      }

      toast.success(
        response?.data?.message ||
        `Dispatcher ${isEditMode ? "updated" : "created"} successfully`,
        {
          duration: 5000,
        }
      );

      if (onDispatcherCreated) {
        onDispatcherCreated();
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

  console.log("userId====", userId);

  const echo = useSocket();

  useEffect(() => {
    if (!echo || !userId) return;

    console.log("Subscribing to user:", userId);

    const channel = echo.private(`App.Models.User.${userId}`);

    channel.notification((notification) => {
      console.log("Notification:", notification);
    });

    return () => {
      echo.leave(`App.Models.User.${userId}`);
    };
  }, [echo, userId]);

  return (
    <div>
      <Formik
        initialValues={{
          name: initialValue.name || '',
          email: initialValue.email || '',
          phone_no: initialValue.phone_no || '',
          status: initialValue.status || 'active',
          // password: initialValue.password || ''
          password: ""
        }}
        onSubmit={handleSubmit}
        validationSchema={DISPATCHER_VALIDATION_SCHEMA}
        validateOnChange={true}
        validateOnBlur={true}
        enableReinitialize={true}
      >
        {({ values, setFieldValue, isSubmitting }) => (
          <Form>
            <div className="text-xl sm:text-2xl lg:text-[26px] leading-7 sm:leading-8 lg:leading-9 font-semibold text-[#252525] mb-4 sm:mb-6 lg:mb-7 text-center mx-auto max-w-full sm:max-w-[85%] lg:max-w-[75%] w-full px-2">
              <span className="w-full text-center block truncate">
                {isEditMode ? 'Edit Dispatcher' : 'Add Dispatcher'}</span>
            </div>

            {submitError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {submitError}
              </div>
            )}

            <div className="flex flex-wrap gap-5 mb-6 sm:mb-[60px]">
              {/* Form Fields */}
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

              {/* Email */}
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

              {/* Phone Number */}
              <div className="w-[calc((100%-20px)/2)]">
                <FormLabel htmlFor="phone_no">Phone Number</FormLabel>
                <div className="sm:h-16 h-14">
                  <Field
                    type="text"
                    name="phone_no"
                    className="sm:px-5 px-4 sm:py-[21px] py-4 border border-[#8D8D8D] rounded-lg w-full h-full shadow-[-4px_4px_6px_0px_#0000001F] placeholder:text-[#6C6C6C] sm:text-base text-sm leading-[22px] font-semibold"
                    placeholder="Enter Phone Number"
                  />
                </div>
                <ErrorMessage name="phone_no" component="div" className="text-red-500 text-sm mt-1" />
              </div>

              {/* Status */}
              <div className="w-[calc((100%-20px)/2)]">
                <FormLabel htmlFor="status">Status</FormLabel>
                <div className="sm:h-16 h-14">
                  <FormSelection
                    label="Select Status"
                    name="status"
                    value={values.status}
                    onChange={(val) => setFieldValue("status", val)}
                    placeholder="Select Status"
                    options={[
                      { label: 'Active', value: 'active' },
                      { label: 'Inactive', value: 'inactive' }
                    ]}
                  />
                </div>
                <ErrorMessage name="status" component="div" className="text-red-500 text-sm mt-1" />
              </div>

              {/* Password */}
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
            </div>

            {/* Buttons */}
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
                disabled={isSubmitting}
              >
                {/* <span>{isSubmitting ? "Submitting..." : "Submit"}</span> */}
                <span>{isLoading ? (isEditMode ? "Updating..." : "Submitting...") : (isEditMode ? "Update" : "Submit")}</span>
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default AddDispatcherModal;