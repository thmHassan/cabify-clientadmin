import { Field, ErrorMessage } from "formik";
import FormLabel from "../../../../../../components/ui/FormLabel/FormLabel";
import Button from "../../../../../../components/ui/Button/Button";

const MileageSystemSection = ({
    values,
    setFieldValue,
    errors,
    distanceUnit,
    pricingTiers,
    setPricingTiers,
}) => {
    return (
        <div>
            {/* Fixed Mileage */}
            <div
                className={`border mb-4 rounded-lg p-4 ${values.mileage_system === "fixed"
                    ? "border-blue-500"
                    : "border-gray-300"
                    }`}
            >
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
                        <ErrorMessage
                            name="mileage_system"
                            component="div"
                            className="text-red-500 text-sm mb-2"
                        />
                    </div>
                    <div className="w-full">
                        <FormLabel htmlFor="first_mile_km">
                            First {distanceUnit} *
                        </FormLabel>
                        <div className="h-14">
                            <Field
                                type="text"
                                name="first_mile_km"
                                className="sm:px-5 px-4 sm:py-[21px] py-4 border border-[#8D8D8D] rounded-lg w-full h-full shadow-[-4px_4px_6px_0px_#0000001F] placeholder:text-[#6C6C6C] sm:text-base text-sm leading-[22px] font-semibold"
                                placeholder={`Enter First ${distanceUnit}`}
                                disabled={values.mileage_system !== "fixed"}
                            />
                        </div>
                        <ErrorMessage
                            name="first_mile_km"
                            component="div"
                            className="text-red-500 text-sm mt-1"
                        />
                    </div>
                    <div className="w-full">
                        <FormLabel htmlFor="second_mile_km">
                            Second {distanceUnit} *
                        </FormLabel>
                        <div className="h-14">
                            <Field
                                type="text"
                                name="second_mile_km"
                                className="sm:px-5 px-4 sm:py-[21px] py-4 border border-[#8D8D8D] rounded-lg w-full h-full shadow-[-4px_4px_6px_0px_#0000001F] placeholder:text-[#6C6C6C] sm:text-base text-sm leading-[22px] font-semibold"
                                placeholder={`Enter Second ${distanceUnit}`}
                                disabled={values.mileage_system !== "fixed"}
                            />
                        </div>
                        <ErrorMessage
                            name="second_mile_km"
                            component="div"
                            className="text-red-500 text-sm mt-1"
                        />
                    </div>
                </div>
            </div>

            {/* Tiered Pricing */}
            <div
                className={`border rounded-lg p-4 ${values.mileage_system === "dynamic"
                    ? "border-blue-500"
                    : "border-gray-300"
                    }`}
            >
                <div className="flex flex-row gap-4">
                    <div className="mb-5">
                        <label className="px-1">
                            <input
                                type="radio"
                                name="mileage_system"
                                value="dynamic"
                                checked={values.mileage_system === "dynamic"}
                                onChange={(e) =>
                                    setFieldValue("mileage_system", e.target.value)
                                }
                                className="accent-blue-600 text-blue-500 border-blue-500 h-4 w-4"
                            />

                        </label>
                    </div>
                    <div className="flex-1 space-y-6">
                        {pricingTiers.map((tier, index) => (
                            <div key={index} className="grid grid-cols-4 gap-4 items-end">
                                <div className="w-full">
                                    <FormLabel htmlFor={`tier_from_${index}`}>From</FormLabel>
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
                                            placeholder="Enter From"
                                            disabled={values.mileage_system !== "dynamic"}
                                        />
                                    </div>
                                </div>

                                <div className="w-full">
                                    <FormLabel htmlFor={`tier_to_${index}`}>To</FormLabel>
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
                                            placeholder="Enter To"
                                            disabled={values.mileage_system !== "dynamic"}
                                        />
                                    </div>
                                </div>

                                <div className="w-full">
                                    <FormLabel htmlFor={`tier_price_${index}`}>Fare</FormLabel>
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
                                            disabled={values.mileage_system !== "dynamic"}
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    {index === 0 && (
                                        <Button
                                            type="button"
                                            onClick={() => {
                                                const updated = [
                                                    ...pricingTiers,
                                                    { from: "", to: "", price: "" },
                                                ];
                                                setPricingTiers(updated);
                                                setFieldValue("pricing_tiers", updated);
                                            }}
                                            className="text-blue-500 px-3 py-2 border border-blue-500 rounded-md w-28"
                                            btnSize="sm"
                                            disabled={values.mileage_system !== "dynamic"}

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
                                            disabled={values.mileage_system !== "dynamic"}

                                        >
                                            Remove
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                {values.mileage_system === "dynamic" && errors.pricing_tiers && (
                    <div className="text-red-500 text-sm mb-2">{errors.pricing_tiers}</div>
                )}
            </div>
        </div>
    );
};

export default MileageSystemSection;