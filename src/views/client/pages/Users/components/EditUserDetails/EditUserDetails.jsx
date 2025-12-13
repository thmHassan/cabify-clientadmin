import { distance } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import CardContainer from "../../../../../../components/shared/CardContainer";
import Loading from "../../../../../../components/shared/Loading/Loading";
import SearchBar from "../../../../../../components/shared/SearchBar/SearchBar";
import Button from "../../../../../../components/ui/Button/Button";
import PageTitle from "../../../../../../components/ui/PageTitle/PageTitle";
import { lockBodyScroll, unlockBodyScroll } from "../../../../../../utils/functions/common.function";
import RideHistory from "./components/RideHistory";
import Pagination from "../../../../../../components/ui/Pagination/Pagination";
import { useAppSelector } from "../../../../../../store";
import { PAGE_SIZE_OPTIONS, STATUS_OPTIONS } from "../../../../../../constants/selectOptions";
import { apiGetUserById, apiEditUser, apiGetRideHistory } from "../../../../../../services/UserService";

const EditUserDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [isUserModalOpen, setIsUserModalOpen] = useState({
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
        password: "",
        address: "",
        city: "",
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

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

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
                    address: userData.address || "",
                    city: userData.city || "",
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

            if (response?.status === 200 && Array.isArray(response?.data?.data)) {
                setRideHistory(response.data.data);
                setTotalItems(response.data.total || response.data.data.length);
                setTotalPages(response.data.last_page || 1);
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
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        setSubmitError(null);
        setSuccessMessage(null);

        try {
            const editData = new FormData();
            editData.append('id', id);
            editData.append('name', formData.name || '');
            editData.append('email', formData.email || '');
            editData.append('phone_no', formData.phone_no || '');
            if (formData.password) {
                editData.append('password', formData.password);
            }
            editData.append('address', formData.address || '');
            editData.append('city', formData.city || '');

            const response = await apiEditUser(editData);

            if (response?.data?.success === 1 || response?.status === 200) {
                setSuccessMessage("User updated successfully!");
                setTimeout(() => {
                    navigate("/users");
                }, 1500);
            } else {
                setSubmitError(response?.data?.message || "Failed to update user");
            }
        } catch (error) {
            console.error("Error updating user:", error);
            setSubmitError(error?.response?.data?.message || error?.message || "Error updating user");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        unlockBodyScroll();
        navigate("/users");
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
                    <div className="sm:w-auto xs:w-auto w-full sm:mb-[50px]">
                        <Button
                            type="filled"
                            btnSize="2xl"
                            onClick={() => {
                                lockBodyScroll();
                                // setIsUserModalOpen({ isOpen: true, type: "new" });
                            }}
                            className="w-full sm:w-auto -mb-2 sm:-mb-3 lg:-mb-3 !py-3.5 sm:!py-3 lg:!py-3"
                        >
                            <div className="flex gap-2 sm:gap-[15px] items-center justify-center whitespace-nowrap">
                                <span>Send Notifiction</span>
                            </div>
                        </Button>
                    </div>
                </div>
                <div>
                    <CardContainer className="p-3 sm:p-4 lg:p-5 bg-[#F5F5F5]">
                        <Loading loading={isLoading} type="cover">
                            <div className="w-full">
                                <h2 className="text-[22px] font-semibold mb-4">Driver Details</h2>

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
                                            className="border border-blue-600 rounded-lg px-4 py-3 focus:outline-none"
                                        />
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <label className="text-sm font-medium text-gray-700">Phone Number</label>
                                        <input
                                            type="text"
                                            name="phone_no"
                                            value={formData.phone_no}
                                            onChange={handleInputChange}
                                            placeholder="Enter Phone Number"
                                            className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-600"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-sm font-medium text-gray-700">Password</label>
                                        <input
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            placeholder="Enter password"
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
                                            placeholder="Enter company address"
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
                {/* <Modal
        isOpen={isUserModalOpen.isOpen}
        className="p-4 sm:p-6 lg:p-10"
      >
        <AddUserModel setIsOpen={setIsUserModalOpen} />
      </Modal> */}
            </div>
        </div>
    )
}

export default EditUserDetails;