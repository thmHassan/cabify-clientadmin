import { Field, ErrorMessage } from "formik";
import FormLabel from "../../../../../../components/ui/FormLabel/FormLabel";
import FormSelection from "../../../../../../components/ui/FormSelection/FormSelection";

const BasicDetails = ({
    values,
    setFieldValue,
    errors,
    touched,
    distanceUnit,
    backupBidTypes,
    handleBackupBidTypeChange,
    allVehicleType,
    vehicleImage,
    setVehicleImage,
    existingVehicleImageUrl,
    setExistingVehicleImageUrl,
    isEditMode,
}) => {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <FormLabel htmlFor="vehicle_type_name">Vehicle Type Name *</FormLabel>
                    <div className="h-14">
                        <Field
                            type="text"
                            name="vehicle_type_name"
                            className="sm:px-5 px-4 sm:py-[21px] py-4 border border-[#8D8D8D] rounded-lg w-full h-full shadow-[-4px_4px_6px_0px_#0000001F] placeholder:text-[#6C6C6C] sm:text-base text-sm leading-[22px] font-semibold"
                            placeholder="Enter Name"
                        />
                    </div>
                    <ErrorMessage
                        name="vehicle_type_name"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                    />
                </div>

                <div>
                    <FormLabel htmlFor="order_no">Order No *</FormLabel>
                    <div className="h-14">
                        <Field
                            type="text"
                            name="order_no"
                            className="sm:px-5 px-4 sm:py-[21px] py-4 border border-[#8D8D8D] rounded-lg w-full h-full shadow-[-4px_4px_6px_0px_#0000001F] placeholder:text-[#6C6C6C] sm:text-base text-sm leading-[22px] font-semibold"
                            placeholder="Enter Order Number"
                        />
                    </div>
                    <ErrorMessage
                        name="order_no"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                    />
                </div>

                <div>
                    <FormLabel htmlFor="vehicle_type_service">
                        Vehicle Type Service *
                    </FormLabel>
                    <div className="h-14">
                        <FormSelection
                            name="vehicle_type_service"
                            value={values.vehicle_type_service}
                            placeholder="Select Vehicle Type Service"
                            onChange={(val) => setFieldValue("vehicle_type_service", val)}
                            options={[{ label: "Local", value: "local" }]}
                        />
                    </div>
                    <ErrorMessage
                        name="vehicle_type_service"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <FormLabel htmlFor="minimum_distance">
                        Minimum Distance ({distanceUnit}) *
                    </FormLabel>
                    <div className="h-14">
                        <Field
                            type="text"
                            name="minimum_distance"
                            className="sm:px-5 px-4 sm:py-[21px] py-4 border border-[#8D8D8D] rounded-lg w-full h-full shadow-[-4px_4px_6px_0px_#0000001F] placeholder:text-[#6C6C6C] sm:text-base text-sm leading-[22px] font-semibold"
                            placeholder="Enter Minimum Distance"
                        />
                    </div>
                    <ErrorMessage
                        name="minimum_distance"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                    />
                </div>
                <div>
                    <FormLabel htmlFor="backupBidTypes">
                        Backup Bid Vehicle Type *
                    </FormLabel>
                    <div className="h-16 w-full">
                        <FormSelection
                            label="Backup Bid Vehicle Type"
                            name="backup_bid_vehicle_type"
                            value={backupBidTypes.map((id) => id?.toString())}
                            onChange={(vals) => {
                                handleBackupBidTypeChange(vals);
                                setFieldValue("backup_bid_vehicle_type", vals);
                            }}
                            placeholder="Select Backup Bid Vehicle Type"
                            options={allVehicleType.map((vehicle) => ({
                                label: vehicle.vehicle_type_name || `Vehicle ${vehicle.id}`,
                                value: vehicle.id?.toString() || "",
                            }))}
                            isMulti={true}
                        />
                    </div>
                    {touched.backup_bid_vehicle_type &&
                        errors.backup_bid_vehicle_type && (
                            <div className="text-red-500 text-sm mt-1">
                                {errors.backup_bid_vehicle_type}
                            </div>
                        )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <FormLabel htmlFor="vehicle_image">Vehicle Type Image *</FormLabel>
                    
                    {/* Show new uploaded image preview */}
                    {vehicleImage && (
                        <div className="mb-3">
                            {/* <p className="text-sm text-gray-600 mb-2">New Image Preview:</p> */}
                            <img
                                src={URL.createObjectURL(vehicleImage)}
                                alt="New vehicle image preview"
                                className="w-12 h-12 object-contain border border-gray-300 rounded-lg bg-white"
                            />
                        </div>
                    )}
                    
                    {/* Show existing image only if no new image is uploaded */}
                    {!vehicleImage && existingVehicleImageUrl && (
                        <div className="mb-3">
                            {/* <p className="text-sm text-gray-600 mb-2">Current Image:</p> */}
                            <img
                                src={`${import.meta.env.VITE_BACKEND_URL}${existingVehicleImageUrl}`}
                                alt="Current vehicle type"
                                className="w-12 h-12 object-contain border border-gray-300 rounded-lg bg-white"
                            />
                        </div>
                    )}
                    
                    {/* Hidden file input */}
                    <input
                        id="vehicle_image_input"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            setVehicleImage(file);
                            setFieldValue("vehicle_image", file);
                        }}
                        className="hidden"
                    />
                    
                    {/* Custom file input button */}
                    <div className="flex items-center gap-3">
                        <label
                            htmlFor="vehicle_image_input"
                            className="px-5 py-3 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors shadow-sm"
                        >
                            Choose File
                        </label>
                        <span className="text-sm text-gray-600">
                            {vehicleImage 
                                ? vehicleImage.name 
                                : existingVehicleImageUrl 
                                    ? existingVehicleImageUrl.split('/').pop()
                                    : "No file chosen"
                            }
                        </span>
                    </div>
                    
                    {/* Only show error if NOT in edit mode OR if in edit mode but no existing image */}
                    {touched.vehicle_image && errors.vehicle_image && !(isEditMode && existingVehicleImageUrl) && (
                        <div className="text-red-500 text-sm mt-1">
                            {errors.vehicle_image}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BasicDetails;