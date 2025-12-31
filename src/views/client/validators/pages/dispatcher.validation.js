import * as Yup from "yup";

export const DISPATCHER_VALIDATION_SCHEMA = Yup.object().shape({
  name: Yup.string()
    .required("Name is required")
    .min(2, "Name must be at least 2 characters"),

  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),

  phone_no: Yup.string()
    .required("Phone number is required"),

  status: Yup.string()
    .required("Status is required"),

  password: Yup.string()
    .when("isEditMode", {
      is: false,
      then: (schema) =>
        schema.required("Password is required").min(6, "Password must be at least 6 characters"),
      otherwise: (schema) => schema.notRequired(),
    }),
});
