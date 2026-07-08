import { ErrorMessage, Field, Form, Formik } from "formik";
import { useEffect, useMemo, useState } from "react";
import FormLabel from "../../../../../../components/ui/FormLabel/FormLabel";
import FormSelection from "../../../../../../components/ui/FormSelection/FormSelection";
import Password from "../../../../../../components/elements/CustomPassword/Password";
import { unlockBodyScroll } from "../../../../../../utils/functions/common.function";
import Button from "../../../../../../components/ui/Button/Button";
import { apiCreateDriveManagement, apiEditDriverManagement } from "../../../../../../services/DriverManagementService";
import { apiGetSubCompany } from "../../../../../../services/SubCompanyServices";
import { DRIVER_EDIT_VALIDATION_SCHEMA, DRIVER_VALIDATION_SCHEMA } from "../../../../validators/pages/driverManagement.validation";
import toast from "react-hot-toast";
import { apiGetAllVehicleType } from "../../../../../../services/VehicleTypeServices";
import { apiGetDocumentTypes } from "../../../../../../services/DriversDocumentServices";
import { getTenantData } from "../../../../../../utils/functions/tokenEncryption";
import { getDefaultDialCode } from "../../../../../../utils/tenantFormatUtils";
import { getDateStringInTimezone } from "../../../../../../utils/timezoneUtils";

const inputClass = "sm:px-5 px-4 sm:py-[21px] py-4 border border-[#8D8D8D] rounded-lg w-full h-full shadow-[-4px_4px_6px_0px_#0000001F] placeholder:text-[#6C6C6C] sm:text-base text-sm leading-[22px] font-semibold";
const fileClass = "block w-full h-full text-sm text-[#252525] file:mr-4 file:h-full file:border-0 file:bg-[#1F41BB] file:px-4 file:text-white file:font-semibold file:cursor-pointer border border-[#8D8D8D] rounded-lg shadow-[-4px_4px_6px_0px_#0000001F] bg-white";
const fieldWrapClass = "w-full lg:w-[calc((100%-20px)/2)]";

const normalizeDateInput = (value) => {
  if (!value) return "";
  if (typeof value === "string") {
    return value.split("T")[0].split(" ")[0];
  }
  return "";
};

const driverDocumentKey = (name, id) => {
  const key = String(name || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return key || `document_${id}`;
};

const buildDocumentValues = (requirements) =>
  requirements.reduce((acc, doc) => {
    acc[doc.key] = {
      number: "",
      issueDate: "",
      expiryDate: "",
      frontPhoto: null,
      backPhoto: null,
      profilePhoto: null,
      file: null,
    };
    return acc;
  }, {});

const AddDriversManagementModal = ({ initialValue = {}, setIsOpen, onDriverCreated }) => {
  const [submitError, setSubmitError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [subCompanyList, setSubCompanyList] = useState([]);
  const [loadingSubCompanies, setLoadingSubCompanies] = useState(false);
  const [vehicleList, setVehicleList] = useState([]);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [documentRequirements, setDocumentRequirements] = useState([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const tenantData = getTenantData();
  const defaultCountryCode = getDefaultDialCode(tenantData);

  useEffect(() => {
    setIsEditMode(!!initialValue?.id);
  }, [initialValue]);

  useEffect(() => {
    const fetchSubCompanies = async () => {
      setLoadingSubCompanies(true);
      try {
        const response = await apiGetSubCompany({ page: 1, perPage: 100 });
        if (response?.data?.success === 1) {
          const companies = response?.data?.list?.data || [];
          setSubCompanyList(companies.map((company) => ({
            label: company.name,
            value: company.id.toString(),
          })));
        }
      } catch (error) {
        console.error("Error fetching sub-companies:", error);
      } finally {
        setLoadingSubCompanies(false);
      }
    };
    fetchSubCompanies();
  }, []);

  useEffect(() => {
    const fetchVehicle = async () => {
      setLoadingVehicles(true);
      try {
        const response = await apiGetAllVehicleType();
        if (response?.data?.success === 1) {
          const vehicleTypes = response?.data?.list || [];
          setVehicleList(vehicleTypes.map((vehicle) => ({
            label: vehicle.vehicle_type_name,
            value: vehicle.id.toString(),
          })));
        }
      } catch (error) {
        console.error("Error fetching vehicle:", error);
      } finally {
        setLoadingVehicles(false);
      }
    };
    fetchVehicle();
  }, []);

  useEffect(() => {
    const fetchDocumentRequirements = async () => {
      if (isEditMode) return;

      setLoadingDocuments(true);
      try {
        const response = await apiGetDocumentTypes({ page: 1, perPage: 100 });
        if (response?.data?.success === 1) {
          const list = response?.data?.list?.data || response?.data?.list || [];
          setDocumentRequirements(list.map((doc) => ({
            ...doc,
            key: driverDocumentKey(doc.document_name, doc.id),
          })));
        }
      } catch (error) {
        console.error("Error fetching driver document requirements:", error);
      } finally {
        setLoadingDocuments(false);
      }
    };

    fetchDocumentRequirements();
  }, [isEditMode]);

  const initialDocumentValues = useMemo(
    () => buildDocumentValues(documentRequirements),
    [documentRequirements]
  );

  const validateDynamicFields = (values) => {
    const errors = {};

    if (!isEditMode && !values.profile_image) {
      errors.profile_image = "Profile photo is required";
    }

    if (!isEditMode) {
      const documentErrors = {};

      documentRequirements.forEach((doc) => {
        const value = values.documents?.[doc.key] || {};
        const currentErrors = {};

        if (doc.has_number_field === "yes" && !value.number) {
          currentErrors.number = "Document number is required";
        }
        if (doc.has_issue_date === "yes" && !value.issueDate) {
          currentErrors.issueDate = "Issue date is required";
        }
        if (doc.has_expiry_date === "yes" && !value.expiryDate) {
          currentErrors.expiryDate = "Expiry date is required";
        }
        if (doc.front_photo === "yes" && !value.frontPhoto) {
          currentErrors.frontPhoto = "Front photo is required";
        }
        if (doc.back_photo === "yes" && !value.backPhoto) {
          currentErrors.backPhoto = "Back photo is required";
        }
        if (doc.profile_photo === "yes" && !value.profilePhoto) {
          currentErrors.profilePhoto = "Profile photo is required";
        }
        if (doc.front_photo !== "yes" && doc.back_photo !== "yes" && doc.profile_photo !== "yes" && !value.file) {
          currentErrors.file = "Document image is required";
        }

        if (Object.keys(currentErrors).length > 0) {
          documentErrors[doc.key] = currentErrors;
        }
      });

      if (Object.keys(documentErrors).length > 0) {
        errors.documents = documentErrors;
      }
    }

    return errors;
  };

  const appendDocumentPayload = (formDataObj, values) => {
    if (isEditMode || documentRequirements.length === 0) return;

    const documentKeys = documentRequirements.map((doc) => doc.key);
    const documentNumbers = {};
    const documentIssueDates = {};
    const documentExpiryDates = {};

    formDataObj.append("documentKeys", JSON.stringify(documentKeys));

    documentRequirements.forEach((doc) => {
      const value = values.documents?.[doc.key] || {};

      if (value.number) documentNumbers[doc.key] = value.number;
      if (value.issueDate) documentIssueDates[doc.key] = value.issueDate;
      if (value.expiryDate) documentExpiryDates[doc.key] = value.expiryDate;
      if (value.frontPhoto) formDataObj.append(`documentFrontPhotos[${doc.key}]`, value.frontPhoto);
      if (value.backPhoto) formDataObj.append(`documentBackPhotos[${doc.key}]`, value.backPhoto);
      if (value.profilePhoto) formDataObj.append(`documentProfilePhotos[${doc.key}]`, value.profilePhoto);
      if (value.file) formDataObj.append(`documentFiles[${doc.key}]`, value.file);
    });

    formDataObj.append("documentNumbers", JSON.stringify(documentNumbers));
    formDataObj.append("documentIssueDates", JSON.stringify(documentIssueDates));
    formDataObj.append("documentExpiryDates", JSON.stringify(documentExpiryDates));
  };

  const handleSubmit = async (values) => {
    setIsLoading(true);
    setSubmitError(null);

    try {
      const formDataObj = new FormData();

      if (isEditMode) {
        formDataObj.append("id", initialValue.id);
      }

      formDataObj.append("name", values.name || "");
      formDataObj.append("email", values.email || "");
      formDataObj.append("country_code", values.country_code || "");
      formDataObj.append("phone_no", values.phone_no || "");
      if (!isEditMode || values.password) {
        formDataObj.append("password", values.password || "");
      }
      formDataObj.append("gender", values.gender || "");
      formDataObj.append("date_of_birth", values.date_of_birth || "");
      formDataObj.append("address", values.address || "");
      formDataObj.append("city", values.city || "");
      formDataObj.append("country", values.country || "");
      formDataObj.append("driver_license", values.driver_license || "");
      formDataObj.append("assigned_vehicle", values.assigned_vehicle || "");
      formDataObj.append("color", values.color || "");
      formDataObj.append("seats", values.seats || "");
      formDataObj.append("plate_no", values.plate_no || "");
      formDataObj.append("vehicle_registration_date", values.vehicle_registration_date || "");
      formDataObj.append("joined_date", values.joined_date || "");
      formDataObj.append("sub_company", values.sub_company || "");

      if (values.profile_image) {
        formDataObj.append("profile_image", values.profile_image);
      }

      appendDocumentPayload(formDataObj, values);

      const response = isEditMode
        ? await apiEditDriverManagement(formDataObj)
        : await apiCreateDriveManagement(formDataObj);

      if (response?.data?.error === 1) {
        toast.error(
          response?.data?.message ||
          `Failed to ${isEditMode ? "update" : "create"} driver`,
          { duration: 5000 }
        );
        return;
      }

      toast.success(
        response?.data?.message ||
        (isEditMode ? "Driver updated successfully" : "Driver created successfully"),
        { duration: 5000 }
      );

      if (onDriverCreated) {
        onDriverCreated();
      }

      unlockBodyScroll();
      setIsOpen({ type: "new", isOpen: false });
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || "Server error";
      setSubmitError(message);
      toast.error(message, { duration: 5000 });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-[960px] max-w-full">
      <Formik
        initialValues={{
          name: initialValue?.name || "",
          email: initialValue?.email || "",
          phone_no: initialValue?.phone_no || "",
          country_code: initialValue?.country_code || defaultCountryCode,
          password: "",
          profile_image: null,
          gender: initialValue?.gender || "",
          date_of_birth: normalizeDateInput(initialValue?.date_of_birth),
          address: initialValue?.address || "",
          city: initialValue?.city || "",
          country: initialValue?.country || "",
          driver_license: initialValue?.driver_license || "",
          assigned_vehicle: initialValue?.assigned_vehicle || "",
          color: initialValue?.color || "",
          seats: initialValue?.seats || "",
          plate_no: initialValue?.plate_no || "",
          vehicle_registration_date: normalizeDateInput(initialValue?.vehicle_registration_date),
          joined_date: isEditMode
            ? normalizeDateInput(initialValue?.joined_date)
            : getDateStringInTimezone(),
          sub_company: initialValue?.sub_company || "",
          documents: initialDocumentValues,
        }}
        validationSchema={isEditMode ? DRIVER_EDIT_VALIDATION_SCHEMA : DRIVER_VALIDATION_SCHEMA}
        validate={validateDynamicFields}
        onSubmit={handleSubmit}
        validateOnChange={true}
        validateOnBlur={true}
        enableReinitialize={true}
      >
        {({ values, setFieldValue, errors, touched }) => (
          <Form>
            <div className="text-xl sm:text-2xl lg:text-[26px] leading-7 sm:leading-8 lg:leading-9 font-semibold text-[#252525] mb-4 sm:mb-6 lg:mb-7 text-center mx-auto max-w-full sm:max-w-[85%] lg:max-w-[75%] w-full px-2">
              <span className="w-full text-center block truncate">
                {isEditMode ? "Edit Driver" : "Add New Driver"}
              </span>
            </div>

            {submitError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {submitError}
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-[#252525] mb-4">Personal Information</h3>
              <div className="flex flex-wrap gap-5">
                <div className={fieldWrapClass}>
                  <FormLabel htmlFor="name">Full Name</FormLabel>
                  <div className="sm:h-16 h-14">
                    <Field type="text" name="name" className={inputClass} placeholder="Enter full name" />
                  </div>
                  <ErrorMessage name="name" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                <div className={fieldWrapClass}>
                  <FormLabel htmlFor="email">Email</FormLabel>
                  <div className="sm:h-16 h-14">
                    <Field type="email" name="email" className={inputClass} placeholder="Enter email" />
                  </div>
                  <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                <div className={fieldWrapClass}>
                  <FormLabel htmlFor="phone_no">Phone Number</FormLabel>
                  <div className="flex items-center border border-[#8D8D8D] rounded-lg overflow-hidden shadow-[-4px_4px_6px_0px_#0000001F] sm:h-16 h-14">
                    <div className="h-full px-3 sm:px-4 bg-gray-100 border-r border-[#8D8D8D] flex items-center font-semibold text-[#252525] sm:text-base text-sm whitespace-nowrap">
                      {values.country_code || defaultCountryCode || "-"}
                    </div>
                    <Field
                      type="text"
                      name="phone_no"
                      placeholder="Enter phone number"
                      className="flex-1 sm:px-5 px-4 h-full outline-none placeholder:text-[#6C6C6C] font-semibold"
                    />
                  </div>
                  <ErrorMessage name="country_code" component="div" className="text-red-500 text-sm mt-1" />
                  <ErrorMessage name="phone_no" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                <div className={fieldWrapClass}>
                  <FormLabel htmlFor="password">Password</FormLabel>
                  <div className="sm:h-16 h-14">
                    <Password
                      name="password"
                      className="sm:px-5 px-4 sm:py-[21px] py-4 !select-none border border-[#8D8D8D] rounded-lg w-full h-14 sm:h-16 shadow-[-4px_4px_6px_0px_#0000001F] placeholder:text-[#6C6C6C] sm:text-base text-sm leading-[22px] font-semibold"
                      placeholder={isEditMode ? "Leave blank to keep current" : "Enter password"}
                      autoComplete="new-password"
                    />
                  </div>
                  <ErrorMessage name="password" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                {!isEditMode && (
                  <div className={fieldWrapClass}>
                    <FormLabel htmlFor="profile_image">Profile Photo</FormLabel>
                    <div className="sm:h-16 h-14">
                      <input
                        type="file"
                        accept="image/*"
                        name="profile_image"
                        className={fileClass}
                        onChange={(event) => setFieldValue("profile_image", event.currentTarget.files?.[0] || null)}
                      />
                    </div>
                    {errors.profile_image && touched.profile_image && (
                      <div className="text-red-500 text-sm mt-1">{errors.profile_image}</div>
                    )}
                  </div>
                )}

                <div className={fieldWrapClass}>
                  <FormLabel htmlFor="gender">Gender</FormLabel>
                  <div className="sm:h-16 h-14">
                    <Field as="select" name="gender" className={inputClass}>
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </Field>
                  </div>
                  <ErrorMessage name="gender" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                <div className={fieldWrapClass}>
                  <FormLabel htmlFor="date_of_birth">Date of Birth</FormLabel>
                  <div className="sm:h-16 h-14">
                    <Field type="date" name="date_of_birth" className={inputClass} />
                  </div>
                  <ErrorMessage name="date_of_birth" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                <div className={fieldWrapClass}>
                  <FormLabel htmlFor="address">Address</FormLabel>
                  <div className="sm:h-16 h-14">
                    <Field type="text" name="address" className={inputClass} placeholder="Enter address" />
                  </div>
                  <ErrorMessage name="address" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                <div className={fieldWrapClass}>
                  <FormLabel htmlFor="city">City</FormLabel>
                  <div className="sm:h-16 h-14">
                    <Field type="text" name="city" className={inputClass} placeholder="Enter city" />
                  </div>
                  <ErrorMessage name="city" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                <div className={fieldWrapClass}>
                  <FormLabel htmlFor="country">Country</FormLabel>
                  <div className="sm:h-16 h-14">
                    <Field type="text" name="country" className={inputClass} placeholder="Enter country" />
                  </div>
                  <ErrorMessage name="country" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                <div className={fieldWrapClass}>
                  <FormLabel htmlFor="driver_license">Driver License Number</FormLabel>
                  <div className="sm:h-16 h-14">
                    <Field type="text" name="driver_license" className={inputClass} placeholder="Enter driver's license number" />
                  </div>
                  <ErrorMessage name="driver_license" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                <div className={fieldWrapClass}>
                  <FormLabel htmlFor="joined_date">Joined Date</FormLabel>
                  <div className="sm:h-16 h-14">
                    <Field type="date" name="joined_date" className={inputClass} />
                  </div>
                  <ErrorMessage name="joined_date" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                <div className={fieldWrapClass}>
                  <FormLabel htmlFor="sub_company">Sub Company</FormLabel>
                  <div className="sm:h-16 h-14">
                    <FormSelection
                      label="Select Sub Company"
                      name="sub_company"
                      value={values.sub_company}
                      onChange={(val) => setFieldValue("sub_company", val)}
                      placeholder="Select Sub Company"
                      options={subCompanyList}
                      disabled={loadingSubCompanies}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-[#252525] mb-4">Vehicle Information</h3>
              <div className="flex flex-wrap gap-5">
                <div className={fieldWrapClass}>
                  <FormLabel htmlFor="assigned_vehicle">Vehicle Type</FormLabel>
                  <div className="sm:h-16 h-14">
                    <FormSelection
                      label="Select Vehicle"
                      name="assigned_vehicle"
                      value={values.assigned_vehicle}
                      onChange={(val) => setFieldValue("assigned_vehicle", val)}
                      placeholder="Select Vehicle"
                      options={vehicleList}
                      disabled={loadingVehicles}
                    />
                  </div>
                  <ErrorMessage name="assigned_vehicle" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                <div className={fieldWrapClass}>
                  <FormLabel htmlFor="color">Vehicle Color</FormLabel>
                  <div className="sm:h-16 h-14">
                    <Field type="text" name="color" className={inputClass} placeholder="Enter vehicle color" />
                  </div>
                  <ErrorMessage name="color" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                <div className={fieldWrapClass}>
                  <FormLabel htmlFor="seats">Seats</FormLabel>
                  <div className="sm:h-16 h-14">
                    <Field type="number" name="seats" className={inputClass} placeholder="Enter seats" min="1" />
                  </div>
                  <ErrorMessage name="seats" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                <div className={fieldWrapClass}>
                  <FormLabel htmlFor="plate_no">Plate Number</FormLabel>
                  <div className="sm:h-16 h-14">
                    <Field type="text" name="plate_no" className={inputClass} placeholder="Enter plate number" />
                  </div>
                  <ErrorMessage name="plate_no" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                <div className={fieldWrapClass}>
                  <FormLabel htmlFor="vehicle_registration_date">Vehicle Registration Date</FormLabel>
                  <div className="sm:h-16 h-14">
                    <Field type="date" name="vehicle_registration_date" className={inputClass} />
                  </div>
                  <ErrorMessage name="vehicle_registration_date" component="div" className="text-red-500 text-sm mt-1" />
                </div>
              </div>
            </div>

            {!isEditMode && (
              <div className="mb-6 sm:mb-[60px]">
                <h3 className="text-lg font-semibold text-[#252525] mb-4">Driver Documents</h3>
                {loadingDocuments ? (
                  <div className="text-sm text-gray-500">Loading document requirements...</div>
                ) : documentRequirements.length === 0 ? (
                  <div className="text-sm text-gray-500">No document requirements configured.</div>
                ) : (
                  <div className="flex flex-col gap-5">
                    {documentRequirements.map((doc) => {
                      const docErrors = errors.documents?.[doc.key] || {};
                      const docTouched = touched.documents?.[doc.key] || {};

                      return (
                        <div key={doc.key} className="border border-[#D7D7D7] rounded-lg p-4">
                          <div className="font-semibold text-[#252525] mb-4">{doc.document_name}</div>
                          <div className="flex flex-wrap gap-5">
                            {doc.has_number_field === "yes" && (
                              <div className={fieldWrapClass}>
                                <FormLabel htmlFor={`documents.${doc.key}.number`}>Document Number</FormLabel>
                                <div className="sm:h-16 h-14">
                                  <Field name={`documents.${doc.key}.number`} className={inputClass} placeholder="Enter document number" />
                                </div>
                                {docErrors.number && docTouched.number && <div className="text-red-500 text-sm mt-1">{docErrors.number}</div>}
                              </div>
                            )}

                            {doc.has_issue_date === "yes" && (
                              <div className={fieldWrapClass}>
                                <FormLabel htmlFor={`documents.${doc.key}.issueDate`}>Issue Date</FormLabel>
                                <div className="sm:h-16 h-14">
                                  <Field type="date" name={`documents.${doc.key}.issueDate`} className={inputClass} />
                                </div>
                                {docErrors.issueDate && docTouched.issueDate && <div className="text-red-500 text-sm mt-1">{docErrors.issueDate}</div>}
                              </div>
                            )}

                            {doc.has_expiry_date === "yes" && (
                              <div className={fieldWrapClass}>
                                <FormLabel htmlFor={`documents.${doc.key}.expiryDate`}>Expiry Date</FormLabel>
                                <div className="sm:h-16 h-14">
                                  <Field type="date" name={`documents.${doc.key}.expiryDate`} className={inputClass} />
                                </div>
                                {docErrors.expiryDate && docTouched.expiryDate && <div className="text-red-500 text-sm mt-1">{docErrors.expiryDate}</div>}
                              </div>
                            )}

                            {doc.front_photo === "yes" && (
                              <div className={fieldWrapClass}>
                                <FormLabel>Front Photo</FormLabel>
                                <div className="sm:h-16 h-14">
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className={fileClass}
                                    onChange={(event) => setFieldValue(`documents.${doc.key}.frontPhoto`, event.currentTarget.files?.[0] || null)}
                                  />
                                </div>
                                {docErrors.frontPhoto && docTouched.frontPhoto && <div className="text-red-500 text-sm mt-1">{docErrors.frontPhoto}</div>}
                              </div>
                            )}

                            {doc.back_photo === "yes" && (
                              <div className={fieldWrapClass}>
                                <FormLabel>Back Photo</FormLabel>
                                <div className="sm:h-16 h-14">
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className={fileClass}
                                    onChange={(event) => setFieldValue(`documents.${doc.key}.backPhoto`, event.currentTarget.files?.[0] || null)}
                                  />
                                </div>
                                {docErrors.backPhoto && docTouched.backPhoto && <div className="text-red-500 text-sm mt-1">{docErrors.backPhoto}</div>}
                              </div>
                            )}

                            {doc.profile_photo === "yes" && (
                              <div className={fieldWrapClass}>
                                <FormLabel>Profile Photo</FormLabel>
                                <div className="sm:h-16 h-14">
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className={fileClass}
                                    onChange={(event) => setFieldValue(`documents.${doc.key}.profilePhoto`, event.currentTarget.files?.[0] || null)}
                                  />
                                </div>
                                {docErrors.profilePhoto && docTouched.profilePhoto && <div className="text-red-500 text-sm mt-1">{docErrors.profilePhoto}</div>}
                              </div>
                            )}

                            {doc.front_photo !== "yes" && doc.back_photo !== "yes" && doc.profile_photo !== "yes" && (
                              <div className={fieldWrapClass}>
                                <FormLabel>Document Image</FormLabel>
                                <div className="sm:h-16 h-14">
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className={fileClass}
                                    onChange={(event) => setFieldValue(`documents.${doc.key}.file`, event.currentTarget.files?.[0] || null)}
                                  />
                                </div>
                                {docErrors.file && docTouched.file && <div className="text-red-500 text-sm mt-1">{docErrors.file}</div>}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-5 justify-end">
              <Button
                btnSize="md"
                type="filledGray"
                className="!px-10 pt-4 pb-[15px] leading-[25px] w-full sm:w-auto"
                onClick={() => {
                  unlockBodyScroll();
                  setIsOpen({ type: "new", isOpen: false });
                }}
              >
                <span>Cancel</span>
              </Button>
              <Button
                btnType="submit"
                btnSize="md"
                type="filled"
                className="!px-10 pt-4 pb-[15px] leading-[25px] w-full sm:w-auto"
                disabled={isLoading}
              >
                <span>{isLoading ? (isEditMode ? "Updating..." : "Creating...") : (isEditMode ? "Update" : "Add Driver")}</span>
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default AddDriversManagementModal;
