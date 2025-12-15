import CardContainer from "../../../../../../components/shared/CardContainer";
import PageTitle from "../../../../../../components/ui/PageTitle/PageTitle";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback, useMemo } from "react";
import Button from "../../../../../../components/ui/Button/Button";
import { unlockBodyScroll } from "../../../../../../utils/functions/common.function";
import { apiGetVehicleTypeById, apiCreateVehicleType, apiEditVehicleType, apiGetVehicleTypes, apiGetAllVehicleType } from "../../../../../../services/VehicleTypeServices";
import { VEHICLE_TYPE_PATH } from "../../../../../../constants/routes.path.constant/client.route.path.constant";
import FormLabel from "../../../../../../components/ui/FormLabel/FormLabel";
import FormSelection from "../../../../../../components/ui/FormSelection/FormSelection";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from "yup";

const AddVehicleType = () => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
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
  const [pricingTiers, setPricingTiers] = useState([{ from: "", to: "", price: "" }]);
  const [attributes, setAttributes] = useState({
  });
  const [attributesEnabled, setAttributesEnabled] = useState(true);
  const [isAttributeModalOpen, setIsAttributeModalOpen] = useState(false);
  const [newAttributeName, setNewAttributeName] = useState("");

  useEffect(() => {
    const fetchAllVehicleType = async () => {
      try {
        const response = await apiGetAllVehicleType();
        if (response?.data?.success === 1) {
          const vehicleTypes = Array.isArray(response?.data?.list)
            ? response.data.list
            : response?.data?.list?.data || [];

          if (vehicleTypes.length > 0) {
            console.log("First vehicle type:", vehicleTypes[0]);
          }

          setAllVehicleType(vehicleTypes);
        } else {
          console.warn("API response success is not 1:", response?.data);
        }
      } catch (error) {
        console.error("Error fetching vehicle types:", error);
        console.error("Error details:", error?.response?.data);
      }
    };
    fetchAllVehicleType();
  }, []);

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
    base_fare_system_status: "yes",
    mileage_system: "fixed",
    order_no: "",
    backup_bid_vehicle_type: [],
    pricing_tiers: [{ from: "", to: "", price: "" }],
    vehicle_image: null,
  });

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
        if (result?.data?.vehicleType && typeof result.data.vehicleType === 'object') {
          vehicleData = result.data.vehicleType;
        }
        else if (result?.data?.data && typeof result.data.data === 'object') {
          vehicleData = result.data.data;
        }
        else if (result?.data?.success === 1 && result?.data?.data) {
          vehicleData = result.data.data;
        }
        else if (result?.data?.success === 1) {
          const { success, message, vehicleType, ...rest } = result.data;
          vehicleData = vehicleType || rest;
        }
        else if (result?.data && typeof result.data === 'object' && (result.data.vehicle_type_name || result.data.vehicleType)) {
          vehicleData = result.data.vehicleType || result.data;
        }
      }

      if (vehicleData) {
        setFormData({
          vehicle_type_name: vehicleData.vehicle_type_name || "",
          vehicle_type_service: vehicleData.vehicle_type_service || "",
          minimum_price: vehicleData.minimum_price || "",
          minimum_distance: vehicleData.minimum_distance || "",
          base_fare_less_than_x_miles: vehicleData.base_fare_less_than_x_miles || "",
          base_fare_less_than_x_price: vehicleData.base_fare_less_than_x_price || "",
          base_fare_from_x_miles: vehicleData.base_fare_from_x_miles || "",
          base_fare_to_x_miles: vehicleData.base_fare_to_x_miles || "",
          base_fare_from_to_price: vehicleData.base_fare_from_to_price || "",
          base_fare_greater_than_x_miles: vehicleData.base_fare_greater_than_x_miles || "",
          base_fare_greater_than_x_price: vehicleData.base_fare_greater_than_x_price || "",
          first_mile_km: vehicleData.first_mile_km || "",
          second_mile_km: vehicleData.second_mile_km || "",
          base_fare_system_status: vehicleData.base_fare_system_status || "yes",
          mileage_system: vehicleData.mileage_system || "fixed",
          order_no: vehicleData.order_no || "",
          backup_bid_vehicle_type: vehicleData.backup_bid_vehicle_type || [],
          pricing_tiers: [{ from: "", to: "", price: "" }],
          vehicle_image: null,
        });
        if (vehicleData.backup_bid_vehicle_type) {
          const backupTypes = Array.isArray(vehicleData.backup_bid_vehicle_type)
            ? vehicleData.backup_bid_vehicle_type.map(id => id?.toString())
            : [];
          setBackupBidTypes(backupTypes);
          setFormData(prev => ({ ...prev, backup_bid_vehicle_type: backupTypes }));
        }
        if (vehicleData.attributes) {
          setAttributes(vehicleData.attributes);
        }
        if (vehicleData.vehicle_image) {
          setExistingVehicleImageUrl(vehicleData.vehicle_image);
        }
        if (vehicleData.from_array && vehicleData.to_array && vehicleData.price_array) {
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
            setFormData(prev => ({ ...prev, pricing_tiers: tiers }));
          }
        }
      } else {
        const errorMsg = result?.data?.message ||
          (result?.status !== 200 ? `API returned status ${result?.status}` : null) ||
          "Failed to load vehicle type data. Please check the console for details.";
        console.error("Failed to load vehicle type - Response structure:", {
          status: result?.status,
          data: result?.data,
          hasData: !!result?.data?.data,
          hasSuccess: result?.data?.success,
        });
        setSubmitError(errorMsg);
      }
    } catch (error) {
      console.error("Error loading vehicle type:", error);
      console.error("Error details:", {
        message: error?.message,
        response: error?.response,
        responseData: error?.response?.data,
        responseStatus: error?.response?.status,
      });
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
    return Yup.object({
      vehicle_type_name: Yup.string().required("Vehicle type name is required"),
      order_no: Yup.string().required("Order number is required"),
      vehicle_type_service: Yup.string().required("Vehicle type service is required"),
      minimum_price: Yup.string().required("Minimum price is required"),
      minimum_distance: Yup.string().required("Minimum distance is required"),
      backup_bid_vehicle_type: Yup.array().of(Yup.string()).min(1, "Select at least one backup bid vehicle type"),
      base_fare_system_status: Yup.string().oneOf(["yes", "no"]),
      base_fare_less_than_x_miles: Yup.string().when("base_fare_system_status", {
        is: "yes",
        then: (schema) => schema.required("Base fare miles is required"),
        otherwise: (schema) => schema.notRequired(),
      }),
      base_fare_less_than_x_price: Yup.string().when("base_fare_system_status", {
        is: "yes",
        then: (schema) => schema.required("Base fare price is required"),
        otherwise: (schema) => schema.notRequired(),
      }),
      base_fare_from_x_miles: Yup.string().when("base_fare_system_status", {
        is: "yes",
        then: (schema) => schema.required("From miles is required"),
        otherwise: (schema) => schema.notRequired(),
      }),
      base_fare_to_x_miles: Yup.string().when("base_fare_system_status", {
        is: "yes",
        then: (schema) => schema.required("To miles is required"),
        otherwise: (schema) => schema.notRequired(),
      }),
      base_fare_from_to_price: Yup.string().when("base_fare_system_status", {
        is: "yes",
        then: (schema) => schema.required("Base fare price is required"),
        otherwise: (schema) => schema.notRequired(),
      }),
      base_fare_greater_than_x_miles: Yup.string().when("base_fare_system_status", {
        is: "yes",
        then: (schema) => schema.required("Greater than miles is required"),
        otherwise: (schema) => schema.notRequired(),
      }),
      base_fare_greater_than_x_price: Yup.string().when("base_fare_system_status", {
        is: "yes",
        then: (schema) => schema.required("Greater than price is required"),
        otherwise: (schema) => schema.notRequired(),
      }),
      mileage_system: Yup.string().oneOf(["fixed", "tiered"]).required("Mileage system is required"),
      first_mile_km: Yup.string().when("mileage_system", {
        is: "fixed",
        then: (schema) => schema.required("First mile/km is required"),
        otherwise: (schema) => schema.notRequired(),
      }),
      second_mile_km: Yup.string().when("mileage_system", {
        is: "fixed",
        then: (schema) => schema.required("Second mile/km is required"),
        otherwise: (schema) => schema.notRequired(),
      }),
      pricing_tiers: Yup.array().when("mileage_system", {
        is: (val) => val !== "fixed",
        then: (schema) =>
          schema
            .min(1, "Add at least one pricing tier")
            .test("tiers-complete", "Fill From, To and Fare for each tier", () =>
              pricingTiers.every((tier) => tier.from && tier.to && tier.price)
            ),
        otherwise: (schema) => schema.notRequired(),
      }),
      vehicle_image: Yup.mixed().test("vehicle-image-required", "Vehicle image is required", (value) => {
        if (isEditMode && existingVehicleImageUrl && !value) return true;
        return !!value;
      }),
    });
  }, [existingVehicleImageUrl, isEditMode, pricingTiers]);

  const handleAttributeChange = (attr, value) => {
    setAttributes(prev => ({
      ...prev,
      [attr]: value,
    }));
  };

  const handleAddAttribute = () => {
    const trimmed = (newAttributeName || "").trim().toLowerCase().replace(/\s+/g, "_");
    if (!trimmed) return;
    if (attributes[trimmed]) {
      setIsAttributeModalOpen(false);
      setNewAttributeName("");
      return;
    }
    setAttributes(prev => ({
      ...prev,
      [trimmed]: "",
    }));
    setIsAttributeModalOpen(false);
    setNewAttributeName("");
  };

  const handleBackupBidTypeChange = (selectedValues) => {
    setBackupBidTypes(selectedValues || []);
  };

  const handleSave = async (values) => {
    setIsSaving(true);
    setSubmitError(null);
    setSuccessMessage(null);

    try {
      const vehicleFormData = new FormData();

      if (isEditMode) {
        vehicleFormData.append('id', id);
      }
      vehicleFormData.append('vehicle_type_name', values.vehicle_type_name || '');
      vehicleFormData.append('vehicle_type_service', values.vehicle_type_service || '');
      vehicleFormData.append('minimum_price', values.minimum_price || '');
      vehicleFormData.append('minimum_distance', values.minimum_distance || '');
      const isBaseFareOn = (values.base_fare_system_status || '').toLowerCase() === 'yes';
      vehicleFormData.append('base_fare_less_than_x_miles', isBaseFareOn ? values.base_fare_less_than_x_miles || '' : '0');
      vehicleFormData.append('base_fare_less_than_x_price', isBaseFareOn ? values.base_fare_less_than_x_price || '' : '0');
      vehicleFormData.append('base_fare_from_x_miles', isBaseFareOn ? values.base_fare_from_x_miles || '' : '0');
      vehicleFormData.append('base_fare_to_x_miles', isBaseFareOn ? values.base_fare_to_x_miles || '' : '0');
      vehicleFormData.append('base_fare_from_to_price', isBaseFareOn ? values.base_fare_from_to_price || '' : '0');
      vehicleFormData.append('base_fare_greater_than_x_miles', isBaseFareOn ? values.base_fare_greater_than_x_miles || '' : '0');
      vehicleFormData.append('base_fare_greater_than_x_price', isBaseFareOn ? values.base_fare_greater_than_x_price || '' : '0');
      vehicleFormData.append('first_mile_km', values.first_mile_km || '');
      vehicleFormData.append('second_mile_km', values.second_mile_km || '');
      vehicleFormData.append('base_fare_system_status', values.base_fare_system_status || '');
      vehicleFormData.append('mileage_system', values.mileage_system || '');
      vehicleFormData.append('order_no', values.order_no || '');
      const selectedBackup = values.backup_bid_vehicle_type || backupBidTypes;
      (selectedBackup || []).forEach(type => {
        vehicleFormData.append('backup_bid_vehicle_type[]', type);
      });
      const tiersToSend = values.pricing_tiers || pricingTiers;
      (tiersToSend || []).forEach((tier) => {
        if (tier.from) vehicleFormData.append('from_array[]', tier.from);
        if (tier.to) vehicleFormData.append('to_array[]', tier.to);
        if (tier.price) vehicleFormData.append('price_array[]', tier.price);
      });
      const imageToSend = values.vehicle_image || vehicleImage;
      if (imageToSend) {
        vehicleFormData.append('vehicle_image', imageToSend);
      }
      Object.keys(attributes).forEach(key => {
        vehicleFormData.append(`attribute_array[${key}]`, attributesEnabled ? attributes[key] : "");
      });
      if (isEditMode) {
        console.log("Edit Mode - Form Data being sent:");
        console.log("ID:", id);
        for (let pair of vehicleFormData.entries()) {
          console.log(pair[0] + ': ' + pair[1]);
        }
      }

      const response = isEditMode
        ? await apiEditVehicleType(vehicleFormData)
        : await apiCreateVehicleType(vehicleFormData);

      if (response?.data?.success === 1 || response?.status === 200) {
        setSuccessMessage(`Vehicle type ${isEditMode ? 'updated' : 'created'} successfully!`);
        setTimeout(() => {
          navigate(VEHICLE_TYPE_PATH);
        }, 1500);
      } else {
        setSubmitError(response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} vehicle type`);
      }
    } catch (error) {
      console.error("Error saving vehicle type:", error);
      setSubmitError(error?.response?.data?.message || error?.message || `Error ${isEditMode ? 'updating' : 'creating'} vehicle type`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    unlockBodyScroll();
    navigate(VEHICLE_TYPE_PATH);
  };

  return (
    <Formik
      initialValues={formData}
      enableReinitialize
      validationSchema={validationSchema}
      onSubmit={handleSave}
    >
      {({ values, setFieldValue, errors }) => (
        <Form>
          <div>
            <div className="px-4 py-5 sm:p-6 lg:p-10 min-h-[calc(100vh-85px)]">
              <div className="flex justify-between sm:flex-row flex-col items-start sm:items-center gap-3 sm:gap-0">
                <div className="sm:mb-[30px] mb-1 sm:w-[calc(100%-240px)] w-full flex gap-5 items-center">
                  <div className="flex flex-col gap-2.5 w-[calc(100%-100px)]">
                    <PageTitle title={isEditMode ? "Edit Vehicle Type" : "Add Vehicle Type"} />
                  </div>
                </div>
              </div>

              <div>
                <CardContainer className="p-3 sm:p-4 lg:p-5 bg-[#F5F5F5]">
                  <div className="w-full">
                    {submitError && (
                      <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                        {submitError}
                      </div>
                    )}

                    {successMessage && (
                      <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                        {successMessage}
                      </div>
                    )}

                    <div class="max-w-6xl mx-auto">
                      <div class=" space-y-4">
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div>
                            <FormLabel htmlFor="name">Vehicle Type Name</FormLabel>
                            <div className="h-14">
                              <Field
                                type="text"
                                name="vehicle_type_name"
                                className="sm:px-5 px-4 sm:py-[21px] py-4 border border-[#8D8D8D] rounded-lg w-full h-full shadow-[-4px_4px_6px_0px_#0000001F] placeholder:text-[#6C6C6C] sm:text-base text-sm leading-[22px] font-semibold"
                                placeholder="Enter Name"
                              />
                            </div>
                            <ErrorMessage name="vehicle_type_name" component="div" className="text-red-500 text-sm mt-1" />
                          </div>

                          <div>
                            <FormLabel htmlFor="name">Order No *</FormLabel>
                            <div className="h-14">
                              <Field
                                type="text"
                                name="order_no"
                                className="sm:px-5 px-4 sm:py-[21px] py-4 border border-[#8D8D8D] rounded-lg w-full h-full shadow-[-4px_4px_6px_0px_#0000001F] placeholder:text-[#6C6C6C] sm:text-base text-sm leading-[22px] font-semibold"
                                placeholder="Enter Name"
                              />
                            </div>
                            <ErrorMessage name="order_no" component="div" className="text-red-500 text-sm mt-1" />
                          </div>

                          <div>
                            <FormLabel htmlFor="name">Vehicle Type Service</FormLabel>
                            <div className="h-14">
                              <Field
                                type="text"
                                name="vehicle_type_service"
                                className="sm:px-5 px-4 sm:py-[21px] py-4 border border-[#8D8D8D] rounded-lg w-full h-full shadow-[-4px_4px_6px_0px_#0000001F] placeholder:text-[#6C6C6C] sm:text-base text-sm leading-[22px] font-semibold"
                                placeholder="Enter Name"
                              />
                            </div>
                            <ErrorMessage name="vehicle_type_service" component="div" className="text-red-500 text-sm mt-1" />
                          </div>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <FormLabel htmlFor="name">Minimum Price *</FormLabel>
                            <div className="h-14">
                              <Field
                                type="text"
                                name="minimum_price"
                                className="sm:px-5 px-4 sm:py-[21px] py-4 border border-[#8D8D8D] rounded-lg w-full h-full shadow-[-4px_4px_6px_0px_#0000001F] placeholder:text-[#6C6C6C] sm:text-base text-sm leading-[22px] font-semibold"
                                placeholder="Enter Minimum Price"
                              />
                            </div>
                            <ErrorMessage name="minimum_price" component="div" className="text-red-500 text-sm mt-1" />
                          </div>
                          <div>
                            <FormLabel htmlFor="name">Minimum Distance (Miles) *</FormLabel>
                            <div className="h-14">
                              <Field
                                type="text"
                                name="minimum_distance"
                                className="sm:px-5 px-4 sm:py-[21px] py-4 border border-[#8D8D8D] rounded-lg w-full h-full shadow-[-4px_4px_6px_0px_#0000001F] placeholder:text-[#6C6C6C] sm:text-base text-sm leading-[22px] font-semibold"
                                placeholder="Enter Minimum Distance"
                              />
                            </div>
                            <ErrorMessage name="minimum_distance" component="div" className="text-red-500 text-sm mt-1" />
                          </div>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label class="block text-gray-700 font-medium mb-1">Vehicle Type Image</label>
                            {existingVehicleImageUrl && !vehicleImage && (
                              <div class="mb-3">
                                <p class="text-sm text-gray-600 mb-2">Current Image:</p>
                                <img
                                  src={existingVehicleImageUrl}
                                  alt="Current vehicle type"
                                  class="w-32 h-32 object-contain border border-gray-300 rounded-lg"
                                />
                              </div>
                            )}
                            {/* {vehicleImage && (
                              <div class="mb-3">
                                <p class="text-sm text-gray-600 mb-2">New Image Preview:</p>
                                <img
                                  src={URL.createObjectURL(vehicleImage)}
                                  alt="Preview"
                                  class="w-32 h-32 object-contain border border-gray-300 rounded-lg"
                                />
                              </div>
                            )} */}
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0] || null;
                                setVehicleImage(file);
                                setFieldValue("vehicle_image", file);
                                if (file) {
                                  setExistingVehicleImageUrl(null);
                                }
                              }}
                              class="w-full h-14 border border-gray-300 rounded-lg px-4 py-2 bg-white"
                            />
                            {isEditMode && !vehicleImage && (
                              <p class="text-xs text-gray-500 mt-1">Leave empty to keep current image</p>
                            )}
                            {errors.vehicle_image && (
                              <div className="text-red-500 text-sm mt-1">{errors.vehicle_image}</div>
                            )}
                          </div>
                          <div>
                            <FormLabel htmlFor="backupBidTypes">Backup Bid Vehicle Type</FormLabel>
                            <div className="h-16 w-full">
                              <FormSelection
                                label="Backup Bid Vehicle Type"
                                name="backupBidTypes"
                                value={backupBidTypes.map(id => id?.toString())}
                                onChange={(vals) => {
                                  handleBackupBidTypeChange(vals);
                                  setFieldValue("backup_bid_vehicle_type", vals);
                                }}
                                placeholder="Select Backup Bid Vehicle Type"
                                options={allVehicleType.map(vehicle => ({
                                  label: vehicle.vehicle_type_name || `Vehicle ${vehicle.id}`,
                                  value: vehicle.id?.toString() || ""
                                }))}
                                isMulti={true}
                              />
                            </div>
                            {errors.backup_bid_vehicle_type && (
                              <div className="text-red-500 text-sm mt-1">{errors.backup_bid_vehicle_type}</div>
                            )}
                          </div>
                        </div>

                        <div className="mt-3 flex flex-col sm:flex-row gap-3 sm:gap-5 justify-start">
                          <Button
                            btnSize="md"
                            type="filledGray"
                            className="!px-10 pt-4 pb-[15px] leading-[25px] w-full sm:w-auto"
                            onClick={handleCancel}
                            disabled={isSaving || isLoading}
                          >
                            <span>Cancel</span>
                          </Button>
                          <Button
                            btnType="submit"
                            btnSize="md"
                            type="filled"
                            className="!px-10 pt-4 pb-[15px] leading-[25px] w-full sm:w-auto"
                            disabled={isSaving || isLoading}
                          >
                            <span>{isSaving ? "Saving..." : "Save"}</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContainer>
              </div>

              <div>
                <CardContainer className="p-3 sm:p-4 lg:p-5 bg-[#F5F5F5] mt-5">
                  <div className="flex flex-row gap-3">
                    <div className="flex gap-3 mt-3">
                      <input
                        id="base_fare_system_status"
                        type="checkbox"
                        checked={values.base_fare_system_status === "yes"}
                        onChange={(e) => setFieldValue("base_fare_system_status", e.target.checked ? "yes" : "no")}
                        className="h-4 w-4 accent-blue-600"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                      <div>
                        <FormLabel htmlFor="name">Base Fare less Than (x) Miles</FormLabel>
                        <div className="h-14">
                          <Field
                            type="text"
                            name="base_fare_less_than_x_miles"
                            className="sm:px-5 px-4 sm:py-[21px] py-4 border border-[#8D8D8D] rounded-lg w-full h-full shadow-[-4px_4px_6px_0px_#0000001F] placeholder:text-[#6C6C6C] sm:text-base text-sm leading-[22px] font-semibold"
                            placeholder="$0"
                          />
                        </div>
                        <ErrorMessage name="base_fare_less_than_x_miles" component="div" className="text-red-500 text-sm mt-1" />
                      </div>
                      <div>
                        <FormLabel htmlFor="name">Base Fare less Then (x) Miles Price</FormLabel>
                        <div className="h-14">
                          <Field
                            type="text"
                            name="base_fare_less_than_x_price"
                            className="sm:px-5 px-4 sm:py-[21px] py-4 border border-[#8D8D8D] rounded-lg w-full h-full shadow-[-4px_4px_6px_0px_#0000001F] placeholder:text-[#6C6C6C] sm:text-base text-sm leading-[22px] font-semibold"
                            placeholder="$0"
                          />
                        </div>
                        <ErrorMessage name="base_fare_less_than_x_price" component="div" className="text-red-500 text-sm mt-1" />
                      </div>

                      <div className="flex flex-col gap-1">
                        <FormLabel className="text-sm font-medium text-gray-700">Base Fare From (x) Miles to (X) Miles</FormLabel>
                        <div className="flex flex-row gap-4 w-full">
                          <div>
                            <div className="h-14">
                              <Field
                                type="text"
                                name="base_fare_from_x_miles"
                                className="sm:px-5 px-4 sm:py-[21px] py-4 border border-[#8D8D8D] rounded-lg w-full h-full shadow-[-4px_4px_6px_0px_#0000001F] placeholder:text-[#6C6C6C] sm:text-base text-sm leading-[22px] font-semibold"
                                placeholder="$0"
                              />
                            </div>
                            <ErrorMessage name="base_fare_from_x_miles" component="div" className="text-red-500 text-sm mt-1" />
                          </div>

                          <div>
                            <div className="h-14">
                              <Field
                                type="text"
                                name="base_fare_to_x_miles"
                                className="sm:px-5 px-4 sm:py-[21px] py-4 border border-[#8D8D8D] rounded-lg w-full h-full shadow-[-4px_4px_6px_0px_#0000001F] placeholder:text-[#6C6C6C] sm:text-base text-sm leading-[22px] font-semibold"
                                placeholder="$0"
                              />
                            </div>
                            <ErrorMessage name="base_fare_to_x_miles" component="div" className="text-red-500 text-sm mt-1" />
                          </div>
                        </div>
                      </div>

                      <div>
                        <FormLabel htmlFor="name">Base Fare From (x) Miles to (X) Miles Price</FormLabel>
                        <div className="h-14">
                          <Field
                            type="text"
                            name="base_fare_from_to_price"
                            className="sm:px-5 px-4 sm:py-[21px] py-4 border border-[#8D8D8D] rounded-lg w-full h-full shadow-[-4px_4px_6px_0px_#0000001F] placeholder:text-[#6C6C6C] sm:text-base text-sm leading-[22px] font-semibold"
                            placeholder="$0"
                          />
                        </div>
                        <ErrorMessage name="base_fare_from_to_price" component="div" className="text-red-500 text-sm mt-1" />
                      </div>
                      <div>
                        <FormLabel htmlFor="name">Base Fare Greater Then (x) Miles</FormLabel>
                        <div className="h-14">
                          <Field
                            type="text"
                            name="base_fare_greater_than_x_miles"
                            className="sm:px-5 px-4 sm:py-[21px] py-4 border border-[#8D8D8D] rounded-lg w-full h-full shadow-[-4px_4px_6px_0px_#0000001F] placeholder:text-[#6C6C6C] sm:text-base text-sm leading-[22px] font-semibold"
                            placeholder="$0"
                          />
                        </div>
                        <ErrorMessage name="base_fare_greater_than_x_miles" component="div" className="text-red-500 text-sm mt-1" />
                      </div>

                      <div>
                        <FormLabel htmlFor="name">Base Fare Greater Then (x) Miles Price</FormLabel>
                        <div className="h-14">
                          <Field
                            type="text"
                            name="base_fare_greater_than_x_price"
                            className="sm:px-5 px-4 sm:py-[21px] py-4 border border-[#8D8D8D] rounded-lg w-full h-full shadow-[-4px_4px_6px_0px_#0000001F] placeholder:text-[#6C6C6C] sm:text-base text-sm leading-[22px] font-semibold"
                            placeholder="$0"
                          />
                        </div>
                        <ErrorMessage name="base_fare_greater_than_x_price" component="div" className="text-red-500 text-sm mt-1" />
                      </div>
                      <div className="mt-3 flex flex-col sm:flex-row gap-3 sm:gap-5 justify-start">
                        <Button
                          btnSize="md"
                          type="filledGray"
                          className="!px-10 pt-4 pb-[15px] leading-[25px] w-full sm:w-auto"
                          onClick={handleCancel}
                          disabled={isSaving || isLoading}
                        >
                          <span>Cancel</span>
                        </Button>
                        <Button
                          btnType="submit"
                          btnSize="md"
                          type="filled"
                          className="!px-10 pt-4 pb-[15px] leading-[25px] w-full sm:w-auto"
                          disabled={isSaving || isLoading}
                        >
                          <span>{isSaving ? "Saving..." : "Save"}</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContainer>
              </div>

              <div>
                <CardContainer className="p-3 sm:p-4 lg:p-5 bg-[#F5F5F5] mt-5">
                  <div>
                    <div className={`border mb-4 rounded-lg p-4 ${values.mileage_system === "fixed" ? "border-blue-500" : "border-gray-300"}`}>
                      <div className="flex flex-row gap-4">
                        <div>
                          <label className="px-1">
                            <input
                              type="radio"
                              name="mileage_system"
                              value="fixed"
                              checked={values.mileage_system === "fixed"}
                              onChange={(e) => setFieldValue("mileage_system", e.target.value)}
                              className="accent-blue-600 text-blue-500 border-blue-500 h-4 w-4"
                            />
                          </label>
                          <ErrorMessage name="mileage_system" component="div" className="text-red-500 text-sm mb-2" />
                        </div>
                        <div className="w-full">
                          <FormLabel htmlFor="name">First Mile / Km*</FormLabel>
                          <div className="h-14">
                            <Field
                              type="text"
                              name="first_mile_km"
                              className="sm:px-5 px-4 sm:py-[21px] py-4 border border-[#8D8D8D] rounded-lg w-full h-full shadow-[-4px_4px_6px_0px_#0000001F] placeholder:text-[#6C6C6C] sm:text-base text-sm leading-[22px] font-semibold"
                              placeholder="Enter First Mile / Km"
                              disabled={values.mileage_system !== "fixed"}
                            />
                          </div>
                          <ErrorMessage name="first_mile_km" component="div" className="text-red-500 text-sm mt-1" />
                        </div>
                        <div className="w-full">
                          <FormLabel htmlFor="name">Second Mile / Km*</FormLabel>
                          <div className="h-14">
                            <Field
                              type="text"
                              name="second_mile_km"
                              className="sm:px-5 px-4 sm:py-[21px] py-4 border border-[#8D8D8D] rounded-lg w-full h-full shadow-[-4px_4px_6px_0px_#0000001F] placeholder:text-[#6C6C6C] sm:text-base text-sm leading-[22px] font-semibold"
                              placeholder="Enter Second Mile / Km"
                              disabled={values.mileage_system !== "fixed"}
                            />
                          </div>
                          <ErrorMessage name="second_mile_km" component="div" className="text-red-500 text-sm mt-1" />
                        </div>
                      </div>
                    </div>

                    <div className={`border rounded-lg p-4 ${values.mileage_system !== "fixed" ? "border-blue-500" : "border-gray-300"}`}>
                      <div className="flex flex-row gap-4">
                        <div className="mb-5">
                          <label className="px-1">
                            <input
                              type="radio"
                              name="mileage_system"
                              value="tiered"
                              checked={values.mileage_system === "tiered"}
                              onChange={(e) => setFieldValue("mileage_system", e.target.value)}
                              className="accent-blue-600 h-4 w-4"
                            />
                          </label>
                        </div>
                        <div className="flex-1 space-y-6">
                          {pricingTiers.map((tier, index) => (
                            <div key={index} class="grid grid-cols-4 gap-4 items-end">
                              <div className="w-full">
                                <FormLabel htmlFor="from">From</FormLabel>
                                <div className="h-14">
                                  <Field
                                    type="number"
                                    value={tier.from}
                                    onChange={(e) => {
                                      const updated = [...pricingTiers];
                                      updated[index].from = e.target.value;
                                      setPricingTiers(updated);
                                      setFieldValue("pricing_tiers", updated);
                                    }}
                                    className="sm:px-5 px-4 sm:py-[21px] py-4 border border-[#8D8D8D] rounded-lg w-full h-full shadow-[-4px_4px_6px_0px_#0000001F] placeholder:text-[#6C6C6C] sm:text-base text-sm leading-[22px] font-semibold"
                                    placeholder="Enter First Mile"
                                    disabled={values.mileage_system === "fixed"}
                                  />
                                </div>
                                <ErrorMessage name="tier.price" component="div" className="text-red-500 text-sm mt-1" />
                              </div>

                              <div className="w-full">
                                <FormLabel htmlFor="to">To</FormLabel>
                                <div className="h-14">
                                  <Field
                                    type="number"
                                    value={tier.to}
                                    onChange={(e) => {
                                      const updated = [...pricingTiers];
                                      updated[index].to = e.target.value;
                                      setPricingTiers(updated);
                                      setFieldValue("pricing_tiers", updated);
                                    }}
                                    className="sm:px-5 px-4 sm:py-[21px] py-4 border border-[#8D8D8D] rounded-lg w-full h-full shadow-[-4px_4px_6px_0px_#0000001F] placeholder:text-[#6C6C6C] sm:text-base text-sm leading-[22px] font-semibold"
                                    placeholder="Enter Second Mile"
                                    disabled={values.mileage_system === "fixed"}
                                  />
                                </div>
                                <ErrorMessage name="tier.price" component="div" className="text-red-500 text-sm mt-1" />
                              </div>

                              <div className="w-full">
                                <FormLabel htmlFor="fare">Fare</FormLabel>
                                <div className="h-14">
                                  <Field
                                    type="number"
                                    value={tier.price}
                                    onChange={(e) => {
                                      const updated = [...pricingTiers];
                                      updated[index].price = e.target.value;
                                      setPricingTiers(updated);
                                      setFieldValue("pricing_tiers", updated);
                                    }}
                                    className="sm:px-5 px-4 sm:py-[21px] py-4 border border-[#8D8D8D] rounded-lg w-full h-full shadow-[-4px_4px_6px_0px_#0000001F] placeholder:text-[#6C6C6C] sm:text-base text-sm leading-[22px] font-semibold"
                                    placeholder="Enter Fare"
                                    disabled={values.mileage_system === "fixed"}
                                  />
                                </div>
                                <ErrorMessage name="tier.price" component="div" className="text-red-500 text-sm mt-1" />
                              </div>

                              <div className="flex flex-col gap-2">
                                {index === 0 && (
                                  <Button
                                    type="button"
                                    onClick={() => {
                                      const updated = [...pricingTiers, { from: "", to: "", price: "" }];
                                      setPricingTiers(updated);
                                      setFieldValue("pricing_tiers", updated);
                                    }}
                                    className="text-blue-500 px-3 py-2 border border-blue-500 rounded-md w-28 "
                                    btnSize="sm"
                                    disabled={values.mileage_system === "fixed"}
                                  >
                                    Add Range
                                  </Button>
                                )}

                                {index !== 0 && (
                                  <Button
                                    type="button"
                                    onClick={() => {
                                      const updated = pricingTiers.filter((_, i) => i !== index);
                                      setPricingTiers(updated);
                                      setFieldValue("pricing_tiers", updated);
                                    }}
                                    className="text-red-500 px-3 py-2 border border-red-500 rounded-md w-28"
                                    btnSize="sm"
                                    disabled={values.mileage_system === "fixed"}
                                  >
                                    Remove
                                  </Button>
                                )}
                              </div>

                            </div>
                          ))}
                        </div>
                      </div>
                      {values.mileage_system !== "fixed" && errors.pricing_tiers && (
                        <div className="text-red-500 text-sm mb-2">{errors.pricing_tiers}</div>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 flex flex-col sm:flex-row gap-3 sm:gap-5 justify-start">
                    <Button
                      btnSize="md"
                      type="filledGray"
                      className="!px-10 pt-4 pb-[15px] leading-[25px] w-full sm:w-auto"
                      onClick={handleCancel}
                      disabled={isSaving || isLoading}
                    >
                      <span>Cancel</span>
                    </Button>
                    <Button
                      btnType="submit"
                      btnSize="md"
                      type="filled"
                      className="!px-10 pt-4 pb-[15px] leading-[25px] w-full sm:w-auto"
                      disabled={isSaving || isLoading}
                    >
                      <span>{isSaving ? "Saving..." : "Save"}</span>
                    </Button>
                  </div>
                </CardContainer>
              </div>

              <div className="w-full my-10">
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-semibold text-gray-900">Attributes</h3>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={attributesEnabled}
                        onChange={() => setAttributesEnabled((prev) => !prev)}
                      />
                      <div className="w-12 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[4px] after:left-[3px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5"></div>
                    </label>
                  </div>
                  <Button
                    type="filled"
                    btnSize="sm"
                    className="!px-10 pt-3 pb-[13px] leading-[25px] w-full sm:w-auto rounded-lg"
                    onClick={() => {
                      setNewAttributeName("");
                      setIsAttributeModalOpen(true);
                    }}
                  >
                    + Add Attribute
                  </Button>
                </div>
                <CardContainer className="p-3 sm:p-4 lg:p-5 bg-[#F5F5F5]">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.keys(attributes).map((attrKey) => (
                      <div key={attrKey} className="bg-white rounded-xl p-3 shadow-sm border">
                        <p className="font-semibold mb-3 text-gray-800 capitalize">{attrKey.replace(/_/g, " ")}</p>
                        <div className="flex items-center gap-6">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name={attrKey}
                              value="yes"
                              checked={attributes[attrKey] === "yes"}
                              onChange={(e) => handleAttributeChange(attrKey, e.target.value)}
                              className="accent-blue-600"
                              disabled={!attributesEnabled}
                            />
                            <span>Yes</span>
                          </label>

                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name={attrKey}
                              value="no"
                              checked={attributes[attrKey] === "no"}
                              onChange={(e) => handleAttributeChange(attrKey, e.target.value)}
                              className="accent-blue-600"
                              disabled={!attributesEnabled}
                            />
                            <span>No</span>
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 flex flex-col sm:flex-row gap-3 sm:gap-5 justify-start">
                    <Button
                      btnSize="md"
                      type="filledGray"
                      className="!px-10 pt-4 pb-[15px] leading-[25px] w-full sm:w-auto"
                      onClick={handleCancel}
                      disabled={isSaving || isLoading}
                    >
                      <span>Cancel</span>
                    </Button>
                    <Button
                      btnType="submit"
                      btnSize="md"
                      type="filled"
                      className="!px-10 pt-4 pb-[15px] leading-[25px] w-full sm:w-auto"
                      disabled={isSaving || isLoading}
                    >
                      <span>{isSaving ? "Saving..." : "Save"}</span>
                    </Button>
                  </div>
                </CardContainer>
              </div>

              {isAttributeModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                    <h4 className="text-lg font-semibold mb-4">Add Attribute</h4>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Attribute Name</label>
                    <input
                      type="text"
                      value={newAttributeName}
                      onChange={(e) => setNewAttributeName(e.target.value)}
                      className="w-full border rounded-md px-3 py-2 mb-4"
                      placeholder="Enter attribute"
                    />
                    <div className="flex justify-end gap-3">
                      <Button
                        type="filledGray"
                        className="!px-10 pt-4 pb-[15px] leading-[25px] w-full sm:w-auto"
                        onClick={() => {
                          setIsAttributeModalOpen(false);
                          setNewAttributeName("");
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        btnSize="md"
                        type="filled"
                        className="!px-10 pt-4 pb-[15px] leading-[25px] w-full sm:w-auto"
                        onClick={handleAddAttribute}
                      >
                        Create
                      </Button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </Form>
      )}
    </Formik>
  )
}

export default AddVehicleType;