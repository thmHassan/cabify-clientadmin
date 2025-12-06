import React, { useState } from "react";
import PageTitle from "../../../../../../components/ui/PageTitle/PageTitle";
import PageSubTitle from "../../../../../../components/ui/PageSubTitle/PageSubTitle";
import CardContainer from "../../../../../../components/shared/CardContainer";
import SearchBar from "../../../../../../components/shared/SearchBar/SearchBar";
import CustomSelect from "../../../../../../components/ui/CustomSelect";
import Loading from "../../../../../../components/shared/Loading/Loading";
import Button from "../../../../../../components/ui/Button/Button";
import { lockBodyScroll } from "../../../../../../utils/functions/common.function";
import PlusIcon from "../../../../../../components/svg/PlusIcon";
import CommissionCard from "./components/CommssionCard";
import Modal from "../../../../../../components/shared/Modal/Modal";
import AddPackageModel from "./components/AddPackegModel";
import SnapshotCard from "../../../../../../components/shared/SnapshotCard/SnapshotCard";
import CompaniesIcon from "../../../../../../components/svg/CompaniesIcon";

const Commission = () => {
    const [_searchQuery, setSearchQuery] = useState("");
    const [tableLoading, setTableLoading] = useState(false);
    const [isCommissionModelOpen, setIsCommissionModelOpen] = useState({
        type: "new",
        isOpen: false,
    });

    const staticCommission = [
        {
            id: 1,
            name: "Camry(sedan)",
            type: "monthly package",
            duration: "1 Month",
            price: "299.50"
        },
        {
            id: 2,
            name: "Highlander(SUV)",
            type: "monthly package",
            duration: "1 Month",
            price: "299.50"
        },
        {
            id: 3,
            name: "Olivia Rhye",
            type: "monthly package",
            duration: "1 Month",
            price: "299.50"
        },
        {
            id: 4,
            name: "Cody Fisher",
            type: "monthly package",
            duration: "1 Month",
            price: "299.50"
        },
        {
            id: 5,
            name: "Esther Howard",
            type: "monthly package",
            duration: "1 Month",
            price: "299.50"
        },
        {
            id: 6,
            name: "Robert Fox",
            type: "monthly package",
            duration: "1 Month",
            price: "299.50"
        },
    ];

    const DASHBOARD_CARDS = [
        {
            title: "Total Companies",
            value: "25",
            change: "+3 from last hour",
            icon: {
                component: CompaniesIcon,
            },
            backgroundColor: "#eeedff",
            color: "#534CB4",
        },
        {
            title: "Active Companies",
            value: "15",
            change: "+3 from last hour",
            icon: {
                component: CompaniesIcon,
            },
            backgroundColor: "#e5f9f0",
            color: "#3E9972",
        },
        {
            title: "Monthly Revenue",
            value: "$6,800",
            change: "+3 from last hour",
            icon: {
                component: CompaniesIcon,
            },
            backgroundColor: "#fdf3e7",
            color: "#C29569",
        },
    ];
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
                <div className="grid  gap-4 sm:gap-5">


                    <div class="flex gap-4  w-full">

                        {/* <!-- Card 1 --> */}
                        <label class="flex-1 cursor-pointer">
                            <div class="border rounded-2xl p-5 flex flex-col gap-4 shadow-sm hover:shadow-md transition">
                                <div class="flex items-center gap-3">
                                    <input type="radio" name="commission" class="w-4 h-4 text-blue-600" />
                                    <p class="font-medium text-gray-800">
                                        Per Ride <br /> Commission (Top Up)
                                    </p>
                                </div>

                                <div class="mt-3">
                                    <div class="border rounded-lg px-4 py-1 text-gray-700 shadow-sm inline-block bg-white">
                                        $ 0.00
                                    </div>
                                </div>
                            </div>
                        </label>


                        {/* <!-- Card 2 (Active) --> */}
                        <label class="flex-1 cursor-pointer">
                            <div class="border rounded-2xl p-5 flex flex-col gap-4 shadow-sm bg-blue-50 hover:shadow-md transition">
                                <div class="flex items-center gap-3">
                                    <input type="radio" name="commission" checked class="w-4 h-4 text-blue-600" />
                                    <p class="font-medium text-gray-800">
                                        Packages (Top Up)
                                    </p>
                                </div>
                            </div>
                        </label>


                        {/* <!-- Card 3 --> */}
                        <label class="flex-1 cursor-pointer">
                            <div class="border rounded-2xl p-5 flex flex-col gap-4 shadow-sm hover:shadow-md transition">
                                <div class="flex items-center gap-3">
                                    <input type="radio" name="commission" class="w-4 h-4 text-blue-600" />
                                    <p class="font-medium text-gray-800 leading-tight">
                                        Commission <br /> without Top Up <br /> Settled Later
                                    </p>
                                </div>

                                <div class="flex gap-3">
                                    <div class="border rounded-lg px-4 py-1 shadow-sm bg-white">Days</div>
                                    <div class="border rounded-lg px-4 py-1 shadow-sm bg-white">0%</div>
                                </div>
                            </div>
                        </label>


                        {/* <!-- Card 4 --> */}
                        <label class="flex-1 cursor-pointer">
                            <div class="border rounded-2xl p-5 flex flex-col gap-4 shadow-sm hover:shadow-md transition">
                                <div class="flex items-center gap-3">
                                    <input type="radio" name="commission" class="w-4 h-4 text-blue-600" />
                                    <p class="font-medium text-gray-800">
                                        Packages Post Paid
                                    </p>
                                </div>

                                <div class="flex gap-3">
                                    <div class="border rounded-lg px-4 py-1 shadow-sm bg-white">Days</div>
                                    <div class="border rounded-lg px-4 py-1 shadow-sm bg-white">0</div>
                                </div>
                            </div>
                        </label>

                    </div>

                </div>
                <div>
                    <div>
                        <CardContainer className="p-3 sm:p-4 lg:p-5 bg-[#F5F5F5]">
                            <div className="flex flex-row items-stretch sm:items-center gap-3 sm:gap-5 justify-between mb-4 sm:mb-0">
                                <div className="md:w-full w-[calc(100%-54px)] sm:flex-1">
                                    <SearchBar
                                        value={_searchQuery}
                                        // onSearchChange={handleSearchChange}
                                        className="w-full md:max-w-[400px] max-w-full"
                                    />
                                </div>
                                <div className="hidden md:flex flex-row gap-3 sm:gap-5 w-full sm:w-auto">
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
                            <Loading loading={tableLoading} type="cover">
                                <div className="flex flex-col gap-4 pt-4">
                                    {staticCommission.map((commission) => (
                                        <CommissionCard key={commission.id} commission={commission} />
                                    ))}
                                </div>
                            </Loading>
                        </CardContainer>
                    </div>
                </div>
            </div>
            <Modal
                isOpen={isCommissionModelOpen.isOpen}
                className="p-4 sm:p-6 lg:p-10"
            >
                <AddPackageModel setIsOpen={setIsCommissionModelOpen} />
            </Modal>
        </div>
    )
}

export default Commission;