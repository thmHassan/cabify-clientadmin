import { ErrorMessage, Field, Form, Formik } from "formik";
import React from "react";
import * as Yup from "yup";
import Button from "../../../../../../components/ui/Button/Button";
import FormLabel from "../../../../../../components/ui/FormLabel";
import { apiResetPassword } from "../../../../../../services/AuthService";
import toast from "react-hot-toast";

const searchParams = new URLSearchParams(window.location.search);
const tokenFromQuery = searchParams.get("token") || "";
const emailFromQuery = searchParams.get("email") || "";

const RESET_PASSWORD_VALIDATION_SCHEMA = Yup.object().shape({
  email: Yup.string().email("Invalid email format").required("Email is required"),
  token: Yup.string().required("Reset token is required"),
  password: Yup.string().required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords do not match")
    .required("Confirm password is required"),
});

const ResetPasswordForm = () => {
  return (
    <Formik
      initialValues={{
        email: emailFromQuery,
        token: tokenFromQuery,
        password: "",
        confirmPassword: "",
      }}
      validationSchema={RESET_PASSWORD_VALIDATION_SCHEMA}
      onSubmit={async (values, { setSubmitting, resetForm }) => {
        try {
          const response = await apiResetPassword({
            email: values.email,
            token: values.token,
            password: values.password,
            confirmPassword: values.confirmPassword,
            password_confirmation: values.confirmPassword,
          });

          if (response.status === 200 || response.data?.success) {
            toast.success(response.data?.message || "Password reset successfully");
            resetForm({
              values: {
                email: values.email,
                token: values.token,
                password: "",
                confirmPassword: "",
              },
            });
          }
        } catch (error) {
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            "Failed to reset password";
          toast.error(errorMessage);
          console.error("Reset Password Error:", error);
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({ isSubmitting }) => (
        <Form>
          <div className="flex flex-col gap-[15px]">
            <div>
              <FormLabel htmlFor="Email" className="text-[#363636]">
                New Password
              </FormLabel>
              <div>
                <div>
                  <Field
                    name="password"
                    type="password"
                    className="border-[1.2px] border-[#E0E0E0] focus:outline-none h-[56px] rounded-lg p-4 text-[18px] font-semibold leading-6 w-full placeholder:text-[#9C9C9C]"
                    placeholder="Enter new password"
                    autoComplete="off"
                  />
                </div>
                <ErrorMessage
                  name="password"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>
            </div>
            <div>
              <FormLabel htmlFor="Email" className="text-[#363636]">
                Confirm New Password
              </FormLabel>
              <div>
                <div>
                  <Field
                    name="confirmPassword"
                    type="password"
                    className="border-[1.2px] border-[#E0E0E0] focus:outline-none h-[56px] rounded-lg p-4 text-[18px] font-semibold leading-6 w-full placeholder:text-[#9C9C9C]"
                    placeholder="Confirm new password"
                    autoComplete="off"
                  />
                </div>
                <ErrorMessage
                  name="confirmPassword"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>
            </div>
            <div>
              <Field name="email" type="hidden" />
              <Field name="token" type="hidden" />
            </div>
          </div>
          <div className="pt-5">
            <Button
              btnType="submit"
              disabled={isSubmitting}
              type="filled"
              className="py-4 w-full rounded-lg text-[18px] leading-6 capitalize"
            >
              <span>{isSubmitting ? "resetting..." : "reset password"}</span>
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default ResetPasswordForm;
