import * as Yup from "yup";

export const PACKAGE_VALIDATION_SCHEMA = Yup.object().shape({
    packageName: Yup.string().required("package name is required"),
    packageType: Yup.string().required("package type is required"),
    packageDuration: Yup.string().required("package duration is required"),
    packagePrice: Yup.string().required("package price is required"),
});
export const RIDE_COUNT_VALIDATION_SCHEMA = Yup.object().shape({
    package_ride_count: Yup.number().required("Ride count is required").positive().integer(),
    package_amount: Yup.number().required("Amount is required").positive(),
});
