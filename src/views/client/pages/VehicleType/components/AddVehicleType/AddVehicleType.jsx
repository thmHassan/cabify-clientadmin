import CardContainer from "../../../../../../components/shared/CardContainer";
import PageTitle from "../../../../../../components/ui/PageTitle/PageTitle";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback, useMemo } from "react";
import { unlockBodyScroll } from "../../../../../../utils/functions/common.function";
import {
  apiGetVehicleTypeById,
  apiCreateVehicleType,
  apiEditVehicleType,
  apiGetVehicleTypes,
  apiGetAllVehicleType,
} from "../../../../../../services/VehicleTypeServices";
import { VEHICLE_TYPE_PATH } from "../../../../../../constants/routes.path.constant/client.route.path.constant";
import { Form, Formik } from "formik";
import { getTenantData } from "../../../../../../utils/functions/tokenEncryption";
import ActionButtons from "./ActionButtons";
import BasicDetails from "./BasicDetails";
import BaseFareSection from "./BaseFareSection";
import MileageSystemSection from "./MileageSystemSection";
import AttributesSection from "./AttributesSection";
import { getValidationSchema } from "../../../../validators/pages/vehicle.validation";
import toast from 'react-hot-toast';
import AppLogoLoader from "../../../../../../components/shared/AppLogoLoader";

const AddVehicleType = () => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [vehicleImage, setVehicleImage] = useState(null);
  const [existingVehicleImageUrl, setExistingVehicleImageUrl] = useState(null);
  const [backupBidTypes, setBackupBidTypes] = useState([]);
  const [availableVehicleTypes, setAvailableVehicleTypes] = useState([]);
  const [allVehicleType, setAllVehicleType] = useState([]);
  const [pricingTiers, setPricingTiers] = useState([
    { from: "", to: "", price: "" },
  ]);
  const [attributes, setAttributes] = useState({});
  const [attributesEnabled, setAttributesEnabled] = useState(true);
  const [distanceUnit, setDistanceUnit] = useState("Miles");

  const [formData, setFormData] = useState({
    vehicle_type_name: "",
    vehicle_type_service: "",
    minimum_price: "",
    minimum_distance: "",
    base_fare_less_than_x_miles: "",
    base_fare_less_than_x_price: "",
    base_fare_from_x_miles: "",
    base_fare_to_x_miles: "",
    base_fare_from_to_price: "",
    base_fare_greater_than_x_miles: "",
    base_fare_greater_than_x_price: "",
    first_mile_km: "",
    second_mile_km: "",
    base_fare_system_status: "no",
    mileage_system: "fixed",
    order_no: "",
    backup_bid_vehicle_type: [],
    pricing_tiers: [{ from: "", to: "", price: "" }],
    vehicle_image: null,
  });

  useEffect(() => {
    const tenant = getTenantData();
    if (tenant?.units) {
      const unit = tenant.units.toLowerCase() === "km" ? "Km" : "Miles";
      setDistanceUnit(unit);
    }
  }, []);

  useEffect(() => {
    const fetchAllVehicleType = async () => {
      try {
        const response = await apiGetAllVehicleType();
        if (response?.data?.success === 1) {
          const vehicleTypes = Array.isArray(response?.data?.list)
            ? response.data.list
            : response?.data?.list?.data || [];
          setAllVehicleType(vehicleTypes);
        }
      } catch (error) {
        console.error("Error fetching vehicle types:", error);
      }
    };
    fetchAllVehicleType();
  }, []);

  useEffect(() => {
    loadAvailableVehicleTypes();
    if (id) {
      loadVehicleTypeData();
      setIsEditMode(true);
    } else {
      setIsEditMode(false);
    }
  }, [id]);

  const loadAvailableVehicleTypes = useCallback(async () => {
    try {
      const response = await apiGetVehicleTypes({ page: 1, perPage: 100 });
      if (response?.data?.success === 1) {
        const vehicleTypes = response?.data?.list?.data || [];
        setAvailableVehicleTypes(vehicleTypes);
      }
    } catch (error) {
      console.error("Error loading vehicle types:", error);
    }
  }, []);

  const loadVehicleTypeData = useCallback(async () => {
    setIsLoading(true);
    setSubmitError(null);

    try {
      const result = await apiGetVehicleTypeById({ id });
      let vehicleData = null;

      if (result?.status === 200) {
        if (
          result?.data?.vehicleType &&
          typeof result.data.vehicleType === "object"
        ) {
          vehicleData = result.data.vehicleType;
        } else if (result?.data?.data && typeof result.data.data === "object") {
          vehicleData = result.data.data;
        } else if (result?.data?.success === 1 && result?.data?.data) {
          vehicleData = result.data.data;
        } else if (result?.data?.success === 1) {
          const { success, message, vehicleType, ...rest } = result.data;
          vehicleData = vehicleType || rest;
        } else if (
          result?.data &&
          typeof result.data === "object" &&
          (result.data.vehicle_type_name || result.data.vehicleType)
        ) {
          vehicleData = result.data.vehicleType || result.data;
        }
      }

      if (vehicleData) {
        setFormData({
          vehicle_type_name: vehicleData.vehicle_type_name || "",
          vehicle_type_service: vehicleData.vehicle_type_service || "",
          minimum_price: vehicleData.minimum_price || "",
          minimum_distance: vehicleData.minimum_distance || "",
          base_fare_less_than_x_miles:
            vehicleData.base_fare_less_than_x_miles || "",
          base_fare_less_than_x_price:
            vehicleData.base_fare_less_than_x_price || "",
          base_fare_from_x_miles: vehicleData.base_fare_from_x_miles || "",
          base_fare_to_x_miles: vehicleData.base_fare_to_x_miles || "",
          base_fare_from_to_price: vehicleData.base_fare_from_to_price || "",
          base_fare_greater_than_x_miles:
            vehicleData.base_fare_greater_than_x_miles || "",
          base_fare_greater_than_x_price:
            vehicleData.base_fare_greater_than_x_price || "",
          first_mile_km: vehicleData.first_mile_km || "",
          second_mile_km: vehicleData.second_mile_km || "",
          base_fare_system_status: vehicleData.base_fare_system_status || "no",
          mileage_system: vehicleData.mileage_system || "fixed",
          order_no: vehicleData.order_no || "",
          backup_bid_vehicle_type: vehicleData.backup_bid_vehicle_type || [],
          pricing_tiers: [{ from: "", to: "", price: "" }],
          vehicle_image: vehicleData.vehicle_image || "",
        });

        if (vehicleData.backup_bid_vehicle_type) {
          const backupTypes = Array.isArray(vehicleData.backup_bid_vehicle_type)
            ? vehicleData.backup_bid_vehicle_type.map((id) => id?.toString())
            : [];
          setBackupBidTypes(backupTypes);
          setFormData((prev) => ({
            ...prev,
            backup_bid_vehicle_type: backupTypes,
          }));
        }

        if (vehicleData.attributes) {
          setAttributes(vehicleData.attributes);
        }

        if (vehicleData.vehicle_image) {
          setExistingVehicleImageUrl(vehicleData.vehicle_image);
        }

        if (
          vehicleData.from_array &&
          vehicleData.to_array &&
          vehicleData.price_array
        ) {
          const tiers = [];
          const maxLength = Math.max(
            vehicleData.from_array.length || 0,
            vehicleData.to_array.length || 0,
            vehicleData.price_array.length || 0
          );
          for (let i = 0; i < maxLength; i++) {
            tiers.push({
              from: vehicleData.from_array[i] || "",
              to: vehicleData.to_array[i] || "",
              price: vehicleData.price_array[i] || "",
            });
          }
          if (tiers.length > 0) {
            setPricingTiers(tiers);
            setFormData((prev) => ({ ...prev, pricing_tiers: tiers }));
          }
        }
      } else {
        const errorMsg =
          result?.data?.message ||
          (result?.status !== 200
            ? `API returned status ${result?.status}`
            : null) ||
          "Failed to load vehicle type data.";
        setSubmitError(errorMsg);
      }
    } catch (error) {
      console.error("Error loading vehicle type:", error);
      setSubmitError(
        error?.response?.data?.message ||
        error?.message ||
        "Error loading vehicle type data"
      );
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  const validationSchema = useMemo(() => {
    return getValidationSchema(
      existingVehicleImageUrl,
      isEditMode,
      pricingTiers
    );
  }, [existingVehicleImageUrl, isEditMode, pricingTiers]);

  const handleBackupBidTypeChange = (selectedValues) => {
    setBackupBidTypes(selectedValues || []);
  };

  const handleSave = async (values) => {
    setIsSaving(true);
    setSubmitError(null);
    setSuccessMessage(null);

    try {
      const vehicleFormData = new FormData();

      if (isEditMode && id) {
        vehicleFormData.append("id", id);
      }

      vehicleFormData.append("vehicle_type_name", values.vehicle_type_name || "");
      vehicleFormData.append("vehicle_type_service", values.vehicle_type_service || "");
      vehicleFormData.append("minimum_price", values.minimum_price || "");
      vehicleFormData.append("minimum_distance", values.minimum_distance || "");
      vehicleFormData.append("order_no", values.order_no || "");

      const isBaseFareOn = (values.base_fare_system_status || "").toLowerCase() === "yes";
      vehicleFormData.append("base_fare_system_status", values.base_fare_system_status || "no");

      if (isBaseFareOn) {
        vehicleFormData.append("base_fare_less_than_x_miles", values.base_fare_less_than_x_miles || "");
        vehicleFormData.append("base_fare_less_than_x_price", values.base_fare_less_than_x_price || "");
        vehicleFormData.append("base_fare_from_x_miles", values.base_fare_from_x_miles || "");
        vehicleFormData.append("base_fare_to_x_miles", values.base_fare_to_x_miles || "");
        vehicleFormData.append("base_fare_from_to_price", values.base_fare_from_to_price || "");
        vehicleFormData.append("base_fare_greater_than_x_miles", values.base_fare_greater_than_x_miles || "");
        vehicleFormData.append("base_fare_greater_than_x_price", values.base_fare_greater_than_x_price || "");
      } else {
        vehicleFormData.append("base_fare_less_than_x_miles", "0");
        vehicleFormData.append("base_fare_less_than_x_price", "0");
        vehicleFormData.append("base_fare_from_x_miles", "0");
        vehicleFormData.append("base_fare_to_x_miles", "0");
        vehicleFormData.append("base_fare_from_to_price", "0");
        vehicleFormData.append("base_fare_greater_than_x_miles", "0");
        vehicleFormData.append("base_fare_greater_than_x_price", "0");
      }

      vehicleFormData.append("mileage_system", values.mileage_system || "fixed");

      if (values.mileage_system === "fixed") {
        vehicleFormData.append("first_mile_km", values.first_mile_km || "");
        vehicleFormData.append("second_mile_km", values.second_mile_km || "");
      } else {
        vehicleFormData.append("first_mile_km", "");
        vehicleFormData.append("second_mile_km", "");

        const tiersToSend = values.pricing_tiers || pricingTiers;
        if (Array.isArray(tiersToSend)) {
          tiersToSend.forEach((tier) => {
            if (tier.from) vehicleFormData.append("from_array[]", tier.from);
            if (tier.to) vehicleFormData.append("to_array[]", tier.to);
            if (tier.price) vehicleFormData.append("price_array[]", tier.price);
          });
        }
      }

      const selectedBackup = values.backup_bid_vehicle_type || backupBidTypes;
      if (Array.isArray(selectedBackup) && selectedBackup.length > 0) {
        selectedBackup.forEach((type) => {
          vehicleFormData.append("backup_bid_vehicle_type[]", type);
        });
      }

      const imageToSend = values.vehicle_image || vehicleImage;
      if (imageToSend && imageToSend instanceof File) {
        vehicleFormData.append("vehicle_image", imageToSend);
        console.log("Sending new image file");
      } else if (isEditMode && existingVehicleImageUrl) {
        vehicleFormData.append("existing_vehicle_image", existingVehicleImageUrl);
        console.log("Sending existing image URL:", existingVehicleImageUrl);
      }
      if (Object.keys(attributes).length > 0) {
        Object.keys(attributes).forEach((key) => {
          vehicleFormData.append(
            `attribute_array[${key}]`,
            attributesEnabled ? attributes[key] : ""
          );
        });
      }

      console.log(`${isEditMode ? "Edit" : "Create"} Mode - FormData:`);
      for (let pair of vehicleFormData.entries()) {
        console.log(pair[0] + ":", pair[1]);
      }

      const response = isEditMode
        ? await apiEditVehicleType(vehicleFormData)
        : await apiCreateVehicleType(vehicleFormData);

      console.log("API Response:", response);

      if (response?.data?.success === 1 || response?.status === 200) {
        toast.success(
          `Vehicle type ${isEditMode ? "updated" : "created"} successfully`
        );

        setTimeout(() => {
          navigate(VEHICLE_TYPE_PATH);
        }, 1200);
      } else {
        setSubmitError(
          response?.data?.message ||
          response?.data?.error ||
          `Failed to ${isEditMode ? "update" : "create"} vehicle type`
        );
      }
    } catch (error) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.message ||
        `Error ${isEditMode ? "updating" : "creating"} vehicle type`;

      toast.error(errorMsg);
      setSubmitError(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    unlockBodyScroll();
    navigate(VEHICLE_TYPE_PATH);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <AppLogoLoader />
      </div>
    );
  }

  return (
    <Formik
      initialValues={formData}
      enableReinitialize
      validationSchema={validationSchema}
      onSubmit={handleSave}
    >
      {({ values, setFieldValue, errors, touched }) => (
        <Form>
          <div>
            <div className="px-4 py-5 sm:p-6 lg:p-10 min-h-[calc(100vh-85px)]">
              <div className="flex justify-between sm:flex-row flex-col items-start sm:items-center gap-3 sm:gap-0">
                <div className="sm:mb-[30px] mb-1 sm:w-[calc(100%-240px)] w-full flex gap-5 items-center">
                  <div className="flex flex-col gap-2.5 w-[calc(100%-100px)]">
                    <PageTitle
                      title={
                        isEditMode ? "Edit Vehicle Type" : "Add Vehicle Type"
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Global Error/Success Messages */}
              {submitError && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  <strong>Error:</strong> {submitError}
                </div>
              )}

              {successMessage && (
                <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                  {successMessage}
                </div>
              )}

              {/* Basic Details Section */}
              <div>
                <CardContainer className="p-3 sm:p-4 lg:p-5 bg-[#F5F5F5]">
                  <div className="w-full">
                    <div className="max-w-6xl mx-auto">
                      <BasicDetails
                        values={values}
                        setFieldValue={setFieldValue}
                        errors={errors}
                        touched={touched}
                        distanceUnit={distanceUnit}
                        backupBidTypes={backupBidTypes}
                        handleBackupBidTypeChange={handleBackupBidTypeChange}
                        allVehicleType={allVehicleType}
                        vehicleImage={vehicleImage}
                        setVehicleImage={setVehicleImage}
                        existingVehicleImageUrl={existingVehicleImageUrl}
                        setExistingVehicleImageUrl={setExistingVehicleImageUrl}
                      />
                    </div>
                  </div>
                </CardContainer>
              </div>

              {/* Base Fare Section */}
              <div>
                <CardContainer className="p-3 sm:p-4 lg:p-5 bg-[#F5F5F5] mt-5">
                  <BaseFareSection
                    values={values}
                    setFieldValue={setFieldValue}
                    distanceUnit={distanceUnit}
                  />
                </CardContainer>
              </div>

              {/* Mileage System Section */}
              <div>
                <CardContainer className="p-3 sm:p-4 lg:p-5 bg-[#F5F5F5] mt-5">
                  <MileageSystemSection
                    values={values}
                    setFieldValue={setFieldValue}
                    errors={errors}
                    distanceUnit={distanceUnit}
                    pricingTiers={pricingTiers}
                    setPricingTiers={setPricingTiers}
                  />
                </CardContainer>
              </div>

              {/* Attributes Section */}
              <div className="my-10">
                <CardContainer className="p-3 sm:p-4 lg:p-5 bg-[#F5F5F5]">
                  <AttributesSection
                    attributes={attributes}
                    setAttributes={setAttributes}
                    attributesEnabled={attributesEnabled}
                  />
                </CardContainer>
              </div>

              {/* Final Action Buttons */}
              <div className="flex justify-end">
                <ActionButtons
                  handleCancel={handleCancel}
                  isSaving={isSaving}
                  isLoading={isLoading}
                  isEditMode={isEditMode}
                />
              </div>
            </div>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default AddVehicleType;