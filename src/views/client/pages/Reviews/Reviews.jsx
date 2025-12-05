import React, { useState } from "react";
import PageTitle from "../../../../components/ui/PageTitle/PageTitle";
import PageSubTitle from "../../../../components/ui/PageSubTitle/PageSubTitle";
import CardContainer from "../../../../components/shared/CardContainer";
import DataDetailsTable from "../../../../components/shared/DataDetailsTable/DataDetailsTable";
import SearchBar from "../../../../components/shared/SearchBar/SearchBar";
import Button from "../../../../components/ui/Button/Button";
import ReviewCard from "./ReviewCard";
import { useAppSelector } from "../../../../store";
import { PAGE_SIZE_OPTIONS } from "../../../../constants/selectOptions";
import Pagination from "../../../../components/ui/Pagination/Pagination";

const Reviews = () => {
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
      rating: 4.2,
      comment:
        "So yes, the alcohol (ethanol) in hand sanitizers can be absorbed through the skin, but no, it would...",
    },
    {
      rideId: "MR12346",
      userName: "Kathryn Murphy",
      driverName: "Eleanor Pena",
      rating: 5,
      comment:
        "An interesting implication of the 2007 study concerns the use of hand sanitizers...",
    },
    {
      rideId: "MR12347",
      userName: "Darlene Robertson",
      driverName: "Jane Cooper",
      rating: 4.2,
      comment:
        "Their blood alcohol levels rose to 0.007 to 0.02% after consuming sanitizer...",
    },
    {
      rideId: "MR12346",
      userName: "Kathryn Murphy",
      driverName: "Eleanor Pena",
      rating: 5,
      comment:
        "An interesting implication of the 2007 study concerns the use of hand sanitizers...",
    },
    {
      rideId: "MR12347",
      userName: "Darlene Robertson",
      driverName: "Jane Cooper",
      rating: 4.2,
      comment:
        "Their blood alcohol levels rose to 0.007 to 0.02% after consuming sanitizer...",
    },
    {
      rideId: "MR12346",
      userName: "Kathryn Murphy",
      driverName: "Eleanor Pena",
      rating: 5,
      comment:
        "An interesting implication of the 2007 study concerns the use of hand sanitizers...",
    },
    {
      rideId: "MR12347",
      userName: "Darlene Robertson",
      driverName: "Jane Cooper",
      rating: 4.2,
      comment:
        "Their blood alcohol levels rose to 0.007 to 0.02% after consuming sanitizer...",
    },
  ];

  const driverReviews = [
    {
      rideId: "MR22345",
      userName: "User A",
      driverName: "Driver X",
      rating: 4.7,
      comment: "Driver was punctual and polite.",
    },
    {
      rideId: "MR22346",
      userName: "User B",
      driverName: "Driver Y",
      rating: 3.8,
      comment: "Car was okay, but driver took longer route.",
    },
    {
      rideId: "MR22345",
      userName: "User A",
      driverName: "Driver X",
      rating: 4.7,
      comment: "Driver was punctual and polite.",
    },
    {
      rideId: "MR22346",
      userName: "User B",
      driverName: "Driver Y",
      rating: 3.8,
      comment: "Car was okay, but driver took longer route.",
    },
    {
      rideId: "MR22345",
      userName: "User A",
      driverName: "Driver X",
      rating: 4.7,
      comment: "Driver was punctual and polite.",
    },
    {
      rideId: "MR22346",
      userName: "User B",
      driverName: "Driver Y",
      rating: 3.8,
      comment: "Car was okay, but driver took longer route.",
    },
    {
      rideId: "MR22345",
      userName: "User A",
      driverName: "Driver X",
      rating: 4.7,
      comment: "Driver was punctual and polite.",
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
          <PageTitle title="Reviews" />
        </div>
        <div>
          <PageSubTitle title="Reviews By Costomers & Driver" />
        </div>
      </div>
      <div className="bg-[#006FFF1A] p-1 rounded-lg mb-6 inline-flex gap-1">
        <Button
          type="filled"
          btnSize="2xl"
          className={`${activeTab === "customer" ? "!bg-[#1F41BB] !text-white" : "!bg-transparent !text-black"}`}
          onClick={() => setActiveTab("customer")}
        >
          Customer Ratings
        </Button>
        <Button
          type="filled"
          btnSize="2xl"
          className={`${activeTab === "driver" ? "!bg-[#1F41BB] !text-white" : "!bg-transparent !text-black"}`}
          onClick={() => setActiveTab("driver")}
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
                // onSearchChange={handleSearchChange}
                className="w-full md:max-w-[400px] max-w-full"
              />
            </div>
          </div>
          <div className="space-y-4">
            {filtered.length === 0 ? (
              <p className="text-gray-500">No reviews found</p>
            ) : (
              filtered.map((review, idx) => <ReviewCard key={idx} review={review} />)
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

export default Reviews;