import { ErrorMessage, Field, Form, Formik } from "formik";
import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import * as Yup from "yup";
import Button from "../../../../../../components/ui/Button/Button";
import FormLabel from "../../../../../../components/ui/FormLabel";
import toast from "react-hot-toast";
import { apiResetPassword } from "../../../../../../services/AuthService";
import { SIGN_IN_PATH } from "../../../../../../constants/routes.path.constant/auth.route.path.constant";

const ResetPasswordForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);
  const email = useMemo(() => searchParams.get("email") || "", [searchParams]);
  const [loading, setLoading] = useState(false);

  const ResetPasswordValidationSchema = Yup.object().shape({
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
    password_confirmation: Yup.string()
      .oneOf([Yup.ref("password"), null], "Passwords must match")
      .required("Confirm password is required"),
  });

  const initialValues = {
    password: "",
    password_confirmation: "",
  };

  const handleResetPassword = async (values, { setSubmitting, resetForm }) => {
    if (!token || !email) {
      toast.error("Invalid reset link. Please request a new reset link.");
      setSubmitting(false);
      return;
    }

    setLoading(true);
    try {
      const response = await apiResetPassword({
        email,
        token,
        password: values.password,
        password_confirmation: values.password_confirmation,
      });

      if (response.status === 200 || response.data.success) {
        toast.success(response.data.message || "Password reset successful");
        resetForm();
        navigate(SIGN_IN_PATH);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to reset password. Please try again.";

      toast.error(errorMessage);
      console.error("Reset Password Error:", error);
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={ResetPasswordValidationSchema}
      onSubmit={handleResetPassword}
    >
      {({ isSubmitting }) => (
        <Form>
          <div className="flex flex-col gap-[15px]">
            <div>
              <FormLabel htmlFor="password" className="text-[#363636]">
                New Password
              </FormLabel>
              <div>
                <div>
                  <Field
                    name="password"
                    type="password"
                    className="border-[1.2px] border-[#E0E0E0] focus:outline-none h-[56px] rounded-lg p-4 text-[18px] font-semibold leading-6 w-full placeholder:text-[#9C9C9C]"
                    placeholder="Enter new password"
                    autoComplete="new-password"
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
              <FormLabel
                htmlFor="password_confirmation"
                className="text-[#363636]"
              >
                Confirm New Password
              </FormLabel>
              <div>
                <div>
                  <Field
                    name="password_confirmation"
                    type="password"
                    className="border-[1.2px] border-[#E0E0E0] focus:outline-none h-[56px] rounded-lg p-4 text-[18px] font-semibold leading-6 w-full placeholder:text-[#9C9C9C]"
                    placeholder="Confirm new password"
                    autoComplete="new-password"
                  />
                </div>
                <ErrorMessage
                  name="password_confirmation"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>
            </div>
          </div>
          <div className="pt-5">
            <Button
              btnType="submit"
              type="filled"
              className="py-4 w-full rounded-lg text-[18px] leading-6 capitalize"
              disabled={isSubmitting || loading}
            >
              <span>{loading ? "Resetting..." : "Reset Password"}</span>
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default ResetPasswordForm;
