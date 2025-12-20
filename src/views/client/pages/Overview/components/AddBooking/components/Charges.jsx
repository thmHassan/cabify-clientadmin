import { useFormikContext } from "formik";
import Button from "../../../../../../../components/ui/Button/Button";

const Charges = () => {
    const { values, setFieldValue } = useFormikContext();

    const chargeFields = [
        "fares",
        "return_fares",
        "parking_charges",
        "booking_fee_charges",
        "ac_fares",
        "return_ac_fares",
        "ac_parking_charges",
        "waiting_charges",
        "extra_charges",
        "congestion_toll",
        "ac_waiting_charges",
    ];

    // 🔢 Auto calculate total
    const calculateTotal = () => {
        return chargeFields.reduce(
            (sum, key) => sum + Number(values[key] || 0),
            0
        );
    };

    // Update total whenever any charge changes
    const handleChargeChange = (name, value) => {
        setFieldValue(name, Number(value) || 0);

        setTimeout(() => {
            setFieldValue("total_charges", calculateTotal());
        }, 0);
    };

    return (
        <div className="bg-blue-50 p-4 rounded-lg space-y-4 mt-7">

            <div className="flex justify-between items-center">
                <h3 className="font-semibold text-xl">Charges</h3>
                <div className="flex justify-end gap-2 mt-4">
                    <Button
                        btnSize="md"
                        type="filled"
                        className="px-4 py-3 text-xs text-white rounded"
                    // onClick={() => handleCalculateFares(values)}
                    // disabled={fareLoading}
                    >
                        {/* {fareLoading ? "Calculating..." : "Calculate Fares"} */}
                        Calculate Fares
                    </Button>
                    <Button
                        btnSize="md"
                        type="filled"
                        className="px-4 py-3 text-xs text-white rounded"
                    >
                        Show Map
                    </Button>
                </div>
            </div>


            {/* Payment */}
            <div className="flex justify-between">
                <div className="flex gap-4 items-center">

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
                        value={values.payment_mode || "cash"}
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

                <div className="w-60">
                    <ChargeInput
                        label="Booking Fees Charges"
                        name="booking_fee_charges"
                        value={values.booking_fee_charges}
                        onChange={handleChargeChange}
                    />
                </div>
            </div>

            {/* Charges Grid */}
            <div className="grid md:grid-cols-4 grid-cols-1 gap-4">
                {chargeFields.map((field) => (
                    <ChargeInput
                        key={field}
                        label={field.replaceAll("_", " ").toUpperCase()}
                        name={field}
                        value={values[field]}
                        onChange={handleChargeChange}
                    />
                ))}

                <div className="font-bold text-[#10B981]">
                    <ChargeInput
                        label="TOTAL CHARGES"
                        name="total_charges"
                        value={values.total_charges}
                        readOnly
                    />
                </div>
            </div>
        </div>
    );
};

export default Charges;

/* ----------------- Charge Input ----------------- */

const ChargeInput = ({ label, name, value, onChange, readOnly = false }) => (
    <div className="flex items-center gap-2">
        <label className="text-sm font-medium w-40">{label}</label>
        <input
            type="number"
            value={value || 0}
            readOnly={readOnly}
            onChange={(e) => onChange && onChange(name, e.target.value)}
            className="rounded-[8px] px-5 py-2 w-full"
        />
    </div>
);
