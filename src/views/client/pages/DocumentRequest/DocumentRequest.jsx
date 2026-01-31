import React, { useCallback, useEffect, useRef, useState } from "react";
import { PAGE_SIZE_OPTIONS, DOCUMENT_OPTIONS } from "../../../../constants/selectOptions";
import { useAppSelector } from "../../../../store";
import AppLogoLoader from "../../../../components/shared/AppLogoLoader";
import PageTitle from "../../../../components/ui/PageTitle/PageTitle";
import PageSubTitle from "../../../../components/ui/PageSubTitle";
import CardContainer from "../../../../components/shared/CardContainer";
import SearchBar from "../../../../components/shared/SearchBar/SearchBar";
import Pagination from "../../../../components/ui/Pagination/Pagination";
import { apiGetDocumentRequests } from "../../../../services/DocumentRequestServices";
import DocumentRequestCard from "./components/DocumentRequestCard";

const DocumentRequest = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
    const [tableLoading, setTableLoading] = useState(false);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [documentData, setDocumentData] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState(
        DOCUMENT_OPTIONS.find((o) => o.value === "all") ?? DOCUMENT_OPTIONS[0]
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
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const fetchDocuments = useCallback(async () => {
        setTableLoading(true);
        try {
            const params = {
                page: currentPage,
                perPage: itemsPerPage,
            };

            if (selectedStatus?.value && selectedStatus.value !== "all") {
                params.status = selectedStatus.value;
            }

            if (debouncedSearchQuery?.trim()) {
                params.search = debouncedSearchQuery.trim();
            }

            const response = await apiGetDocumentRequests(params);

            if (response?.data?.success === 1) {
                const listData = response?.data?.data;
                setDocumentData(listData?.data || []);
                setTotalItems(listData?.total || 0);
                setTotalPages(listData?.last_page || 1);
            }
        } catch (error) {
            console.error("Error fetching documents:", error);
            setDocumentData([]);
        } finally {
            setTableLoading(false);
            setIsInitialLoad(false); 
        }
    }, [currentPage, itemsPerPage, debouncedSearchQuery, selectedStatus]);

    useEffect(() => {
        fetchDocuments();
    }, [fetchDocuments, refreshTrigger]);

    const handleOnStatusChange = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    const handleStatusChange = (status) => {
        setSelectedStatus(status);
        setCurrentPage(1);
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleItemsPerPageChange = (newItemsPerPage) => {
        setItemsPerPage(newItemsPerPage);
        setCurrentPage(1);
    };

    return (
        <div className="px-4 py-5 sm:p-6 lg:p-10 min-h-[calc(100vh-85px)]">
            <div className="flex justify-between sm:flex-row flex-col items-start sm:items-center gap-3 sm:gap-0 2xl:mb-6 1.5xl:mb-10 mb-0">
                <div className="sm:mb-[30px] mb-1 sm:w-[calc(100%-240px)] w-full flex gap-5 items-center">
                    <div className="flex flex-col gap-2.5 w-[calc(100%-100px)]">
                        <PageTitle title="Drivers Document Request" />
                        <PageSubTitle title="Manage documents added by drivers" />
                    </div>
                </div>
            </div>
            <div>
                <CardContainer className="p-3 sm:p-4 lg:p-5 bg-[#F5F5F5]">
                    <div className="flex flex-row items-stretch sm:items-center gap-3 sm:gap-5 justify-between mb-4 sm:mb-0">
                        <div className="md:w-full w-[calc(100%-54px)] sm:flex-1">
                            <SearchBar
                                value={searchQuery}
                                onSearchChange={setSearchQuery}
                                className="w-full md:max-w-[400px] max-w-full"
                            />
                        </div>
                        {/* <div className="md:flex flex-row gap-3 sm:gap-5 w-full sm:w-auto">
                            <CustomSelect
                                variant={2}
                                options={DOCUMENT_OPTIONS}
                                value={selectedStatus}
                                onChange={handleStatusChange}
                                placeholder="All Status"
                            />
                        </div> */}
                    </div>

                    {tableLoading ? (
                        <div className="flex items-center justify-center py-10">
                            <AppLogoLoader />
                        </div>
                    ) : documentData.length === 0 ? (
                        <div className="flex items-center justify-center py-10">
                            <p className="text-gray-500 text-lg">No documents found</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4 pt-4">
                            {documentData.map((document) => (
                                <DocumentRequestCard
                                    key={document.id}
                                    document={document}
                                    onStatusChange={handleOnStatusChange}
                                />
                            ))}
                        </div>
                    )}


                    {Array.isArray(documentData) && documentData.length > 0 ? (
                        <div className="mt-4 sm:mt-4 border-t border-[#E9E9E9] pt-3 sm:pt-4">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                itemsPerPage={itemsPerPage}
                                onPageChange={handlePageChange}
                                onItemsPerPageChange={handleItemsPerPageChange}
                                itemsPerPageOptions={PAGE_SIZE_OPTIONS}
                                pageKey="companies"
                            />
                        </div>
                    ) : null}
                </CardContainer>
            </div>
        </div>
    );
};

export default DocumentRequest;