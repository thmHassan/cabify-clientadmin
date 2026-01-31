import React, { useEffect, useState } from "react";
import PageTitle from "../../../../components/ui/PageTitle/PageTitle";
import PageSubTitle from "../../../../components/ui/PageSubTitle/PageSubTitle";
import Button from "../../../../components/ui/Button/Button";
import AddDispatcherIcon from "../../../../components/svg/AddDispatcherIcon";
import Modal from "../../../../components/shared/Modal/Modal";
import { lockBodyScroll } from "../../../../utils/functions/common.function";
import AddDispatcherModal from "./components/AddDispatcherModal";
import CompaniesIcon from "../../../../components/svg/CompaniesIcon";
import SnapshotCard from "../../../../components/shared/SnapshotCard/SnapshotCard";
import CardContainer from "../../../../components/shared/CardContainer/CardContainer";
import SearchBar from "../../../../components/shared/SearchBar/SearchBar";
import CustomSelect from "../../../../components/ui/CustomSelect/CustomSelect";
import { PAGE_SIZE_OPTIONS, STATUS_OPTIONS } from "../../../../constants/selectOptions";
import Pagination from "../../../../components/ui/Pagination/Pagination";
import { useAppSelector } from "../../../../store";
import Tag from "../../../../components/ui/Tag";
import UserDropdown from "../../../../components/shared/UserDropdown";
import ThreeDotsIcon from "../../../../components/svg/ThreeDotsIcon";
import ApiService from "../../../../services/ApiService";
import { apiDeleteDispatcher } from "../../../../services/DispatcherService";
import AppLogoLoader from "../../../../components/shared/AppLogoLoader";
import ViewLogModel from "./components/ViewLogModel";

const Dispatcher = () => {
  const [isDispatcherModalOpen, setIsDispatcherModalOpen] = useState({
    type: "new",
    isOpen: false,
  });
  const [isLogModalOpen, setIsLogModalOpen] = useState({ type: "new", isOpen: false, });
  const [tableLoading, setTableLoading] = useState(false);
  const [_searchQuery, setSearchQuery] = useState("");
  const [companyListDisplay, setCompanyListDisplay] = useState([]);
  const [openMenuId, setOpenMenuId] = useState(null);
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
  const [cardsLoading, setDispatchLoading] = useState(false);
  const [dispatchCards, setDispatchCards] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [dispatcherListRaw, setDispatcherListRaw] = useState([]);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [dispatcherToDelete, setDispatcherToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchDispatcherCards = async () => {
    try {
      setDispatchLoading(true);
      const response = await ApiService.getDispatcherCards();
      setDispatchCards(response?.data?.data ?? null);
    } catch (error) {
      console.log("err--", error);
      setCompanyCards(null);
    } finally {
      setDispatchLoading(false);
    }
  };

  useEffect(() => {
    fetchDispatcherCards()
  }, [])

  const fetchDispatcherList = async (
    page = 1,
    perPage = itemsPerPage,
    search = ""
  ) => {
    try {
      setTableLoading(true);
      const response = await ApiService.getDispatcherList({
        page,
        perPage,
        search: search || undefined,
      });
      const list = response?.data?.dispatchers;
      console.log(list, "list");
      const rows = Array.isArray(list?.data) ? list?.data : [];

      console.log(rows, "rows");

      setDispatcherListRaw(rows);

      const nextPerPage = list?.per_page ?? itemsPerPage;
      const total = list?.total ?? rows.length;
      const lastPage = list?.last_page ?? 1;

      setItemsPerPage(nextPerPage);
      setTotalItems(total);
      setTotalPages(lastPage);
    } catch (error) {
      console.log("err--", error);
      setDispatcherListRaw([]);
      setTotalItems(0);
      setTotalPages(1);
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    fetchDispatcherList(currentPage, itemsPerPage, debouncedSearchQuery);
  }, [currentPage, itemsPerPage, debouncedSearchQuery, refreshTrigger]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(_searchQuery);
      setCurrentPage(1);
    }, 500); // 500ms debounce

    return () => clearTimeout(handler);
  }, [_searchQuery]);

  const DASHBOARD_CARDS = [
    {
      title: "Total Companies",
      value: dispatchCards ? dispatchCards.totalDispatcher : "0",
      change: "+3 from last hour",
      icon: {
        component: CompaniesIcon,
      },
      backgroundColor: "#eeedff",
      color: "#534CB4",
    },
    {
      title: "Active Companies",
      value: dispatchCards ? dispatchCards.activeDispatcher : "0",
      change: "+3 from last hour",
      icon: {
        component: CompaniesIcon,
      },
      backgroundColor: "#e5f9f0",
      color: "#3E9972",
    },
    {
      title: "Monthly Revenue",
      value: dispatchCards ? `${dispatchCards.ridesDispatchToday}` : "$0",
      change: "+3 from last hour",
      icon: {
        component: CompaniesIcon,
      },
      backgroundColor: "#fdf3e7",
      color: "#C29569",
    },
  ];

  const actionOptions = [
    {
      label: "Edit",
      onClick: (dispatcher) => {
        setIsDispatcherModalOpen({ type: "edit", isOpen: true, data: dispatcher });
        lockBodyScroll();
      },
    },
    {
      label: "View Logs",
      onClick: (dispatcher) => {
        setIsLogModalOpen({
          isOpen: true,
          dispatcher,
        });
        lockBodyScroll();
      },
    },
    {
      label: "Delete",
      onClick: (dispatcher) => handleDeleteClick(dispatcher),
    },
  ];

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const handleDeleteClick = (company) => {
    setDispatcherToDelete(company);
    setDeleteModalOpen(true);
  };

  const handleDeleteDispatcher = async () => {
    if (!dispatcherToDelete?.id) return;

    setIsDeleting(true);
    try {
      const response = await apiDeleteDispatcher(dispatcherToDelete.id);

      if (response?.data?.success === 1 || response?.status === 200) {
        setDeleteModalOpen(false);
        setDispatcherToDelete(null);
        setRefreshTrigger(prev => prev + 1);
      } else {
        console.error("Failed to delete dispatcher");
      }
    } catch (error) {
      console.error("Error deleting dispatcher:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleonDispatcherCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="px-4 py-5 sm:p-6 lg:p-10 min-h-[calc(100vh-85px)]">
      <div className="flex justify-between sm:flex-row flex-col items-start sm:items-center gap-3 sm:gap-0 2xl:mb-6 1.5xl:mb-10 mb-0">
        <div className="sm:mb-[30px] mb-1 sm:w-[calc(100%-240px)] w-full flex gap-5 items-center">
          <div className="flex flex-col gap-2.5 w-[calc(100%-100px)]">
            <PageTitle title="Dispatcher" />
            <PageSubTitle title="Add, monitor and manage your company's dispatch team" />
          </div>
        </div>
        <div className="sm:w-auto xs:w-auto w-full sm:mb-[50px] mb-8 flex gap-[15px]">
          {/* <Button
            type="bgOutlined"
            btnSize="2xl"
            onClick={() => {
              lockBodyScroll();
              setIsManualRequestModal({ isOpen: true, type: "new" });
            }}
            className="w-full sm:w-auto -mb-2 sm:-mb-3 lg:-mb-3 !py-3.5 sm:!py-3 lg:!py-3 !bg-transparent"
          >
            <div className="flex gap-2 sm:gap-[15px] items-center justify-center whitespace-nowrap">
              <span className="hidden sm:inline-block">
                <DownloadIcon />
              </span>
              <span className="sm:hidden">
                <DownloadIcon height={16} width={16} />
              </span>
              <span>Export Report</span>
            </div>
          </Button> */}
          <Button
            type="filled"
            btnSize="2xl"
            onClick={() => {
              lockBodyScroll();
              setIsDispatcherModalOpen({ isOpen: true, type: "new" });
            }}
            className="w-full sm:w-auto -mb-2 sm:-mb-3 lg:-mb-3 !py-3.5 sm:!py-3 lg:!py-3"
          >
            <div className="flex gap-2 sm:gap-[15px] items-center justify-center whitespace-nowrap">
              <span className="hidden sm:inline-block">
                <AddDispatcherIcon />
              </span>
              <span className="sm:hidden">
                <AddDispatcherIcon height={16} width={16} />
              </span>
              <span>Add Dispatcher</span>
            </div>
          </Button>
        </div>
      </div>
      <div className="flex flex-col sm:gap-5 gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 1.5xl:grid-cols-3 gap-4 sm:gap-5">
          {DASHBOARD_CARDS.map((card, index) => (
            <SnapshotCard
              key={index}
              isChange={false}
              data={card}
              className={
                DASHBOARD_CARDS.length - 1 === index
                  ? "sm:col-span-2 1.5xl:col-span-1"
                  : "col-span-1"
              }
            />
          ))}
        </div>
        <div>
          <div>
            <CardContainer className="p-3 sm:p-4 lg:p-5 bg-[#F5F5F5]">
              <div className="flex flex-row items-stretch sm:items-center gap-3 sm:gap-5 justify-between mb-4 sm:mb-0">
                <div className="md:w-full w-[calc(100%-54px)] sm:flex-1">
                  <SearchBar
                    value={_searchQuery}
                    onSearchChange={(value) => setSearchQuery(value)}
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
              <div className="flex flex-col gap-4 pt-4">
                {tableLoading ? (
                  <div className="flex justify-center py-10">
                    <AppLogoLoader />
                  </div>
                ) : dispatcherListRaw.length > 0 ? (
                  dispatcherListRaw.map((d) => (
                    <div key={d.id} className="bg-white rounded-[15px] p-4 gap-2 flex items-center justify-between hover:shadow-md  overflow-x-auto  "
                    >
                      <div className="flex items-center gap-3">
                        {/* <img
                          src={d.picture}
                          className="w-14 h-14 rounded-md object-cover"
                          alt=""
                        /> */}
                        <div className="">
                          <p className="font-semibold text-xl">{d.name}</p>
                          <p className="text-[10px]">{d.email}</p>
                          <p className="text-xs">{d.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-center gap-3">

                        <Tag
                          className={
                            d.status === "active"
                              ? "bg-[#E4FFF6] border border-[#10B981] text-[#10B981] w-28 py-3 text-center rounded-full"
                              : "bg-[#FFF1F1] border border-[#FF4747] text-[#FF4747] text-center w-28 py-3 rounded-full"
                          }
                        >
                          {d.status.charAt(0).toUpperCase() + d.status.slice(1)}
                        </Tag>

                        <div className="px-4 py-2 rounded-full bg-[#EFEFEF] text-center">
                          <p className="text-xs text-[#6C6C6C]">Active Rides</p>
                          <p className="text-[#1F41BB] font-semibold text-sm">
                            {d.active_rides || "0"}
                          </p>
                        </div>

                        <div className="px-4 py-2 rounded-full bg-[#EFEFEF] text-center">
                          <p className="text-xs text-[#6C6C6C]">Completed Today</p>
                          <p className="text-[#00cc66] font-semibold text-sm">
                            {d.completed_rides || "0"}
                          </p>
                        </div>
                      </div>
                      <UserDropdown options={actionOptions} itemData={d}>
                        <Button className="w-10 h-10 bg-[#EFEFEF] rounded-full flex justify-center items-center">
                          <ThreeDotsIcon />
                        </Button>
                      </UserDropdown>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-10">
                    No dispatchers found
                  </p>
                )}
              </div>
              {Array.isArray(dispatcherListRaw) &&
                dispatcherListRaw.length > 0 ? (
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
      </div>
      <Modal
        isOpen={isDispatcherModalOpen.isOpen}
        className="p-4 sm:p-6 lg:p-10"
      >
        <AddDispatcherModal
          initialValue={isDispatcherModalOpen.type === "edit" ? isDispatcherModalOpen.data : {}}
          setIsOpen={setIsDispatcherModalOpen}
          onDispatcherCreated={handleonDispatcherCreated} />
      </Modal>
      <Modal
        isOpen={isLogModalOpen.isOpen}
        className="p-4 sm:p-6 lg:p-10"
      >
        <ViewLogModel
          dispatcher={isLogModalOpen.dispatcher}
          setIsOpen={setIsLogModalOpen}
        />
      </Modal>
      <Modal isOpen={deleteModalOpen} className="p-10">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-3">Delete Driver Document?</h2>
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete {dispatcherToDelete?.name}?
          </p>

          <div className="flex justify-center gap-4">
            <Button
              type="filledGray"
              onClick={() => {
                setDeleteModalOpen(false);
                setDispatcherToDelete(null);
              }}
              className="px-6 py-2 rounded-md"
            >
              Cancel
            </Button>

            <Button
              type="filledRed"
              onClick={handleDeleteDispatcher}
              disabled={isDeleting}
              className="px-6 py-2 rounded-md"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Dispatcher;