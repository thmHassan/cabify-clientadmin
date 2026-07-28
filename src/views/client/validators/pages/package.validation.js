import * as Yup from "yup";

export const PACKAGE_VALIDATION_SCHEMA = Yup.object().shape({
    packageName: Yup.string().required("package name is required"),
    packageType: Yup.string().required("package type is required"),
    packageDuration: Yup.string().required("package duration is required"),
    packagePrice: Yup.number().typeError("package price must be a number").min(0).required("package price is required"),
    commissionType: Yup.string().oneOf(["percentage", "fixed"]).required("commission type is required"),
    commissionValue: Yup.number()
        .typeError("commission value must be a number")
        .min(0, "commission value cannot be negative")
        .when("commissionType", {
            is: "percentage",
            then: (schema) => schema.max(100, "percentage cannot exceed 100"),
        })
        .required("commission value is required"),
});
export const RIDE_COUNT_VALIDATION_SCHEMA = Yup.object().shape({
    package_ride_count: Yup.number().required("Ride count is required").positive().integer(),
    package_amount: Yup.number().required("Amount is required").positive(),
});
