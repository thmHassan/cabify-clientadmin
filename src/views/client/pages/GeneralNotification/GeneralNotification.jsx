import React, { useCallback, useEffect, useMemo, useState } from "react";
import PageTitle from "../../../../components/ui/PageTitle/PageTitle";
import CardContainer from "../../../../components/shared/CardContainer/CardContainer";
import { ErrorMessage, Field, Form, Formik } from "formik";
import FormLabel from "../../../../components/ui/FormLabel/FormLabel";
import FormSelection from "../../../../components/ui/FormSelection/FormSelection";
import Button from "../../../../components/ui/Button/Button";
import SearchBar from "../../../../components/shared/SearchBar/SearchBar";
import Pagination from "../../../../components/ui/Pagination/Pagination";
import AppLogoLoader from "../../../../components/shared/AppLogoLoader";
import { apiGetAllVehicleType } from "../../../../services/VehicleTypeServices";
import {
    apiGetNotificationRecipients,
    apiSendNotifiction,
} from "../../../../services/GeneralNotificationServices";
import { NOTIFICATION_VALIDATION_SCHEMA } from "../../validators/pages/generalNotification.validation";
import { formatPhoneNumber } from "../../../../utils/tenantFormatUtils";
import toast from "react-hot-toast";

const USER_TYPE_OPTIONS = [
    { value: "all_drivers", label: "All Drivers" },
    { value: "all_users", label: "All Users" },
    { value: "pending_drivers", label: "Pending Drivers" },
    { value: "approved_drivers", label: "Approved Drivers" },
    { value: "rejected_drivers", label: "Rejected Drivers" },
];

const DRIVER_USER_TYPES = new Set([
    "all_drivers",
    "pending_drivers",
    "approved_drivers",
    "rejected_drivers",
]);

const capitalizeFirst = (value) => {
    if (!value) return "-";
    return value.charAt(0).toUpperCase() + value.slice(1);
};

const GeneralNotification = () => {
    const [vehicleList, setVehicleList] = useState([]);
    const [loadingVehicleType, setLoadingVehicleType] = useState(false);
    const [sending, setSending] = useState(false);

    const [recipients, setRecipients] = useState([]);
    const [recipientsLoading, setRecipientsLoading] = useState(false);
    const [selectedRecipientIds, setSelectedRecipientIds] = useState([]);
    const [recipientSearch, setRecipientSearch] = useState("");
    const [debouncedRecipientSearch, setDebouncedRecipientSearch] = useState("");
    const [recipientPage, setRecipientPage] = useState(1);
    const [recipientItemsPerPage, setRecipientItemsPerPage] = useState(10);
    const [recipientTotalPages, setRecipientTotalPages] = useState(1);
    const [recipientTotal, setRecipientTotal] = useState(0);

    const [activeUserType, setActiveUserType] = useState("");
    const [activeVehicleId, setActiveVehicleId] = useState("");

    useEffect(() => {
        const fetchVehicle = async () => {
            setLoadingVehicleType(true);
            try {
                const response = await apiGetAllVehicleType();
                if (response?.data?.success === 1) {
                    const options = (response?.data?.list || []).map((vehicle) => ({
                        label: vehicle.vehicle_type_name,
                        value: vehicle.id.toString(),
                    }));
                    setVehicleList(options);
                }
            } catch (error) {
                console.error("Error fetching vehicle types:", error);
            } finally {
                setLoadingVehicleType(false);
            }
        };

        fetchVehicle();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedRecipientSearch(recipientSearch);
            setRecipientPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [recipientSearch]);

    const fetchRecipients = useCallback(async () => {
        if (!activeUserType) {
            setRecipients([]);
            setRecipientTotal(0);
            setRecipientTotalPages(1);
            return;
        }

        setRecipientsLoading(true);
        try {
            const params = {
                user_type: activeUserType,
                page: recipientPage,
                perPage: recipientItemsPerPage,
            };

            if (debouncedRecipientSearch?.trim()) {
                params.search = debouncedRecipientSearch.trim();
            }

            if (activeVehicleId && DRIVER_USER_TYPES.has(activeUserType)) {
                params.vehicle_id = activeVehicleId;
            }

            const response = await apiGetNotificationRecipients(params);

            if (response?.data?.success === 1) {
                const paginated = response?.data?.recipients;
                setRecipients(paginated?.data || []);
                setRecipientTotal(paginated?.total || 0);
                setRecipientTotalPages(paginated?.last_page || 1);
            } else {
                setRecipients([]);
                setRecipientTotal(0);
                setRecipientTotalPages(1);
            }
        } catch (error) {
            console.error("Error fetching notification recipients:", error);
            setRecipients([]);
            setRecipientTotal(0);
            setRecipientTotalPages(1);
        } finally {
            setRecipientsLoading(false);
        }
    }, [
        activeUserType,
        activeVehicleId,
        debouncedRecipientSearch,
        recipientPage,
        recipientItemsPerPage,
    ]);

    useEffect(() => {
        fetchRecipients();
    }, [fetchRecipients]);

    const isDriverType = DRIVER_USER_TYPES.has(activeUserType);

    const selectedOnPageCount = useMemo(
        () => recipients.filter((r) => selectedRecipientIds.includes(r.id)).length,
        [recipients, selectedRecipientIds]
    );

    const toggleRecipient = (id) => {
        setSelectedRecipientIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    const selectAllOnPage = () => {
        const pageIds = recipients.map((r) => r.id);
        setSelectedRecipientIds((prev) => {
            const merged = new Set([...prev, ...pageIds]);
            return Array.from(merged);
        });
    };

    const clearSelection = () => setSelectedRecipientIds([]);

    const handleUserTypeChange = (val, setFieldValue) => {
        setFieldValue("type", val);
        const userType = val?.value || val || "";
        setActiveUserType(userType);
        setSelectedRecipientIds([]);
        setRecipientPage(1);
        setRecipientSearch("");
        setDebouncedRecipientSearch("");

        if (!DRIVER_USER_TYPES.has(userType)) {
            setFieldValue("vehicleType", "");
            setActiveVehicleId("");
        }
    };

    const handleVehicleTypeChange = (val, setFieldValue) => {
        setFieldValue("vehicleType", val);
        const vehicleId = val?.value || val || "";
        setActiveVehicleId(vehicleId);
        setSelectedRecipientIds([]);
        setRecipientPage(1);
    };

    return (
        <div className="px-4 py-5 sm:p-6 lg:p-10 min-h-[calc(100vh-85px)]">
            <div className="flex flex-col gap-2.5 sm:mb-[30px] mb-6">
                <PageTitle title="General Notification" />
            </div>

            <CardContainer className="!p-3 sm:!p-4 lg:!px-5 lg:!pt-[30px] lg:!pb-5 2xl:!p-10">
                <Formik
                    initialValues={{
                        title: "",
                        body: "",
                        type: "",
                        vehicleType: "",
                    }}
                    validationSchema={NOTIFICATION_VALIDATION_SCHEMA}
                    onSubmit={async (values, { resetForm }) => {
                        try {
                            setSending(true);

                            const formData = new FormData();
                            formData.append("user_type", values.type?.value || values.type);
                            formData.append("title", values.title);
                            formData.append("body", values.body);

                            if (values.vehicleType && isDriverType) {
                                formData.append(
                                    "vehicle_id",
                                    values.vehicleType?.value || values.vehicleType
                                );
                            }

                            if (selectedRecipientIds.length > 0) {
                                selectedRecipientIds.forEach((id) => {
                                    formData.append("recipient_ids[]", id);
                                });
                            }

                            const response = await apiSendNotifiction(formData);

                            if (response?.data?.success === 1) {
                                const count = response?.data?.recipient_count;
                                toast.success(
                                    count != null
                                        ? `Notification sent to ${count} recipient(s)`
                                        : "Notification sent successfully"
                                );
                                resetForm();
                                setActiveUserType("");
                                setActiveVehicleId("");
                                setSelectedRecipientIds([]);
                                setRecipients([]);
                                setRecipientSearch("");
                                setDebouncedRecipientSearch("");
                                setRecipientPage(1);
                            } else {
                                toast.error(
                                    response?.data?.message || "Failed to send notification"
                                );
                            }
                        } catch (error) {
                            toast.error(
                                error?.response?.data?.message || "Notification send failed"
                            );
                            console.error("Notification send failed:", error);
                        } finally {
                            setSending(false);
                        }
                    }}
                >
                    {({ values, setFieldValue, handleSubmit, resetForm }) => (
                        <Form>
                            <div className="max-w-[720px] flex flex-col gap-5">
                                <div>
                                    <FormLabel>Title</FormLabel>
                                    <div className="sm:h-16 h-14">
                                        <Field
                                            name="title"
                                            type="text"
                                            placeholder="Enter Title"
                                            className="sm:px-5 px-4 sm:py-[21px] py-4 border border-[#8D8D8D] rounded-lg w-full h-full font-semibold"
                                        />
                                    </div>
                                    <ErrorMessage
                                        name="title"
                                        component="div"
                                        className="text-red-500 text-sm mt-1"
                                    />
                                </div>

                                <div>
                                    <FormLabel>Body</FormLabel>
                                    <div className="h-[130px]">
                                        <Field
                                            as="textarea"
                                            name="body"
                                            rows={5}
                                            placeholder="Write here..."
                                            className="h-full sm:px-5 px-4 sm:py-[21px] py-4 border border-[#8D8D8D] rounded-lg w-full font-semibold"
                                        />
                                    </div>
                                    <ErrorMessage
                                        name="body"
                                        component="div"
                                        className="text-red-500 text-sm mt-1"
                                    />
                                </div>

                                <div>
                                    <FormLabel>User Type</FormLabel>
                                    <div className="sm:h-16 h-14">
                                        <FormSelection
                                            name="type"
                                            value={values.type}
                                            onChange={(val) =>
                                                handleUserTypeChange(val, setFieldValue)
                                            }
                                            placeholder="Select Type"
                                            options={USER_TYPE_OPTIONS}
                                        />
                                    </div>
                                    <ErrorMessage
                                        name="type"
                                        component="div"
                                        className="text-red-500 text-sm mt-1"
                                    />
                                </div>

                                {isDriverType && (
                                    <div>
                                        <FormLabel>Vehicle Type (optional filter)</FormLabel>
                                        <div className="sm:h-16 h-14">
                                            <FormSelection
                                                name="vehicleType"
                                                value={values.vehicleType}
                                                onChange={(val) =>
                                                    handleVehicleTypeChange(val, setFieldValue)
                                                }
                                                placeholder={
                                                    loadingVehicleType
                                                        ? "Loading..."
                                                        : "All vehicle types"
                                                }
                                                options={vehicleList}
                                                isDisabled={loadingVehicleType}
                                            />
                                        </div>
                                    </div>
                                )}

                                {activeUserType && (
                                    <div className="border border-[#E9E9E9] rounded-lg p-4 bg-[#FAFAFA]">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                                            <div>
                                                <FormLabel>Recipients</FormLabel>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Select specific people, or leave none selected
                                                    to broadcast to the entire group (
                                                    {recipientTotal} total).
                                                </p>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                <Button
                                                    btnType="button"
                                                    btnSize="sm"
                                                    type="filledGray"
                                                    className="!px-3 !py-1 text-xs"
                                                    onClick={selectAllOnPage}
                                                    disabled={recipients.length === 0}
                                                >
                                                    Select page
                                                </Button>
                                                <Button
                                                    btnType="button"
                                                    btnSize="sm"
                                                    type="filledGray"
                                                    className="!px-3 !py-1 text-xs"
                                                    onClick={clearSelection}
                                                    disabled={selectedRecipientIds.length === 0}
                                                >
                                                    Clear ({selectedRecipientIds.length})
                                                </Button>
                                            </div>
                                        </div>

                                        <SearchBar
                                            key={activeUserType}
                                            onSearchChange={setRecipientSearch}
                                            className="w-full max-w-full mb-4"
                                        />

                                        {recipientsLoading ? (
                                            <div className="flex justify-center py-8">
                                                <AppLogoLoader />
                                            </div>
                                        ) : recipients.length === 0 ? (
                                            <p className="text-center text-gray-500 py-6 text-sm">
                                                No recipients found for this filter.
                                            </p>
                                        ) : (
                                            <div className="flex flex-col gap-2 max-h-[320px] overflow-y-auto">
                                                {recipients.map((recipient) => {
                                                    const isSelected =
                                                        selectedRecipientIds.includes(
                                                            recipient.id
                                                        );
                                                    return (
                                                        <label
                                                            key={`${recipient.entity_type}-${recipient.id}`}
                                                            className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                                                                isSelected
                                                                    ? "border-[#1F41BB] bg-[#006FFF1A]"
                                                                    : "border-gray-200 bg-white hover:bg-gray-50"
                                                            }`}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={isSelected}
                                                                onChange={() =>
                                                                    toggleRecipient(recipient.id)
                                                                }
                                                                className="mt-1 h-4 w-4"
                                                            />
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-semibold text-sm text-gray-900 truncate">
                                                                    {recipient.name || "-"}
                                                                </p>
                                                                <p className="text-xs text-gray-500 truncate">
                                                                    {recipient.email || "-"}
                                                                </p>
                                                                <p className="text-xs text-gray-600">
                                                                    {formatPhoneNumber(
                                                                        recipient.country_code,
                                                                        recipient.phone ||
                                                                            recipient.phone_no
                                                                    )}
                                                                </p>
                                                                <div className="flex gap-2 mt-1">
                                                                    <span className="text-[10px] uppercase px-2 py-0.5 rounded-full bg-gray-200 text-gray-700">
                                                                        {recipient.entity_type}
                                                                    </span>
                                                                    <span className="text-[10px] uppercase px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                                                                        {capitalizeFirst(
                                                                            recipient.status
                                                                        )}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {!recipientsLoading && recipients.length > 0 && (
                                            <p className="text-xs text-gray-500 mt-2">
                                                {selectedOnPageCount} selected on this page ·{" "}
                                                {selectedRecipientIds.length} selected overall
                                            </p>
                                        )}

                                        {recipientTotalPages > 1 && (
                                            <div className="mt-4 border-t border-gray-200 pt-3">
                                                <Pagination
                                                    currentPage={recipientPage}
                                                    totalPages={recipientTotalPages}
                                                    itemsPerPage={recipientItemsPerPage}
                                                    onPageChange={setRecipientPage}
                                                    onItemsPerPageChange={(size) => {
                                                        setRecipientItemsPerPage(size);
                                                        setRecipientPage(1);
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="pt-4 flex gap-2">
                                    <Button
                                        btnType="submit"
                                        btnSize="md"
                                        type="filled"
                                        onClick={handleSubmit}
                                        disabled={sending}
                                        className="sm:h-14 h-12 px-10 rounded-lg font-semibold"
                                    >
                                        {sending
                                            ? "Sending..."
                                            : selectedRecipientIds.length > 0
                                              ? `Send to ${selectedRecipientIds.length} selected`
                                              : "Send to all in group"}
                                    </Button>
                                    <Button
                                        btnType="button"
                                        onClick={() => {
                                            resetForm();
                                            setActiveUserType("");
                                            setActiveVehicleId("");
                                            setSelectedRecipientIds([]);
                                            setRecipients([]);
                                            setRecipientSearch("");
                                            setDebouncedRecipientSearch("");
                                            setRecipientPage(1);
                                        }}
                                        className="border border-[#1F41BB] sm:h-14 h-12 px-10 rounded-lg font-semibold text-[#1F41BB]"
                                    >
                                        Clear
                                    </Button>
                                </div>
                            </div>
                        </Form>
                    )}
                </Formik>
            </CardContainer>
        </div>
    );
};

export default GeneralNotification;
