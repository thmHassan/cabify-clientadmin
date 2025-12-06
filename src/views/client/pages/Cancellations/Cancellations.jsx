import React, { useState } from "react";
import PageTitle from "../../../../components/ui/PageTitle/PageTitle";
import CardContainer from "../../../../components/shared/CardContainer";
import SearchBar from "../../../../components/shared/SearchBar/SearchBar";
import CancellationsCard from "./CancellationsCard";
import Pagination from "../../../../components/ui/Pagination/Pagination";
import { PAGE_SIZE_OPTIONS } from "../../../../constants/selectOptions";
import { useAppSelector } from "../../../../store";


const Cancellations = () => {
  const [_searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("customer");
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

  const customerReviews = [
    {
      rideId: "MR12345",
      userName: "Dianne Russell",
      driverName: "Marvin McKinney",
      initiatedAt: "2023-08-15 14:30",
      cancelledBy: "User",
      reason: "Change of plans",
      amount: "$15.00",
      services: "Standard Ride",
    },
    {
      rideId: "MR12346",
      userName: "Kathryn Murphy",
      driverName: "Eleanor Pena",
      initiatedAt: "2023-08-16 10:15",
      cancelledBy: "Driver",
      reason: "Vehicle issue",
      amount: "$22.50",
      services: "Premium Ride",
    },
    {
      rideId: "MR12347",
      userName: "Darlene Robertson",
      driverName: "Jane Cooper",
      initiatedAt: "2023-08-17 09:45",
      cancelledBy: "User",
      reason: "Found alternative transport",
      amount: "$18.75",
      services: "Standard Ride",
    },
    {
      rideId: "MR12346",
      userName: "Kathryn Murphy",
      driverName: "Eleanor Pena",
      initiatedAt: "2023-08-16 10:15",
      cancelledBy: "Driver",
      reason: "Vehicle issue",
      amount: "$22.50",
      services: "Premium Ride",
    },
    {
      rideId: "MR12347",
      userName: "Darlene Robertson",
      driverName: "Jane Cooper",
      initiatedAt: "2023-08-17 09:45",
      cancelledBy: "User",
      reason: "Found alternative transport",
      amount: "$18.75",
      services: "Standard Ride",
    },
    {
      rideId: "MR12346",
      userName: "Kathryn Murphy",
      driverName: "Eleanor Pena",
      initiatedAt: "2023-08-16 10:15",
      cancelledBy: "Driver",
      reason: "Vehicle issue",
      amount: "$22.50",
      services: "Premium Ride",
    },
    {
      rideId: "MR12347",
      userName: "Darlene Robertson",
      driverName: "Jane Cooper",
      initiatedAt: "2023-08-17 09:45",
      cancelledBy: "User",
      reason: "Found alternative transport",
      amount: "$18.75",
      services: "Standard Ride",
    },
    {
      rideId: "MR12346",
      userName: "Kathryn Murphy",
      driverName: "Eleanor Pena",
      initiatedAt: "2023-08-16 10:15",
      cancelledBy: "Driver",
      reason: "Vehicle issue",
      amount: "$22.50",
      services: "Premium Ride",
    },
  ];

  const reviews = activeTab === "customer" ? customerReviews : driverReviews;

  const filtered = reviews.filter((r) => {
    const q = _searchQuery.toLowerCase();
    return (
      r.rideId.toLowerCase().includes(q) ||
      r.userName.toLowerCase().includes(q) ||
      r.driverName.toLowerCase().includes(q) ||
      (r.comment && r.comment.toLowerCase().includes(q))
    );
  });
  return (
    <div className="px-4 py-5 sm:p-6 lg:p-10 min-h-[calc(100vh-85px)]">
      <div className="flex flex-col gap-2.5 sm:mb-[30px] mb-6">
        <div className="flex justify-between">
          <PageTitle title="Cancellations" />
        </div>
      </div>
      <div className="flex flex-col gap-4 sm:gap-5 lg:gap-[30px]">
        <CardContainer className="p-3 sm:p-4 lg:p-5">
          <div className="flex flex-row items-stretch sm:items-center gap-3 sm:gap-5 justify-between mb-4 sm:mb-0">
            <div className="md:w-full w-[calc(100%-54px)] sm:flex-1">
              <SearchBar
                value={_searchQuery}
                // onSearchChange={handleSearchChange}
                className="w-full md:max-w-[400px] max-w-full"
              />
            </div>
          </div>
          <div className="space-y-4">
            {filtered.length === 0 ? (
              <p className="text-gray-500">No reviews found</p>
            ) : (
              filtered.map((review, idx) => <CancellationsCard key={idx} review={review} />)
            )}
          </div>
          {Array.isArray(filtered) &&
            filtered.length > 0 ? (
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

export default Cancellations;
