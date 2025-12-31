import * as Yup from "yup";

export const SUB_COMPANY_VALIDATION_SCHEMA = Yup.object().shape({
    name: Yup.string()
        .required("Sub company name is required")
        .min(2, "Name must be at least 2 characters"),
    email: Yup.string()
        .email("Invalid email format")
        .required("Email is required"),
});