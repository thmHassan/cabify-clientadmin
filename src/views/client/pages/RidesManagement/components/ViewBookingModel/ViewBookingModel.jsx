import { ErrorMessage, Field, Form, Formik } from "formik";
import { useRef, useState, useEffect } from "react";
import { unlockBodyScroll } from "../../../../../../utils/functions/common.function";
import Button from "../../../../../../components/ui/Button/Button";

const ViewBookingModel = ({ initialValue, setIsOpen }) => {
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
                const pickup = initialValue.pickup_point.split(',');
                const destination = initialValue.destination_point.split(',');

                if (pickup.length === 2 && destination.length === 2) {
                    const newMapUrl = `https://www.google.com/maps/embed/v1/directions?key=YOUR_GOOGLE_MAPS_API_KEY&origin=${pickup[0].trim()},${pickup[1].trim()}&destination=${destination[0].trim()},${destination[1].trim()}`;
                    setMapUrl(newMapUrl);
                }
            }
        }
    }, [initialValue]);

    useEffect(() => {
        if (initialValue?.pickup_point && initialValue?.destination_point) {

            const [pickupLat, pickupLng] = initialValue.pickup_point
                .split(",")
                .map(val => val.trim());

            const [destLat, destLng] = initialValue.destination_point
                .split(",")
                .map(val => val.trim());

            if (pickupLat && pickupLng && destLat && destLng) {
                const url = `https://www.google.com/maps/embed/v1/directions
                ?key=AIzaSyDTlV1tPVuaRbtvBQu4-kjDhTV54tR4cDU
                &origin=${pickupLat},${pickupLng}
                &destination=${destLat},${destLng}
                &zoom=12`;

                setMapUrl(url.replace(/\s/g, ""));
            }
        }
    }, [initialValue]);


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
    return (
        <div>
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
                    // quoted: false,
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
                            <div className="w-full">
                                <div className="space-y-4 w-full">
                                    <div className="w-full flex max-sm:flex-col md:items-center gap-4">
                                        <h2 className="text-xl font-semibold">View Booking - #{rideData?.booking_id || 'N/A'}</h2>

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

                                        <div className="flex md:flex-row flex-col md:gap-4 gap-0 md:items-center">
                                            <div className="md:w-72 w-full">
                                                <input
                                                    type="text"
                                                    name="sub_company"
                                                    value={rideData?.sub_company_detail?.name || ""}
                                                    className="w-full border-[1.5px] border-[#8D8D8D] px-3 py-2 rounded-[8px]"
                                                    disabled
                                                />
                                            </div>
                                        </div>

                                        <div className="flex max-sm:justify-center rounded-[8px] px-3 py-2 border-[1.5px] shadow-lg border-[#8D8D8D]">
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={values.multi_booking === "yes"}
                                                    disabled
                                                />
                                            </label>

                                            <span className="text-sm ml-2">
                                                {values.multi_booking === "yes" ? "Multi Booking" : "Single Booking"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="w-full bg-white">
                                        <div className="flex lg:flex-row md:flex-col flex-col gap-4">
                                            <div className="lg:col-span-3 space-y-4 flex-1">
                                                {values.multi_booking === "yes" && (
                                                    <div className="w-full space-y-3">
                                                        <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-3">
                                                            <span className="font-semibold text-sm sm:text-base">
                                                                Select day of the week
                                                            </span>
                                                            <div className="flex flex-wrap max-sm:grid max-sm:grid-cols-4 gap-2">
                                                                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => {
                                                                    const isChecked = values.multi_days.includes(day.toLowerCase());
                                                                    return (
                                                                        <label
                                                                            key={day}
                                                                            className="flex items-center gap-2 text-sm sm:text-base cursor-pointer"
                                                                        >
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={isChecked}
                                                                                // disabled
                                                                                className="w-4 h-4 accent-[#1F41BB]"
                                                                            />
                                                                            {day}
                                                                        </label>

                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                        <div className="grid md:grid-cols-3 grid-cols-1 items-center gap-4">
                                                            <div className="flex gap-2">
                                                                <label className="text-sm font-semibold mb-1 block">Week</label>
                                                                <select
                                                                    className="border-[1.5px] shadow-lg border-[#8D8D8D] rounded-[8px] px-3 py-2 text-sm w-full"
                                                                    value={values.week_pattern}
                                                                    disabled
                                                                >
                                                                    <option value="">Every 1st Days of Week</option>
                                                                    <option value="every">Every Week</option>
                                                                    <option value="alternate">Alternate Weeks</option>
                                                                </select>
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <label className="text-sm font-semibold mb-1 block">Start At</label>
                                                                <input
                                                                    type="date"
                                                                    className="border-[1.5px] shadow-lg border-[#8D8D8D] rounded-[8px] px-3 py-2 text-sm w-full"
                                                                    value={values.multi_start_at || ""}
                                                                    disabled
                                                                />
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <label className="text-sm font-semibold mb-1 block">End At</label>
                                                                <input
                                                                    type="date"
                                                                    className="border-[1.5px] shadow-lg border-[#8D8D8D] rounded-[8px] px-3 py-2 text-sm w-full"
                                                                    value={values.multi_end_at || ""}
                                                                    disabled
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
                                                    <div className="flex w-full items-center gap-2 md:text-center">
                                                        <label className="text-sm font-semibold md:text-center w-20">Pick up Time</label>
                                                        <div className="w-full flex gap-2">
                                                            <input
                                                                type="text"
                                                                className="border-[1.5px] shadow-lg border-[#8D8D8D] rounded-[8px] px-3 py-2 text-sm w-full"
                                                                value={values.pickup_time || "asap"}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="flex w-full items-center gap-2">
                                                        <label className="text-sm font-semibold mb-1 w-20 md:w-auto">Date</label>
                                                        <input
                                                            type="date"
                                                            className="border-[1.5px] shadow-lg border-[#8D8D8D] rounded-[8px] px-3 py-2 text-sm w-full"
                                                            value={values.booking_date || ""}
                                                            disabled
                                                        />
                                                    </div>

                                                    <div className="flex w-full items-center gap-2 md:text-center">
                                                        <label className="text-sm font-semibold mb-1 w-20">Booking Type</label>
                                                        <input
                                                            type="text"
                                                            className="border-[1.5px] shadow-lg border-[#8D8D8D] rounded-[8px] px-3 py-2 text-sm w-full"
                                                            value={values.booking_date || ""}
                                                            onChange={(e) => setFieldValue("booking_date", e.target.value)}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="relative flex gap-2 w-full flex-col md:flex-row">
                                                    <InputBox
                                                        label="Pick up Point"
                                                        type="text"
                                                        name="pickup_point"
                                                        value={values.pickup_point || ''}
                                                        placeholder="Search location..."

                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder="Plot"
                                                        value={rideData?.pickup_point || ""}
                                                        readOnly
                                                        className="max-sm:ml-[75px] border-[1.5px] shadow-lg border-[#8D8D8D] rounded-[8px] px-3 py-2" />

                                                </div>
                                                <div className="relative flex gap-2 w-full flex-col md:flex-row">
                                                    <InputBox
                                                        label="Desti-nation"
                                                        type="text"
                                                        name="pickup_point"
                                                        value={values.destination || ''}
                                                        placeholder="Search location..."
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder="Plot"
                                                        value={rideData?.destination_point || destinationPlotData}
                                                        readOnly
                                                        className="max-sm:ml-[75px] border-[1.5px] shadow-lg border-[#8D8D8D] rounded-[8px] px-3 py-2" />
                                                </div>

                                                <div className="flex md:flex-row flex-col">
                                                    <div className="w-full gap-3 grid">
                                                        {/* name, email */}
                                                        <div className="flex md:flex-row flex-col gap-2">
                                                            <div className="text-left flex">
                                                                <label className="text-sm font-semibold mb-1 md:w-28 w-20">Name</label>
                                                                <input
                                                                    type="text"
                                                                    placeholder="Enter Name"
                                                                    className="border-[1.5px] shadow-lg border-[#8D8D8D] rounded-[8px] px-3 py-2 w-full"
                                                                    value={values.name || ""}
                                                                    disabled
                                                                />
                                                            </div>

                                                            <div className="text-left flex items-center md:gap-2">
                                                                <label className="text-sm font-semibold mb-1 md:w-11 w-20">Email</label>
                                                                <input
                                                                    type="text"
                                                                    placeholder="Enter Email"
                                                                    className="border-[1.5px] shadow-lg border-[#8D8D8D] rounded-[8px] px-3 py-2 w-full"
                                                                    value={values.email}
                                                                    disabled
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="flex md:flex-row flex-col gap-2">
                                                            <div className="text-left flex">
                                                                <label className="text-sm font-semibold mb-1 md:w-28 w-20">Mobile No</label>
                                                                <input
                                                                    type="text"
                                                                    placeholder="Enter Mobile No"
                                                                    className="border-[1.5px] shadow-lg border-[#8D8D8D] rounded-[8px] px-3 py-2 w-full md:w-full"
                                                                    value={values.phone_no || ""}
                                                                    disabled
                                                                />
                                                            </div>

                                                            <div className="flex md:flex-row flex-col gap-2">
                                                                <div className="flex w-full md:gap-2">
                                                                    <label className="text-sm font-semibold mb-1 max-sm:w-20">Tel No.</label>
                                                                    <input
                                                                        type="text"
                                                                        placeholder="Enter Telephone no"
                                                                        className="border-[1.5px] shadow-lg border-[#8D8D8D] rounded-[8px] px-3 py-2 w-full"
                                                                        value={values.tel_no}
                                                                        disabled
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="w-full">
                                                            <div className="md:flex-row flex-col flex gap-2 w-full">
                                                                <div className="text-left flex items-center gap-2">
                                                                    <label className="text-sm font-semibold md:w-16">Journey</label>
                                                                    <div className="flex items-center gap-2">
                                                                        <label className="flex items-center gap-1">
                                                                            <input
                                                                                type="radio"
                                                                                name="journey"
                                                                                checked={values.journey_type === "one_way"}
                                                                            // disabled
                                                                            />
                                                                            One Way
                                                                        </label>

                                                                        <label className="flex items-center gap-1">
                                                                            <input
                                                                                type="radio"
                                                                                name="journey"
                                                                                checked={values.journey_type === "return"}
                                                                            // disabled
                                                                            />
                                                                            Return
                                                                        </label>

                                                                        <label className="flex items-center gap-1">
                                                                            <input
                                                                                type="radio"
                                                                                name="journey"
                                                                                checked={values.journey_type === "wr"}
                                                                            // disabled
                                                                            />
                                                                            W/R
                                                                        </label>
                                                                    </div>
                                                                </div>

                                                                <div className="flex-1">
                                                                    <div className="text-center flex items-center gap-2">
                                                                        <label className="text-sm md:text-right text-left font-semibold mb-1 md:w-24 w-14">Accounts</label>
                                                                        <div className="w-full">
                                                                            <input
                                                                                name="account"
                                                                                value={rideData?.account_detail?.name || ""}
                                                                                className="border-[1.5px] border-[#8D8D8D] rounded-[8px] px-2 py-2 w-full"
                                                                                disabled
                                                                            />
                                                                        </div>

                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex gap-2 w-full md:flex-row flex-col">
                                                            <div className="flex md:flex-row items-center flex-row gap-2 w-full">
                                                                <label className="text-sm font-semibold md:w-24 w-16">Vehicle</label>
                                                                <input
                                                                    type="text"
                                                                    name="vehicle"
                                                                    value={rideData?.vehicle_detail?.vehicle_type_name}
                                                                    placeholder="Select Vehicle"
                                                                    className="border-[1.5px] shadow-lg border-[#8D8D8D] rounded-[8px] px-3 py-2 w-full bg-gray-50"
                                                                    disabled
                                                                />
                                                            </div>

                                                            <div className="flex md:flex-row items-center flex-row gap-2 w-full text-right">
                                                                <label className="text-sm font-semibold text-left md:w-16 w-16">Driver</label>
                                                                <div className="w-full">
                                                                    <input
                                                                        type="text"
                                                                        name="driver"
                                                                        placeholder="Driver Name"
                                                                        value={rideData?.driver_detail?.name || ""}
                                                                        readOnly
                                                                        className="border-[1.5px] shadow-lg border-[#8D8D8D] rounded-[8px] px-3 py-2 w-full bg-gray-50"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="border mt-2 max-sm:w-full rounded-lg h-28 md:mt-0 px-4 py-4 bg-white shadow-sm">
                                                        <div className="flex flex-col gap-3">
                                                            <label className="flex items-center gap-2">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={rideData?.booking_system === 'auto_dispatch'}
                                                                    className="w-4 h-4 accent-[#1F41BB]"
                                                                // disabled
                                                                />
                                                                Auto Dispatch
                                                            </label>

                                                            <label className="flex items-center gap-2">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={rideData?.booking_system === 'bidding'}
                                                                    className="w-4 h-4 accent-[#1F41BB]"
                                                                // disabled
                                                                />
                                                                Bidding
                                                            </label>
                                                        </div>
                                                    </div>

                                                </div>

                                                <div className="grid md:grid-cols-3 grid-cols-1 gap-4">
                                                    <div className="text-center flex items-center gap-2">
                                                        <label className="text-sm font-semibold mb-1 md:w-20 w-20">Passenger</label>
                                                        <input
                                                            type="number"
                                                            className="border-[1.5px] shadow-lg border-[#8D8D8D] rounded-[8px] px-3 py-2 w-full"
                                                            value={values.passenger}
                                                            disabled
                                                        />
                                                    </div>

                                                    <div className="text-center flex items-center gap-2">
                                                        <label className="text-sm font-semibold mb-1 md:w-20 w-20">Luggage</label>
                                                        <input
                                                            type="number"
                                                            className="border-[1.5px] shadow-lg border-[#8D8D8D] rounded-[8px] px-3 py-2 w-full"
                                                            value={values.luggage}
                                                            disabled
                                                        />
                                                    </div>

                                                    <div className="text-center flex items-center gap-2">
                                                        <label className="text-sm font-semibold mb-1 md:w-20 w-20">Hand Luggage</label>
                                                        <input
                                                            type="number"
                                                            className="border-[1.5px] shadow-lg border-[#8D8D8D] rounded-[8px] px-3 py-2 w-full"
                                                            value={values.hand_luggage}
                                                            disabled
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
                                                    <div className="text-center flex items-center gap-2">
                                                        <label className="text-sm font-semibold mb-1 md:w-20 w-20">Special Req</label>
                                                        <input
                                                            type="text"
                                                            placeholder="Write here..."
                                                            className="border-[1.5px] shadow-lg border-[#8D8D8D] rounded-[8px] px-3 py-2 w-full"
                                                            value={values.special_request}
                                                            disabled
                                                        />
                                                    </div>
                                                    <div className="text-center flex items-center gap-2">
                                                        <label className="text-sm font-semibold mb-1 md:w-20 w-20">Payment Ref</label>
                                                        <input
                                                            type="text"
                                                            placeholder="Write here..."
                                                            className="border-[1.5px] shadow-lg border-[#8D8D8D] rounded-[8px] px-3 py-2 w-full"
                                                            value={values.payment_reference}
                                                            disabled
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <div className="w-full h-full rounded-xl overflow-hidden border" style={{ minHeight: '400px' }}>
                                                    <iframe
                                                        title="map"
                                                        width="100%"
                                                        height="100%"
                                                        loading="lazy"
                                                        allowFullScreen
                                                        referrerPolicy="no-referrer-when-downgrade"
                                                        src={mapUrl}
                                                        style={{ minHeight: "400px" }}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-blue-50 p-4 rounded-lg space-y-4 mt-7">
                                            <div className="flex md:justify-between max-sm:flex-col md:items-center">
                                                <h3 className="font-semibold text-xl">Charges</h3>
                                            </div>

                                            <div className="flex justify-between max-sm:flex-col gap-2">
                                                <div className="flex gap-4 items-center">

                                                    <label className="flex items-center gap-2 text-sm">
                                                        {/* <input
                                                            type="checkbox"
                                                            checked={values.quoted || false}
                                                            disabled
                                                        /> */}
                                                        Quoted
                                                    </label>

                                                    <input
                                                        value={values.payment_method}
                                                        className="border rounded px-2 py-1 w-48"
                                                        // disabled
                                                    >
                                                       
                                                    </input>
                                                </div>

                                                <div className="md:w-60">
                                                    <ChargeInput label="Booking Fees Charges" name="booking_fee_charges" values={values} readOnly />
                                                </div>
                                            </div>

                                            <div className="grid md:grid-cols-4 grid-cols-1 gap-4">
                                                {chargeFields.map((field) => (

                                                    <ChargeInput label={field.replaceAll("_", " ").toUpperCase()} name={field} values={values} readOnly />
                                                ))}

                                                <div className="font-bold text-[#10B981]">
                                                    <ChargeInput
                                                        label="TOTAL CHARGES"
                                                        name="total_charges"
                                                        values={values} readOnly
                                                    // readOnly
                                                    />
                                                </div>
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

const ChargeInput = ({ label, name, values, onChange, readOnly = false }) => (
    <div className="flex items-center gap-2">
        <label className="text-sm font-semibold w-40">{label}</label>
        <input
            type="number"
            value={values[name] || 0}
            onChange={(e) => onChange && onChange(e.target.value)}
            readOnly={readOnly}
            disabled={readOnly}
            className="rounded-[8px] px-5 py-2 w-full bg-gray-50"
        />
    </div>
)

const InputBox = ({
    label,
    value,
    onChange,
    suggestions,
    show,
    onSelect,
    plot,
    placeholder
}) => (
    <div className="relative flex md:flex-row max-sm:w-full gap-2">
        <label className="font-semibold text-sm md:w-20 w-20 text-left">{label}</label>
        <div className="flex max-sm:flex-col gap-2 w-full">
            <input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="border-[1.5px] shadow-lg border-[#8D8D8D] rounded-[8px] px-3 py-2"
            />
        </div>
    </div>
);