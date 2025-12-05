import React, { useState } from 'react'
import PageTitle from '../../../../components/ui/PageTitle/PageTitle';
import PageSubTitle from '../../../../components/ui/PageSubTitle/PageSubTitle';
import { useAppSelector } from '../../../../store';
import { PAGE_SIZE_OPTIONS, STATUS_OPTIONS } from '../../../../constants/selectOptions';
import CardContainer from '../../../../components/shared/CardContainer';
import SearchBar from '../../../../components/shared/SearchBar/SearchBar';
import Loading from '../../../../components/shared/Loading/Loading';
import Pagination from '../../../../components/ui/Pagination/Pagination';
import CustomSelect from '../../../../components/ui/CustomSelect';
import { date } from 'yup';
import TicketsCard from './components/TicketsCard';

const Tickets = () => {
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
  const staticTickets = [
    {
      id: "#TC1001",
      customer: "John Doe",
      date: "2024-08-15",
      subject: "Issue with recent order",
      status: "Open",
      note: "i want to delete my account but it's not getting deleted",
      reply: "reply"
    },
    {
      id: "#TC1004",
      customer: "Emily Davis",
      date: "2024-08-12",
      subject: "App crashes frequently",
      status: "Open",
      note: "i want to delete my account but it's not getting deleted",
      reply: "reply"
    },
    {
      id: "#TC1002",
      customer: "Jane Smith",
      date: "2024-08-14",
      subject: "Payment not processed",
      status: "Closed",
      note: "i want to delete my account but it's not getting deleted",
      reply: "View Chat History"

    },
    {
      id: "#TC1003",
      customer: "Mike Johnson",
      date: "2024-08-13",
      subject: "Unable to login",
      status: "Closed",
      note: "i want to delete my account but it's not getting deleted",
      reply: "View Chat History"
    },
    {
      id: "#TC1005",
      customer: "David Wilson",
      date: "2024-08-11",
      subject: "Feature request",
      status: "Closed",
      note: "i want to delete my account but it's not getting deleted",
      reply: "View Chat History"
    },
  ];
  return (
    <div className="px-4 py-5 sm:p-6 lg:p-10 min-h-[calc(100vh-85px)]">
      <div className="flex flex-col gap-2.5 sm:mb-[30px] mb-6">
        <div className="flex justify-between">
          <PageTitle title="Tickets" />
        </div>
        <div>
          <PageSubTitle title="Need Content Here" />
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
              {staticTickets.map((tickets) => (
                <TicketsCard
                  key={tickets.id}
                  tickets={tickets}
                  // onView={handleView}
                  // onEdit={handleEdit}
                />
              ))}
            </div>
          </Loading>
          {Array.isArray(staticTickets) &&
            staticTickets.length > 0 ? (
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
      {/* <Modal
        isOpen={isSubCompanyModelOpen.isOpen}
        className="p-4 sm:p-6 lg:p-10"
      >
        <AddSubCompanyModel setIsOpen={setIsSubCompanyModelOpen} />
      </Modal> */}
    </div>
  );
}

export default Tickets