import { useState } from "react";
import CardContainer from "../../../../../../components/shared/CardContainer"
import Loading from "../../../../../../components/shared/Loading/Loading"
import PageTitle from "../../../../../../components/ui/PageTitle/PageTitle"
import { unlockBodyScroll } from "../../../../../../utils/functions/common.function";
import { useNavigate } from "react-router-dom";

const LostFoundDetails = () => {
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [formData, setFormData] = useState({
        driverName: "",
        customerName: "",
        rideNumber: "",
        phone_no: "",
        car_plate_no: "",
        description: "",
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleCancel = () => {
        unlockBodyScroll();
        navigate("/lost-found");
    };

    return (
        <div>
            <div className="px-4 py-5 sm:p-6 lg:p-10 min-h-[calc(100vh-85px)]">
                <div className="flex justify-between sm:flex-row flex-col items-start sm:items-center gap-3 sm:gap-0">
                    <div className="sm:mb-[30px] mb-1 sm:w-[calc(100%-240px)] w-full flex gap-5 items-center">
                        <div className="flex flex-col gap-2.5 w-[calc(100%-100px)]">
                            <PageTitle title="Lost & Found Details" />
                        </div>
                    </div>
                </div>
                <div>
                    <CardContainer className="p-3 sm:p-4 lg:p-5 bg-[#F5F5F5]">
                        <Loading loading={isLoading} type="cover">
                            <div className="w-full">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                                    <div className="flex flex-col gap-1">
                                        <label className="text-sm font-medium text-gray-700">Driver Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.driverName}
                                            onChange={handleInputChange}
                                            placeholder="Enter Name"
                                            className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-600"
                                        />
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <label className="text-sm font-medium text-gray-700">Customer Name</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.customerName}
                                            onChange={handleInputChange}
                                            placeholder="Enter Email"
                                            className="border border-blue-600 rounded-lg px-4 py-3 focus:outline-none"
                                        />
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <label className="text-sm font-medium text-gray-700">Ride Number</label>
                                        <input
                                            type="text"
                                            name="phone_no"
                                            value={formData.rideNumber}
                                            onChange={handleInputChange}
                                            placeholder="Enter Phone Number"
                                            className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-600"
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
                                        <label className="text-sm font-medium text-gray-700">Car Plate Number</label>
                                        <input
                                            type="text"
                                            name="phone_no"
                                            value={formData.car_plate_no}
                                            onChange={handleInputChange}
                                            placeholder="Enter Phone Number"
                                            className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-600"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-sm font-medium text-gray-700">Description</label>
                                        <input
                                            type="text"
                                            name="address"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            placeholder="Enter company address"
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
                                        // onClick={handleSave}
                                        disabled={isSaving || isLoading}
                                    >
                                        <span>{isSaving ? "Saving..." : "Save"}</span>
                                    </Button>
                                </div>
                            </div>
                        </Loading>
                    </CardContainer>
                </div>
            </div>
        </div>
    )
}

export default LostFoundDetails