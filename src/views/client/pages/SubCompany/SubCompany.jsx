import React, { useState } from 'react'
import PageTitle from '../../../../components/ui/PageTitle/PageTitle';
import PageSubTitle from '../../../../components/ui/PageSubTitle/PageSubTitle';
import Button from '../../../../components/ui/Button/Button';
import PlusIcon from '../../../../components/svg/PlusIcon';
import CardContainer from '../../../../components/shared/CardContainer';
import SearchBar from '../../../../components/shared/SearchBar/SearchBar';
import Loading from '../../../../components/shared/Loading/Loading';
import { PAGE_SIZE_OPTIONS, STATUS_OPTIONS } from '../../../../constants/selectOptions';
import Pagination from '../../../../components/ui/Pagination/Pagination';
import { useAppSelector } from '../../../../store';
import { lockBodyScroll } from '../../../../utils/functions/common.function';
import Modal from '../../../../components/shared/Modal/Modal';
import AddSubCompanyModel from './components/AddSubCompanyModel/AddSubCompanyModel';
import SubCompantCard from './components/SubCompanyCard';

const SubCompany = () => {
  const [isSubCompanyModelOpen, setIsSubCompanyModelOpen] = useState({
    type: "new",
    isOpen: false,
  });
  const [_searchQuery, setSearchQuery] = useState("");
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
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

  const handleView = (account) => {
    setIsSubCompanyModelOpen({
      type: "view",  // Set to view mode
      isOpen: true,
      accountData: account,  // Pass the selected account data
    });
  }
  const handleEdit = (account) => {
    setIsSubCompanyModelOpen({
      type: "edit",  // Set to edit mode
      isOpen: true,
      accountData: account,  // Pass the account data
    });
  };
  const staticCompany = [
    {
      id: 1,
      name: "Presting Auto Pvt. Ltd.",
      email: "debra@gmail.com"
    },
    {
      id: 2,
      name: "Swift Logistics Co.",
      email: "demo@gmail.com"

    },
    {
      id: 3,
      name: "Global Transport Inc.",
      email: "demo@gmail.com",
    },
    {
      id: 4,
      name: "Express Movers Ltd.",
      email: "demo@gmail.com",
    },
    {
      id: 5,
      name: "Rapid Delivery Services",
      email: "demo@gmail.com",
    },
  ];

  return (
    <div className="px-4 py-5 sm:p-6 lg:p-10 min-h-[calc(100vh-85px)]">
      <div className="flex justify-between sm:flex-row flex-col items-start sm:items-center gap-3 sm:gap-0 2xl:mb-6 1.5xl:mb-10 mb-0">
        <div className="sm:mb-[30px] mb-1 sm:w-[calc(100%-240px)] w-full flex gap-5 items-center">
          <div className="flex flex-col gap-2.5 w-[calc(100%-100px)]">
            <PageTitle title="Sub Company" />
            <PageSubTitle title="Manage sub company from here" />
          </div>
        </div>
        <div className="sm:w-auto xs:w-auto w-full sm:mb-[50px] mb-8">
          <Button
            type="filled"
            btnSize="2xl"
            onClick={() => {
              lockBodyScroll();
              setIsSubCompanyModelOpen({ isOpen: true, type: "new" });
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
              <span>Add Sub Company</span>
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
          </div>
          <Loading loading={tableLoading} type="cover">
            <div className="flex flex-col gap-4 pt-4">
              {staticCompany.map((company) => (
                <SubCompantCard
                  key={company.id}
                  company={company}
                  // onView={handleView}
                  onEdit={handleEdit}
                />
              ))}
            </div>
          </Loading>
          {Array.isArray(staticCompany) &&
            staticCompany.length > 0 ? (
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
        isOpen={isSubCompanyModelOpen.isOpen}
        className="p-4 sm:p-6 lg:p-10"
      >
        <AddSubCompanyModel setIsOpen={setIsSubCompanyModelOpen} />
      </Modal>
    </div>
  );
}

export default SubCompany