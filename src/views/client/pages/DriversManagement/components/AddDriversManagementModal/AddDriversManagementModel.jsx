import { ErrorMessage, Field, Form, Formik } from "formik";
import { useState, useEffect } from "react";
import _ from "lodash";
import FormLabel from "../../../../../../components/ui/FormLabel/FormLabel";
import FormSelection from "../../../../../../components/ui/FormSelection/FormSelection";
import { unlockBodyScroll } from "../../../../../../utils/functions/common.function";
import Button from "../../../../../../components/ui/Button/Button";
import { apiCreateDriveManagement, apiEditDriverManagement } from "../../../../../../services/DriverManagementService";
import { apiGetSubCompany } from "../../../../../../services/SubCompanyServices";
import { DRIVER_VALIDATION_SCHEMA } from "../../../../validators/pages/driverManagement.validation";
import toast from "react-hot-toast";
import { apiGetAllVehicleType } from "../../../../../../services/VehicleTypeServices";
import { getTenantData } from "../../../../../../utils/functions/tokenEncryption";

const COUNTRY_CODE_MAP = {
  AF: "+93", AC: "+247", AL: "+355", DZ: "+213", AD: "+376",
  AO: "+244", AI: "+1264", AG: "+1268", AR: "+54", AM: "+374",
  AW: "+297", AU: "+61", AT: "+43", AZ: "+994", BS: "+1242",
  BH: "+973", BD: "+880", BB: "+1246", BY: "+375", BE: "+32",
  BZ: "+501", BJ: "+229", BM: "+1441", BT: "+975", BO: "+591",
  BA: "+387", BW: "+267", BR: "+55", BN: "+673", BG: "+359",
  BF: "+226", BI: "+257", KH: "+855", CM: "+237", CA: "+1",
  CV: "+238", KY: "+1345", CF: "+236", TD: "+235", CL: "+56",
  CN: "+86", CO: "+57", KM: "+269", CG: "+242", CD: "+243",
  CK: "+682", CR: "+506", HR: "+385", CU: "+53", CY: "+357",
  CZ: "+420", DK: "+45", DJ: "+253", DM: "+1767", DO: "+1809",
  EC: "+593", EG: "+20", SV: "+503", GQ: "+240", ER: "+291",
  EE: "+372", ET: "+251", FK: "+500", FO: "+298", FJ: "+679",
  FI: "+358", FR: "+33", GF: "+594", PF: "+689", GA: "+241",
  GM: "+220", GE: "+995", DE: "+49", GH: "+233", GI: "+350",
  GR: "+30", GL: "+299", GD: "+1473", GP: "+590", GU: "+1671",
  GT: "+502", GN: "+224", GW: "+245", GY: "+592", HT: "+509",
  HN: "+504", HK: "+852", HU: "+36", IS: "+354", IN: "+91",
  ID: "+62", IR: "+98", IQ: "+964", IE: "+353", IL: "+972",
  IT: "+39", JM: "+1876", JP: "+81", JO: "+962", KZ: "+7",
  KE: "+254", KI: "+686", KP: "+850", KR: "+82", KW: "+965",
  KG: "+996", LA: "+856", LV: "+371", LB: "+961", LS: "+266",
  LR: "+231", LY: "+218", LI: "+423", LT: "+370", LU: "+352",
  MO: "+853", MK: "+389", MG: "+261", MW: "+265", MY: "+60",
  MV: "+960", ML: "+223", MT: "+356", MH: "+692", MQ: "+596",
  MR: "+222", MU: "+230", MX: "+52", FM: "+691", MD: "+373",
  MC: "+377", MN: "+976", ME: "+382", MS: "+1664", MA: "+212",
  MZ: "+258", MM: "+95", NA: "+264", NR: "+674", NP: "+977",
  NL: "+31", NZ: "+64", NI: "+505", NE: "+227", NG: "+234",
  NU: "+683", NF: "+672", NO: "+47", OM: "+968", PK: "+92",
  PW: "+680", PS: "+970", PA: "+507", PG: "+675", PY: "+595",
  PE: "+51", PH: "+63", PL: "+48", PT: "+351", PR: "+1787",
  QA: "+974", RE: "+262", RO: "+40", RU: "+7", RW: "+250",
  KN: "+1869", LC: "+1758", VC: "+1784", WS: "+685", SM: "+378",
  ST: "+239", SA: "+966", SN: "+221", RS: "+381", SC: "+248",
  SL: "+232", SG: "+65", SK: "+421", SI: "+386", SB: "+677",
  SO: "+252", ZA: "+27", SS: "+211", ES: "+34", LK: "+94",
  SD: "+249", SR: "+597", SZ: "+268", SE: "+46", CH: "+41",
  SY: "+963", TW: "+886", TJ: "+992", TZ: "+255", TH: "+66",
  TL: "+670", TG: "+228", TO: "+676", TT: "+1868", TN: "+216",
  TR: "+90", TM: "+993", TC: "+1649", TV: "+688", UG: "+256",
  UA: "+380", AE: "+971", GB: "+44", US: "+1", UY: "+598",
  UZ: "+998", VU: "+678", VE: "+58", VN: "+84", VG: "+1284",
  VI: "+1340", YE: "+967", ZM: "+260", ZW: "+263",
};

const COUNTRY_CODE_OPTIONS = [
  ...new Map(
    Object.entries(COUNTRY_CODE_MAP).map(([code, dial]) => [dial, { label: `${dial} (${code})`, value: dial }])
  ).values()
].sort((a, b) => a.label.localeCompare(b.label));

const AddDriversManagementModal = ({ initialValue = {}, setIsOpen, onDriverCreated }) => {
  const [submitError, setSubmitError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [subCompanyList, setSubCompanyList] = useState([]);
  const [loadingSubCompanies, setLoadingSubCompanies] = useState(false);
  const [vehicleList, setVehicleList] = useState([]);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const tenantData = getTenantData();

  const defaultCountryCode =
    COUNTRY_CODE_MAP[tenantData?.country_of_use] || "";

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
          const options = companies.map(company => ({
            label: company.name,
            value: company.id.toString(),
          }));
          setSubCompanyList(options);
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
          const vehicletype = response?.data?.list || [];
          const options = vehicletype.map(v => ({
            label: v.vehicle_type_name,
            value: v.id.toString(),
          }));
          setVehicleList(options);
        }
      } catch (error) {
        console.error("Error fetching vehicle:", error);
      } finally {
        setLoadingVehicles(false);
      }
    };
    fetchVehicle();
  }, []);

  const handleSubmit = async (values) => {
    setIsLoading(true);

    try {
      const formDataObj = new FormData();

      if (isEditMode) {
        formDataObj.append("id", initialValue.id);
      }

      formDataObj.append("name", values.name || "");
      formDataObj.append("email", values.email || "");
      formDataObj.append("country_code", values.country_code || "");
      formDataObj.append("phone_no", values.phone_no || "");
      if (values.password) {
        formDataObj.append("password", values.password);
      }
      formDataObj.append("address", values.address || "");
      formDataObj.append("driver_license", values.driver_license || "");
      formDataObj.append("assigned_vehicle", values.assigned_vehicle || "");
      formDataObj.append("joined_date", values.joined_date || "");
      formDataObj.append("sub_company", values.sub_company || "");

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
        (isEditMode
          ? "Driver updated successfully"
          : "Driver created successfully"),
        { duration: 5000 }
      );

      if (onDriverCreated) {
        onDriverCreated();
      }

      unlockBodyScroll();
      setIsOpen({ type: "new", isOpen: false });

    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        "Server error",
        { duration: 5000 }
      );
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div>
      <Formik
        initialValues={{
          name: initialValue?.name || "",
          email: initialValue?.email || "",
          phone_no: initialValue?.phone_no || "",
          country_code: initialValue?.country_code || defaultCountryCode,
          password: "",
          address: initialValue?.address || "",
          driver_license: initialValue?.driver_license || "",
          assigned_vehicle: initialValue?.assigned_vehicle || "",
          joined_date: initialValue?.joined_date || "",
          sub_company: initialValue?.sub_company || "",
        }}
        validationSchema={DRIVER_VALIDATION_SCHEMA}
        onSubmit={handleSubmit}
        validateOnChange={true}
        validateOnBlur={true}
        enableReinitialize={true}
      >
        {({ values, setFieldValue, errors, touched }) => {
          return (
            <Form>
              <div className="text-xl sm:text-2xl lg:text-[26px] leading-7 sm:leading-8 lg:leading-9 font-semibold text-[#252525] mb-4 sm:mb-6 lg:mb-7 text-center mx-auto max-w-full sm:max-w-[85%] lg:max-w-[75%] w-full px-2">
                <span className="w-full text-center block truncate">
                  {isEditMode ? 'Edit Driver' : 'Add New Driver'}
                </span>
              </div>
              {submitError && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {submitError}
                </div>
              )}
              <div className="flex flex-wrap gap-5 mb-6 sm:mb-[60px]">
                <div className="w-[calc((100%-20px)/2)]">
                  <FormLabel htmlFor="name">Full Name</FormLabel>
                  <div className="sm:h-16 h-14">
                    <Field
                      type="text"
                      name="name"
                      className="sm:px-5 px-4 sm:py-[21px] py-4 border border-[#8D8D8D] rounded-lg w-full h-full shadow-[-4px_4px_6px_0px_#0000001F] placeholder:text-[#6C6C6C] sm:text-base text-sm leading-[22px] font-semibold"
                      placeholder="Enter full name"
                    />
                  </div>
                  <ErrorMessage
                    name="name"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
                <div className="w-[calc((100%-20px)/2)]">
                  <FormLabel htmlFor="email">Email</FormLabel>
                  <div className="sm:h-16 h-14">
                    <Field
                      type="email"
                      name="email"
                      className="sm:px-5 px-4 sm:py-[21px] py-4 border border-[#8D8D8D] rounded-lg w-full h-full shadow-[-4px_4px_6px_0px_#0000001F] placeholder:text-[#6C6C6C] sm:text-base text-sm leading-[22px] font-semibold"
                      placeholder="Enter Email"
                    />
                  </div>
                  <ErrorMessage
                    name="email"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
                <div className="w-[calc((100%-20px)/2)]">
                  <FormLabel htmlFor="phone_no">Phone Number</FormLabel>
                  <div className="flex items-center border border-[#8D8D8D] rounded-lg overflow-hidden shadow-[-4px_4px_6px_0px_#0000001F] sm:h-16 h-14">
                    {/* <Field
                      as="select"
                      name="country_code"
                      className="h-full px-3 sm:px-4 bg-gray-100 border-r border-[#8D8D8D] outline-none font-semibold"
                    >
                      {COUNTRY_CODE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.value}
                        </option>
                      ))}
                    </Field> */}
                    <div className="h-full px-3 sm:px-4 bg-gray-100 border-r border-[#8D8D8D] flex items-center font-semibold text-[#252525] sm:text-base text-sm whitespace-nowrap">
                      {values.country_code || defaultCountryCode || "+1"}
                    </div>
                    <Field
                      type="text"
                      name="phone_no"
                      placeholder="Enter phone number"
                      className="flex-1 sm:px-5 px-4 h-full outline-none placeholder:text-[#6C6C6C] font-semibold"
                    />
                  </div>
                  <ErrorMessage
                    name="country_code"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                  <ErrorMessage
                    name="phone_no"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
                {/* <div className="w-[calc((100%-20px)/2)]">
                  <FormLabel htmlFor="phone_no">Phone Number</FormLabel>
                  <div className="flex items-center border border-[#8D8D8D] rounded-lg overflow-hidden shadow-[-4px_4px_6px_0px_#0000001F] sm:h-16 h-14">
                    <Field
                      as="select"
                      name="country_code"
                      className="h-full px-3 sm:px-4 bg-gray-100 border-r border-[#8D8D8D] outline-none font-semibold"
                    >
                      <option value="+91">+91</option>
                      <option value="+92">+92</option>
                      <option value="+1">+1</option>
                      <option value="+44">+44</option>
                      <option value="+971">+971</option>
                    </Field>
                    <Field
                      type="text"
                      name="phone_no"
                      placeholder="Enter phone number"
                      className="flex-1 sm:px-5 px-4 h-full outline-none placeholder:text-[#6C6C6C] font-semibold"
                    />

                  </div>

                  <ErrorMessage name="country_code" component="div" className="text-red-500 text-sm mt-1" />
                  <ErrorMessage name="phone_no" component="div" className="text-red-500 text-sm mt-1" />
                </div> */}
                {/* <div className="w-[calc((100%-20px)/2)]">
                  <FormLabel htmlFor="password">Password</FormLabel>
                  <div className="sm:h-16 h-14">
                    <Field
                      type="password"
                      name="password"
                      className="sm:px-5 px-4 sm:py-[21px] py-4 border border-[#8D8D8D] rounded-lg w-full h-full shadow-[-4px_4px_6px_0px_#0000001F] placeholder:text-[#6C6C6C] sm:text-base text-sm leading-[22px] font-semibold"
                      placeholder={isEditMode ? "Leave blank to keep current" : "Enter Password"}
                    />
                  </div>
                  <ErrorMessage
                    name="password"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div> */}
                <div className="w-[calc((100%-20px)/2)]">
                  <FormLabel htmlFor="address">Address</FormLabel>
                  <div className="sm:h-16 h-14">
                    <Field
                      type="text"
                      name="address"
                      className="sm:px-5 px-4 sm:py-[21px] py-4 border border-[#8D8D8D] rounded-lg w-full h-full shadow-[-4px_4px_6px_0px_#0000001F] placeholder:text-[#6C6C6C] sm:text-base text-sm leading-[22px] font-semibold"
                      placeholder="Enter Address"
                    />
                  </div>
                  <ErrorMessage
                    name="address"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
                <div className="w-[calc((100%-20px)/2)]">
                  <FormLabel htmlFor="driver_license">Driver License Number</FormLabel>
                  <div className="sm:h-16 h-14">
                    <Field
                      type="text"
                      name="driver_license"
                      className="sm:px-5 px-4 sm:py-[21px] py-4 border border-[#8D8D8D] rounded-lg w-full h-full shadow-[-4px_4px_6px_0px_#0000001F] placeholder:text-[#6C6C6C] sm:text-base text-sm leading-[22px] font-semibold"
                      placeholder="Enter Driver's License Number"
                    />
                  </div>
                  <ErrorMessage
                    name="driver_license"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
                {/* <div className="w-[calc((100%-20px)/2)]">
                  <FormLabel htmlFor="assigned_vehicle">Assigned Vehicle</FormLabel>
                  <div className="sm:h-16 h-14">
                    <Field
                      type="text"
                      name="assigned_vehicle"
                      className="sm:px-5 px-4 sm:py-[21px] py-4 border border-[#8D8D8D] rounded-lg w-full h-full shadow-[-4px_4px_6px_0px_#0000001F] placeholder:text-[#6C6C6C] sm:text-base text-sm leading-[22px] font-semibold"
                      placeholder="Enter Assigned Vehicle"
                    />
                  </div>
                  <ErrorMessage
                    name="assigned_vehicle"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div> */}
                <div className="w-[calc((100%-20px)/2)]">
                  <FormLabel htmlFor="assigned_vehicle">Assigned Vehicle</FormLabel>
                  <div className="sm:h-16 h-14">
                    <FormSelection
                      label="Select Vehicle"
                      name="assigned_vehicle"
                      value={values.assigned_vehicle}
                      onChange={(val) => setFieldValue("assigned_vehicle", val)}
                      placeholder="Select Vehicle"
                      options={vehicleList}
                      disabled={loadingSubCompanies}
                    />
                  </div>
                  <ErrorMessage
                    name="assigned_vehicle"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
                <div className="w-[calc((100%-20px)/2)]">
                  <FormLabel htmlFor="joined_date">Joined Date</FormLabel>
                  <div className="sm:h-16 h-14">
                    <Field
                      type="date"
                      name="joined_date"
                      className="sm:px-5 px-4 sm:py-[21px] py-4 border border-[#8D8D8D] rounded-lg w-full h-full shadow-[-4px_4px_6px_0px_#0000001F] placeholder:text-[#6C6C6C] sm:text-base text-sm leading-[22px] font-semibold"
                    />
                    {/* <Field
                      type="datetime-local"
                      name="joined_date"
                      className="sm:px-5 px-4 sm:py-[21px] py-4 border border-[#8D8D8D] rounded-lg w-full h-full shadow-[-4px_4px_6px_0px_#0000001F] placeholder:text-[#6C6C6C] sm:text-base text-sm leading-[22px] font-semibold"
                    /> */}
                  </div>
                  <ErrorMessage
                    name="joined_date"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
                <div className="w-[calc((100%-20px)/2)]">
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
                  {/* <ErrorMessage
                    name="sub_company"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  /> */}
                </div>
              </div>
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
          );
        }}
      </Formik>
    </div>
  );
};

export default AddDriversManagementModal;