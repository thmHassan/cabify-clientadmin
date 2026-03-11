import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import CardContainer from "../../../../../../components/shared/CardContainer";
import Loading from "../../../../../../components/shared/Loading/Loading";
import Button from "../../../../../../components/ui/Button/Button";
import PageTitle from "../../../../../../components/ui/PageTitle/PageTitle";
import { lockBodyScroll, unlockBodyScroll } from "../../../../../../utils/functions/common.function";
import RideHistory from "./components/RideHistory";
import Pagination from "../../../../../../components/ui/Pagination/Pagination";
import { useAppSelector } from "../../../../../../store";
import { PAGE_SIZE_OPTIONS, STATUS_OPTIONS } from "../../../../../../constants/selectOptions";
import { apiGetUserById, apiEditUser, apiGetRideHistory, apiEditUserStatus } from "../../../../../../services/UserService";
import Modal from "../../../../../../components/shared/Modal/Modal";
import SendNotifictionModel from "./components/SendNotifictionModel";
import toast from "react-hot-toast";
import { getTenantData } from "../../../../../../utils/functions/tokenEncryption";

const COUNTRY_CODE_MAP = {
    AF: "+93", AC: "+247", AL: "+355", DZ: "+213", AD: "+376",
    AO: "+244", AI: "+1264", AG: "+1268", AR: "+54", AM: "+374",
    AW: "+297", AU: "+61", AT: "+43", AZ: "+994", BS: "+1242",
    BH: "+973", BD: "+880", BB: "+1246", BY: "+375", BE: "+32",
    BZ: "+501", BJ: "+229", BM: "+1441", BT: "+975", BO: "+591",
    BA: "+387", BW: "+267", BR: "+55", BN: "+673", BG: "+359",
    BF: "+226", BI: "+257", KH: "+855", CM: "+237", CA: "+1",
    CV: "+238", KY: "+1345", CF: "+236", TD: "+235", CL: "+56",
    CN: "+86", CO: "+57", KM: "+269", CG: "+242", CD: "+243",
    CK: "+682", CR: "+506", HR: "+385", CU: "+53", CY: "+357",
    CZ: "+420", DK: "+45", DJ: "+253", DM: "+1767", DO: "+1809",
    EC: "+593", EG: "+20", SV: "+503", GQ: "+240", ER: "+291",
    EE: "+372", ET: "+251", FK: "+500", FO: "+298", FJ: "+679",
    FI: "+358", FR: "+33", GF: "+594", PF: "+689", GA: "+241",
    GM: "+220", GE: "+995", DE: "+49", GH: "+233", GI: "+350",
    GR: "+30", GL: "+299", GD: "+1473", GP: "+590", GU: "+1671",
    GT: "+502", GN: "+224", GW: "+245", GY: "+592", HT: "+509",
    HN: "+504", HK: "+852", HU: "+36", IS: "+354", IN: "+91",
    ID: "+62", IR: "+98", IQ: "+964", IE: "+353", IL: "+972",
    IT: "+39", JM: "+1876", JP: "+81", JO: "+962", KZ: "+7",
    KE: "+254", KI: "+686", KP: "+850", KR: "+82", KW: "+965",
    KG: "+996", LA: "+856", LV: "+371", LB: "+961", LS: "+266",
    LR: "+231", LY: "+218", LI: "+423", LT: "+370", LU: "+352",
    MO: "+853", MK: "+389", MG: "+261", MW: "+265", MY: "+60",
    MV: "+960", ML: "+223", MT: "+356", MH: "+692", MQ: "+596",
    MR: "+222", MU: "+230", MX: "+52", FM: "+691", MD: "+373",
    MC: "+377", MN: "+976", ME: "+382", MS: "+1664", MA: "+212",
    MZ: "+258", MM: "+95", NA: "+264", NR: "+674", NP: "+977",
    NL: "+31", NZ: "+64", NI: "+505", NE: "+227", NG: "+234",
    NU: "+683", NF: "+672", NO: "+47", OM: "+968", PK: "+92",
    PW: "+680", PS: "+970", PA: "+507", PG: "+675", PY: "+595",
    PE: "+51", PH: "+63", PL: "+48", PT: "+351", PR: "+1787",
    QA: "+974", RE: "+262", RO: "+40", RU: "+7", RW: "+250",
    KN: "+1869", LC: "+1758", VC: "+1784", WS: "+685", SM: "+378",
    ST: "+239", SA: "+966", SN: "+221", RS: "+381", SC: "+248",
    SL: "+232", SG: "+65", SK: "+421", SI: "+386", SB: "+677",
    SO: "+252", ZA: "+27", SS: "+211", ES: "+34", LK: "+94",
    SD: "+249", SR: "+597", SZ: "+268", SE: "+46", CH: "+41",
    SY: "+963", TW: "+886", TJ: "+992", TZ: "+255", TH: "+66",
    TL: "+670", TG: "+228", TO: "+676", TT: "+1868", TN: "+216",
    TR: "+90", TM: "+993", TC: "+1649", TV: "+688", UG: "+256",
    UA: "+380", AE: "+971", GB: "+44", US: "+1", UY: "+598",
    UZ: "+998", VU: "+678", VE: "+58", VN: "+84", VG: "+1284",
    VI: "+1340", YE: "+967", ZM: "+260", ZW: "+263",
};

const EditUserDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const tenantData = getTenantData();

    const isPushNotificationEnabled =
        tenantData?.push_notification === "enable" ||
        tenantData?.push_notification === "yes" ||
        tenantData?.data?.push_notification === "enable" ||
        tenantData?.data?.push_notification === "yes";

    // ✅ Get country code from tenant's country_of_use (e.g. "AU" → "+61")
    const defaultCountryCode =
        COUNTRY_CODE_MAP[tenantData?.data?.country_of_use || tenantData?.country_of_use] || "";

    const [isSendNotificationModalOpen, setIsSendNotificationModalOpen] = useState({
        type: "new",
        isOpen: false,
    });

    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [rideHistory, setRideHistory] = useState([]);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone_no: "",
        country_code: "",
        password: "",
        address: "",
        city: "",
        status: "",
    });

    const [tableLoading, setTableLoading] = useState(false);
    const [_selectedStatus, setSelectedStatus] = useState(
        STATUS_OPTIONS.find((o) => o.value === "all") ?? STATUS_OPTIONS[0]
    );
    const savedPagination = useAppSelector(
        (state) => state?.app?.app?.pagination?.companies
    );

    const [currentPage, setCurrentPage] = useState(
        Number(savedPagination?.currentPage) || 1
    );
    const [itemsPerPage, setItemsPerPage] = useState(
        Number(savedPagination?.itemsPerPage) || 10
    );
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

    const handleItemsPerPageChange = (newItemsPerPage) => {
        setItemsPerPage(newItemsPerPage);
        setCurrentPage(1);
    };

    const loadUserData = useCallback(async () => {
        setIsLoading(true);
        setSubmitError(null);
        try {
            const result = await apiGetUserById({ id });
            if (result?.status === 200 && result?.data?.user) {
                const userData = result.data.user;
                setFormData({
                    name: userData.name || "",
                    email: userData.email || "",
                    phone_no: userData.phone_no || "",
                    // ✅ Use user's saved country_code if available,
                    // otherwise fall back to tenant's country code from login
                    country_code: userData.country_code || defaultCountryCode,
                    address: userData.address || "",
                    city: userData.city || "",
                    status: userData.status || "",
                    password: "",
                });
            } else {
                setSubmitError("Failed to load user data");
            }
        } catch (error) {
            console.error("Error loading user:", error);
            setSubmitError(error?.response?.data?.message || "Error loading user data");
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    const loadRideHistory = useCallback(async () => {
        if (!id) return;
        setTableLoading(true);
        try {
            const response = await apiGetRideHistory(id);
            if (response?.status === 200 && Array.isArray(response?.data?.rideHistory?.data)) {
                setRideHistory(response.data.rideHistory.data);
                setTotalItems(response.data.rideHistory.total || response.data.rideHistory.data.length);
                setTotalPages(response.data.rideHistory.last_page || 1);
            } else {
                setRideHistory([]);
            }
        } catch (error) {
            console.error("Error loading ride history", error);
            setRideHistory([]);
        } finally {
            setTableLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (id) {
            loadUserData();
            loadRideHistory();
        }
    }, [id, loadRideHistory]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const editData = new FormData();
            editData.append("id", id);
            editData.append("name", formData.name || "");
            editData.append("email", formData.email || "");
            editData.append("country_code", formData.country_code || "");
            editData.append("phone_no", formData.phone_no || "");
            editData.append("address", formData.address || "");
            editData.append("city", formData.city || "");
            if (formData.password) editData.append("password", formData.password);

            const response = await apiEditUser(editData);

            if (response?.data?.error === 1) {
                toast.error(response?.data?.message || "Failed to update user", { duration: 5000 });
                return;
            }

            toast.success(response?.data?.message || "User updated successfully", { duration: 5000 });
            navigate("/users");
        } catch (error) {
            toast.error(
                error?.response?.data?.message || error?.message || "Server error",
                { duration: 5000 }
            );
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        unlockBodyScroll();
        navigate("/users");
    };

    const handleStatusChange = async (userId, status) => {
        try {
            const response = await apiEditUserStatus({ id: userId, status });
            if (response?.data?.error === 1) {
                toast.error(response?.data?.message || "Failed to update status");
                return;
            }
            toast.success(`User ${status === "active" ? "activated" : "deactivated"} successfully`);
            setFormData(prev => ({ ...prev, status }));
        } catch (error) {
            toast.error(error?.response?.data?.message || "Server error while changing status");
        }
    };

    return (
        <div>
            <div className="px-4 py-5 sm:p-6 lg:p-10 min-h-[calc(100vh-85px)]">
                <div className="flex justify-between sm:flex-row flex-col items-start sm:items-center gap-3 sm:gap-0">
                    <div className="sm:mb-[30px] mb-1 sm:w-[calc(100%-240px)] w-full flex gap-5 items-center">
                        <div className="flex flex-col gap-2.5 w-[calc(100%-100px)]">
                            <PageTitle title="User Details" />
                        </div>
                    </div>
                    <div className="w-full sm:mb-[50px] mb-8">
                        <div className="flex flex-row justify-end gap-2">
                            {formData?.status === "deactive" && (
                                <Button
                                    onClick={() => handleStatusChange(id, "active")}
                                    className="border border-[#10b981] text-[#10b981] font-bold py-2 px-4 rounded-md"
                                >
                                    Active
                                </Button>
                            )}
                            {formData?.status === "active" && (
                                <Button
                                    onClick={() => handleStatusChange(id, "deactive")}
                                    className="border border-[#ff4747] text-[#ff4747] font-bold py-2 px-4 rounded-md"
                                >
                                    InActive
                                </Button>
                            )}
                            {isPushNotificationEnabled && (
                                <Button
                                    type="filled"
                                    btnSize="2xl"
                                    onClick={() => {
                                        lockBodyScroll();
                                        setIsSendNotificationModalOpen({ isOpen: true, type: "new" });
                                    }}
                                    className="w-full sm:w-auto !py-3.5"
                                >
                                    Send Notification
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                <div>
                    <CardContainer className="p-3 sm:p-4 lg:p-5 bg-[#F5F5F5]">
                        <Loading loading={isLoading} type="cover">
                            <div className="w-full">
                                <h2 className="text-[22px] font-semibold mb-4">User Details</h2>

                                {submitError && (
                                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                                        {submitError}
                                    </div>
                                )}
                                {successMessage && (
                                    <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                                        {successMessage}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                                    <div className="flex flex-col gap-1">
                                        <label className="text-sm font-medium text-gray-700">Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            placeholder="Enter Name"
                                            className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-600"
                                        />
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <label className="text-sm font-medium text-gray-700">Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            placeholder="Enter Email"
                                            className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-600"
                                        />
                                    </div>

                                    {/* ✅ Phone Number — static badge, no dropdown */}
                                    <div className="flex flex-col gap-1">
                                        <label className="text-sm font-medium text-gray-700">Phone Number</label>
                                        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:border-blue-600">
                                            {/* Shows user's saved country_code, falls back to tenant's default */}
                                            <div className="px-3 py-3 bg-gray-100 border-r border-gray-300 font-semibold text-[#252525] text-sm whitespace-nowrap">
                                                {formData.country_code || defaultCountryCode || "+1"}
                                            </div>
                                            <input
                                                type="text"
                                                name="phone_no"
                                                value={formData.phone_no}
                                                onChange={handleInputChange}
                                                placeholder="Enter phone number"
                                                className="flex-1 px-4 py-3 outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <label className="text-sm font-medium text-gray-700">Password</label>
                                        <input
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            placeholder="Leave blank to keep current"
                                            className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-600"
                                        />
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <label className="text-sm font-medium text-gray-700">Address</label>
                                        <input
                                            type="text"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            placeholder="Enter address"
                                            className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-600"
                                        />
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <label className="text-sm font-medium text-gray-700">City</label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            placeholder="Enter city"
                                            className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-600"
                                        />
                                    </div>
                                </div>

                                <div className="mt-3 flex flex-col sm:flex-row gap-3 sm:gap-5 justify-start">
                                    <Button
                                        btnSize="md"
                                        type="filledGray"
                                        className="!px-10 pt-4 pb-[15px] leading-[25px] w-full sm:w-auto"
                                        onClick={handleCancel}
                                        disabled={isSaving || isLoading}
                                    >
                                        <span>Cancel</span>
                                    </Button>
                                    <Button
                                        btnType="button"
                                        btnSize="md"
                                        type="filled"
                                        className="!px-10 pt-4 pb-[15px] leading-[25px] w-full sm:w-auto"
                                        onClick={handleSave}
                                        disabled={isSaving || isLoading}
                                    >
                                        <span>{isSaving ? "Saving..." : "Save"}</span>
                                    </Button>
                                </div>
                            </div>
                        </Loading>
                    </CardContainer>
                </div>

                <div>
                    <CardContainer className="p-3 sm:p-4 lg:p-5 bg-[#F5F5F5] mt-5">
                        <div className="flex flex-row items-stretch sm:items-center gap-3 sm:gap-5 justify-between mb-4 sm:mb-0">
                            <div className="md:w-full w-[calc(100%-54px)] sm:flex-1">
                                <PageTitle title="Ride History" />
                            </div>
                        </div>
                        <Loading loading={tableLoading} type="cover">
                            <div className="flex flex-col gap-4 pt-4">
                                {rideHistory.map((user) => (
                                    <RideHistory key={user.id} user={user} />
                                ))}
                            </div>
                        </Loading>
                        {Array.isArray(rideHistory) && rideHistory.length > 0 && (
                            <div className="mt-4 border-t border-[#E9E9E9] pt-3">
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    itemsPerPage={itemsPerPage}
                                    onPageChange={handlePageChange}
                                    onItemsPerPageChange={handleItemsPerPageChange}
                                    itemsPerPageOptions={PAGE_SIZE_OPTIONS}
                                    pageKey="ride-history"
                                />
                            </div>
                        )}
                    </CardContainer>
                </div>

                {isPushNotificationEnabled && (
                    <Modal
                        isOpen={isSendNotificationModalOpen.isOpen}
                        className="p-4 sm:p-6 lg:p-10"
                    >
                        <SendNotifictionModel
                            setIsOpen={setIsSendNotificationModalOpen}
                            userId={id}
                        />
                    </Modal>
                )}
            </div>
        </div>
    );
};

export default EditUserDetails;