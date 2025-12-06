// import React from "react";

// const Billing = () => {
//     return (
//         <div>Billing</div>
//     )
// }

// export default Billing;


import React from "react";

const Billing = () => {
    const invoices = [
        { date: "29 Sep, 2025 @ 20:15", amount: "$245.75" },
        { date: "29 Aug, 2025 @ 20:15", amount: "$245.75" },
        { date: "29 Jul, 2025 @ 20:15", amount: "$245.75" },
        { date: "29 Jun, 2025 @ 20:15", amount: "$245.75" },
        { date: "29 May, 2025 @ 20:15", amount: "$245.75" },
    ];

    return (
        <div className="">

            {/* --------- HEADER ---------- */}
            <h1 className="text-2xl font-semibold">Billing & Subscription</h1>
            <p className="text-gray-500 mb-6">Manage your subscription plan and billing information</p>

            {/* --------- PLAN CARD ---------- */}
            <div className="bg-white rounded-xl shadow p-6 border">
                <div className="flex justify-between items-center">
                    <div className="flex flex-row gap-2">
                        <h2 className="text-xl font-semibold">Professional Plan</h2>
                        <span className="text-green-600 font-medium text-sm bg-green-100 px-2 py-1 rounded">Active</span>
                    </div>
                    <div className="flex flex-col text-end">
                        <span className="text-gray-500">Subscription End Date:
                        </span>
                        <span className="text-end text-sm">29 Oct, 2025</span>
                    </div>
                </div>

                <div className="flex flex-wrap gap-4 mt-5 text-sm text-gray-700">
                    <Feature label="Unlimited Rides" />
                    <Feature label="Up to 100 drivers" />
                    <Feature label="Advanced analytics" />
                    <Feature label="24/7 support" />
                </div>
            </div>

            {/* --------- INVOICES ---------- */}
            

            <div className="bg-white rounded-xl shadow p-4 border mt-3">
                <h3 className="text-lg font-semibold mb-2">Recent Invoices</h3>
                {invoices.map((inv, idx) => (
                    <div key={idx} className="flex flex-col md:flex-row justify-between items-center py-3 border-b last:border-none">
                        <div className="font-medium">Professional Plan</div>
                        <div className="text-gray-500">{inv.date}</div>
                        <div className="font-semibold">{inv.amount}</div>

                        <div className="flex gap-2 mt-2 md:mt-0">
                            <button className="px-4 py-1 rounded border text-sm hover:bg-gray-50">View Invoice</button>
                            <button className="px-4 py-1 rounded border text-sm bg-blue-600 text-white hover:bg-blue-700">
                                Download
                            </button>
                        </div>
                    </div>
                ))}

                <button className="mt-4 text-blue-600 font-medium hover:underline">View All</button>
            </div>

            {/* --------- SWITCHES & KEYS ---------- */}
            <div className="bg-white rounded-xl shadow p-6 border mt-10">
                <ToggleItem label="Stripe Payments" />
                <ToggleItem label="Driver App" />
                <ToggleItem label="Customer App" />

                <div className="grid md:grid-cols-2 gap-6 mt-6">
                    <InputField label="Stripe Publishable Key" placeholder="customer_live_1234567890abc..." />
                    <InputField label="Stripe Secret Key" placeholder="driver_live_1234567890abc..." />
                </div>

                <div className="mt-6">
                    <label className="block text-sm font-medium mb-1">Stripe Country</label>
                    <select className="w-full border rounded-lg p-2 focus:ring">
                        <option>Select</option>
                    </select>
                </div>
            </div>
        </div>
    );
}

/* ========== COMPONENTS ========== */

const Feature = ({ label }) => (
    <div className="flex items-center gap-2">
        <span className="w-3 h-3 bg-green-500 rounded-full"></span>
        {label}
    </div>
);

const ToggleItem = ({ label }) => (
    <div className="flex justify-between items-center py-3 border-b last:border-none">
        <span className="font-medium">{label}</span>
        <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" defaultChecked />
            <div className="w-11 h-6 bg-gray-200 peer-checked:bg-blue-600 rounded-full peer transition-all"></div>
            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-5 transition-all"></div>
        </label>
    </div>
);

const InputField = ({ label, placeholder }) => (
    <div>
        <label className="block text-sm font-medium mb-1">{label}</label>
        <input
            type="text"
            className="w-full border rounded-lg p-2 focus:ring"
            placeholder={placeholder}
        />
    </div>
);

export default Billing;