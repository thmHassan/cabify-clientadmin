import * as Yup from "yup";

export const PACKAGE_VALIDATION_SCHEMA = Yup.object().shape({
    packageName: Yup.string().required("package name is required"),
    packageType: Yup.string().required("package type is required"),
    packageDuration: Yup.string().required("package duration is required"),
    packagePrice: Yup.string().required("package price is required"),
});
