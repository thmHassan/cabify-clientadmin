import React, { useCallback, useEffect, useState } from "react";
import PageTitle from "../../../../components/ui/PageTitle/PageTitle";
import PageSubTitle from "../../../../components/ui/PageSubTitle/PageSubTitle";
import CardContainer from "../../../../components/shared/CardContainer";
import SearchBar from "../../../../components/shared/SearchBar/SearchBar";
import Button from "../../../../components/ui/Button/Button";
import ReviewCard from "./ReviewCard";
import { useAppSelector } from "../../../../store";
import { PAGE_SIZE_OPTIONS } from "../../../../constants/selectOptions";
import Pagination from "../../../../components/ui/Pagination/Pagination";
import { apiGetCustomerRatings, apiGetDriverRatings } from "../../../../services/Reviewservices";
import AppLogoLoader from "../../../../components/shared/AppLogoLoader";

const Reviews = () => {

  const [_searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("customer");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [tableLoading, setTableLoading] = useState(false);
  const [driverRatingData, setDriverRatingData] = useState([]);
  const [customerRatingData, setCustomerRatingData] = useState([]);
  const savedPagination = useAppSelector((state) => state?.app?.app?.pagination?.companies);
  const [currentPage, setCurrentPage] = useState(Number(savedPagination?.currentPage) || 1);
  const [itemsPerPage, setItemsPerPage] = useState(Number(savedPagination?.itemsPerPage) || 10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(_searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [_searchQuery]);

  const fetchDriverRating = useCallback(async () => {
    setTableLoading(true);
    try {
      const params = {
        page: currentPage,
        perPage: itemsPerPage,
      };

      if (debouncedSearchQuery.trim()) {
        params.search = debouncedSearchQuery.trim();
      }

      const response = await apiGetDriverRatings(params);

      if (response?.data?.success === 1) {
        const listData = response.data.list;
        setDriverRatingData(listData?.data || []);
        setTotalItems(listData.total);
        setTotalPages(listData.last_page);
      }

    } catch (error) {
      console.error("Error fetching driver ratings:", error);
      setDriverRatingData([]);
    } finally {
      setTableLoading(false);
    }
  }, [currentPage, itemsPerPage, debouncedSearchQuery]);

  const fetchCustomerRating = useCallback(async () => {
    setTableLoading(true);
    try {
      const params = {
        page: currentPage,
        perPage: itemsPerPage,
      };

      if (debouncedSearchQuery.trim()) {
        params.search = debouncedSearchQuery.trim();
      }

      const response = await apiGetCustomerRatings(params);

      if (response?.data?.success === 1) {
        const listData = response.data.list;
        setCustomerRatingData(listData?.data || []);
        setTotalItems(listData.total);
        setTotalPages(listData.last_page);
      }

    } catch (error) {
      console.error("Error fetching customer ratings:", error);
      setCustomerRatingData([]);
    } finally {
      setTableLoading(false);
    }
  }, [currentPage, itemsPerPage, debouncedSearchQuery]);

  useEffect(() => {
    if (activeTab === "customer") {
      fetchCustomerRating();
    } else {
      fetchDriverRating();
    }
  }, [
    currentPage,
    itemsPerPage,
    debouncedSearchQuery,
    activeTab,
    fetchCustomerRating,
    fetchDriverRating,
  ]);

  const activeData =
    activeTab === "customer" ? customerRatingData : driverRatingData;

  return (
    <div className="px-4 py-5 sm:p-6 lg:p-10 min-h-[calc(100vh-85px)]">

      <div className="flex flex-col gap-2.5 sm:mb-[30px] mb-6">
        <div className="flex justify-between">
          <PageTitle title="Reviews" />
        </div>
        <PageSubTitle title="Reviews By Customers & Drivers" />
      </div>

      <div className="bg-[#006FFF1A] p-1 rounded-lg mb-6 inline-flex gap-1">
        <Button
          type="filled"
          btnSize="2xl"
          className={`${activeTab === "customer"
            ? "!bg-[#1F41BB] !text-white"
            : "!bg-transparent !text-black"
            }`}
          onClick={() => {
            setActiveTab("customer");
            setCurrentPage(1);
          }}
        >
          Customer Ratings
        </Button>

        <Button
          type="filled"
          btnSize="2xl"
          className={`${activeTab === "driver"
            ? "!bg-[#1F41BB] !text-white"
            : "!bg-transparent !text-black"
            }`}
          onClick={() => {
            setActiveTab("driver");
            setCurrentPage(1);
          }}
        >
          Driver Ratings
        </Button>
      </div>
      <div className="flex flex-col gap-4 sm:gap-5 lg:gap-[30px]">
        <CardContainer className="p-3 sm:p-4 lg:p-5">
          <div className="flex flex-row items-stretch sm:items-center gap-3 sm:gap-5 justify-between mb-4">
            <div className="md:w-full w-[calc(100%-54px)] sm:flex-1">
              <SearchBar
                value={_searchQuery}
                onSearchChange={setSearchQuery}
                className="w-full md:max-w-[400px] max-w-full"
              />
            </div>
          </div>
          <div className="space-y-4">
            {tableLoading ? (
              <div className="flex justify-center py-10">
                <AppLogoLoader />
              </div>
            ) : activeData?.length > 0 ? (
              activeData.map((rating) => (
                <ReviewCard key={rating.id} rating={rating} />
              ))
            ) : (
              <p className="text-center text-gray-500 py-10">
                No reviews found
              </p>
            )}
          </div>
          {activeData?.length > 0 && (
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
          )}
        </CardContainer>
      </div>
    </div>
  );
};

export default Reviews;
