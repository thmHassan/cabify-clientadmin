import * as Yup from "yup";

export const DRIVER_VALIDATION_SCHEMA = Yup.object().shape({
  name: Yup.string().required("Name is required").min(2, "Name must be at least 2 characters"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  phone_no: Yup.string().required("Phone number is required"),
  password: Yup.string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
  profile_image: Yup.mixed().required("Profile photo is required"),
  gender: Yup.string().required("Gender is required"),
  date_of_birth: Yup.date()
    .required("Date of birth is required")
    .max(new Date(new Date().setFullYear(new Date().getFullYear() - 18)), "Driver must be at least 18 years old"),
  address: Yup.string().required("Address is required"),
  city: Yup.string().required("City is required"),
  country: Yup.string().required("Country is required"),
  driver_license: Yup.string().required("Driver license  is required"),
  assigned_vehicle: Yup.string().required("Vehicle type is required"),
  color: Yup.string().required("Vehicle color is required"),
  seats: Yup.string().required("Seats are required"),
  plate_no: Yup.string().required("Plate number is required"),
  vehicle_registration_date: Yup.string().required("Vehicle registration date is required"),
  joined_date: Yup.string().required("Joined Date is required"),
  // sub_company: Yup.string().required("Sub Company is required"),
});

export const DRIVER_EDIT_VALIDATION_SCHEMA = Yup.object().shape({
  name: Yup.string().required("Name is required").min(2, "Name must be at least 2 characters"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  phone_no: Yup.string().required("Phone number is required"),
  password: Yup.string()
    .transform((value) => value || "")
    .test(
      "min-length",
      "Password must be at least 6 characters",
      (value) => !value || value.length >= 6
    ),
  address: Yup.string().required("Address is required"),
  driver_license: Yup.string().required("Driver license  is required"),
  assigned_vehicle: Yup.string().required("Vehicle type is required"),
  joined_date: Yup.string().required("Joined Date is required"),
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
