import { ErrorMessage, Field, Form, Formik } from "formik";
import React, { useRef, useState, useEffect } from "react";
import * as Yup from "yup";
import _ from "lodash";
import FormLabel from "../../../../../../components/ui/FormLabel/FormLabel";
import { unlockBodyScroll } from "../../../../../../utils/functions/common.function";
import Button from "../../../../../../components/ui/Button/Button";
import { apiCreateSubCompany, apiEditSubCompany, apiGetSubCompany } from "../../../../../../services/SubCompanyServices";
import FormSelection from "../../../../../../components/ui/FormSelection/FormSelection";

const SUB_COMPANY_VALIDATION_SCHEMA = Yup.object().shape({
    name: Yup.string()
        .required("Sub company name is required")
        .min(2, "Name must be at least 2 characters"),
    email: Yup.string()
        .email("Invalid email format")
        .required("Email is required"),
});

const AddBookingModel = ({ initialValue = {}, setIsOpen, onSubCompanyCreated }) => {
    const [submitError, setSubmitError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [subCompanyList, setSubCompanyList] = useState([]);
    const [loadingSubCompanies, setLoadingSubCompanies] = useState(false);
    const [googleLoaded, setGoogleLoaded] = useState(false);
    const setFieldValueRef = useRef(null);
    const autocompleteInstanceRef = useRef(null);

    useEffect(() => {
        setIsEditMode(!!initialValue?.id);
    }, [initialValue]);

    // Load Google Maps API with Places library
    useEffect(() => {
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

        // Check if script is already loaded
        if (window.google && window.google.maps && window.google.maps.places) {
            setGoogleLoaded(true);
            return;
        }

        // Check if script tag already exists
        const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
        if (existingScript) {
            existingScript.addEventListener('load', () => {
                setGoogleLoaded(true);
            });
            return;
        }

        // Create and load script
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => {
            setGoogleLoaded(true);
        };
        script.onerror = () => {
            console.error('Failed to load Google Maps API');
        };
        document.head.appendChild(script);

        return () => {
            // Cleanup: Remove script if component unmounts
            const scriptToRemove = document.querySelector('script[src*="maps.googleapis.com"]');
            if (scriptToRemove && scriptToRemove === script) {
                document.head.removeChild(script);
            }
        };
    }, []);

    const handleSubmit = async (values) => {
        setIsLoading(true);
        setSubmitError(null);

        try {
            const formDataObj = new FormData();

            if (isEditMode) {
                formDataObj.append('id', initialValue.id);
            }

            formDataObj.append('name', values.name || '');
            formDataObj.append('email', values.email || '');
            const response = isEditMode
                ? await apiEditSubCompany(formDataObj)
                : await apiCreateSubCompany(formDataObj);

            if (response?.data?.success === 1 || response?.status === 200) {
                if (onSubCompanyCreated) {
                    onSubCompanyCreated();
                }
                unlockBodyScroll();
                setIsOpen({ type: "new", isOpen: false });
            } else {
                setSubmitError(response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} sub-company`);
            }
        } catch (error) {
            console.error(`Sub-company ${isEditMode ? 'edit' : 'creation'} error:`, error);
            setSubmitError(error?.response?.data?.message || error?.message || `Error ${isEditMode ? 'updating' : 'creating'} sub-company`);
        } finally {
            setIsLoading(false);
        }
    };

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

    return (
        <div>
            <Formik
                initialValues={{
                    name: initialValue?.name || "",
                    email: initialValue?.email || "",
                    pickup_point: initialValue?.pickup_point || "",
                }}
                validationSchema={SUB_COMPANY_VALIDATION_SCHEMA}
                onSubmit={handleSubmit}
            >
                {({ values, setFieldValue }) => {
                    // Store setFieldValue in ref for use in autocomplete callback
                    setFieldValueRef.current = setFieldValue;

                    // Initialize Places Autocomplete using callback ref
                    const pickupInputRef = (inputElement) => {
                        if (!inputElement) {
                            // Cleanup on unmount
                            if (autocompleteInstanceRef.current) {
                                window.google.maps?.event?.clearInstanceListeners(autocompleteInstanceRef.current);
                                autocompleteInstanceRef.current = null;
                            }
                            return;
                        }

                        if (!googleLoaded || autocompleteInstanceRef.current) return;

                        // Wait a bit for Google to be fully ready
                        setTimeout(() => {
                            if (!window.google?.maps?.places) return;

                            try {
                                // Cleanup existing autocomplete if any
                                if (autocompleteInstanceRef.current) {
                                    window.google.maps.event.clearInstanceListeners(autocompleteInstanceRef.current);
                                }

                                // Initialize Autocomplete
                                const autocomplete = new window.google.maps.places.Autocomplete(
                                    inputElement,
                                    {
                                        types: ['address', 'establishment'],
                                        componentRestrictions: { country: [] }, // Remove country restriction for global search
                                        fields: ['formatted_address', 'geometry', 'name', 'place_id']
                                    }
                                );

                                autocompleteInstanceRef.current = autocomplete;

                                // Handle place selection
                                autocomplete.addListener('place_changed', () => {
                                    const place = autocomplete.getPlace();
                                    if (place && place.formatted_address && setFieldValueRef.current) {
                                        // Update Formik field value
                                        setFieldValueRef.current('pickup_point', place.formatted_address);

                                        // You can access place details here:
                                        // place.geometry.location.lat() - latitude
                                        // place.geometry.location.lng() - longitude
                                        // place.formatted_address - full address
                                        // place.name - place name
                                        console.log('Selected place:', place);
                                    }
                                });
                            } catch (error) {
                                console.error('Error initializing Google Places Autocomplete:', error);
                            }
                        }, 100);
                    };

                    return (
                        <Form>
                            <div className="w-full">
                                <div className="space-y-4 w-full">
                                    <div class="w-full flex max-sm:flex-col md:items-center gap-4">
                                        <h2 className="text-x font-semibold">Create New Booking</h2>
                                        <div className="flex md:flex-row flex-col md:gap-4 gap-0 md:items-center">
                                            <FormLabel htmlFor="sub_company">Sub Company</FormLabel>
                                            <div className="h-16 md:w-80 w-full">
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
                                        <div class="flex items-center max-sm:justify-center border border-gray-300 rounded-md px-2 py-2">
                                            <span class="text-sm mr-2">Single Booking</span>

                                            <label class="relative inline-flex items-center cursor-pointer ">
                                                <input type="checkbox" class="sr-only peer" />
                                                <div class="w-10 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:bg-green-400 transition-all"></div>
                                                <div
                                                    class="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-5 transition-all">
                                                </div>
                                            </label>

                                            <span className="text-sm ml-2">Multi Booking</span>
                                        </div>

                                    </div>


                                    {/* Form + Map */}
                                    <div className="w-full bg-white">
                                        <div className="grid grid-cols-1 lg:grid-cols-3  gap-4">

                                            {/* ------------------ LEFT SIDE FORM ------------------ */}
                                            <div className="lg:col-span-2 space-y-4">

                                                {/* Pick up time / Date / Booking Type */}
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
                                                    <div className="flex w-full items-center gap-2 md:text-center">
                                                        <label className="text-sm font-semibold md:text-center">Pick up Time</label>
                                                        <select className="border rounded-lg px-3 py-2 text-sm w-full">
                                                            <option>ASAP</option>
                                                        </select>
                                                    </div>

                                                    <div className="flex w-full items-center gap-2 md:text-center">
                                                        <label className="text-sm font-semibold mb-1">Date</label>
                                                        <input
                                                            type="date"
                                                            className="border rounded-lg px-3 py-2 text-sm w-full"
                                                        />
                                                    </div>

                                                    <div className="flex w-full items-center gap-2 md:text-center">
                                                        <label className="text-sm font-semibold mb-1">Booking Type</label>
                                                        <select className="border rounded-lg px-3 py-2 text-sm w-full">
                                                            <option>Local</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                {/* Pickup */}
                                                <div className="flex max-sm:flex-col gap-4 w-full">
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div className="md:text-center max-sm:flex-col flex md:items-center gap-2">
                                                            <label className="text-sm font-semibold mb-1">PickupPoint</label>
                                                            <input
                                                                ref={pickupInputRef}
                                                                type="text"
                                                                name="pickup_point"
                                                                value={values.pickup_point || ''}
                                                                onChange={(e) => setFieldValue('pickup_point', e.target.value)}
                                                                placeholder="Search location..."
                                                                className="border rounded-lg px-3 py-2 w-full"
                                                                autoComplete="off"
                                                            />
                                                        </div>

                                                        <div className="text-center flex items-center gap-2 max-sm:mt-8">
                                                            <input
                                                                type="text"
                                                                placeholder="Plot 1"
                                                                className="border rounded-lg px-3 py-2 w-full"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="text-center flex items-center max-sm:justify-end gap-2">
                                                        <button className="px-2 py-2 w-24 border rounded-lg bg-blue-50 text-blue-600  hover:bg-blue-100">
                                                            +Via
                                                        </button>
                                                    </div>
                                                </div>
                                                {/* Destination  */}
                                                <div className="flex max-sm:flex-col gap-4 w-full">
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div className="md:text-center max-sm:flex-col flex md:items-center gap-2">
                                                            <label className="text-sm font-semibold mb-1">Destination</label>
                                                            <input
                                                                type="text"
                                                                placeholder="Enter Pickup Point"
                                                                className="border rounded-lg px-3 py-2 w-full"
                                                            />
                                                        </div>

                                                        <div className="text-center flex items-center gap-2 max-sm:mt-8">
                                                            <input
                                                                type="text"
                                                                placeholder="Plot 1"
                                                                className="border rounded-lg px-3 py-2 w-full"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="text-center flex items-center max-sm:justify-end gap-2">
                                                        <button className="px-2 py-2 w-24 border rounded-lg bg-blue-50 text-blue-600  hover:bg-blue-100">
                                                            ⇅ swap
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="flex md:flex-row flex-col gap-4">
                                                    <div className="w-full gap-3 grid">
                                                        <div className="flex md:flex-row flex-col gap-4">
                                                            <div className="text-center flex items-center gap-2 w-full">
                                                                <label className="text-sm font-semibold mb-1">Name</label>
                                                                <input
                                                                    type="text"
                                                                    placeholder="Enter Name"
                                                                    className="border rounded-lg px-3 py-2 w-full"
                                                                />
                                                            </div>

                                                            <div className="text-center flex items-center gap-2 w-full">
                                                                <label className="text-sm font-semibold mb-1 ">Email</label>
                                                                <input
                                                                    type="text"
                                                                    placeholder="Enter Email"
                                                                    className="border rounded-lg px-3 py-2 w-full"
                                                                />
                                                            </div>

                                                        </div>

                                                        {/* Mobile / Tel */}
                                                        <div className="flex md:flex-row flex-col gap-4">
                                                            <div className="text-center flex items-center gap-2 w-full">
                                                                <label className="text-sm font-semibold mb-1">Mobile No</label>
                                                                <input
                                                                    type="text"
                                                                    placeholder="Enter Mobile No"
                                                                    className="border rounded-lg px-3 py-2 w-full"
                                                                />
                                                            </div>

                                                            <div className="text-center flex items-center gap-2 w-full">
                                                                <label className="text-sm font-semibold mb-1">Tel No.</label>
                                                                <input
                                                                    type="text"
                                                                    placeholder="Enter Email"
                                                                    className="border rounded-lg px-3 py-2 w-full"
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Journey */}
                                                        <div className="w-full">
                                                            <div className="md:flex-row flex-col flex gap-4">
                                                                <div className="text-center flex items-center gap-2">
                                                                    <label className="text-sm font-semibold">Journey</label>
                                                                    <div className="flex items-center gap-2">
                                                                        <label className="flex items-center gap-1">
                                                                            <input type="radio" name="journey" defaultChecked />
                                                                            One Way
                                                                        </label>

                                                                        <label className="flex items-center gap-1">
                                                                            <input type="radio" name="journey" />
                                                                            Return
                                                                        </label>

                                                                        <label className="flex items-center gap-1">
                                                                            <input type="radio" name="journey" />
                                                                            W/R
                                                                        </label>
                                                                    </div>
                                                                </div>
                                                                {/* Accounts */}
                                                                <div className="flex gap-4">
                                                                    <div className="text-center flex items-center gap-2 w-full">
                                                                        <label className="text-sm font-semibold mb-1">Accounts</label>
                                                                        <select className="border rounded-lg px-3 py-2 w-full">
                                                                            <option>Select Account</option>
                                                                        </select>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Driver */}
                                                        <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
                                                            <div className="text-center flex items-center gap-2 ">
                                                                <label className="text-sm font-semibold mb-1">vehicle</label>
                                                                <select className="border rounded-lg px-3 py-2 w-full">
                                                                    <option>Select vehicle</option>
                                                                </select>
                                                            </div>
                                                            <div className="text-center flex items-center gap-2">
                                                                <label className="text-sm font-semibold mb-1">Driver</label>
                                                                <select className="border rounded-lg px-3 py-2 w-full">
                                                                    <option>Select Driver</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {/* Auto Dispatch + Bidding */}
                                                    <div className="border rounded-lg h-24 md:mt-14 px-4 py-4 md:w-52 w-full bg-white shadow-sm">
                                                        <div className="flex flex-col gap-3">
                                                            <label className="flex items-center gap-2">
                                                                <input type="checkbox" defaultChecked />
                                                                Auto Dispatch
                                                            </label>

                                                            <label className="flex items-center gap-2">
                                                                <input type="checkbox" defaultChecked />
                                                                Bidding
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* Passenger / Luggage */}
                                                <div className="grid md:grid-cols-3 grid-cols-1 gap-4">
                                                    <div className="text-center flex items-center gap-2">
                                                        <label className="text-sm font-semibold mb-1">Passenger</label>
                                                        <input
                                                            type="number"
                                                            className="border rounded-lg px-3 py-2 w-full"
                                                            defaultValue="0"
                                                        />
                                                    </div>

                                                    <div className="text-center flex items-center gap-2">
                                                        <label className="text-sm font-semibold mb-1">Luggage</label>
                                                        <input
                                                            type="number"
                                                            className="border rounded-lg px-3 py-2 w-full"
                                                            defaultValue="0"
                                                        />
                                                    </div>

                                                    <div className="text-center flex items-center gap-2">
                                                        <label className="text-sm font-semibold mb-1">
                                                            Hand Luggage
                                                        </label>
                                                        <input
                                                            type="number"
                                                            className="border rounded-lg px-3 py-2 w-full"
                                                            defaultValue="0"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="grid md:grid-cols-2 grid-cols-1 gap-4 ">                                                            <div className="text-center flex items-center gap-2">
                                                    <label className="text-sm font-semibold mb-1">Special Req</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Write here..."
                                                        className="border rounded-lg px-3 py-2 w-full"
                                                    />
                                                </div>
                                                    <div className="text-center flex items-center gap-2">
                                                        <label className="text-sm font-semibold mb-1">Payment Ref</label>
                                                        <input
                                                            type="text"
                                                            placeholder="Write here..."
                                                            className="border rounded-lg px-3 py-2 w-full"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* ------------------ RIGHT SIDE MAP ------------------ */}
                                            <div>
                                                <div className="w-full h-full rounded-xl overflow-hidden border">
                                                    <iframe
                                                        title="map"
                                                        width="100%"
                                                        height="100%"
                                                        loading="lazy"
                                                        allowFullScreen
                                                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2371.276..."
                                                    ></iframe>
                                                </div>
                                            </div>
                                        </div>
                                        {/* ===================== CHARGES ===================== */}
                                        <div className="bg-blue-50 p-4 rounded-lg space-y-4 mt-7">

                                            {/* Header */}
                                            <div className="flex justify-between items-center">
                                                <h3 className="font-semibold text-xl">Charges</h3>

                                                <div className="flex gap-2">
                                                    <Button
                                                        type="button"
                                                        className="px-4 py-3 text-xs bg-blue-600 text-white rounded"
                                                    >
                                                        Calculate Fares
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        className="px-4 py-3 text-xs bg-blue-600 text-white rounded"
                                                    >
                                                        Show Map
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Payment Row */}
                                            <div className="flex  gap-4 items-center">
                                                <div className="flex items-center gap-2">
                                                    <label className="text-sm font-medium">Payment Ref</label>
                                                </div>

                                                <label className="flex items-center gap-2 text-sm">
                                                    <input
                                                        type="checkbox"
                                                        checked={values.quoted || false}
                                                        onChange={(e) =>
                                                            setFieldValue("quoted", e.target.checked)
                                                        }
                                                    />
                                                    Quoted
                                                </label>

                                                <select
                                                    value={values.payment_mode}
                                                    onChange={(e) =>
                                                        setFieldValue("payment_mode", e.target.value)
                                                    }
                                                    className="border rounded px-2 py-1 w-48"
                                                >
                                                    <option value="cash">Cash</option>
                                                    <option value="card">Card</option>
                                                    <option value="upi">UPI</option>
                                                </select>
                                            </div>

                                            {/* Charges Grid */}
                                            <div className="grid md:grid-cols-4 grid-cols-1 gap-4">

                                                {/* Row 1 */}
                                                <ChargeInput label="Fares" name="fares" {...{ values, setFieldValue }} />
                                                <ChargeInput label="Return Fares" name="return_fares" {...{ values, setFieldValue }} />
                                                <ChargeInput label="Parking Charges" name="parking_charges" {...{ values, setFieldValue }} />
                                                <ChargeInput label="Booking Fees Charges" name="booking_fee_charges" {...{ values, setFieldValue }} />

                                                {/* Row 2 */}
                                                <ChargeInput label="AC Fares" name="ac_fares" {...{ values, setFieldValue }} />
                                                <ChargeInput label="Return AC Fares" name="return_ac_fares" {...{ values, setFieldValue }} />
                                                <ChargeInput label="AC Parking Charges" name="ac_parking_charges" {...{ values, setFieldValue }} />
                                                <ChargeInput label="Waiting Charges" name="waiting_charges" {...{ values, setFieldValue }} />

                                                {/* Row 3 */}
                                                <ChargeInput label="Extra Charges" name="extra_charges" {...{ values, setFieldValue }} />
                                                <ChargeInput label="Congestion / Toll" name="congestion_toll" {...{ values, setFieldValue }} />
                                                <ChargeInput label="Total Charges" name="total_charges" {...{ values, setFieldValue }} />
                                                <ChargeInput label="AC Waiting Charges" name="ac_waiting_charges" {...{ values, setFieldValue }} />

                                                {/* Row 4 */}
                                                <ChargeInput label="Waiting Time" name="waiting_time" {...{ values, setFieldValue }} />
                                            </div>
                                        </div>


                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-5 justify-end mt-3">
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
                                    <span>{isLoading ? (isEditMode ? "Updating..." : "Creating...") : (isEditMode ? "Update" : "Add")}</span>
                                </Button>
                            </div>
                        </Form>
                    );
                }}
            </Formik>
        </div >
    );
};

export default AddBookingModel;
const ChargeInput = ({ label, name, values, setFieldValue }) => (
    <div className="flex items-center gap-2">
        <label className="text-sm font-medium w-40">{label}</label>
        <input
            type="number"
            value={values[name] || 0}
            onChange={(e) =>
                setFieldValue(name, Number(e.target.value))
            }
            className="border rounded px-2 py-1 w-full"
        />
    </div>
);