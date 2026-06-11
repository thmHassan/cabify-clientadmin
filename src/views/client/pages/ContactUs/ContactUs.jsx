import React, { useCallback, useEffect, useState } from "react";
import PageTitle from "../../../../components/ui/PageTitle/PageTitle";
import CardContainer from "../../../../components/shared/CardContainer";
import SearchBar from "../../../../components/shared/SearchBar/SearchBar";
import CustomSelect from "../../../../components/ui/CustomSelect/CustomSelect";
import ContactUsCard from "./ContactUsCard";
import Pagination from "../../../../components/ui/Pagination/Pagination";
import { PAGE_SIZE_OPTIONS } from "../../../../constants/selectOptions";
import { useAppSelector } from "../../../../store";
import { apiGetContactUsList } from "../../../../services/ContactUsService";
import AppLogoLoader from "../../../../components/shared/AppLogoLoader";

const TYPE_OPTIONS = [
    { label: "All Types", value: "all" },
    { label: "User", value: "user" },
    { label: "Driver", value: "driver" },
];

const STATUS_OPTIONS = [
    { label: "All Status", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "Responded", value: "responded" },
];

const ContactUs = () => {
    const [searchQuery, setSearchQuery] = useState("");
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
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
    const [tableLoading, setTableLoading] = useState(false);
    const [contactUsData, setContactUsData] = useState([]);
    const [selectedType, setSelectedType] = useState(TYPE_OPTIONS[0]);
    const [selectedStatus, setSelectedStatus] = useState(STATUS_OPTIONS[0]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const fetchContactUs = useCallback(async () => {
        setTableLoading(true);
        try {
            const params = {
                page: currentPage,
                perPage: itemsPerPage,
            };

            if (debouncedSearchQuery?.trim()) {
                params.search = debouncedSearchQuery.trim();
            }

            if (selectedType?.value && selectedType.value !== "all") {
                params.type = selectedType.value;
            }

            if (selectedStatus?.value && selectedStatus.value !== "all") {
                params.status = selectedStatus.value;
            }

            const response = await apiGetContactUsList(params);

            if (response?.data?.success === 1) {
                const list = response?.data?.list;
                setContactUsData(list?.data || []);
                setTotalItems(list?.total || 0);
                setTotalPages(list?.last_page || 1);
            } else {
                setContactUsData([]);
                setTotalItems(0);
                setTotalPages(1);
            }
        } catch (error) {
            console.error("Error fetching contact us:", error);
            setContactUsData([]);
            setTotalItems(0);
            setTotalPages(1);
        } finally {
            setTableLoading(false);
        }
    }, [currentPage, itemsPerPage, debouncedSearchQuery, selectedType, selectedStatus]);

    useEffect(() => {
        fetchContactUs();
    }, [fetchContactUs]);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleItemsPerPageChange = (newItemsPerPage) => {
        setItemsPerPage(newItemsPerPage);
        setCurrentPage(1);
    };

    const handleTypeChange = (selected) => {
        setSelectedType(selected);
        setCurrentPage(1);
    };

    const handleStatusChange = (selected) => {
        setSelectedStatus(selected);
        setCurrentPage(1);
    };

    return (
        <div className="px-4 py-5 sm:p-6 lg:p-10 min-h-[calc(100vh-85px)]">
            <div className="flex flex-col gap-2.5 sm:mb-[30px] mb-6">
                <div className="flex justify-between">
                    <PageTitle title="Contact Us" />
                </div>
            </div>
            <div className="flex flex-col gap-4 sm:gap-5 lg:gap-[30px]">
                <CardContainer className="p-3 sm:p-4 lg:p-5">
                    <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 sm:gap-5 justify-between mb-4 sm:mb-0">
                        <div className="md:w-full w-full sm:flex-1">
                            <SearchBar
                                value={searchQuery}
                                onSearchChange={setSearchQuery}
                                className="w-full md:max-w-[400px] max-w-full"
                            />
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-5 w-full lg:w-auto">
                            <CustomSelect
                                variant={2}
                                options={TYPE_OPTIONS}
                                value={selectedType}
                                onChange={handleTypeChange}
                                placeholder="All Types"
                            />
                            <CustomSelect
                                variant={2}
                                options={STATUS_OPTIONS}
                                value={selectedStatus}
                                onChange={handleStatusChange}
                                placeholder="All Status"
                            />
                        </div>
                    </div>
                    <div className="space-y-4 mt-6">
                        {tableLoading ? (
                            <div className="flex justify-center py-10">
                                <AppLogoLoader />
                            </div>
                        ) : contactUsData?.length > 0 ? (
                            contactUsData.map((item) => (
                                <ContactUsCard
                                    key={item.id}
                                    contact={item}
                                    onResponded={fetchContactUs}
                                />
                            ))
                        ) : (
                            <p className="text-center text-gray-500 py-10">
                                No contact us records found
                            </p>
                        )}
                    </div>
                    {Array.isArray(contactUsData) && contactUsData.length > 0 ? (
                        <div className="mt-4 sm:mt-4 border-t border-[#E9E9E9] pt-3 sm:pt-4">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                itemsPerPage={itemsPerPage}
                                onPageChange={handlePageChange}
                                onItemsPerPageChange={handleItemsPerPageChange}
                                itemsPerPageOptions={PAGE_SIZE_OPTIONS}
                                pageKey="contact-us"
                            />
                        </div>
                    ) : null}
                </CardContainer>
            </div>
        </div>
    );
};

export default ContactUs;
