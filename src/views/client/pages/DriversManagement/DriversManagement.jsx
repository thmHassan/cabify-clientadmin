import React, { useState, useCallback, useEffect } from "react";
import PageTitle from "../../../../components/ui/PageTitle/PageTitle";
import PageSubTitle from "../../../../components/ui/PageSubTitle/PageSubTitle";
import Button from "../../../../components/ui/Button/Button";
import PlusIcon from "../../../../components/svg/PlusIcon";
import Modal from "../../../../components/shared/Modal/Modal";
import AddDriversManagementModal from "./components/AddDriversManagementModal";
import { lockBodyScroll } from "../../../../utils/functions/common.function";
import { useAppSelector } from "../../../../store";
import Pagination from "../../../../components/ui/Pagination/Pagination";
import { PAGE_SIZE_OPTIONS, STATUS_OPTIONS } from "../../../../constants/selectOptions";
import CardContainer from "../../../../components/shared/CardContainer";
import SearchBar from "../../../../components/shared/SearchBar/SearchBar";
import DriverManagementCard from "./components/DriversManagementCard";
import { apiDeleteDriverManagement, apiGetDriverManagement } from "../../../../services/DriverManagementService";
import { apiGetSubCompany } from "../../../../services/SubCompanyServices";
import { useNavigate } from "react-router-dom";
import AppLogoLoader from "../../../../components/shared/AppLogoLoader";
import CustomSelect from "../../../../components/ui/CustomSelect/CustomSelect";

const DriversManagement = () => {
  const navigate = useNavigate();
  const [isDriversManagementModalOpen, setIsDriversManagementModalOpen] = useState({
    type: "new",
    isOpen: false,
  });
  const [activeTab, setActiveTab] = useState("accepted");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [tableLoading, setTableLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [driversData, setDriversData] = useState([]);
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
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [driverToDelete, setDriverToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sub-company filter states
  const [subCompanyList, setSubCompanyList] = useState([]);
  const [loadingSubCompanies, setLoadingSubCompanies] = useState(false);
  const [selectedSubCompany, setSelectedSubCompany] = useState({
    label: "All Sub Companies",
    value: "all",
  });

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch sub-companies on mount
  useEffect(() => {
    const fetchSubCompanies = async () => {
      setLoadingSubCompanies(true);
      try {
        const response = await apiGetSubCompany({ page: 1, perPage: 100 });
        if (response?.data?.success === 1) {
          const companies = response?.data?.list?.data || [];
          const options = [
            { label: "All Sub Companies", value: "all" },
            ...companies.map((company) => ({
              label: company.name,
              value: company.id.toString(),
            })),
          ];
          setSubCompanyList(options);
        }
      } catch (error) {
        console.error("Error fetching sub-companies:", error);
      } finally {
        setLoadingSubCompanies(false);
      }
    };
    fetchSubCompanies();
  }, []);

  // Fetch drivers with all filters
  const fetchDrivers = useCallback(async () => {
    setTableLoading(true);
    try {
      const params = {
        page: currentPage,
        perPage: itemsPerPage,
        status: activeTab,
      };

      if (debouncedSearchQuery?.trim()) {
        params.search = debouncedSearchQuery.trim();
      }

      // Add sub-company filter
      if (selectedSubCompany?.value && selectedSubCompany.value !== "all") {
        params.sub_company = selectedSubCompany.value;
      }

      const response = await apiGetDriverManagement(params);

      if (response?.data?.success === 1) {
        const listData = response?.data?.list;
        setDriversData(listData?.data || []);
        setTotalItems(listData?.total || 0);
        setTotalPages(listData?.last_page || 1);
      }
    } catch (error) {
      console.error("Error fetching drivers:", error);
      setDriversData([]);
    } finally {
      setTableLoading(false);
      setIsInitialLoad(false);
    }
  }, [currentPage, itemsPerPage, debouncedSearchQuery, activeTab, selectedSubCompany]);

  useEffect(() => {
    fetchDrivers();
  }, [currentPage, itemsPerPage, debouncedSearchQuery, activeTab, selectedSubCompany, fetchDrivers, refreshTrigger]);

  const handleOnDriverCreated = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const handleSubCompanyChange = (selected) => {
    setSelectedSubCompany(selected);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleDeleteClick = (driver) => {
    setDriverToDelete(driver);
    setDeleteModalOpen(true);
  };

  const handleDeleteDriver = async () => {
    if (!driverToDelete?.id) return;

    setIsDeleting(true);
    try {
      const response = await apiDeleteDriverManagement(driverToDelete.id);

      if (response?.data?.success === 1 || response?.status === 200) {
        setDeleteModalOpen(false);
        setDriverToDelete(null);
        setRefreshTrigger((prev) => prev + 1);
      } else {
        console.error("Failed to delete driver");
      }
    } catch (error) {
      console.error("Error deleting driver:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDriverStatusChange = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="px-4 py-5 sm:p-6 lg:p-10 min-h-[calc(100vh-85px)]">
      <div className="flex justify-between sm:flex-row flex-col items-start sm:items-center gap-3 sm:gap-0 2xl:mb-6 1.5xl:mb-10 mb-0">
        <div className="sm:mb-[30px] mb-1 sm:w-[calc(100%-240px)] w-full flex gap-5 items-center">
          <div className="flex flex-col gap-2.5 w-[calc(100%-100px)]">
            <PageTitle title="Drivers Management" />
            <PageSubTitle title="Manage your driver network and monitor their performance" />
          </div>
        </div>
        <div className="sm:w-auto xs:w-auto w-full sm:mb-[50px] mb-8">
          <Button
            type="filled"
            btnSize="2xl"
            onClick={() => {
              lockBodyScroll();
              setIsDriversManagementModalOpen({ isOpen: true, type: "new" });
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
              <span>Add New Driver</span>
            </div>
          </Button>
        </div>
      </div>

      <div className="bg-[#006FFF1A] p-1 rounded-lg mb-6 inline-flex gap-1">
        <Button
          type="filled"
          btnSize="2xl"
          className={`${activeTab === "accepted" ? "!bg-[#1F41BB] !text-white" : "!bg-transparent !text-black"
            }`}
          onClick={() => setActiveTab("accepted")}
        >
          Accepted
        </Button>
        <Button
          type="filled"
          btnSize="2xl"
          className={`${activeTab === "pending" ? "!bg-[#1F41BB] !text-white" : "!bg-transparent !text-black"
            }`}
          onClick={() => setActiveTab("pending")}
        >
          Pending
        </Button>
        <Button
          type="filled"
          btnSize="2xl"
          className={`${activeTab === "rejected" ? "!bg-[#1F41BB] !text-white" : "!bg-transparent !text-black"
            }`}
          onClick={() => setActiveTab("rejected")}
        >
          Rejected
        </Button>
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
            <div className="hidden md:flex flex-row gap-3 sm:gap-5 w-full sm:w-auto">
              <CustomSelect
                variant={2}
                options={subCompanyList}
                value={selectedSubCompany}
                onChange={handleSubCompanyChange}
                placeholder="All Sub Companies"
                disabled={loadingSubCompanies}
              />
            </div>
          </div>

          <div className="flex flex-col gap-4 pt-4">
            {tableLoading ? (
              <div className="flex items-center justify-center py-10">
                <AppLogoLoader />
              </div>
            ) : driversData.length === 0 ? (
              <div className="text-center py-10 text-gray-500">No drivers found</div>
            ) : (
              <div className="flex flex-col gap-4 pt-4">
                {driversData.map((driver) => (
                  <DriverManagementCard
                    key={driver.id}
                    driver={driver}
                    onDelete={handleDeleteClick}
                    onEdit={(d) => navigate(`/driver-management/${d.id}`)}
                    onStatusChange={handleDriverStatusChange}
                  />
                ))}
              </div>
            )}
          </div>

          {Array.isArray(driversData) && driversData.length > 0 ? (
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

      <Modal isOpen={isDriversManagementModalOpen.isOpen} className="p-4 sm:p-6 lg:p-10">
        <AddDriversManagementModal
          initialValue={
            isDriversManagementModalOpen.type === "edit"
              ? isDriversManagementModalOpen.data
              : {}
          }
          setIsOpen={setIsDriversManagementModalOpen}
          onDriverCreated={handleOnDriverCreated}
        />
      </Modal>

      <Modal isOpen={deleteModalOpen} className="p-10">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-3">Delete Driver?</h2>
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete {driverToDelete?.name}?
          </p>

          <div className="flex justify-center gap-4">
            <Button
              type="filledGray"
              onClick={() => {
                setDeleteModalOpen(false);
                setDriverToDelete(null);
              }}
              className="px-6 py-2 rounded-md"
            >
              Cancel
            </Button>

            <Button
              type="filledRed"
              onClick={handleDeleteDriver}
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

export default DriversManagement;