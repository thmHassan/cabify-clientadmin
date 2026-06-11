import { useCallback, useEffect, useState } from "react";
import Button from "../../../../../../components/ui/Button/Button";
import AppLogoLoader from "../../../../../../components/shared/AppLogoLoader";
import {
    apiGetContactUsById,
    apiPostContactUsResponse,
} from "../../../../../../services/ContactUsService";
import { getTenantData } from "../../../../../../utils/functions/tokenEncryption";
import toast from "react-hot-toast";

const DetailRow = ({ label, value }) => (
    <div>
        <p className="text-xs text-gray-500 mb-1">{label}</p>
        <p className="text-sm font-medium text-gray-900 break-words whitespace-pre-wrap">
            {value || "-"}
        </p>
    </div>
);

const ContactUsDetailModal = ({ contactId, onClose, onResponded }) => {
    const [contact, setContact] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [responseText, setResponseText] = useState("");

    const tenant = getTenantData();
    const timeZone = tenant?.time_zone || "UTC";

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        if (Number.isNaN(date.getTime())) return dateString;
        return date
            .toLocaleString("en-GB", {
                timeZone: timeZone,
                weekday: "short",
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            })
            .replace(",", "");
    };

    const capitalizeFirst = (value) => {
        if (!value) return "-";
        return value.charAt(0).toUpperCase() + value.slice(1);
    };

    const fetchContactDetails = useCallback(async () => {
        if (!contactId) return;

        setLoading(true);
        setError(null);
        try {
            const response = await apiGetContactUsById({ id: contactId });

            if (response?.data?.success === 1) {
                const data = response?.data?.data || null;
                setContact(data);
                setResponseText(data?.response || "");
            } else {
                setError(response?.data?.message || "Failed to load contact message");
            }
        } catch (err) {
            setError(err?.response?.data?.message || "Failed to load contact message");
        } finally {
            setLoading(false);
        }
    }, [contactId]);

    useEffect(() => {
        fetchContactDetails();
    }, [fetchContactDetails]);

    const handleSubmitResponse = async () => {
        if (!contactId) return;

        const trimmedResponse = responseText.trim();
        if (!trimmedResponse) {
            toast.error("Please enter a response");
            return;
        }

        setSubmitting(true);
        try {
            const response = await apiPostContactUsResponse({
                id: contactId,
                response: trimmedResponse,
            });

            if (response?.data?.success === 1 || response?.status === 200) {
                toast.success(response?.data?.message || "Response sent successfully");
                await fetchContactDetails();
                onResponded?.();
            } else {
                toast.error(response?.data?.message || "Failed to send response");
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to send response");
        } finally {
            setSubmitting(false);
        }
    };

    const isPending = contact?.status === "pending";

    return (
        <div className="min-w-[280px]">
            <div className="flex items-start justify-between gap-4 mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Contact Message Details</h2>
                <button
                    type="button"
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                    aria-label="Close"
                >
                    ×
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <AppLogoLoader />
                </div>
            ) : error ? (
                <div className="text-center py-8">
                    <p className="text-red-500 mb-4">{error}</p>
                    <Button type="filledGray" onClick={onClose}>
                        Close
                    </Button>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <DetailRow label="ID" value={`#${contact?.id}`} />
                        <DetailRow label="User Type" value={capitalizeFirst(contact?.user_type)} />
                        <DetailRow label="User ID" value={contact?.user_id} />
                        <DetailRow label="Status" value={capitalizeFirst(contact?.status)} />
                        <DetailRow label="Submitted At" value={formatDate(contact?.created_at)} />
                        <DetailRow label="Responded At" value={formatDate(contact?.responded_at)} />
                        <div className="sm:col-span-2">
                            <DetailRow label="Message" value={contact?.message} />
                        </div>
                        {!isPending && (
                            <div className="sm:col-span-2">
                                <DetailRow label="Response" value={contact?.response} />
                            </div>
                        )}
                    </div>

                    {isPending && (
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Admin Response
                            </label>
                            <textarea
                                value={responseText}
                                onChange={(e) => setResponseText(e.target.value)}
                                placeholder="Enter your response..."
                                rows={4}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-600 resize-none"
                            />
                        </div>
                    )}
                </>
            )}

            {!loading && !error && (
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                    <Button type="filledGray" onClick={onClose} className="px-6">
                        Close
                    </Button>
                    {isPending && (
                        <Button
                            type="filled"
                            onClick={handleSubmitResponse}
                            disabled={submitting}
                            className="px-6"
                        >
                            {submitting ? "Sending..." : "Send Response"}
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
};

export default ContactUsDetailModal;
