import * as Yup from "yup";

export const PLOT_VALIDATION_SCHEMA = Yup.object().shape({
    name: Yup.string()
        .required("Plot name is required")
        .min(2, "Plot name must be at least 2 characters"),
    coordinates: Yup.array()
        .of(Yup.array().of(Yup.number()))
        .min(3, "At least 3 coordinates are required to create a polygon")
        .required("Coordinates are required"),
});