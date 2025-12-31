import * as Yup from "yup";

export const getValidationSchema = (
  existingVehicleImageUrl,
  isEditMode,
  pricingTiers
) => {
  return Yup.object().shape({
    vehicle_type_name: Yup.string()
      .required("Vehicle type name is required")
      .trim(),
    
    vehicle_type_service: Yup.string()
      .required("Vehicle type service is required"),
    
    order_no: Yup.string()
      .required("Order number is required")
      .matches(/^[0-9]+$/, "Order number must be a valid number"),
    
    minimum_distance: Yup.string()
      .required("Minimum distance is required")
      .matches(/^[0-9.]+$/, "Must be a valid number"),
    
    backup_bid_vehicle_type: Yup.array()
      .min(1, "At least one backup bid vehicle type is required")
      .required("Backup bid vehicle type is required"),
    
    // Vehicle Image Validation - FIXED
    vehicle_image: Yup.mixed()
      .test(
        "required",
        "Vehicle image is required",
        function(value) {
          // If in edit mode and existing image exists, validation passes
          if (isEditMode && existingVehicleImageUrl) {
            return true;
          }
          // Otherwise, file must be selected
          return value && value instanceof File;
        }
      )
      .test(
        "fileSize",
        "File size must be less than 5MB",
        function(value) {
          // Skip file size check if no new file (edit mode with existing image)
          if (!value || !(value instanceof File)) {
            return true;
          }
          return value.size <= 5 * 1024 * 1024; // 5MB
        }
      )
      .test(
        "fileType",
        "Only image files are allowed (jpg, jpeg, png, gif)",
        function(value) {
          // Skip file type check if no new file (edit mode with existing image)
          if (!value || !(value instanceof File)) {
            return true;
          }
          return ["image/jpeg", "image/jpg", "image/png", "image/gif"].includes(
            value.type
          );
        }
      ),
    
    // Base Fare System Validation
    base_fare_system_status: Yup.string(),
    
    base_fare_less_than_x_miles: Yup.string().when(
      "base_fare_system_status",
      {
        is: (val) => val && val.toLowerCase() === "yes",
        then: (schema) =>
          schema
            .required("This field is required when base fare is enabled")
            .matches(/^[0-9.]+$/, "Must be a valid number"),
        otherwise: (schema) => schema.notRequired(),
      }
    ),
    
    base_fare_less_than_x_price: Yup.string().when(
      "base_fare_system_status",
      {
        is: (val) => val && val.toLowerCase() === "yes",
        then: (schema) =>
          schema
            .required("This field is required when base fare is enabled")
            .matches(/^[0-9.]+$/, "Must be a valid number"),
        otherwise: (schema) => schema.notRequired(),
      }
    ),
    
    base_fare_from_x_miles: Yup.string().when("base_fare_system_status", {
      is: (val) => val && val.toLowerCase() === "yes",
      then: (schema) =>
        schema
          .required("This field is required when base fare is enabled")
          .matches(/^[0-9.]+$/, "Must be a valid number"),
      otherwise: (schema) => schema.notRequired(),
    }),
    
    base_fare_to_x_miles: Yup.string().when("base_fare_system_status", {
      is: (val) => val && val.toLowerCase() === "yes",
      then: (schema) =>
        schema
          .required("This field is required when base fare is enabled")
          .matches(/^[0-9.]+$/, "Must be a valid number"),
      otherwise: (schema) => schema.notRequired(),
    }),
    
    base_fare_from_to_price: Yup.string().when("base_fare_system_status", {
      is: (val) => val && val.toLowerCase() === "yes",
      then: (schema) =>
        schema
          .required("This field is required when base fare is enabled")
          .matches(/^[0-9.]+$/, "Must be a valid number"),
      otherwise: (schema) => schema.notRequired(),
    }),
    
    base_fare_greater_than_x_miles: Yup.string().when(
      "base_fare_system_status",
      {
        is: (val) => val && val.toLowerCase() === "yes",
        then: (schema) =>
          schema
            .required("This field is required when base fare is enabled")
            .matches(/^[0-9.]+$/, "Must be a valid number"),
        otherwise: (schema) => schema.notRequired(),
      }
    ),
    
    base_fare_greater_than_x_price: Yup.string().when(
      "base_fare_system_status",
      {
        is: (val) => val && val.toLowerCase() === "yes",
        then: (schema) =>
          schema
            .required("This field is required when base fare is enabled")
            .matches(/^[0-9.]+$/, "Must be a valid number"),
        otherwise: (schema) => schema.notRequired(),
      }
    ),
    
    // Mileage System Validation
    mileage_system: Yup.string().required("Mileage system is required"),
    
    first_mile_km: Yup.string().when("mileage_system", {
      is: "fixed",
      then: (schema) =>
        schema
          .required("First mile/km price is required for fixed pricing")
          .matches(/^[0-9.]+$/, "Must be a valid number"),
      otherwise: (schema) => schema.notRequired(),
    }),
    
    second_mile_km: Yup.string().when("mileage_system", {
      is: "fixed",
      then: (schema) =>
        schema
          .required("Second mile/km price is required for fixed pricing")
          .matches(/^[0-9.]+$/, "Must be a valid number"),
      otherwise: (schema) => schema.notRequired(),
    }),
    
    // Pricing Tiers Validation (for variable pricing)
    pricing_tiers: Yup.array().when("mileage_system", {
      is: "variable",
      then: (schema) =>
        schema
          .of(
            Yup.object().shape({
              from: Yup.string()
                .required("From value is required")
                .matches(/^[0-9.]+$/, "Must be a valid number"),
              to: Yup.string()
                .required("To value is required")
                .matches(/^[0-9.]+$/, "Must be a valid number"),
              price: Yup.string()
                .required("Price is required")
                .matches(/^[0-9.]+$/, "Must be a valid number"),
            })
          )
          .min(1, "At least one pricing tier is required for variable pricing"),
      otherwise: (schema) => schema.notRequired(),
    }),
  });
};