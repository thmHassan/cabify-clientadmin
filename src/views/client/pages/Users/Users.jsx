import React, { useState } from "react";
import PageTitle from "../../../../components/ui/PageTitle/PageTitle";
import PageSubTitle from "../../../../components/ui/PageSubTitle/PageSubTitle";
import Button from "../../../../components/ui/Button/Button";
import PlusIcon from "../../../../components/svg/PlusIcon";
import CardContainer from "../../../../components/shared/CardContainer";
import SearchBar from "../../../../components/shared/SearchBar/SearchBar";
import CustomSelect from "../../../../components/ui/CustomSelect";
import { useAppSelector } from "../../../../store";
import { PAGE_SIZE_OPTIONS, STATUS_OPTIONS } from "../../../../constants/selectOptions";
import AddUserModel from "./components/AddUserModel";
import Modal from "../../../../components/shared/Modal/Modal";
import { lockBodyScroll } from "../../../../utils/functions/common.function";
import Pagination from "../../../../components/ui/Pagination/Pagination";
import Loading from "../../../../components/shared/Loading/Loading";
import Tag from "../../../../components/ui/Tag";

const Users = () => {
  const [isUserModalOpen, setIsUserModalOpen] = useState({
    type: "new",
    isOpen: false,
  });
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

  const staticUsers = [
    {
      id: "MR12345",
      name: "Alex Rodriguez",
      email: "alex.rodriguez@gmail.com",
      phone: "+1 (555) 123-4567",
      address: "150 Deansgate, Manchester M3 3EH, United Kingdom",
      device: "Android",
      ratings: "-",
      createdAt: "Sat, 20 Sep, 2025",
    },
    {
      id: "MR12346",
      name: "Alex Rodriguez",
      email: "alex.rodriguez@gmail.com",
      phone: "+1 (555) 123-4567",
      address: "150 Deansgate, Manchester M3 3EH, United Kingdom",
      device: "iOS",
      ratings: "4.7",
      createdAt: "Sun, 21 Sep, 2025",
    },
    {
      id: "MR12347",
      name: "Alex Rodriguez",
      email: "alex.rodriguez@gmail.com",
      phone: "+1 (555) 123-4567",
      address: "150 Deansgate, Manchester M3 3EH, United Kingdom",
      device: "Android",
      ratings: "5.0",
      createdAt: "Mon, 22 Sep, 2025",
    },
  ];

  return (
    <div className="px-4 py-5 sm:p-6 lg:p-10 min-h-[calc(100vh-85px)]">
      <div className="flex justify-between sm:flex-row flex-col items-start sm:items-center gap-3 sm:gap-0 2xl:mb-6 1.5xl:mb-10 mb-0">
        <div className="sm:mb-[30px] mb-1 sm:w-[calc(100%-240px)] w-full flex gap-5 items-center">
          <div className="flex flex-col gap-2.5 w-[calc(100%-100px)]">
            <PageTitle title="Users" />
            <PageSubTitle title="Reviews By Customers & Drivers" />
          </div>
        </div>
        <div className="sm:w-auto xs:w-auto w-full sm:mb-[50px] mb-8">
          <Button
            type="filled"
            btnSize="2xl"
            onClick={() => {
              lockBodyScroll();
              setIsUserModalOpen({ isOpen: true, type: "new" });
            }}
            className="w-full sm:w-auto -mb-2 sm:-mb-3 lg:-mb-3 !py-3.5 sm:!py-3 lg:!py-3"
          >
            <div className="flex gap-2 sm:gap-[15px] items-center justify-center whitespace-nowrap">
              <span className="hidden sm:inline-block">
                <PlusIcon />
              </span>
              <span className="sm:hidden">
                <PlusIcon height={16} width={16} />
              </span>
              <span>Add New User</span>
            </div>
          </Button>
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
              {staticUsers.map((user, index) => (
                <div
                  key={index.id}
                  className="bg-white rounded-[15px] p-4 gap-2 flex items-center justify-between hover:shadow-md   overflow-x-auto"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-60">
                      <p className="font-semibold text-xl">{user.name}</p>
                      <p className="text-[10px]">{user.email}</p>
                      <p className="text-xs">{user.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-3" >

                    <div className="px-4 py-2 rounded-full bg-gray-100 text-center">
                      <p className="text-xs text-gray-500">ID</p>
                      <p className="text-black font-semibold text-sm">
                        {user.id}
                      </p>
                    </div>
                    <div className="px-4 py-2 rounded-full bg-gray-100 text-center">
                      <p className="text-xs text-start text-gray-500 mb-0.5 px-1 ">Address</p>
                      <p className="text-black pb-1 px-1 text-start font-semibold text-xs w-60">
                        {user.address}
                      </p>
                    </div>

                    <div className="px-4 py-2 rounded-full bg-gray-100 text-center">
                      <p className="text-xs text-gray-500">Device</p>
                      <p className="text-black font-semibold text-sm">
                        {user.device}
                      </p>
                    </div>
                    <div className="px-4 py-2 rounded-full bg-gray-100 text-center">
                      <p className="text-xs text-gray-500">Rating</p>
                      <p className="text-black font-semibold text-sm">
                        {user.ratings}
                      </p>
                    </div>
                    <div className="px-4 py-2 rounded-full bg-gray-100 text-center">
                      <p className="text-xs text-gray-500">Created At</p>
                      <p className="text-black font-semibold text-sm w-32">
                        {user.createdAt}
                      </p>
                    </div>
                    <div className="cursor-pointer p-3 bg-gray-100 rounded-full hover:bg-gray-200">
                      <svg width="5" height="14" viewBox="0 0 5 20" fill="none">
                        <circle cx="2.5" cy="3" r="2.5" fill="#7B7B7B" />
                        <circle cx="2.5" cy="10" r="2.5" fill="#7B7B7B" />
                        <circle cx="2.5" cy="17" r="2.5" fill="#7B7B7B" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Loading>
          {Array.isArray(staticUsers) &&
            staticUsers.length > 0 ? (
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
      <Modal
        isOpen={isUserModalOpen.isOpen}
        className="p-4 sm:p-6 lg:p-10"
      >
        <AddUserModel setIsOpen={setIsUserModalOpen} />
      </Modal>
    </div>
  );
};

export default Users;
