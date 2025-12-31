import { ErrorMessage, Field, Form, Formik } from "formik";
import React, { useState } from "react";
import * as Yup from "yup";

import FormLabel from "../../../../../../../../components/ui/FormLabel";
import Button from "../../../../../../../../components/ui/Button/Button";
import { apieditDriverStatus } from "../../../../../../../../services/DriverManagementService";
import { unlockBodyScroll } from "../../../../../../../../utils/functions/common.function";
import toast from "react-hot-toast";
import { REJECT_VALIDATION_SCHEMA } from "../../../../../../validators/pages/driverManagement.validation";


const RejectModel = ({ driverId, setIsOpen, onRejected }) => {
  const [submitError, setSubmitError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (values) => {
    setIsLoading(true);
    setSubmitError(null);

    try {
      const params = {
        id: driverId,
        status: "rejected",
        reason: values.reason,
        description: values.description,
      };

      const response = await apieditDriverStatus(params);

      if (response?.data?.success === 1 || response?.status === 200) {
        toast.success("Driver rejected successfully");

        unlockBodyScroll();
        setIsOpen(false);
        onRejected?.();
      } else {
        toast.error(
          response?.data?.message || "Failed to reject driver"
        );
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Something went wrong"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Formik
      initialValues={{ reason: "", description: "" }}
      validationSchema={REJECT_VALIDATION_SCHEMA}
      onSubmit={handleSubmit}
    >
      <div className="w-96">
        <Form>
          <h2 className="text-xl font-semibold mb-5 text-center">
            Reject Driver
          </h2>


          {/* Reason */}
          <div className="mb-4">
            <FormLabel>Reason</FormLabel>
            <Field
              name="reason"
              className="w-full border border-[#8D8D8D] rounded-lg px-4 py-3 shadow-[-4px_4px_6px_0px_#0000001F]"
              placeholder="Enter reason"
            />
            <ErrorMessage
              name="reason"
              component="div"
              className="text-red-500 text-sm"
            />
          </div>

          {/* Description */}
          <div className="mb-6">
            <FormLabel>Description</FormLabel>
            <Field
              as="textarea"
              name="description"
              rows={4}
              className="w-full border border-[#8D8D8D] rounded-lg px-4 py-3 shadow-[-4px_4px_6px_0px_#0000001F]"
              placeholder="Write description"
            />
            <ErrorMessage
              name="description"
              component="div"
              className="text-red-500 text-sm"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3">
            {/* 🔥 IMPORTANT FIX */}
            <Button
              type="button"
              btnSize="md"
              className="!px-10 border border-[#1F41BB] text-[#1F41BB]"
              onClick={() => {
                unlockBodyScroll();
                setIsOpen(false);
              }}
            >
              Cancel
            </Button>

            <Button
              btnType="submit"
              btnSize="md"
              type="filledRed"
              disabled={isLoading}
            >
              {isLoading ? "Rejecting..." : "Yes, Reject"}
            </Button>
          </div>
        </Form>
      </div>
    </Formik>
  );
};

export default RejectModel;
