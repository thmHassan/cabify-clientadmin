import React, { useCallback, useEffect, useState } from "react";
import PageTitle from "../../../../../../components/ui/PageTitle/PageTitle";
import PageSubTitle from "../../../../../../components/ui/PageSubTitle/PageSubTitle";
import CardContainer from "../../../../../../components/shared/CardContainer";
import SearchBar from "../../../../../../components/shared/SearchBar/SearchBar";
import Loading from "../../../../../../components/shared/Loading/Loading";
import Button from "../../../../../../components/ui/Button/Button";
import { lockBodyScroll } from "../../../../../../utils/functions/common.function";
import PlusIcon from "../../../../../../components/svg/PlusIcon";
import CommissionCard from "./components/CommssionCard";
import Modal from "../../../../../../components/shared/Modal/Modal";
import AddPackageModel from "./components/AddPackegModel";
import { apiDeletePackageToPup, apiGetCommissionData, apiSaveCommissionData } from "../../../../../../services/SettingsConfigurationServices";
import toast from 'react-hot-toast';

const Commission = ({ isSidebarOpen }) => {
    const [_searchQuery, setSearchQuery] = useState("");
    const [tableLoading, setTableLoading] = useState(false);
    const [isCommissionModelOpen, setIsCommissionModelOpen] = useState({
        type: "new",
        isOpen: false,
    });
    const [commissionData, setCommissionData] = useState({});
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [packageToPupToDatale, setPackageToPupToDatale] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [commissionForm, setCommissionForm] = useState({
        package_type: "packages_topup",
        package_amount: "",
        package_days: "",
        package_percentage: "",
        cancellation_per_day: "",
        waiting_time_charge: "",
    });

    const fetchCommmissionData = useCallback(async () => {
        setTableLoading(true);
        try {
            const response = await apiGetCommissionData();
            if (response?.data?.success === 1) {
                const commissionsData = response?.data?.data;
                setCommissionData(commissionsData || {});
            }
        } catch (error) {
            setCommissionData({});
        } finally {
            setTableLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCommmissionData();
    }, [fetchCommmissionData, refreshTrigger]);

    const packageTopups = commissionData?.packageTopups || [];
    const mainCommission = commissionData?.main_commission || {};

    useEffect(() => {
        if (mainCommission && Object.keys(mainCommission).length > 0) {
            setCommissionForm({
                package_type: mainCommission.package_type || "packages_topup",
                package_amount: mainCommission.package_amount || "",
                package_days: mainCommission.package_days || "",
                package_percentage: mainCommission.package_percentage || "",
                cancellation_per_day: mainCommission.cancellation_per_day || "",
                waiting_time_charge: mainCommission.waiting_time_charge || "",
            });
        }
    }, [mainCommission]);

    const handleEdit = (commission) => {
        setIsCommissionModelOpen({
            type: "edit",
            isOpen: true,
            initialValue: commission,
        });
    };

    const handleDeleteClick = (company) => {
        setPackageToPupToDatale(company);
        setDeleteModalOpen(true);
    };

    const handleDeleteCommission = async () => {
        if (!packageToPupToDatale?.id) return;

        setIsDeleting(true);
        try {
            const response = await apiDeletePackageToPup(packageToPupToDatale.id);

            if (response?.data?.success === 1 || response?.status === 200) {
                toast.success("package delete successfully")
                setDeleteModalOpen(false);
                setPackageToPupToDatale(null);
                setRefreshTrigger(prev => prev + 1);
            } else {
                console.error("Failed to delete sub-company");
            }
        } catch (error) {
            console.error("Error deleting sub-company:", error);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleCommissionFormChange = (field, value) => {
        setCommissionForm(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSaveCommission = async () => {
        setIsSubmitting(true);
        setError(null);

        const {
            package_type,
            package_days,
            package_amount,
            package_percentage,
            cancellation_per_day,
            waiting_time_charge,
        } = commissionForm;

        /* ---------------- VALIDATION ---------------- */

        if (
            package_type === "per_ride_commission_topup" &&
            !package_amount
        ) {
            toast.error("Package amount is required");
            setIsSubmitting(false);
            return;
        }

        if (
            package_type === "per_ride_commission_potpaid" &&
            (!package_days || !package_percentage)
        ) {
            toast.error("Package days and percentage are required");
            setIsSubmitting(false);
            return;
        }

        if (
            package_type === "packages_postpaid" &&
            (!package_days || !package_amount)
        ) {
            toast.error("Package days and amount are required");
            setIsSubmitting(false);
            return;
        }

        /* ---------------- API CALL ---------------- */

        const toastId = toast.loading("Saving commission settings...");

        try {
            const formData = new FormData();
            formData.append("package_type", package_type);
            formData.append("package_days", package_days || "");
            formData.append("package_amount", package_amount || "");
            formData.append("package_percentage", package_percentage || "");
            formData.append("cancellation_per_day", cancellation_per_day || "");
            formData.append("waiting_time_charge", waiting_time_charge || "");

            const response = await apiSaveCommissionData(formData);

            if (response?.data?.success === 1) {
                toast.success("Commission settings saved successfully", {
                    id: toastId,
                });
                setRefreshTrigger(prev => prev + 1);
            } else {
                toast.error(
                    response?.data?.message || "Failed to save commission settings",
                    { id: toastId }
                );
            }
        } catch (error) {
            toast.error(
                error?.response?.data?.message ||
                error?.message ||
                "Something went wrong",
                { id: toastId }
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            <div className="flex justify-between sm:flex-row flex-col items-start sm:items-center gap-3 sm:gap-0 2xl:mb-6 1.5xl:mb-10 mb-0">
                <div className="sm:mb-[30px] mb-1 sm:w-[calc(100%-240px)] w-full flex gap-5 items-center">
                    <div className="flex flex-col gap-2.5 w-[calc(100%-100px)]">
                        <PageTitle title="Commission" />
                        <PageSubTitle title="Configure commission setting" />
                    </div>
                </div>
            </div>
            <div className="flex flex-col sm:gap-5 gap-4">
                <CardContainer className="p-3 sm:p-4 lg:p-5">
                    <div className="grid gap-4 sm:gap-5 ">
                        <div className="flex gap-4 w-full grid grid-cols-2">
                            <label className="flex-1 cursor-pointer">
                                <div className={`border rounded-2xl p-3 flex flex-col gap-4 shadow-sm hover:shadow-md transition ${commissionForm.package_type === "per_ride_commission_topup" ? "bg-blue-50" : ""}`}>
                                    <div className="flex  gap-3">
                                        <input
                                            type="radio"
                                            name="commission"
                                            className="w-4 h-4 text-blue-600"
                                            checked={commissionForm.package_type === "per_ride_commission_topup"}
                                            onChange={() => handleCommissionFormChange("package_type", "per_ride_commission_topup")}
                                        />
                                        <p className="font-medium text-sm text-gray-800">
                                            Per Ride <br /> Commission (Top Up)
                                        </p>
                                    </div>
                                    {commissionForm.package_type === "per_ride_commission_topup" && (
                                        <div className="mt-3">
                                            <input
                                                type="number"
                                                placeholder="Amount"
                                                value={commissionForm.package_amount}
                                                onChange={(e) => handleCommissionFormChange("package_amount", e.target.value)}
                                                className="border rounded-lg px-4 py-1 text-gray-700 shadow-sm bg-white w-full max-w-[120px]"
                                                disabled={commissionForm.package_type !== "per_ride_commission_topup"}
                                            />
                                        </div>
                                    )}
                                </div>
                            </label>

                            <label className="flex-1 cursor-pointer">
                                <div className={`border rounded-2xl p-3 h-full flex flex-col gap-4 shadow-sm hover:shadow-md transition ${commissionForm.package_type === "packages_topup" ? "bg-blue-50" : ""}`}>
                                    <div className="flex gap-3">
                                        <input
                                            type="radio"
                                            name="commission"
                                            className="w-4 h-4 text-blue-600"
                                            checked={commissionForm.package_type === "packages_topup"}
                                            onChange={() => handleCommissionFormChange("package_type", "packages_topup")}
                                        />
                                        <p className="font-medium text-gray-800 text-sm">
                                            Packages (Top Up)
                                        </p>
                                    </div>
                                </div>
                            </label>

                            <label className="flex-1 cursor-pointer">
                                <div className={`border rounded-2xl  p-3 flex flex-col gap-4 shadow-sm hover:shadow-md transition ${commissionForm.package_type === "commission_without_topup" ? "bg-blue-50" : ""}`}>
                                    <div className="flex gap-3">
                                        <input
                                            type="radio"
                                            name="commission"
                                            className="w-4 h-4 text-blue-600"
                                            checked={commissionForm.package_type === "commission_without_topup"}
                                            onChange={() => handleCommissionFormChange("package_type", "commission_without_topup")}
                                        />
                                        <p className="font-medium text-gray-800 text-sm leading-tight">
                                            Commission <br /> without Top Up <br /> Settled Later
                                        </p>
                                    </div>
                                    {commissionForm.package_type === "commission_without_topup" && (
                                        <div className="flex gap-3">
                                            <input
                                                type="number"
                                                placeholder="Days"
                                                value={commissionForm.package_days}
                                                onChange={(e) => handleCommissionFormChange("package_days", e.target.value)}
                                                className="border rounded-lg px-4 py-1 shadow-sm bg-white w-full max-w-[120px]"
                                                disabled={commissionForm.package_type !== "commission_without_topup"}
                                            />
                                            <input
                                                type="number"
                                                step="0.01"
                                                placeholder="0%"
                                                value={commissionForm.package_percentage}
                                                onChange={(e) => handleCommissionFormChange("package_percentage", e.target.value)}
                                                className="border rounded-lg px-4 py-1 shadow-sm bg-white w-full max-w-[120px]"
                                                disabled={commissionForm.package_type !== "commission_without_topup"}
                                            />
                                        </div>
                                    )}
                                </div>
                            </label>

                            <label className="flex-1 cursor-pointer">
                                <div className={`border rounded-2xl h-full p-3 flex flex-col gap-4 shadow-sm hover:shadow-md transition ${commissionForm.package_type === "packages_post_paid" ? "bg-blue-50" : ""}`}>
                                    <div className="flex gap-3">
                                        <input
                                            type="radio"
                                            name="commission"
                                            className="w-4 h-4 text-blue-600"
                                            checked={commissionForm.package_type === "packages_post_paid"}
                                            onChange={() => handleCommissionFormChange("package_type", "packages_post_paid")}
                                        />
                                        <p className="font-medium text-sm text-gray-800">
                                            Packages Post Paid
                                        </p>
                                    </div>
                                    {commissionForm.package_type === "packages_post_paid" && (
                                        <div className="flex gap-3">
                                            <input
                                                type="number"
                                                placeholder="Days"
                                                value={commissionForm.package_days}
                                                onChange={(e) => handleCommissionFormChange("package_days", e.target.value)}
                                                className="border rounded-lg px-4 py-1 shadow-sm bg-white w-full max-w-[120px]"
                                                disabled={commissionForm.package_type !== "packages_post_paid"}
                                            />
                                            <input
                                                type="number"
                                                step="0.01"
                                                placeholder="Amount"
                                                value={commissionForm.package_amount}
                                                onChange={(e) => handleCommissionFormChange("package_amount", e.target.value)}
                                                className="border rounded-lg px-4 py-1 shadow-sm bg-white w-full max-w-[120px]"
                                                disabled={commissionForm.package_type !== "packages_post_paid"}
                                            />
                                        </div>
                                    )}
                                </div>
                            </label>
                        </div>
                        {/* <div className="flex justify-end">
                            <Button
                                type="filled"
                                onClick={handleSaveCommission}
                                disabled={isSubmitting}
                                className="px-3 py-3 rounded-md"
                            >
                                {isSubmitting ? "Saving..." : "Save Packages (Top Up)"}
                            </Button>
                        </div> */}
                    </div>
                </CardContainer>

                <CardContainer className="p-3 sm:p-4 lg:p-5">
                    <div className="flex flex-col gap-4">
                        <h3 className="font-semibold text-lg text-gray-800">Additional Settings</h3>
                        <div className="grid grid-cols-1 xl:grid-cols-2 lg:grid-cols-1 md:grid-cols-1 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Cancellation Per Day
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    placeholder="Enter cancellation charge"
                                    value={commissionForm.cancellation_per_day}
                                    onChange={(e) => handleCommissionFormChange("cancellation_per_day", e.target.value)}
                                    className="sm:px-5 px-4 sm:py-[21px] py-4 border border-[#8D8D8D] rounded-lg w-full h-10 shadow-[-4px_4px_6px_0px_#0000001F] placeholder:text-[#6C6C6C] sm:text-base text-sm leading-[22px] font-semibold disabled:bg-gray-50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Waiting Time Charge
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    placeholder="Enter waiting time charge"
                                    value={commissionForm.waiting_time_charge}
                                    onChange={(e) => handleCommissionFormChange("waiting_time_charge", e.target.value)}
                                    className="sm:px-5 px-4 sm:py-[21px] py-4 border border-[#8D8D8D] rounded-lg w-full h-10 shadow-[-4px_4px_6px_0px_#0000001F] placeholder:text-[#6C6C6C] sm:text-base text-sm leading-[22px] font-semibold disabled:bg-gray-50"
                                />
                            </div>
                        </div>
                        {error && (
                            <div className="text-red-500 text-sm mt-2">{error}</div>
                        )}
                        <div className="flex justify-end">
                            <Button
                                type="filled"
                                onClick={handleSaveCommission}
                                disabled={isSubmitting}
                                className="px-3 py-3 rounded-md"
                            >
                                {isSubmitting ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </div>
                </CardContainer>
                {commissionForm.package_type === "packages_topup" && (
                    <div className="overflow-hidden">
                        <CardContainer className="p-3 sm:p-4 lg:p-5 bg-[#F5F5F5]">
                            <div className="flex xl:flex-row lg:flex-row md:flex-row flex-col items-stretch sm:items-center gap-3 sm:gap-5 justify-between mb-4 sm:mb-0">
                                <div className="w-full sm:flex-1">
                                    <SearchBar
                                        value={_searchQuery}
                                        className="w-full"
                                    />
                                </div>
                                <div className="md:flex flex-row gap-3 sm:gap-5 flex w-full sm:w-auto justify-end">
                                    <Button
                                        type="filled"
                                        btnSize="2xl"
                                        onClick={() => {
                                            lockBodyScroll();
                                            setIsCommissionModelOpen({ isOpen: true, type: "new" });

                                        }}
                                        className="w-auto -mb-2 sm:-mb-3 lg:-mb-3 !py-3.5 sm:!py-3 lg:!py-3"
                                    >
                                        <div className="flex gap-2 sm:gap-[15px] items-center whitespace-nowrap">
                                            <span className="hidden sm:inline-block">
                                                <PlusIcon />
                                            </span>
                                            <span className="sm:hidden">
                                                <PlusIcon height={12} width={12} />
                                            </span>
                                            <span>Add Packge</span>
                                        </div>
                                    </Button>
                                </div>
                            </div>

                            <div className="overflow-hidden w-full">
                                <Loading loading={tableLoading} type="cover">
                                    <div
                                        className={`
                                          grid gap-4 pt-4 transition-all duration-300 ease-in-out
                                         ${isSidebarOpen
                                                ? ""
                                                : ""
                                            }
                                           `}
                                    >
                                        {packageTopups.length === 0 ? (
                                            <p>No package top-ups available</p>
                                        ) : (
                                            packageTopups.map((commission) => (
                                                <CommissionCard
                                                    key={commission.id}
                                                    commission={commission}
                                                    onEdit={handleEdit}
                                                    onDelete={handleDeleteClick}
                                                />
                                            ))
                                        )}
                                    </div>
                                </Loading>
                            </div>

                        </CardContainer>
                    </div>
                )}
            </div>
            <Modal
                isOpen={isCommissionModelOpen.isOpen}
                className="p-4 sm:p-6 lg:p-10"
            >
                <AddPackageModel
                    setIsOpen={setIsCommissionModelOpen}
                    initialValue={isCommissionModelOpen.initialValue || {}}
                    onPackageCreated={() => setRefreshTrigger(prev => prev + 1)}
                />
            </Modal>
            <Modal isOpen={deleteModalOpen} className="p-10">
                <div className="text-center">
                    <h2 className="text-xl font-semibold mb-3">Delete Package?</h2>
                    <p className="text-gray-600 mb-6">
                        Are you sure you want to delete {packageToPupToDatale?.name}?
                    </p>

                    <div className="flex justify-center gap-4">
                        <Button
                            type="filledGray"
                            onClick={() => {
                                setDeleteModalOpen(false);
                                setPackageToPupToDatale(null);
                            }}
                            className="px-6 py-2 rounded-md"
                        >
                            Cancel
                        </Button>

                        <Button
                            type="filledRed"
                            onClick={handleDeleteCommission}
                            disabled={isDeleting}
                            className="px-6 py-2 rounded-md"
                        >
                            {isDeleting ? "Deleting..." : "Delete"}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}

export default Commission;