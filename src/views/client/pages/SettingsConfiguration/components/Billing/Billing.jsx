import React, { useCallback, useEffect, useState } from "react";
import { apiGetInvoiceHistory, apiGetStripeInformation, apiSaveStripeInformation, apiGetPlanDetails } from "../../../../../../services/SettingsConfigurationServices";
import toast from 'react-hot-toast';

const Billing = () => {
    const [invoices, setInvoices] = useState([]);
    const [invoiceLoading, setInvoiceLoading] = useState(false);
    const [planDetails, setPlanDetails] = useState({
        plan_name: "Professional Plan",
        status: "Active",
        subscription_end_date: "",
        features: []
    });
    const [planLoading, setPlanLoading] = useState(false);
    const [stripeData, setStripeData] = useState({
        stripe_payment: "disable",
        driver_app: "disable",
        customer_app: "disable",
        stripe_key: "",
        stripe_secret_key: "",
        stripe_webhook_secret: "",
        stripe_country: ""
    });
    const [stripeLoading, setStripeLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const fetchPlanDetails = useCallback(async () => {
        setPlanLoading(true);
        try {
            const response = await apiGetPlanDetails();

            if (response?.data?.success === 1) {
                const data = response?.data?.planDetail || {};

                setPlanDetails({
                    plan_name: data.plan_name || "Professional Plan",
                    status: "Active",
                    subscription_end_date: "",
                    features: data.features
                        ? data.features.split(",")
                        : []
                });
            }
        } catch (error) {
            console.log("Error fetching plan details:", error);
        } finally {
            setPlanLoading(false);
        }
    }, []);

    const fetchInvoiceHistory = useCallback(async () => {
        setInvoiceLoading(true);
        try {
            const response = await apiGetInvoiceHistory();
            if (response?.data?.success === 1) {
                const invoiceList = response?.data?.history || response?.data?.history || [];
                setInvoices(Array.isArray(invoiceList) ? invoiceList : []);
            }
        } catch (error) {
            console.log("Error fetching invoice history:", error);
            setInvoices([]);
        } finally {
            setInvoiceLoading(false);
        }
    }, []);

    const fetchStripeInformation = useCallback(async () => {
        setStripeLoading(true);
        try {
            const response = await apiGetStripeInformation();
            if (response?.data?.success === 1) {
                const data = response?.data?.settings || {};
                setStripeData(prev => ({
                    ...prev,
                    stripe_payment: data.stripe_payment || "disable",
                    driver_app: data.driver_app || "disable",
                    customer_app: data.customer_app || "disable",
                    stripe_key: data.stripe_key || "",
                    stripe_secret_key: data.stripe_secret_key || "",
                    stripe_webhook_secret: data.stripe_webhook_secret || "",
                    stripe_country: data.stripe_country || ""
                }));
            }
        } catch (error) {
            console.log("Error fetching stripe information:", error);
        } finally {
            setStripeLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPlanDetails();
        fetchInvoiceHistory();
        fetchStripeInformation();
    }, [fetchPlanDetails, fetchInvoiceHistory, fetchStripeInformation, refreshTrigger]);

    const handleStripeSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        const formData = new FormData();
        formData.append("stripe_payment", stripeData.stripe_payment);
        formData.append("driver_app", stripeData.driver_app);
        formData.append("customer_app", stripeData.customer_app);
        formData.append("stripe_key", stripeData.stripe_key);
        formData.append("stripe_secret_key", stripeData.stripe_secret_key);
        formData.append("stripe_webhook_secret", stripeData.stripe_webhook_secret);
        formData.append("stripe_country", stripeData.stripe_country);

        try {
            const response = await apiSaveStripeInformation(formData);
            if (response?.data?.success === 1) {
                toast.success("Stripe Information saved successfully")
                setRefreshTrigger(prev => prev + 1);
            } else {
                toast.error("Failed to save Stripe Information")
                setError("Failed to save changes.");
            }
        } catch (err) {
            toast.error("Failed to save Stripe Information")
            setError("An error occurred while saving the stripe information.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggle = (field, value) => {
        setStripeData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const formatInvoiceDate = (dateString) => {
        if (!dateString) return "N/A";

        const date = new Date(dateString);

        const datePart = date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });

        const timePart = date.toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        });

        return `${datePart} @ ${timePart}`;
    };

    return (
        <div className="">
            <div className="bg-white rounded-xl shadow p-6 border">
                <h1 className="text-2xl font-semibold text-[#252525]">Billing & Subscription</h1>
                <p className="text-[#6C6C6C] mb-6">Manage your subscription plan and billing information</p>
                <div className="bg-[#F5F9FE] rounded-[8px] p-2">
                    {planLoading ? (
                        <div className="py-4 text-center text-gray-500">Loading plan details...</div>
                    ) : (
                        <>
                            <div className="flex justify-between items-center">
                                <div className="flex flex-row gap-2">
                                    <h2 className="font-semibold">{planDetails.plan_name}</h2>
                                    <span className={`font-medium text-sm px-2 py-1 rounded ${planDetails.status === "Active"
                                        ? "text-[#10B981] bg-[#BFF0DB]"
                                        : "text-gray-600 bg-gray-100"
                                        }`}>
                                        {planDetails.status}
                                    </span>
                                </div>
                                {planDetails.subscription_end_date && (
                                    <div className="flex flex-col text-end">
                                        <span className="text-gray-500">Subscription End Date:</span>
                                        <span className="text-end text-sm">
                                            {new Date(planDetails.subscription_end_date).toLocaleDateString('en-GB', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {planDetails.features && planDetails.features.length > 0 ? (
                                <div className="flex flex-wrap gap-4 mt-5 text-sm text-gray-700">
                                    {planDetails.features.map((feature, idx) => (
                                        <Feature key={idx} label={feature} />
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-4 mt-5 text-sm text-[#252525]">
                                    <Feature label="Unlimited Rides" />
                                    <Feature label="Up to 100 drivers" />
                                    <Feature label="Advanced analytics" />
                                    <Feature label="24/7 support" />
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow p-4 border mt-3">
                <h3 className="text-lg font-semibold mb-2">Recent Invoices</h3>
                {invoiceLoading ? (
                    <div className="py-4 text-center text-gray-500">Loading invoices...</div>
                ) : invoices.length > 0 ? (
                    <div>
                        {invoices.map((inv, idx) => (
                            <div key={idx} className="flex border border-[#E9E9E9] p-2 rounded-[8px] md:flex-row justify-between items-center py-3">
                                <div className="font-medium">{inv.plan_name || "Professional Plan"}</div>
                                <div className="flex gap-1">
                                    <div className="inline-flex flex-col px-4 py-2 rounded-full bg-[#EFEFEF] min-w-[110px]">
                                        <p className="text-[#333333] text-center font-semibold text-sm">
                                            {formatInvoiceDate(inv.date || inv.created_at)}
                                        </p>
                                    </div>
                                    <div className="inline-flex flex-col px-4 py-2 rounded-full bg-[#EFEFEF] min-w-[110px]">
                                        <p className="text-[#333333] text-center font-semibold text-sm">
                                            ${inv.amount || "$0.00"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-4 text-center text-gray-500">No invoices found</div>
                )}
            </div>

            <form onSubmit={handleStripeSubmit}>
                <div className="bg-white rounded-xl shadow p-6 border mt-10">
                    <ToggleItem
                        label="Stripe Payments"
                        checked={stripeData.stripe_payment === "enable"}
                        onChange={(checked) => handleToggle("stripe_payment", checked ? "enable" : "disable")}
                    />
                    <ToggleItem
                        label="Driver App"
                        checked={stripeData.driver_app === "enable"}
                        onChange={(checked) => handleToggle("driver_app", checked ? "enable" : "disable")}
                    />
                    <ToggleItem
                        label="Customer App"
                        checked={stripeData.customer_app === "enable"}
                        onChange={(checked) => handleToggle("customer_app", checked ? "enable" : "disable")}
                    />

                    <div className="grid md:grid-cols-2 gap-6 mt-6">
                        <InputField
                            label="Stripe Publishable Key"
                            placeholder="customer_live_1234567890abc..."
                            value={stripeData.stripe_key}
                            onChange={(e) => setStripeData({ ...stripeData, stripe_key: e.target.value })}
                        />
                        <InputField
                            label="Stripe Secret Key"
                            placeholder=""
                            value={stripeData.stripe_secret_key}
                            onChange={(e) => setStripeData({ ...stripeData, stripe_secret_key: e.target.value })}
                        />
                    </div>

                    {/* <div className="flex justify-start gap-3 pt-4 mt-6">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            {isSubmitting ? "Saving..." : "Save Changes"}
                        </button>
                        <button
                            type="button"
                            className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-100"
                        >
                            Cancel
                        </button>
                    </div> */}
                </div>
            </form>
        </div>
    );
}


const Feature = ({ label }) => (
    <div className="flex items-center gap-2">
        <span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8.6 22.5L6.7 19.3L3.1 18.5L3.45 14.8L1 12L3.45 9.2L3.1 5.5L6.7 4.7L8.6 1.5L12 2.95L15.4 1.5L17.3 4.7L20.9 5.5L20.55 9.2L23 12L20.55 14.8L20.9 18.5L17.3 19.3L15.4 22.5L12 21.05L8.6 22.5ZM10.95 15.55L16.6 9.9L15.2 8.45L10.95 12.7L8.8 10.6L7.4 12L10.95 15.55Z" fill="#10B981" />
        </svg>
        </span>
        {label}
    </div>
);

const ToggleItem = ({ label, checked = false, onChange }) => (
    <div className="grid md:grid-cols-2 grid-cols-2">
        <div className="flex justify-between items-center py-3 last:border-none">
            <span className="font-medium">{label}</span>
            <label className="relative inline-flex items-center cursor-pointer text-[#252525]">
                <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={checked}
                    onChange={(e) => onChange && onChange(e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-checked:bg-blue-600 rounded-full peer transition-all"></div>
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-5 transition-all"></div>
            </label>
        </div>
    </div>
);

const InputField = ({ label, placeholder, value, onChange, disabled = false }) => (
    <div>
        <label className="block text-sm font-medium mb-1">{label}</label>
        <div className="sm:h-16 h-14">
            <input
                type="text"
                disabled={disabled}
                className="sm:px-5 px-4 sm:py-[21px] py-4 border border-[#8D8D8D] rounded-lg w-full h-full shadow-[-4px_4px_6px_0px_#0000001F] placeholder:text-[#6C6C6C] sm:text-base text-sm leading-[22px] font-semibold disabled:bg-gray-50"
                placeholder={placeholder}
                value={value || ""}
                onChange={onChange}
            />
        </div>
    </div>
);

export default Billing;