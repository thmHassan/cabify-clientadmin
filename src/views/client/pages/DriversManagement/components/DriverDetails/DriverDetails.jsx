import { useCallback, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import CardContainer from "../../../../../../components/shared/CardContainer";
import PlusIcon from "../../../../../../components/svg/PlusIcon";
import Button from "../../../../../../components/ui/Button/Button";
import PageTitle from "../../../../../../components/ui/PageTitle/PageTitle";
import Modal from "../../../../../../components/shared/Modal/Modal";
import { lockBodyScroll, unlockBodyScroll } from "../../../../../../utils/functions/common.function";
import AddWalletBalanceModel from "./component/AddWalletBalanceModel/AddWalletBalanceModel";
import AddDocumentModel from "./component/AddDocumentModel/AddDocumentModel";
import SendNotifictionModel from "./component/SendNotifictionModel/SendNotifictionModel";
import Loading from "../../../../../../components/shared/Loading/Loading";
import Pagination from "../../../../../../components/ui/Pagination/Pagination";
import { PAGE_SIZE_OPTIONS, STATUS_OPTIONS } from "../../../../../../constants/selectOptions";
import { useAppSelector } from "../../../../../../store";
import { apiGetDriverManagementById, apiEditDriverManagement, apiGetDriverDocumentList, apiChangeDriverDocument, apiDeleteDriverDocument, apiApproveVehicle, apiGetDriverRideHistory, apiRejectVehicle, apiGetDriverDocumentById, apieditDriverStatus } from "../../../../../../services/DriverManagementService";
import { apiGetSubCompany } from "../../../../../../services/SubCompanyServices";
import DriverRideHistory from "./component/DriverRideHistory";
import RejectModel from "./component/RejectModel";


const FormField = ({ label, type = "text", placeholder, options = [], value = "", onChange, name }) => {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
                {label}
            </label>

            {type === "select" ? (
                <select
                    value={value}
                    onChange={onChange}
                    name={name}
                    className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-600"
                >
                    <option value="">{placeholder}</option>
                    {options.map((opt, index) => (
                        <option key={index} value={opt}>
                            {opt}
                        </option>
                    ))}
                </select>
            ) : type === "date" ? (
                <input
                    type="date"
                    value={value}
                    onChange={onChange}
                    name={name}
                    className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-600"
                />
            ) : (
                <input
                    type="text"
                    value={value}
                    onChange={onChange}
                    name={name}
                    placeholder={placeholder}
                    className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-600"
                />
            )}
        </div>
    );
};


const DriverDetails = () => {
    const { id: driverId } = useParams();
    const [isAddWalletBalanceModalOpen, setIsAddWalletBalanceModalOpen] = useState(false);
    const [isAddDocumentModalOpen, setIsAddDocumentModalOpen] = useState(false);
    const [isSendNotificationModalOpen, setIsSendNotificationModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [isLoadingDocument, setIsLoadingDocument] = useState(false);
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
    const [submitError, setSubmitError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [rideHistory, setRideHistory] = useState([]);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone_no: "",
        address: "",
        driver_license: "",
        assigned_vehicle: "",
        joined_date: "",
        sub_company: "",
        vehicle_name: "",
        vehicle_type: "",
        vehicle_service: "",
        seats: "",
        color: "",
        capacity: "",
        plate_no: "",
        vehicle_registration_date: "",
        bank_name: "",
        bank_account_number: "",
        account_holder_name: "",
        bank_phone_no: "",
        iban_no: "",
    });
    const [profileImage, setProfileImage] = useState(null);
    const [profileImageFile, setProfileImageFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [driverData, setDriverData] = useState(null);
    const [documents, setDocuments] = useState([]);
    const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
    const [documentApprovedOffice, setDocumentApprovedOffice] = useState(false);
    const [subCompanyList, setSubCompanyList] = useState([]);
    const [loadingSubCompanies, setLoadingSubCompanies] = useState(false);

    useEffect(() => {
        const fetchSubCompanies = async () => {
            setLoadingSubCompanies(true);
            try {
                const response = await apiGetSubCompany({ page: 1, perPage: 100 });

                if (response?.data?.success === 1) {
                    const companies = response?.data?.list?.data || [];

                    const options = companies.map((company) => ({
                        label: company.name,       // 👈 show in dropdown
                        value: company.id.toString(), // 👈 stored value
                    }));

                    setSubCompanyList(options);
                }
            } catch (error) {
                console.error("Error fetching sub-companies:", error);
            } finally {
                setLoadingSubCompanies(false);
            }
        };

        fetchSubCompanies();
    }, []);


    const loadDriverData = useCallback(async () => {
        if (!driverId) return;

        setIsLoading(true);
        try {
            const response = await apiGetDriverManagementById({ id: driverId });

            if (response?.data?.success === 1 || response?.status === 200) {
                const data = response?.data?.driver || response?.data?.data || response?.data || {};
                setDriverData(data);
                setFormData({
                    name: data.name || "",
                    email: data.email || "",
                    phone_no: data.phone_no || "",
                    address: data.address || "",
                    driver_license: data.driver_license || "",
                    assigned_vehicle: data.assigned_vehicle || "",
                    joined_date: data.joined_date ? data.joined_date.split('T')[0] : "",
                    sub_company: data.sub_company ? data.sub_company.toString() : "",
                    vehicle_name: data.vehicle_name || "",
                    vehicle_type: data.vehicle_type || "",
                    vehicle_service: data.vehicle_service || "",
                    seats: data.seats || "",
                    color: data.color || "",
                    capacity: data.capacity || "",
                    plate_no: data.plate_no || "",
                    vehicle_registration_date: data.vehicle_registration_date ? data.vehicle_registration_date.split('T')[0] : "",
                    bank_name: data.bank_name || "",
                    bank_account_number: data.bank_account_number || "",
                    account_holder_name: data.account_holder_name || "",
                    bank_phone_no: data.bank_phone_no || "",
                    iban_no: data.iban_no || "",
                });
                if (data.profile_image) {
                    setProfileImage(data.profile_image);
                }
                if (data.document_approved_office !== undefined) {
                    setDocumentApprovedOffice(data.document_approved_office === 1 || data.document_approved_office === "1");
                }
            }
        } catch (error) {
            console.error("Error loading driver data:", error);
        } finally {
            setIsLoading(false);
        }
    }, [driverId]);

    useEffect(() => {
        loadDriverData();
    }, [loadDriverData]);

    const loadDriverDocuments = useCallback(async () => {
        if (!driverId) return;

        setIsLoadingDocuments(true);
        try {
            const response = await apiGetDriverDocumentList({ driver_id: driverId });

            if (response?.data?.success === 1 || response?.status === 200) {
                const docs = response?.data?.documentList || response?.data?.data || response?.data?.list || [];
                const normalizedDocs = (Array.isArray(docs) ? docs : []).map(doc => ({
                    ...doc,
                    displayName: doc.document_detail?.document_name || doc.document_name || "Unnamed Document",
                    status: doc.status === 'approved' ? 'verified' : (doc.status || 'pending')
                }));
                setDocuments(normalizedDocs);
                if (response?.data?.document_approved_office !== undefined) {
                    setDocumentApprovedOffice(response?.data?.document_approved_office === 1 || response?.data?.document_approved_office === "1");
                }
            } else {
                setDocuments([]);
            }
        } catch (error) {
            console.error("Error loading driver documents:", error);
            setDocuments([]);
        } finally {
            setIsLoadingDocuments(false);
        }
    }, [driverId]);

    useEffect(() => {
        loadDriverDocuments();
    }, [loadDriverDocuments]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDeleteDocument = async (documentId) => {
        try {
            const response = await apiDeleteDriverDocument(documentId);
            if (response?.data?.success === 1 || response?.status === 200) {
                await loadDriverDocuments();
            } else {
                console.log(response?.data?.message || "Failed to delete document");
            }
        } catch (error) {
            console.error("Error deleting document:", error);
        }
    };

    const handleViewDocument = async (documentId) => {
        setIsLoadingDocument(true);
        try {
            const response = await apiGetDriverDocumentById({ id: documentId });
            if (response?.data?.success === 1 || response?.status === 200) {
                const docData = response?.data?.data || response?.data?.document || response?.data;
                setSelectedDocument(docData);
                lockBodyScroll();
                setIsAddDocumentModalOpen(true);
            } else {
                console.error(response?.data?.message || "Failed to fetch document");
            }
        } catch (error) {
            console.error("Error fetching document:", error);
        } finally {
            setIsLoadingDocument(false);
        }
    };

    const handleDocumentStatusChange = async (documentId, status) => {
        try {
            const formDataObj = new FormData();
            formDataObj.append('driver_id', driverId);
            formDataObj.append('driver_document_id', documentId);
            formDataObj.append('status', status);

            const response = await apiChangeDriverDocument(formDataObj);
            if (response?.data?.success === 1 || response?.status === 200) {
                await loadDriverDocuments();
            } else {
                console.error(response?.data?.message || "Failed to update document status");
            }
        } catch (error) {
            console.error("Error changing document status:", error);
        }
    };

    const handleApproveAll = async () => {
        try {
            const formDataObj = new FormData();
            formDataObj.append('driver_id', driverId);
            formDataObj.append('approve_all', '1');

            const response = await apiChangeDriverDocument(formDataObj);
            if (response?.data?.success === 1 || response?.status === 200) {
                await loadDriverDocuments();
                await loadDriverData();
            } else {
                console.error(response?.data?.message || "Failed to approve all documents");
            }
        } catch (error) {
            console.error("Error approving all documents:", error);
        }
    };

    const handleRejectAll = async () => {
        try {
            const formDataObj = new FormData();
            formDataObj.append('driver_id', driverId);
            formDataObj.append('reject_all', '1');

            const response = await apiChangeDriverDocument(formDataObj);
            if (response?.data?.success === 1 || response?.status === 200) {
                await loadDriverDocuments();
            } else {
                console.error(response?.data?.message || "Failed to reject all documents");
            }
        } catch (error) {
            console.error("Error rejecting all documents:", error);
        }
    };

    const handleApproveVehicle = async () => {
        try {
            const formDataObj = new FormData();
            formDataObj.append('driver_id', driverId);

            const response = await apiApproveVehicle(formDataObj);
            if (response?.data?.success === 1 || response?.status === 200) {
                await loadDriverData();
            } else {
                console.error(response?.data?.message || "Failed to approve vehicle");
            }
        } catch (error) {
            console.error("Error approving vehicle:", error);
        }
    };

    const handleRejectVehicle = async () => {
        try {
            const formDataObj = new FormData();
            formDataObj.append('driver_id', driverId);

            const response = await apiRejectVehicle(formDataObj);
            if (response?.data?.success === 1 || response?.status === 200) {
                await loadDriverData();
            } else {
                console.error(response?.data?.message || "Failed to approve vehicle");
            }
        } catch (error) {
            console.error("Error approving vehicle:", error);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const formDataObj = new FormData();
            formDataObj.append('id', driverId);
            formDataObj.append('name', formData.name || '');
            formDataObj.append('email', formData.email || '');
            formDataObj.append('phone_no', formData.phone_no || '');
            formDataObj.append('address', formData.address || '');
            formDataObj.append('driver_license', formData.driver_license || '');
            formDataObj.append('assigned_vehicle', formData.assigned_vehicle || '');
            const joinedDate = formData.joined_date ? `${formData.joined_date} 00:00:00` : '';
            formDataObj.append('joined_date', joinedDate);
            formDataObj.append('sub_company', formData.sub_company || '');

            if (profileImageFile) {
                formDataObj.append('profile_image', profileImageFile);
            }

            const response = await apiEditDriverManagement(formDataObj);

            if (response?.data?.success === 1 || response?.status === 200) {
                await loadDriverData();
            } else {
                console.error(response?.data?.message || "Failed to update driver");
            }
        } catch (error) {
            console.error("Error saving driver:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const loadRideHistory = useCallback(async () => {
        if (!driverId) return;

        setTableLoading(true);
        try {
            const response = await apiGetDriverRideHistory(driverId);

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
    }, [driverId]);

    useEffect(() => {
        if (driverId) {
            loadRideHistory();
        }
    }, [driverId, loadRideHistory]);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleItemsPerPageChange = (newItemsPerPage) => {
        setItemsPerPage(newItemsPerPage);
        setCurrentPage(1);
    };

    const handleChangeDriverStatus = async (status) => {
        try {
            const response = await apieditDriverStatus({
                id: driverId,
                status: status,
            });

            if (response?.data?.success === 1 || response?.status === 200) {
                // reload driver data so UI updates
                await loadDriverData();
            } else {
                console.error(response?.data?.message || "Failed to change status");
            }
        } catch (error) {
            console.error("Error changing driver status", error);
        }
    };

    return (
        <div className="px-4 py-5 sm:p-6 lg:p-10 min-h-[calc(100vh-85px)]">
            <div className="flex justify-between sm:flex-row flex-col items-start sm:items-center gap-3 sm:gap-0">
                <div className="sm:mb-[30px] mb-1 sm:w-[calc(100%-240px)] w-full flex gap-5 items-center">
                    <div className="flex flex-col gap-2.5 w-[calc(100%-100px)]">
                        <PageTitle title="Drivers Details" />
                    </div>
                </div>
                <div className="w-full sm:mb-[50px] mb-8">
                    <div className="flex flex-row justify-end gap-2">
                        {(driverData?.status === "rejected" || driverData?.status === "pending") && (
                            <Button
                                onClick={() => handleChangeDriverStatus("accepted")}
                                className="border border-[#10b981] text-[#10b981] font-bold py-2 px-4 rounded-md"
                            >
                                Accepted
                            </Button>
                        )}

                        {(driverData?.status === "accepted" || driverData?.status === "pending") && (
                            <Button
                                onClick={() => {
                                    lockBodyScroll();
                                    setIsRejectModalOpen(true);
                                }}
                                className="border border-[#ff4747] text-[#ff4747] font-bold py-2 px-4 rounded-md"
                            >
                                Rejected
                            </Button>
                        )}

                        <Button
                            type="filled"
                            btnSize="2xl"
                            onClick={() => {
                                lockBodyScroll();
                                setIsSendNotificationModalOpen(true);
                            }}
                            className="w-full sm:w-auto !py-3.5"
                        >
                            Send Notification
                        </Button>
                    </div>

                </div>
            </div>

            <div>
                <CardContainer className="p-5 mt-4">
                    <h2 className="text-base font-semibold text-gray-800 mb-6">
                        Driver Details
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Name
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                placeholder="Enter Name"
                                className="w-full h-11 rounded-lg border border-gray-300 px-4 text-sm focus:ring-1 focus:ring-blue-600 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                placeholder="Enter Email"
                                className="w-full h-11 rounded-lg border border-gray-300 px-4 text-sm focus:ring-1 focus:ring-blue-600 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Phone Number
                            </label>
                            <input
                                type="text"
                                value={formData.phone_no}
                                onChange={(e) => handleInputChange('phone_no', e.target.value)}
                                placeholder="Enter Phone Number"
                                className="w-full h-11 rounded-lg border border-gray-300 px-4 text-sm focus:ring-1 focus:ring-blue-600 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Assigned Vehicle
                            </label>
                            <input
                                type="text"
                                value={formData.assigned_vehicle}
                                onChange={(e) => handleInputChange('assigned_vehicle', e.target.value)}
                                placeholder="Enter Assigned Vehicle"
                                className="w-full h-11 rounded-lg border border-gray-300 px-4 text-sm focus:ring-1 focus:ring-blue-600 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Joined Date
                            </label>
                            <input
                                type="date"
                                value={formData.joined_date}
                                onChange={(e) => handleInputChange('joined_date', e.target.value)}
                                className="w-full h-11 rounded-lg border border-gray-300 px-4 text-sm focus:ring-1 focus:ring-blue-600 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Wallet Balance
                            </label>
                            <input
                                type="text"
                                value={driverData?.wallet_balance ? `$${driverData.wallet_balance}` : "$0.00"}
                                disabled
                                className="w-full h-11 rounded-lg border border-gray-300 px-4 text-sm bg-gray-100 text-gray-600"
                            />
                        </div>
                        <div className="flex flex-col gap-8">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Sub Company
                                </label>
                                <select
                                    value={formData.sub_company}
                                    onChange={(e) => handleInputChange("sub_company", e.target.value)}
                                    disabled={loadingSubCompanies}
                                    className="w-full h-11 rounded-lg border border-gray-300 px-4 text-sm focus:ring-1 focus:ring-blue-600 focus:outline-none"
                                >
                                    <option value="">
                                        {loadingSubCompanies ? "Loading..." : "Select Sub Company"}
                                    </option>

                                    {subCompanyList.map((company) => (
                                        <option key={company.value} value={company.value}>
                                            {company.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className=" ">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Profile Image <span className="text-red-500">*</span>
                                </label>

                                <div className="flex items-center bg-white gap-4 border border-gray-300 rounded-lg px-4 py-3">
                                    <label className="cursor-pointer px-4 py-1.5 text-sm text-blue-700 border border-blue-700 rounded-md hover:bg-blue-50">
                                        Choose File
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                        />
                                    </label>
                                    <span className="text-sm text-gray-500">
                                        {profileImageFile ? profileImageFile.name : profileImage ? "Image selected" : "No File Chosen"}
                                    </span>
                                    {profileImage && (
                                        <img
                                            src={profileImage}
                                            alt="Profile"
                                            className="w-12 h-12 rounded object-cover"
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-start justify-end md:col-start-3 mt-4">
                            <Button
                                btnSize="md"
                                type="filled"
                                className="!px-10 pt-4 pb-[15px] leading-[25px] w-full sm:w-auto"
                                onClick={() => {
                                    lockBodyScroll();
                                    setIsAddWalletBalanceModalOpen(true);
                                }}                            >
                                <span>Add Wallet Balance</span>
                            </Button>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-5 justify-end">
                        <Button
                            btnSize="md"
                            type="filledGray"
                            className="!px-10 pt-4 pb-[15px] leading-[25px] w-full sm:w-auto"
                            onClick={() => loadDriverData()}
                        >
                            <span>Cancel</span>
                        </Button>
                        <Button
                            btnSize="md"
                            type="filled"
                            className="!px-10 pt-4 pb-[15px] leading-[25px] w-full sm:w-auto"
                            onClick={handleSave}
                            disabled={isSaving}
                        >
                            {isSaving ? "Saving..." : "Save"}
                        </Button>
                    </div>
                </CardContainer>
            </div>

            <div>
                <CardContainer className="p-5 mt-6">
                    <h2 className="text-[22px] font-semibold mb-4">
                        Vehicle Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                            label="Vehicle Name"
                            placeholder="Enter Vehicle Name"
                            value={formData.vehicle_name}
                            onChange={(e) => handleInputChange('vehicle_name', e.target.value)}
                            name="vehicle_name"
                        />

                        <FormField
                            label="Vehicle Type"
                            type="select"
                            placeholder="Select Vehicle Type"
                            options={["Sedan", "SUV", "Hatchback", "Van"]}
                            value={formData.vehicle_type}
                            onChange={(e) => handleInputChange('vehicle_type', e.target.value)}
                            name="vehicle_type"
                        />

                        <FormField
                            label="Vehicle Service"
                            type="select"
                            placeholder="Select Vehicle Service"
                            options={["Taxi", "Rental", "Delivery"]}
                            value={formData.vehicle_service}
                            onChange={(e) => handleInputChange('vehicle_service', e.target.value)}
                            name="vehicle_service"
                        />

                        <FormField
                            label="Seats"
                            type="select"
                            placeholder="Select Seats"
                            options={["2", "4", "5", "7", "8"]}
                            value={formData.seats}
                            onChange={(e) => handleInputChange('seats', e.target.value)}
                            name="seats"
                        />

                        <FormField
                            label="Color"
                            type="select"
                            placeholder="Select Color"
                            options={["Black", "White", "Red", "Blue", "Silver"]}
                            value={formData.color}
                            onChange={(e) => handleInputChange('color', e.target.value)}
                            name="color"
                        />

                        <FormField
                            label="Capacity"
                            placeholder="Enter Capacity"
                            value={formData.capacity}
                            onChange={(e) => handleInputChange('capacity', e.target.value)}
                            name="capacity"
                        />

                        <FormField
                            label="Plate Number"
                            placeholder="Enter Plate Number"
                            value={formData.plate_no}
                            onChange={(e) => handleInputChange('plate_no', e.target.value)}
                            name="plate_no"
                        />

                        <FormField
                            label="Vehicle Registration Date"
                            type="date"
                            value={formData.vehicle_registration_date}
                            onChange={(e) => handleInputChange('vehicle_registration_date', e.target.value)}
                            name="vehicle_registration_date"
                        />

                    </div>
                    {Number(driverData?.vehicle_change_request) === 0 && (
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-5 justify-end">
                            <Button
                                btnSize="md"
                                type="filledRed"
                                className="!px-10 pt-4 pb-[15px] leading-[25px] w-full sm:w-auto"
                                onClick={handleRejectVehicle}
                            >
                                <span>Reject</span>
                            </Button>

                            <Button
                                btnSize="md"
                                type="filledGreen"
                                className="!px-10 pt-4 pb-[15px] leading-[25px] w-full sm:w-auto"
                                onClick={handleApproveVehicle}
                            >
                                Approve
                            </Button>
                        </div>
                    )}
                </CardContainer>
            </div>

            <div className="p-5 mt-6 bg-[#EEF3FF] rounded-xl">
                <h2 className="text-[22px] font-semibold mb-4">
                    Bank Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                        label="Bank Name"
                        placeholder="Enter Bank Name"
                        value={formData.bank_name}
                        onChange={(e) => handleInputChange('bank_name', e.target.value)}
                        name="bank_name"
                    />
                    <FormField
                        label="Bank Account Number"
                        placeholder="Enter Account Number"
                        value={formData.bank_account_number}
                        onChange={(e) => handleInputChange('bank_account_number', e.target.value)}
                        name="bank_account_number"
                    />
                    <FormField
                        label="Account Holder Name"
                        placeholder="Enter Holder Name"
                        value={formData.account_holder_name}
                        onChange={(e) => handleInputChange('account_holder_name', e.target.value)}
                        name="account_holder_name"
                    />
                    <FormField
                        label="Bank Phone Number"
                        placeholder="Enter Phone Number"
                        value={formData.bank_phone_no}
                        onChange={(e) => handleInputChange('bank_phone_no', e.target.value)}
                        name="bank_phone_no"
                    />
                    <FormField
                        label="IBAN Number"
                        placeholder="Enter IBAN Number"
                        value={formData.iban_no}
                        onChange={(e) => handleInputChange('iban_no', e.target.value)}
                        name="iban_no"
                    />
                </div>
            </div>

            <div className="p-5 mt-6 bg-[#EEEDFF] rounded-xl">
                <div className="flex gap-4 items-center mb-4 flex-wrap">
                    <h2 className="text-[22px] font-semibold">
                        Document Information
                    </h2>
                    {Number(driverData?.document_approved_office) === 0 && (
                        <span className="bg-[#10B981] text-white text-sm px-3 py-1 rounded-full flex items-center gap-1">
                            <svg className="w-4 h-4 bg-white rounded-full text-[#10B981] font-semibold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Approved in office
                        </span>
                    )}
                    <div className="flex gap-3 ml-auto">
                        <Button
                            type="filledGreen"
                            className="bg-[#10B981] hover:bg-[#10B981] text-white py-1.5 px-4 rounded-md text-sm"
                            onClick={handleApproveAll}
                        >
                            Approve All
                        </Button>
                        <Button
                            type="filledRed"
                            className="bg-[#FF4747] hover:bg-[#FF4747] text-white py-1.5 px-4 rounded-md text-sm border-0"
                            onClick={handleRejectAll}
                        >
                            Reject All
                        </Button>
                        {/* <Button
                            btnSize="md"
                            type="filled"
                            className="!px-10 pt-4 pb-[15px] leading-[25px] w-full sm:w-auto"
                            onClick={() => {
                                lockBodyScroll();
                                setIsAddDocumentModalOpen(true);
                            }}
                        >
                            Add Document
                        </Button> */}
                    </div>
                </div>

                <Loading loading={isLoadingDocuments} type="cover">
                    {documents.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            No documents found
                        </div>
                    ) : (
                        documents.map((doc) => (
                            <div
                                key={doc.id}
                                className="flex justify-between items-center bg-white p-4 rounded-lg mb-3"
                            >
                                <span className="font-medium">{doc.displayName}</span>

                                <div className="flex items-center gap-3">
                                    <select
                                        value={doc.status || "pending"}
                                        onChange={(e) => handleDocumentStatusChange(doc.id, e.target.value)}
                                        className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="verified">Approved</option>
                                        <option value="rejected">Rejected</option>
                                    </select>
                                    <Button
                                        type="filled"
                                        className="py-1.5 px-4 rounded-sm leading-[25px]"
                                        onClick={() => handleViewDocument(doc.id)}
                                        disabled={isLoadingDocument}
                                    >
                                        View
                                    </Button>
                                    {/* <Button
                                        className="py-1.5 px-4 rounded-sm leading-[25px] border border-blue-600 text-blue-600 hover:bg-blue-50"
                                        onClick={() => {
                                            console.log("Edit document:", doc);
                                        }}
                                    >
                                        Edit
                                    </Button> */}
                                    <Button
                                        className="py-1.5 px-4 rounded-sm leading-[25px] border border-red-600 text-red-600 hover:bg-red-50"
                                        onClick={() => handleDeleteDocument(doc.id)}
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </Loading>
            </div>

            {/* <div className="p-5 mt-6 bg-[#EEEDFF] rounded-xl">
                <div className="flex">
                    <p className="font-semibold">Revenue</p>
                </div>
                <div>
                    <p className="font-semibold text-2xl pt-2 pl-2">$465.32</p>
                </div>
            </div> */}

            <div>
                <CardContainer className="p-3 sm:p-4 lg:p-5 bg-[#F5F5F5] mt-5">
                    <div className="flex flex-row items-stretch sm:items-center gap-3 sm:gap-5 justify-between mb-4 sm:mb-0">
                        <div className="md:w-full w-[calc(100%-54px)] sm:flex-1">
                            <PageTitle title="Ride History" />
                        </div>
                    </div>
                    <Loading loading={tableLoading} type="cover">
                        <div className="flex flex-col gap-4 pt-4">
                            {rideHistory.map((driver) => (
                                <DriverRideHistory key={driver.id} driver={driver} />
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

            <Modal
                isOpen={isAddWalletBalanceModalOpen}
                className="p-4 sm:p-6 lg:p-10"
            >
                <AddWalletBalanceModel
                    driverId={driverId}
                    setIsOpen={setIsAddWalletBalanceModalOpen}
                />
            </Modal>

            <Modal
                isOpen={isAddDocumentModalOpen}
                className="p-4 sm:p-6 lg:p-10"
            >
                <AddDocumentModel
                    initialValue={selectedDocument}
                    setIsOpen={(value) => {
                        setIsAddDocumentModalOpen(value);
                        if (!value) setSelectedDocument(null);
                    }}
                    onDocumentCreated={loadDriverDocuments}
                />
            </Modal>

            <Modal
                isOpen={isSendNotificationModalOpen}
                className="p-4 sm:p-6 lg:p-10"
            >
                <SendNotifictionModel
                    driverId={driverId}
                    setIsOpen={setIsSendNotificationModalOpen}
                />
            </Modal>

            <Modal
                isOpen={isRejectModalOpen}
                className="p-4 sm:p-6 lg:p-10"
            >
                <RejectModel
                    driverId={driverId}
                    setIsOpen={setIsRejectModalOpen}
                    onRejected={async () => {
                        await loadDriverData();
                    }}
                />
            </Modal>

        </div>
    );
};

export default DriverDetails;
