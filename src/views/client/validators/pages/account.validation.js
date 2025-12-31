import * as Yup from "yup";

export const ACCOUNT_VALIDATION_SCHEMA = Yup.object().shape({
    name: Yup.string().required("Name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    phone_no: Yup.string().required("Phone number is required"),
    address: Yup.string().required("Address is required"),
    notes: Yup.string().required("Notes is required"),
});
