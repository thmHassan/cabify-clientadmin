import * as Yup from "yup";

export const DRIVER_VALIDATION_SCHEMA = Yup.object().shape({
  name: Yup.string().required("Name is required").min(2, "Name must be at least 2 characters"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  phone_no: Yup.string().required("Phone number is required"),
  password: Yup.string().when("id", {
    is: (id) => !id,
    then: (schema) => schema.required("Password is required").min(6, "Password must be at least 6 characters"),
    otherwise: (schema) => schema.min(6, "Password must be at least 6 characters"),
  }),
  address: Yup.string().required("Address is required"),
  driver_license: Yup.string().required("Driver license  is required"),
  assigned_vehicle: Yup.string().required("assigned vehicle is required"),
  joined_date: Yup.string().required("Joined Date is required"),
  sub_company: Yup.string().required("Sub Company is required"),
});

export const WALLET_BALANCE_VALIDATION_SCHEMA = Yup.object().shape({
    amount: Yup.number()
        .required("Amount is required")
        .positive("Amount must be greater than 0")
        .typeError("Amount must be a valid number"),
});

 export const REJECT_VALIDATION_SCHEMA = Yup.object({
  reason: Yup.string().required("Reason is required"),
  description: Yup.string().required("Description is required"),
});