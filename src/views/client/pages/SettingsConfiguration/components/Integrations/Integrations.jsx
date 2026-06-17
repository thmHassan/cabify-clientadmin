import React, { useCallback, useEffect, useState } from "react";
import { getTenantData } from "../../../../../../utils/functions/tokenEncryption";
import { apiSaveThirdPartyInformation } from "../../../../../../services/SettingsConfigurationServices";
import { fetchThirdPartyMapSettings } from "../../../../../../utils/map/fetchThirdPartyMapSettings";
import { hasValidGoogleKey } from "../../../../../../utils/map/resolveMapProvider";
import { useMapConfig } from "../../../../../../contexts/MapConfigContext";
import toast from "react-hot-toast";

const Integrations = () => {
    const { refreshMapConfig } = useMapConfig();
    const [thirdPartyData, setThirdPartyData] = useState({
        google_api_keys: "",
        barikoi_api_keys: "",
        map_settings: "",
        map_type: "default",
        mail_server: "",
        mail_from: "",
        mail_user_name: "",
        mail_password: "",
        mail_port: "",
        tls_ssl_version: "TLSv1_2",
        tls_ssl_enabled: true,
        smtp_type: "",
    });
    const [tableLoading, setTableLoading] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [mapConfigSource, setMapConfigSource] = useState(null);

    const tenantDataFromStorage = getTenantData();
    const showMapIntegrations = tenantDataFromStorage?.map !== "disable";

    const googleKeyConfigured = hasValidGoogleKey(thirdPartyData.google_api_keys);
    const activeMapProvider = googleKeyConfigured
        ? "Google Maps"
        : "Mapify (default)";

    const fetchThirdPartyInformation = useCallback(async () => {
        setTableLoading(true);
        try {
            const { settings, fromFallback, error: loadError } =
                await fetchThirdPartyMapSettings();

            if (loadError) {
                setError(loadError);
            } else {
                setError(null);
            }

            setMapConfigSource(fromFallback ? "map-information" : "third-party-information");
            setThirdPartyData((prev) => ({
                ...prev,
                google_api_keys: settings.google_api_keys || "",
                barikoi_api_keys: settings.barikoi_api_keys || "",
                map_settings: settings.map_settings || "",
                map_type: settings.map_type || "default",
                mail_server: settings.mail_server || "",
                mail_from: settings.mail_from || "",
                mail_user_name: settings.mail_user_name || "",
                mail_password: settings.mail_password || "",
                mail_port: settings.mail_port || "",
                tls_ssl_version: settings.tls_ssl_version || "TLSv1_2",
                tls_ssl_enabled:
                    settings.tls_ssl_enabled !== undefined
                        ? settings.tls_ssl_enabled
                        : true,
                smtp_type: settings.mail_server ? "custom" : "default",
            }));
        } catch (fetchError) {
            setMapConfigSource(null);
            setThirdPartyData({
                google_api_keys: "",
                barikoi_api_keys: "",
                map_settings: "",
                map_type: "default",
                mail_server: "",
                mail_from: "",
                mail_user_name: "",
                mail_password: "",
                mail_port: "",
                tls_ssl_version: "TLSv1_2",
                tls_ssl_enabled: true,
                smtp_type: "default",
            });
            setError("Unable to load integration settings.");
        } finally {
            setTableLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchThirdPartyInformation();
    }, [fetchThirdPartyInformation, refreshTrigger]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        const formData = new FormData();
        formData.append("google_api_keys", thirdPartyData.google_api_keys);
        formData.append("barikoi_api_keys", thirdPartyData.barikoi_api_keys);
        formData.append("map_settings", thirdPartyData.map_settings);

        if (thirdPartyData.smtp_type === "custom") {
            formData.append("mail_server", thirdPartyData.mail_server);
            formData.append("mail_from", thirdPartyData.mail_from);
            formData.append("mail_user_name", thirdPartyData.mail_user_name);
            formData.append("mail_password", thirdPartyData.mail_password);
            formData.append("mail_port", thirdPartyData.mail_port);
        }

        try {
            const response = await apiSaveThirdPartyInformation(formData);
            if (response?.data?.success === 1) {
                toast.success("Settings saved successfully");
                setRefreshTrigger((prev) => prev + 1);
                refreshMapConfig();
            } else {
                toast.error("Failed to save settings");
                setError("Failed to save changes.");
            }
        } catch (err) {
            setError("An error occurred while saving the third-party information.");
            toast.error("Failed to save settings");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full mx-auto ">
            <div className="mb-4">
                <h2 className="text-2xl font-semibold text-[#252525]">Third-party Integrations</h2>
                <p className="text-[#6C6C6C] mb-6">Connect external services and APIs</p>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                    {showMapIntegrations && (
                        <>
                            <div className="grid grid-cols-2 p-4 border rounded-xl bg-white shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between gap-3">
                                            <h3 className="font-semibold text-gray-800">Google Maps</h3>
                                            <span
                                                className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                                                    googleKeyConfigured
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-gray-100 text-gray-600"
                                                }`}
                                            >
                                                {googleKeyConfigured ? "API key configured" : "No API key"}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Active map provider: {activeMapProvider}
                                            {mapConfigSource
                                                ? ` (loaded from ${mapConfigSource})`
                                                : ""}
                                        </p>
                                        <div className="mt-2">
                                            <InputBox
                                                label="API Key"
                                                placeholder="Enter Google Maps API Key"
                                                value={thirdPartyData.google_api_keys}
                                                onChange={(e) =>
                                                    setThirdPartyData({
                                                        ...thirdPartyData,
                                                        google_api_keys: e.target.value,
                                                    })
                                                }
                                                disabled={tableLoading}
                                            />
                                        </div>
                                        {!googleKeyConfigured && (
                                            <p className="text-sm text-gray-500 mt-2">
                                                When no Google key is saved, the app uses Mapify as the default map provider.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div className="bg-white rounded-xl shadow-sm border p-4 space-y-6 mt-4">
                    <h3 className="text-lg font-semibold">SMTP Options</h3>
                    <div className="flex gap-6">
                        <label className="flex items-center gap-2 cursor-pointer text-gray-700">
                            <input
                                type="radio"
                                name="smtpType"
                                value="default"
                                checked={thirdPartyData.map_settings === "default"}
                                onChange={(e) =>
                                    setThirdPartyData({
                                        ...thirdPartyData,
                                        map_settings: e.target.value,
                                    })
                                }
                            />
                            Use default mail settings
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer text-gray-700">
                            <input
                                type="radio"
                                name="smtpType"
                                value="custom"
                                checked={thirdPartyData.map_settings === "custom"}
                                onChange={(e) =>
                                    setThirdPartyData({
                                        ...thirdPartyData,
                                        map_settings: e.target.value,
                                    })
                                }
                            />
                            Use custom mail settings
                        </label>
                    </div>

                    {thirdPartyData.map_settings === "custom" && (
                        <div>
                            <div className="grid md:grid-cols-2 gap-5">
                                <InputBox
                                    label="Mail Server"
                                    placeholder="smtp.looker.com"
                                    value={thirdPartyData.mail_server}
                                    onChange={(e) =>
                                        setThirdPartyData({
                                            ...thirdPartyData,
                                            mail_server: e.target.value,
                                        })
                                    }
                                />

                                <InputBox
                                    label="From"
                                    placeholder="Taxi Corp Admin <admin@looker.com>"
                                    value={thirdPartyData.mail_from}
                                    onChange={(e) =>
                                        setThirdPartyData({
                                            ...thirdPartyData,
                                            mail_from: e.target.value,
                                        })
                                    }
                                />

                                <InputBox
                                    label="User Name"
                                    placeholder="taxicorp@looker.com"
                                    value={thirdPartyData.mail_user_name}
                                    onChange={(e) =>
                                        setThirdPartyData({
                                            ...thirdPartyData,
                                            mail_user_name: e.target.value,
                                        })
                                    }
                                />

                                <InputBox
                                    label="Password"
                                    type="password"
                                    placeholder="********"
                                    value={thirdPartyData.mail_password}
                                    onChange={(e) =>
                                        setThirdPartyData({
                                            ...thirdPartyData,
                                            mail_password: e.target.value,
                                        })
                                    }
                                />

                                <InputBox
                                    label="Port"
                                    placeholder="587"
                                    value={thirdPartyData.mail_port}
                                    onChange={(e) =>
                                        setThirdPartyData({
                                            ...thirdPartyData,
                                            mail_port: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div className="grid md:grid-cols-2 gap-5 mt-3">
                                <div>
                                    <div className="flex items-center gap-2 mt-2">
                                        <input
                                            type="checkbox"
                                            checked={thirdPartyData.tls_ssl_enabled}
                                            onChange={(e) =>
                                                setThirdPartyData({
                                                    ...thirdPartyData,
                                                    tls_ssl_enabled: e.target.checked,
                                                })
                                            }
                                        />
                                        <label className="text-[#6C6C6C]">TLS/SSL</label>
                                    </div>
                                    <div className="flex flex-col gap-1 mt-2">
                                        <label className="block text-sm font-medium mb-1">
                                            TLS/SSL Version
                                        </label>
                                        <select
                                            className="sm:px-5 px-4 sm:py-[21px] py-4 border border-[#8D8D8D] rounded-lg w-full h-full shadow-[-4px_4px_6px_0px_#0000001F] placeholder:text-[#6C6C6C] sm:text-base text-sm leading-[22px] font-semibold disabled:bg-gray-50"
                                            value={thirdPartyData.tls_ssl_version}
                                            onChange={(e) =>
                                                setThirdPartyData({
                                                    ...thirdPartyData,
                                                    tls_ssl_version: e.target.value,
                                                })
                                            }
                                        >
                                            <option value="TLSv1_2">TLSv1_2</option>
                                            <option value="TLSv1_3">TLSv1_3</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="submit"
                            disabled={isSubmitting || tableLoading}
                            className="px-4 py-2 bg-[#1F41BB] text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            {isSubmitting ? "Saving..." : "Save Changes"}
                        </button>
                        <button
                            type="button"
                            className="px-4 py-2 border border-[#1F41BB] rounded-lg text-[#1F41BB]"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

const InputBox = ({
    label,
    placeholder,
    type = "text",
    value,
    onChange,
    disabled = false,
}) => (
    <div>
        <label className="block text-sm font-medium mb-1">{label}</label>
        <div className="">
            <input
                type={type}
                disabled={disabled}
                className="sm:px-5 px-4 sm:py-[21px] py-4 border border-[#8D8D8D] rounded-lg w-full h-full shadow-[-4px_4px_6px_0px_#0000001F] placeholder:text-[#6C6C6C] sm:text-base text-sm leading-[22px] font-semibold disabled:bg-gray-50"
                placeholder={placeholder}
                value={value || ""}
                onChange={onChange}
            />
        </div>
    </div>
);

export default Integrations;
