import React, { useState } from "react";

const Integrations = () => {

    return (
        <div className="w-full mx-auto ">

            {/* Title */}
            <div className="mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Third-party Integrations</h2>
                <p className="text-gray-500">Connect external services and APIs</p>
            </div>

            {/* Integrations */}
            <div className="space-y-4">

                {/* Google Maps Card */}
                <IntegrationCard
                    icon="🌍"
                    name="Google Maps"
                    description="Navigation and location services"
                />

                {/* Stripe Card */}
                <IntegrationCard
                    icon="💳"
                    name="Stripe"
                    description="Payment processing"
                />

                {/* Twilio Card */}
                <IntegrationCard
                    icon="📱"
                    name="Twilio"
                    description="SMS notifications"
                />
            </div>

            {/* SMTP SETTINGS */}
            <div className="bg-white rounded-xl shadow-sm border p-4 space-y-6 mt-4">

                <h3 className="text-lg font-semibold">SMTP Options</h3>

                {/* radio */}
                <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer text-gray-700">
                        <input
                            type="radio"
                            name="smtpType"
                        />
                        Use default mail settings
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-gray-700">
                        <input
                            type="radio"
                            name="smtpType"
                        />
                        Use custom mail settings
                    </label>
                </div>

                {/* CUSTOM SMTP FORM */}
                <div className="grid md:grid-cols-2 gap-5">

                    <InputBox label="Mail Server" placeholder="smtp.looker.com" />
                    <InputBox label="From" placeholder="Taxi Corp Admin <admin@looker.com>" />
                    <InputBox label="User Name" placeholder="taxicorp@looker.com" />
                    <InputBox label="Password" type="password" placeholder="********" />
                    <InputBox label="Port" placeholder="58945" />

                    {/* TLS/SSL Version */}
                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-gray-600">TLS/SSL Version</label>
                        <select className="border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-100">
                            <option>TLSv1_2</option>
                            <option>TLSv1_3</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                        <input type="checkbox" className="" defaultChecked />
                        <label className="text-sm text-gray-700">TLS/SSL</label>
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-start gap-3 pt-4">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        Save Changes
                    </button>
                    <button className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-100">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ------------------------- COMPONENTS ------------------------- */

// Integration Card
const IntegrationCard = ({ icon, name, description }) => (
    <div className="flex items-center justify-between p-4 border rounded-xl bg-white shadow-sm">

        <div className="flex items-center gap-3">
            <div className="w-10 h-10 text-2xl">{icon}</div>

            <div>
                <h3 className="font-semibold text-gray-800">{name}</h3>
                <p className="text-sm text-gray-500">{description}</p>
            </div>
        </div>

        <div className="flex items-center gap-3">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Connected
            </button>
            <button className="border border-blue-600 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50">
                Configure
            </button>
        </div>
    </div>
);

// Input Box
const InputBox = ({ label, placeholder, type = "text" }) => (
    <div className="flex flex-col gap-1">
        <label className="text-sm text-gray-600">{label}</label>
        <input
            type={type}
            placeholder={placeholder}
            className="border rounded-lg px-3 py-2 focus:ring focus:ring-blue-100 focus:outline-none"
        />
    </div>
);


export default Integrations;