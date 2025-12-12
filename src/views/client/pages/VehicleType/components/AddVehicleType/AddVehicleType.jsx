import CardContainer from "../../../../../../components/shared/CardContainer";
import PageTitle from "../../../../../../components/ui/PageTitle/PageTitle";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import Button from "../../../../../../components/ui/Button/Button";
import { unlockBodyScroll } from "../../../../../../utils/functions/common.function";
import { apiGetVehicleTypeById, apiCreateVehicleType, apiEditVehicleType, apiGetVehicleTypes, apiGetAllVehicleType } from "../../../../../../services/VehicleTypeServices";
import { VEHICLE_TYPE_PATH } from "../../../../../../constants/routes.path.constant/client.route.path.constant";
import FormLabel from "../../../../../../components/ui/FormLabel/FormLabel";
import FormSelection from "../../../../../../components/ui/FormSelection/FormSelection";

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
    smoking: "",
    ac: "",
    child_seat: "",
    pets: "",
    wheel_chair: "",
    lady_driver: "",
  });

  useEffect(() => {
    const fetchAllVehicleType = async () => {
      try {
        const response = await apiGetAllVehicleType();
        console.log("All Vehicle Types Response:", response);
        console.log("Response data:", response?.data);
        console.log("Response data.list:", response?.data?.list);

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
        if (result?.data?.data && typeof result.data.data === 'object') {
          vehicleData = result.data.data;
        }
        else if (result?.data?.success === 1 && result?.data?.data) {
          vehicleData = result.data.data;
        }
        else if (result?.data?.success === 1) {
          const { success, message, ...rest } = result.data;
          vehicleData = rest;
          console.log("Extracted vehicle data (removed success/message flags):", vehicleData);
        }
        else if (result?.data && typeof result.data === 'object' && result.data.vehicle_type_name) {
          vehicleData = result.data;
        }
      }

      if (vehicleData) {
        console.log("Vehicle data extracted successfully:", vehicleData);

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
        });
        if (vehicleData.backup_bid_vehicle_type) {
          const backupTypes = Array.isArray(vehicleData.backup_bid_vehicle_type)
            ? vehicleData.backup_bid_vehicle_type.map(id => id?.toString())
            : [];
          setBackupBidTypes(backupTypes);
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePricingTierChange = (index, field, value) => {
    const updatedTiers = [...pricingTiers];
    updatedTiers[index][field] = value;
    setPricingTiers(updatedTiers);
  };

  const handleAddPricingTier = () => {
    setPricingTiers([...pricingTiers, { from: "", to: "", price: "" }]);
  };

  const handleRemovePricingTier = (index) => {
    setPricingTiers(pricingTiers.filter((_, i) => i !== index));
  };

  const handleAttributeChange = (attr, value) => {
    setAttributes(prev => ({
      ...prev,
      [attr]: value,
    }));
  };

  const handleBackupBidTypeChange = (selectedValues) => {
    setBackupBidTypes(selectedValues || []);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSubmitError(null);
    setSuccessMessage(null);

    try {
      const vehicleFormData = new FormData();

      if (isEditMode) {
        vehicleFormData.append('id', id);
      }

      // Basic fields
      vehicleFormData.append('vehicle_type_name', formData.vehicle_type_name || '');
      vehicleFormData.append('vehicle_type_service', formData.vehicle_type_service || '');
      vehicleFormData.append('minimum_price', formData.minimum_price || '');
      vehicleFormData.append('minimum_distance', formData.minimum_distance || '');

      // Base fare fields
      vehicleFormData.append('base_fare_less_than_x_miles', formData.base_fare_less_than_x_miles || '');
      vehicleFormData.append('base_fare_less_than_x_price', formData.base_fare_less_than_x_price || '');
      vehicleFormData.append('base_fare_from_x_miles', formData.base_fare_from_x_miles || '');
      vehicleFormData.append('base_fare_to_x_miles', formData.base_fare_to_x_miles || '');
      vehicleFormData.append('base_fare_from_to_price', formData.base_fare_from_to_price || '');
      vehicleFormData.append('base_fare_greater_than_x_miles', formData.base_fare_greater_than_x_miles || '');
      vehicleFormData.append('base_fare_greater_than_x_price', formData.base_fare_greater_than_x_price || '');

      // Mileage fields
      vehicleFormData.append('first_mile_km', formData.first_mile_km || '');
      vehicleFormData.append('second_mile_km', formData.second_mile_km || '');

      // System status fields
      vehicleFormData.append('base_fare_system_status', formData.base_fare_system_status || '');
      vehicleFormData.append('mileage_system', formData.mileage_system || '');
      vehicleFormData.append('order_no', formData.order_no || '');

      // Backup bid vehicle types
      backupBidTypes.forEach(type => {
        vehicleFormData.append('backup_bid_vehicle_type[]', type);
      });

      // Pricing tiers
      pricingTiers.forEach((tier) => {
        if (tier.from) vehicleFormData.append('from_array[]', tier.from);
        if (tier.to) vehicleFormData.append('to_array[]', tier.to);
        if (tier.price) vehicleFormData.append('price_array[]', tier.price);
      });

      // Vehicle image
      if (vehicleImage) {
        vehicleFormData.append('vehicle_image', vehicleImage);
      }

      // Attributes
      Object.keys(attributes).forEach(key => {
        vehicleFormData.append(`attribute_array[${key}]`, attributes[key]);
      });

      // Log FormData contents for debugging (edit mode)
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

              {isEditMode && isLoading && (
                <div className="mb-4 p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded">
                  Loading vehicle type data...
                </div>
              )}

              {isEditMode && !isLoading && formData.vehicle_type_name && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded">
                  <strong>Editing:</strong> {formData.vehicle_type_name} (ID: {id})
                </div>
              )}

              <div class="max-w-6xl mx-auto">
                <div class=" space-y-4">
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label class="block text-gray-700 font-medium mb-1">Vehicle Type Name *</label>
                      <input
                        type="text"
                        name="vehicle_type_name"
                        value={formData.vehicle_type_name}
                        onChange={handleInputChange}
                        placeholder="Enter Vehicle Type Name"
                        class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label class="block text-gray-700 font-medium mb-1">Order No *</label>
                      <input
                        type="number"
                        name="order_no"
                        value={formData.order_no}
                        onChange={handleInputChange}
                        placeholder="Enter Order No"
                        class="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label class="block text-gray-700 font-medium mb-1">Vehicle Type Service *</label>
                      <input
                        type="text"
                        name="vehicle_type_service"
                        value={formData.vehicle_type_service}
                        onChange={handleInputChange}
                        placeholder="e.g., local, airport"
                        class="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label class="block text-gray-700 font-medium mb-1">Minimum Price *</label>
                      <input
                        type="number"
                        name="minimum_price"
                        value={formData.minimum_price}
                        onChange={handleInputChange}
                        placeholder="Enter Minimum Price"
                        class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label class="block text-gray-700 font-medium mb-1">Minimum Distance (Miles) *</label>
                      <input
                        type="number"
                        name="minimum_distance"
                        value={formData.minimum_distance}
                        onChange={handleInputChange}
                        placeholder="Enter Minimum Distance"
                        class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div class="md:col-span-2">
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
                      {vehicleImage && (
                        <div class="mb-3">
                          <p class="text-sm text-gray-600 mb-2">New Image Preview:</p>
                          <img
                            src={URL.createObjectURL(vehicleImage)}
                            alt="Preview"
                            class="w-32 h-32 object-contain border border-gray-300 rounded-lg"
                          />
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setVehicleImage(file);
                          if (file) {
                            setExistingVehicleImageUrl(null); // Clear existing image when new one is selected
                          }
                        }}
                        class="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white"
                      />
                      {isEditMode && !vehicleImage && (
                        <p class="text-xs text-gray-500 mt-1">Leave empty to keep current image</p>
                      )}
                    </div>
                    <div>
                      <FormLabel htmlFor="backupBidTypes">Backup Bid Vehicle Type</FormLabel>
                      <div className="h-16 md:w-80 w-full">
                        <FormSelection
                          label="Backup Bid Vehicle Type"
                          name="backupBidTypes"
                          value={backupBidTypes.map(id => id?.toString())}
                          onChange={handleBackupBidTypeChange}
                          placeholder="Select Backup Bid Vehicle Type"
                          options={allVehicleType.map(vehicle => ({
                            label: vehicle.vehicle_type_name || `Vehicle ${vehicle.id}`,
                            value: vehicle.id?.toString() || ""
                          }))}
                          isMulti={true}
                        />
                      </div>
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
                      btnType="button"
                      btnSize="md"
                      type="filled"
                      className="!px-10 pt-4 pb-[15px] leading-[25px] w-full sm:w-auto"
                      onClick={handleSave}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Base Fare less Than (x) Miles</label>
                <input
                  type="number"
                  name="base_fare_less_than_x_miles"
                  value={formData.base_fare_less_than_x_miles}
                  onChange={handleInputChange}
                  placeholder="Enter Miles"
                  className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Base Fare less Then (x) Miles Price</label>
                <input
                  type="number"
                  name="base_fare_less_than_x_price"
                  value={formData.base_fare_less_than_x_price}
                  onChange={handleInputChange}
                  placeholder="Enter Price"
                  className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Base Fare From (x) Miles to (X) Miles</label>
                <div className="flex flex-row gap-4 w-full">
                  <input
                    type="number"
                    name="base_fare_from_x_miles"
                    value={formData.base_fare_from_x_miles}
                    onChange={handleInputChange}
                    placeholder="From Miles"
                    className="border border-gray-300 w-full rounded-lg px-4 py-3 focus:outline-none focus:border-blue-600"
                  />
                  <input
                    type="number"
                    name="base_fare_to_x_miles"
                    value={formData.base_fare_to_x_miles}
                    onChange={handleInputChange}
                    placeholder="To Miles"
                    className="border border-gray-300 w-full rounded-lg px-4 py-3 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Base Fare From (x) Miles to (X) Miles Price</label>
                <input
                  type="number"
                  name="base_fare_from_to_price"
                  value={formData.base_fare_from_to_price}
                  onChange={handleInputChange}
                  placeholder="Enter price"
                  className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Base Fare Greater Then (x) Miles</label>
                <input
                  type="number"
                  name="base_fare_greater_than_x_miles"
                  value={formData.base_fare_greater_than_x_miles}
                  onChange={handleInputChange}
                  placeholder="Enter Miles"
                  className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Base Fare Greater Then (x) Miles Price</label>
                <input
                  type="number"
                  name="base_fare_greater_than_x_price"
                  value={formData.base_fare_greater_than_x_price}
                  onChange={handleInputChange}
                  placeholder="Enter price"
                  className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-600"
                />
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
                  btnType="button"
                  btnSize="md"
                  type="filled"
                  className="!px-10 pt-4 pb-[15px] leading-[25px] w-full sm:w-auto"
                  onClick={handleSave}
                  disabled={isSaving || isLoading}
                >
                  <span>{isSaving ? "Saving..." : "Save"}</span>
                </Button>
              </div>
            </div>

          </CardContainer>
        </div>
        <div>
          <CardContainer className="p-3 sm:p-4 lg:p-5 bg-[#F5F5F5] mt-5">
            <div class="border border-blue-300 rounded-lg p-4">
              <div class="grid grid-cols-2 gap-6 w-full">
                <div>
                  <label class="text-sm font-medium">First Mile / Km*</label>
                  <input
                    type="number"
                    name="first_mile_km"
                    value={formData.first_mile_km}
                    onChange={handleInputChange}
                    placeholder="0"
                    class="mt-1 w-full border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label class="text-sm font-medium">Second Mile / Km*</label>
                  <input
                    type="number"
                    name="second_mile_km"
                    value={formData.second_mile_km}
                    onChange={handleInputChange}
                    placeholder="0"
                    class="mt-1 w-full border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label class="text-sm font-medium">Mileage System*</label>
                  <select
                    name="mileage_system"
                    value={formData.mileage_system}
                    onChange={handleInputChange}
                    class="mt-1 w-full border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="fixed">Fixed</option>
                    <option value="variable">Variable</option>
                  </select>
                </div>

                <div>
                  <label class="text-sm font-medium">Base Fare System Status*</label>
                  <select
                    name="base_fare_system_status"
                    value={formData.base_fare_system_status}
                    onChange={handleInputChange}
                    class="mt-1 w-full border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="yes">Enabled</option>
                    <option value="no">Disabled</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="p-6 bg-white rounded-xl shadow-sm mt-6">
              <div className="mb-4 flex justify-between items-center">
                <h3 className="text-lg font-semibold">Pricing Tiers</h3>
                <Button
                  type="button"
                  onClick={handleAddPricingTier}
                  className="text-sm px-3 py-1 border border-blue"
                  btnSize="sm"
                >
                  Add Range
                </Button>
              </div>
              <div class="flex-1 space-y-6">
                {pricingTiers.map((tier, index) => (
                  <div key={index} class="grid grid-cols-4 gap-4 items-end">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">From</label>
                      <input
                        type="number"
                        value={tier.from}
                        onChange={(e) => handlePricingTierChange(index, 'from', e.target.value)}
                        placeholder="From km"
                        class="w-full p-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">To</label>
                      <input
                        type="number"
                        value={tier.to}
                        onChange={(e) => handlePricingTierChange(index, 'to', e.target.value)}
                        placeholder="To km"
                        class="w-full p-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Fare</label>
                      <input
                        type="number"
                        value={tier.price}
                        onChange={(e) => handlePricingTierChange(index, 'price', e.target.value)}
                        placeholder="Price"
                        class="w-full p-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      {pricingTiers.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => handleRemovePricingTier(index)}
                          className="text-red-500 px-3 py-2 border border-red-500 rounded-md"
                          btnSize="sm"
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
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
                btnType="button"
                btnSize="md"
                type="filled"
                className="!px-10 pt-4 pb-[15px] leading-[25px] w-full sm:w-auto"
                onClick={handleSave}
                disabled={isSaving || isLoading}
              >
                <span>{isSaving ? "Saving..." : "Save"}</span>
              </Button>
            </div>
          </CardContainer>

          <div className="w-full my-10">
            <CardContainer className="p-3 sm:p-4 lg:p-5 bg-[#F5F5F5]">
              <div class="">
                <div class="grid grid-cols-3 gap-6">
                  <div class="bg-white rounded-xl p-3 shadow-sm border">
                    <p class="font-semibold mb-3 text-gray-800">No Smoking</p>
                    <div class="flex items-center gap-6">
                      <label class="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="smoking"
                          value="yes"
                          checked={attributes.smoking === "yes"}
                          onChange={(e) => handleAttributeChange('smoking', e.target.value)}
                          class="accent-blue-600"
                        />
                        <span>Yes</span>
                      </label>

                      <label class="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="smoking"
                          value="no"
                          checked={attributes.smoking === "no"}
                          onChange={(e) => handleAttributeChange('smoking', e.target.value)}
                          class="accent-blue-600"
                        />
                        <span>No</span>
                      </label>
                    </div>
                  </div>

                  <div class="bg-white rounded-xl p-3 shadow-sm border">
                    <p class="font-semibold mb-3 text-gray-800">AC</p>
                    <div class="flex items-center gap-6">
                      <label class="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="ac"
                          value="yes"
                          checked={attributes.ac === "yes"}
                          onChange={(e) => handleAttributeChange('ac', e.target.value)}
                          class="accent-blue-600"
                        />
                        <span>Yes</span>
                      </label>

                      <label class="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="ac"
                          value="no"
                          checked={attributes.ac === "no"}
                          onChange={(e) => handleAttributeChange('ac', e.target.value)}
                          class="accent-blue-600"
                        />
                        <span>No</span>
                      </label>
                    </div>
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
                    btnType="button"
                    btnSize="md"
                    type="filled"
                    className="!px-10 pt-4 pb-[15px] leading-[25px] w-full sm:w-auto"
                    onClick={handleSave}
                    disabled={isSaving || isLoading}
                  >
                    <span>{isSaving ? "Saving..." : "Save"}</span>
                  </Button>
                </div>
              </div>
            </CardContainer>
          </div>

        </div>
      </div>
    </div>
  )
}

export default AddVehicleType;