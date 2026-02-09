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

const AddDriversManagementModal = ({ initialValue = {}, setIsOpen, onDriverCreated }) => {
  const [submitError, setSubmitError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [subCompanyList, setSubCompanyList] = useState([]);
  const [loadingSubCompanies, setLoadingSubCompanies] = useState(false);

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
          country_code: initialValue?.country_code || "",
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

                    {/* Country Code */}
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

                    {/* Phone Number */}
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
                {/* <div className="w-[calc((100%-20px)/2)]">
                  <FormLabel htmlFor="phone_no">Phone Number</FormLabel>
                  <div className="sm:h-16 h-14">
                    <Field
                      type="text"
                      name="phone_no"
                      className="sm:px-5 px-4 sm:py-[21px] py-4 border border-[#8D8D8D] rounded-lg w-full h-full shadow-[-4px_4px_6px_0px_#0000001F] placeholder:text-[#6C6C6C] sm:text-base text-sm leading-[22px] font-semibold"
                      placeholder="Enter Phone Number"
                    />
                  </div>
                  <ErrorMessage
                    name="phone_no"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div> */}
                <div className="w-[calc((100%-20px)/2)]">
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
                </div>
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
                <div className="w-[calc((100%-20px)/2)]">
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
                </div>
                <div className="w-[calc((100%-20px)/2)]">
                  <FormLabel htmlFor="joined_date">Joined Date</FormLabel>
                  <div className="sm:h-16 h-14">
                    <Field
                      type="datetime-local"
                      name="joined_date"
                      className="sm:px-5 px-4 sm:py-[21px] py-4 border border-[#8D8D8D] rounded-lg w-full h-full shadow-[-4px_4px_6px_0px_#0000001F] placeholder:text-[#6C6C6C] sm:text-base text-sm leading-[22px] font-semibold"
                    />
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
                  <ErrorMessage
                    name="sub_company"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
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
