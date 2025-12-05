import React, { useState } from 'react'
import PageTitle from '../../../../components/ui/PageTitle/PageTitle';
import PageSubTitle from '../../../../components/ui/PageSubTitle/PageSubTitle';
import { PAGE_SIZE_OPTIONS, STATUS_OPTIONS } from '../../../../constants/selectOptions';
import { useAppSelector } from '../../../../store';
import CardContainer from '../../../../components/shared/CardContainer';
import SearchBar from '../../../../components/shared/SearchBar/SearchBar';
import CustomSelect from '../../../../components/ui/CustomSelect';
import Loading from '../../../../components/shared/Loading/Loading';
import LostFoundCard from './components/LostFoundCard/LostFoundCard';
import Pagination from '../../../../components/ui/Pagination/Pagination';

const LostFound = () => {
   const [_searchQuery, setSearchQuery] = useState("");
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
  
    const staticLostFound = [
      {
        id: "MR12345",
        name: "Alex Rodriguez",
        phoneNumber: "+1 (555) 123-4567",
        carPlateNo: "ABC-1234",
        DateTime: "2023-08-15 14:30",
        status: "Found",
        received: "Received"
      },
      {
        id: "MR12346",
        name: "Alex Rodriguez",
        phoneNumber: "+1 (555) 123-4567",
        carPlateNo: "ABC-1234",
        DateTime: "2023-08-15 14:30",
        status: "Lost",
        received: "Reply"
      },
      {
        id: "MR12347",
        name: "Alex Rodriguez",
        phoneNumber: "+1 (555) 123-4567",
        carPlateNo: "ABC-1234",
        DateTime: "2023-08-15 14:30",
        status: "Searching",
        received: "Received"
      },
      {
        id: "MR12347",
        name: "Alex Rodriguez",
        phoneNumber: "+1 (555) 123-4567",
        carPlateNo: "ABC-1234",
        DateTime: "2023-08-15 14:30",
        status: "Found",
        received: "Reply"
      },
    ];
  return (
    <div className="px-4 py-5 sm:p-6 lg:p-10 min-h-[calc(100vh-85px)]">
      <div className="flex flex-col gap-2.5 sm:mb-[30px] mb-6">
        <div className="flex justify-between">
          <PageTitle title="Lost & Found" />
        </div>
        <div>
          <PageSubTitle title="Lost And Found Drivers And Customers Belongings" />
        </div>
      </div>
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
              <CustomSelect
                variant={2}
                options={STATUS_OPTIONS}
                value={_selectedStatus}
                // onChange={handleStatusChange}
                placeholder="All Status"
              />
            </div>
          </div>
          <Loading loading={tableLoading} type="cover">
            <div className="flex flex-col gap-4 pt-4">
              {staticLostFound.map((lostfound) => (
                <LostFoundCard key={lostfound.id} lostfound={lostfound} />
              ))}
            </div>
          </Loading>
          {Array.isArray(staticLostFound) &&
            staticLostFound.length > 0 ? (
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
}

export default LostFound