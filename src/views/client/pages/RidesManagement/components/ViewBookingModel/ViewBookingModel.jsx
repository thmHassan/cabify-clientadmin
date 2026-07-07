import { ErrorMessage, Field, Form, Formik } from "formik";
import { useRef, useState, useEffect } from "react";
import { unlockBodyScroll } from "../../../../../../utils/functions/common.function";
import Button from "../../../../../../components/ui/Button/Button";
import { useMapConfig } from "../../../../../../contexts/MapConfigContext";
import useDistanceUnit from "../../../../../../utils/hooks/useDistanceUnit";
import { formatDistanceFromBooking } from "../../../../../../utils/tenantFormatUtils";

const ViewBookingModel = ({ initialValue, setIsOpen }) => {
    const { googleKey, provider } = useMapConfig();
    const distanceUnit = useDistanceUnit();
    const [isLoading, setIsLoading] = useState(false);
    const [rideData, setRideData] = useState(null);
    const [destinationPlotData, setDestinationPlotData] = useState("");
    const [mapUrl, setMapUrl] = useState("https://www.google.com/maps/embed");

    // Format the ride data when initialValue changes
    useEffect(() => {
        if (initialValue) {
            setRideData(initialValue);

            // Update map if coordinates are available
            if (initialValue.pickup_point && initialValue.destination_point) {
                const pickup = initialValue.pickup_point.split(',').map(v => v.trim());
                const destination = initialValue.destination_point.split(',').map(v => v.trim());

                if (pickup.length === 2 && destination.length === 2 && provider === "google" && googleKey) {
                    let waypointsStr = "";
                    if (initialValue.via_point) {
                        try {
                            const vias = typeof initialValue.via_point === 'string' ? JSON.parse(initialValue.via_point) : initialValue.via_point;
                            if (Array.isArray(vias) && vias.length > 0) {
                                waypointsStr = "&waypoints=" + vias.map(v => `${v.latitude},${v.longitude}`).join('|');
                            }
                        } catch (e) {
                            console.error("Error parsing via_point", e);
                        }
                    }

                    const url = `https://www.google.com/maps/embed/v1/directions?key=${googleKey}&origin=${pickup[0]},${pickup[1]}&destination=${destination[0]},${destination[1]}${waypointsStr}&zoom=12`;

                    setMapUrl(url);
                } else {
                    setMapUrl("https://www.google.com/maps/embed");
                }
            }
        }
    }, [initialValue, googleKey, provider]);

    const chargeFields = [
        "fares",
        "return_fares",
        "waiting_time",
        "parking_charges",
        "ac_fares",
        "return_ac_fares",
        "ac_parking_charges",
        "waiting_charges",
        "extra_charges",
        "congestion_toll",
        "ac_waiting_charges",
    ];

    const parseViaLocations = (val) => {
        if (!val) return [];
        try {
            return typeof val === 'string' ? JSON.parse(val) : val;
        } catch (e) {
            return [];
        }
    };

    const parseViaPoints = (val) => {
        if (!val) return [];
        try {
            return typeof val === 'string' ? JSON.parse(val) : val;
        } catch (e) {
            return [];
        }
    };

    return (
        <div className="w-full">
            <Formik
                initialValues={{
                    sub_company: rideData?.sub_company || "",
                    multi_booking: rideData?.multi_booking || "no",
                    multi_days: rideData?.multi_days && rideData.multi_days !== null && rideData.multi_days !== "null"
                        ? rideData.multi_days.split(',').map(day => day.trim())
                        : [],
                    week_pattern: rideData?.week || "",
                    multi_start_at: rideData?.start_at || "",
                    multi_end_at: rideData?.end_at || "",
                    pickup_time_type: rideData?.pickup_time ? "time" : "asap",
                    pickup_time: rideData?.pickup_time || "",
                    booking_date: rideData?.booking_date || "",
                    booking_type: rideData?.booking_type || "local",
                    pickup_point: rideData?.pickup_location || "",
                    destination: rideData?.destination_location || "",
                    via_locations: parseViaLocations(rideData?.via_location),
                    via_points: parseViaPoints(rideData?.via_point),
                    name: rideData?.name || "",
                    email: rideData?.email || "",
                    phone_no: rideData?.phone_no || "",
                    tel_no: rideData?.tel_no || "",
                    journey_type: rideData?.journey_type || "one_way",
                    account: rideData?.account || "",
                    vehicle: rideData?.vehicle || "",
                    driver: rideData?.driver || "",
                    passenger: rideData?.passenger || 0,
                    luggage: rideData?.luggage || 0,
                    hand_luggage: rideData?.hand_luggage || 0,
                    special_request: rideData?.special_request || "",
                    payment_reference: rideData?.payment_reference || "",
                    payment_method: rideData?.payment_method || "Cash",
                    booking_fee_charges: 0,
                    fares: parseFloat(rideData?.booking_amount) || 0,
                    return_fares: 0,
                    waiting_time: 0,
                    parking_charges: parseFloat(rideData?.parking_charge) || 0,
                    ac_fares: parseFloat(rideData?.ac_fares) || 0,
                    return_ac_fares: parseFloat(rideData?.return_ac_fares) || 0,
                    waiting_charges: parseFloat(rideData?.waiting_charge) || 0,
                    ac_parking_charges: parseFloat(rideData?.ac_parking_charge) || 0,
                    extra_charges: parseFloat(rideData?.extra_charge) || 0,
                    congestion_toll: parseFloat(rideData?.toll) || 0,
                    ac_waiting_charges: parseFloat(rideData?.ac_waiting_charge) || 0,
                    total_charges: parseFloat(rideData?.booking_amount) || 0,
                }}
                enableReinitialize
            >
                {({ values, setFieldValue }) => {
                    return (
                        <Form>
                            <div className="w-full flex flex-col gap-6 p-4 md:p-8">
                                <div className="w-full flex max-sm:flex-col md:items-center gap-4">
                                    <h2 className="text-xl font-semibold whitespace-nowrap">View Booking - #{rideData?.booking_id || 'N/A'}</h2>

                                    {rideData?.booking_status && (
                                        <span className={`px-3 py-1 rounded-full w-fit h-fit text-sm font-medium ${rideData.booking_status === 'completed' ? 'bg-green-100 text-green-800' :
                                            rideData.booking_status === 'pending' ? 'bg-[#F5C60B] text-white' :
                                                rideData.booking_status === 'cancelled' ? 'bg-[#FF4747] text-white' :
                                                    rideData.booking_status === 'waiting' ? 'bg-[#1F41BB] text-white' :
                                                        rideData.booking_status === 'arrived' ? 'bg-purple-100 text-white' :
                                                            'bg-gray-100 text-gray-800'
                                            }`}>
                                            {rideData.booking_status.toUpperCase()}
                                        </span>
                                    )}

                                    <div className="flex md:flex-row flex-col md:gap-4 gap-0 md:items-center flex-1">
                                        <div className="md:w-72 w-full">
                                            <input
                                                type="text"
                                                name="sub_company"
                                                value={rideData?.sub_company_detail?.name || "Select Sub Company"}
                                                className="w-full border-[1.5px] border-[#8D8D8D] px-3 py-2 rounded-[8px] bg-gray-50"
                                                disabled
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center rounded-[8px] px-3 py-2 border-[1.5px] shadow-lg border-[#8D8D8D] bg-white">
                                        <span className="text-sm mr-2">
                                            {values.multi_booking === "yes" ? "Multi Booking" : "Single Booking"}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex xl:flex-row lg:flex-row md:flex-col flex-col gap-4 mb-2">
                                    <div className="flex-1 space-y-4">
                                        {values.multi_booking === "yes" && (
                                            <div className="w-full space-y-3 p-3 border rounded-lg bg-gray-50">
                                                <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-3">
                                                    <span className="font-semibold text-sm">
                                                        Select day of the week
                                                    </span>
                                                    <div className="flex flex-wrap gap-2">
                                                        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => {
                                                            const isChecked = values.multi_days.includes(day.toLowerCase());
                                                            return (
                                                                <label key={day} className="flex items-center gap-2 text-sm cursor-pointer opacity-70">
                                                                    <input type="checkbox" checked={isChecked} disabled className="w-4 h-4 accent-[#1F41BB]" />
                                                                    {day}
                                                                </label>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                                <div className="grid md:grid-cols-3 grid-cols-1 items-center gap-4">
                                                    <div className="flex gap-2">
                                                        <label className="text-sm font-semibold mb-1 block whitespace-nowrap">Week</label>
                                                        <input
                                                            readOnly
                                                            className="border-[1.5px] border-[#8D8D8D] rounded-[8px] px-3 py-2 text-sm w-full bg-white"
                                                            value={values.week_pattern === "every" ? "Every Week" : values.week_pattern === "alternate" ? "Alternate Weeks" : "Every 1st Days of Week"}
                                                        />
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <label className="text-sm font-semibold mb-1 block whitespace-nowrap">Start At</label>
                                                        <input type="date" className="border-[1.5px] border-[#8D8D8D] rounded-[8px] px-3 py-2 text-sm w-full bg-white" value={values.multi_start_at || ""} disabled />
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <label className="text-sm font-semibold mb-1 block whitespace-nowrap">End At</label>
                                                        <input type="date" className="border-[1.5px] border-[#8D8D8D] rounded-[8px] px-3 py-2 text-sm w-full bg-white" value={values.multi_end_at || ""} disabled />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
                                            <div className="flex w-full items-center gap-2">
                                                <label className="text-sm font-semibold w-24">Pick up Time</label>
                                                <input
                                                    type="text"
                                                    className="border-[1.5px] shadow-lg border-[#8D8D8D] rounded-[8px] px-3 py-2 text-sm w-full bg-gray-50"
                                                    value={values.pickup_time || "asap"}
                                                    readOnly
                                                />
                                            </div>
                                            <div className="flex w-full items-center gap-2">
                                                <label className="text-sm font-semibold w-20">Date</label>
                                                <input
                                                    type="date"
                                                    className="border-[1.5px] shadow-lg border-[#8D8D8D] rounded-[8px] px-3 py-2 text-sm w-full bg-gray-50"
                                                    value={values.booking_date || ""}
                                                    disabled
                                                />
                                            </div>

                                            <div className="flex w-full items-center gap-2">
                                                <label className="text-sm font-semibold w-24">Booking Type</label>
                                                <input
                                                    type="text"
                                                    className="border-[1.5px] shadow-lg border-[#8D8D8D] rounded-[8px] px-3 py-2 text-sm w-full bg-gray-50 capitalize"
                                                    value={values.booking_type || ""}
                                                    readOnly
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            {/* Pickup Point */}
                                            <div className="relative flex gap-2 w-full flex-col md:flex-row">
                                                <InputBox
                                                    label="Pick up Point"
                                                    type="text"
                                                    name="pickup_point"
                                                    value={values.pickup_point || ''}
                                                    placeholder="Pickup location"
                                                    readOnly
                                                    plot={rideData?.pickup_point || ""}
                                                />
                                            </div>

                                            {/* Via Points */}
                                            {values.via_locations && values.via_locations.map((loc, i) => (
                                                <div key={i} className="relative flex gap-2 w-full flex-col md:flex-row">
                                                    <InputBox
                                                        label={`Via Point ${i + 1}`}
                                                        type="text"
                                                        name={`via_points[${i}]`}
                                                        value={loc || ''}
                                                        placeholder="Via location"
                                                        readOnly
                                                        plot={values.via_points[i] ? `${values.via_points[i].latitude}, ${values.via_points[i].longitude}` : ""}
                                                    />
                                                </div>
                                            ))}

                                            {/* Destination */}
                                            <div className="relative flex gap-2 w-full flex-col md:flex-row">
                                                <InputBox
                                                    label="Desti-nation"
                                                    type="text"
                                                    name="destination"
                                                    value={values.destination || ''}
                                                    placeholder="Destination location"
                                                    readOnly
                                                    plot={rideData?.destination_point || ""}
                                                />
                                            </div>
                                        </div>

                                        <div className="w-full gap-3 grid">
                                            <div className="flex md:flex-row flex-col gap-2">
                                                <div className="text-left flex flex-1 items-center gap-2">
                                                    <label className="text-sm font-semibold md:w-28 w-24">Name</label>
                                                    <input
                                                        type="text"
                                                        className="border-[1.5px] shadow-lg border-[#8D8D8D] rounded-[8px] px-3 py-2 w-full bg-gray-50"
                                                        value={values.name || ""}
                                                        disabled
                                                    />
                                                </div>

                                                <div className="text-left flex flex-1 items-center gap-2">
                                                    <label className="text-sm font-semibold md:w-16 w-24">Email</label>
                                                    <input
                                                        type="text"
                                                        className="border-[1.5px] shadow-lg border-[#8D8D8D] rounded-[8px] px-3 py-2 w-full bg-gray-50"
                                                        value={values.email || ""}
                                                        disabled
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex md:flex-row flex-col gap-2">
                                                <div className="text-left flex flex-1 items-center gap-2">
                                                    <label className="text-sm font-semibold md:w-28 w-24">Mobile No</label>
                                                    <input
                                                        type="text"
                                                        className="border-[1.5px] shadow-lg border-[#8D8D8D] rounded-[8px] px-3 py-2 w-full bg-gray-50"
                                                        value={values.phone_no || ""}
                                                        disabled
                                                    />
                                                </div>

                                                <div className="text-left flex flex-1 items-center gap-2">
                                                    <label className="text-sm font-semibold md:w-16 w-24">Tel No.</label>
                                                    <input
                                                        type="text"
                                                        className="border-[1.5px] shadow-lg border-[#8D8D8D] rounded-[8px] px-3 py-2 w-full bg-gray-50"
                                                        value={values.tel_no || ""}
                                                        disabled
                                                    />
                                                </div>
                                            </div>

                                            <div className="md:flex-row flex-col flex gap-2 w-full">
                                                <div className="text-left flex items-center gap-2">
                                                    <label className="text-sm font-semibold w-24 md:w-20">Journey</label>
                                                    <div className="flex items-center gap-2">
                                                        {[{ val: "one_way", label: "One Way" }, { val: "return", label: "Return" }, { val: "wr", label: "W/R" }].map(({ val, label }) => (
                                                            <label key={val} className="flex items-center gap-1 text-sm opacity-80">
                                                                <input type="radio" name="journey" checked={values.journey_type === val} disabled />
                                                                {label}
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <label className="text-sm font-semibold md:w-24 w-24">Accounts</label>
                                                        <input
                                                            value={rideData?.account_detail?.name || ""}
                                                            className="border-[1.5px] border-[#8D8D8D] rounded-[8px] px-2 py-2 w-full bg-gray-50"
                                                            disabled
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex gap-2 w-full md:flex-row flex-col">
                                                <div className="flex md:flex-row items-center flex-row gap-2 w-full">
                                                    <label className="text-sm font-semibold md:w-24 w-24">Vehicle</label>
                                                    <input
                                                        type="text"
                                                        value={rideData?.vehicle_detail?.vehicle_type_name || ""}
                                                        className="border-[1.5px] shadow-lg border-[#8D8D8D] rounded-[8px] px-3 py-2 w-full bg-gray-50"
                                                        disabled
                                                    />
                                                </div>

                                                <div className="flex md:flex-row items-center flex-row gap-2 w-full">
                                                    <label className="text-sm font-semibold md:w-16 w-24">Driver</label>
                                                    <input
                                                        type="text"
                                                        value={rideData?.driver_detail?.name || "N/A"}
                                                        className="border-[1.5px] shadow-lg border-[#8D8D8D] rounded-[8px] px-3 py-2 w-full bg-gray-50"
                                                        disabled
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid md:grid-cols-4 grid-cols-1 gap-4">
                                                <div className="flex items-center gap-2 md:col-span-1">
                                                    <div className="border rounded-lg px-4 py-3 bg-white shadow-sm flex flex-col gap-2 w-full">
                                                        <label className="flex items-center gap-2 text-sm opacity-80">
                                                            <input type="checkbox" checked={rideData?.booking_system === 'auto_dispatch'} disabled />
                                                            Auto Dispatch
                                                        </label>
                                                        <label className="flex items-center gap-2 text-sm opacity-80">
                                                            <input type="checkbox" checked={rideData?.booking_system === 'bidding'} disabled />
                                                            Bidding
                                                        </label>
                                                    </div>
                                                </div>

                                                <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                                                    <div className="flex items-center gap-2">
                                                        <label className="text-sm font-semibold w-24">Passenger</label>
                                                        <input type="number" className="border-[1.5px] shadow-lg border-[#8D8D8D] rounded-[8px] px-3 py-2 w-full bg-gray-50" value={values.passenger} disabled />
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <label className="text-sm font-semibold w-24">Luggage</label>
                                                        <input type="number" className="border-[1.5px] shadow-lg border-[#8D8D8D] rounded-[8px] px-3 py-2 w-full bg-gray-50" value={values.luggage} disabled />
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <label className="text-sm font-semibold w-24 whitespace-nowrap">Hand Luggage</label>
                                                        <input type="number" className="border-[1.5px] shadow-lg border-[#8D8D8D] rounded-[8px] px-3 py-2 w-full bg-gray-50" value={values.hand_luggage} disabled />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Empty div to close the space-y-4 if needed, but the grid was the last element */}
                                        </div>
                                    </div>

                                    {/* Map Section */}
                                    <div className="xl:w-96 lg:w-80 w-full flex flex-col gap-4">
                                        <div className="w-full h-[400px] rounded-xl overflow-hidden border shadow-sm relative">
                                            <iframe
                                                title="map"
                                                width="100%"
                                                height="100%"
                                                loading="lazy"
                                                allowFullScreen
                                                referrerPolicy="no-referrer-when-downgrade"
                                                src={mapUrl}
                                                className="absolute inset-0"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-3 grid-cols-1 gap-4">
                                    <div className="flex items-center gap-2">
                                        <label className="text-sm font-semibold w-24">Special Req</label>
                                        <input type="text" className="border-[1.5px] shadow-lg border-[#8D8D8D] rounded-[8px] px-3 py-2 w-full bg-gray-50" value={values.special_request || ""} disabled />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <label className="text-sm font-semibold w-24 whitespace-nowrap">Payment Ref</label>
                                        <input type="text" className="border-[1.5px] shadow-lg border-[#8D8D8D] rounded-[8px] px-3 py-2 w-full bg-gray-50" value={values.payment_reference || ""} disabled />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <label className="text-sm font-semibold w-24">Distance</label>
                                        <input
                                            type="text"
                                            readOnly
                                            value={rideData?.distance ? formatDistanceFromBooking(rideData, distanceUnit) : "N/A"}
                                            className="border-[1.5px] shadow-lg border-[#8D8D8D] rounded-[8px] px-3 py-2 w-full bg-gray-50 font-medium"
                                        />
                                    </div>
                                </div>

                                {/* Charges Section */}
                                <div className="bg-blue-50 p-6 rounded-xl space-y-4">
                                    <h3 className="font-semibold text-xl border-b border-blue-100 pb-2">Charges</h3>

                                    <div className="flex justify-between items-center max-sm:flex-col gap-4">
                                        <div className="flex gap-4 items-center w-full md:w-auto">
                                            <label className="text-sm font-semibold">Payment Method</label>
                                            <input
                                                value={values.payment_method}
                                                className="border border-[#8D8D8D] rounded-[8px] px-3 py-2 w-48 bg-white shadow-sm capitalize"
                                                readOnly
                                            />
                                        </div>

                                        <div className="w-full md:w-72">
                                            <ChargeInput label="Booking Fees Charges" name="booking_fee_charges" values={values} readOnly />
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-4 sm:grid-cols-2 grid-cols-1 gap-x-6 gap-y-4">
                                        {chargeFields.map((field) => (
                                            <ChargeInput key={field} label={field.replaceAll("_", " ").toUpperCase()} name={field} values={values} readOnly />
                                        ))}

                                        <div className="font-bold text-[#10B981] md:col-span-1">
                                            <ChargeInput
                                                label="TOTAL CHARGES"
                                                name="total_charges"
                                                values={values}
                                                readOnly
                                                isTotal
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end mb-3 mr-6">
                                <Button
                                    btnSize="md"
                                    type="filledGray"
                                    className="!px-12 py-2 leading-[25px] w-full sm:w-auto !rounded-lg !bg-gray-200 !text-black !border-none hover:!bg-gray-300"
                                    onClick={() => {
                                        unlockBodyScroll();
                                        setIsOpen({ type: "new", isOpen: false });
                                    }}
                                >
                                    <span>Close</span>
                                </Button>
                            </div>
                        </Form>
                    );
                }}
            </Formik>
        </div>
    );
};

export default ViewBookingModel;

const ChargeInput = ({ label, name, values, readOnly = false, isTotal = false }) => (
    <div className="flex items-center gap-2">
        <label className={`text-sm font-semibold whitespace-nowrap ${isTotal ? 'w-32' : 'w-40'}`}>{label}</label>
        <input
            type="text"
            value={values[name] || 0}
            readOnly={readOnly}
            disabled={readOnly}
            className={`rounded-[8px] px-4 py-2 w-full shadow-sm ${isTotal ? 'bg-green-50 border-green-200 text-green-700' : 'bg-white border-[#8D8D8D] border-[1.5px]'}`}
        />
    </div>
)

const InputBox = ({
    label,
    value,
    readOnly = false,
    plot,
    placeholder
}) => (
    <div className="relative flex flex-col md:flex-row w-full gap-2 items-start md:items-center">
        <label className="font-semibold text-sm w-24 text-left whitespace-nowrap">{label}</label>
        <div className="flex flex-col md:flex-row gap-2 w-full">
            <input
                value={value}
                readOnly={readOnly}
                placeholder={placeholder}
                className="border-[1.5px] shadow-lg border-[#8D8D8D] rounded-[8px] px-3 py-2 flex-1 bg-gray-50"
            />
            <input
                type="text"
                placeholder="Plot"
                value={plot || ""}
                readOnly
                className="border-[1.5px] shadow-lg border-[#8D8D8D] rounded-[8px] px-3 py-2 w-full md:w-60 bg-gray-50 text-xs text-gray-500"
            />
        </div>
    </div>
);
