import * as Yup from "yup";

export const USER_VALIDATION_SCHEMA = Yup.object().shape({
    name: Yup.string().required("Name is required").min(2, "Name must be at least 2 characters"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    phoneNumber: Yup.string().required("Phone number is required"),
    password: Yup.string().required("Password is required").min(6, "Password must be at least 6 characters"),
    address: Yup.string().required("Address is required"),
    city: Yup.string().required("City is required"),
});