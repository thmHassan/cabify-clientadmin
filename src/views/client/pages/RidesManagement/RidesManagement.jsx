import React, { useCallback, useEffect, useState } from 'react'
import PageTitle from '../../../../components/ui/PageTitle/PageTitle';
import PageSubTitle from '../../../../components/ui/PageSubTitle/PageSubTitle';
import { PAGE_SIZE_OPTIONS } from '../../../../constants/selectOptions';
import Button from '../../../../components/ui/Button/Button';
import CardContainer from '../../../../components/shared/CardContainer';
import SearchBar from '../../../../components/shared/SearchBar/SearchBar';
import Pagination from '../../../../components/ui/Pagination/Pagination';
import RidesManagementCard from './components/RidesManagementCard';
import { apiDeleteRide, apiGetRideById, apiGetRidesManagement } from '../../../../services/RidesManagementServices';
import ViewBookingModel from './components/ViewBookingModel';
import { lockBodyScroll, unlockBodyScroll } from '../../../../utils/functions/common.function';
import Modal from '../../../../components/shared/Modal/Modal';
import AppLogoLoader from '../../../../components/shared/AppLogoLoader';
import toast from 'react-hot-toast';
import useDistanceUnit from '../../../../utils/hooks/useDistanceUnit';

const RidesManagement = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [_searchQuery, setSearchQuery] = useState("");
  const [tableLoading, setTableLoading] = useState(false);
  const [_isInitialLoad, setIsInitialLoad] = useState(true);
  const [_selectedDate, setSelectedDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [_totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [rideManagementData, setRideManagementData] = useState([]);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedRide, setSelectedRide] = useState(null);
  const [_isLoading, setIsLoading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [rideToDelete, setRideToDelete] = useState(null);
  const distanceUnit = useDistanceUnit();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(_searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [_searchQuery]);

  const fetchRidesManagement = useCallback(async () => {
    setTableLoading(true);
    try {
      const params = {
        page: currentPage,
        perPage: itemsPerPage,
      };

      if (activeTab !== "all" && activeTab !== "ongoing") {
        params.status = activeTab;
      }

      if (debouncedSearchQuery?.trim()) params.search = debouncedSearchQuery.trim();
      if (_selectedDate) params.date = _selectedDate;

      const response = await apiGetRidesManagement(params);

      if (response?.data?.success === 1) {
        const listData = response?.data?.rides;
        setRideManagementData(listData?.data || []);
        setTotalItems(listData?.total || 0);
        setTotalPages(listData?.last_page || 1);
      }
    } catch (error) {
      console.error("Error fetching rides:", error);
      setRideManagementData([]);
    } finally {
      setTableLoading(false);
      setIsInitialLoad(false);
    }
  }, [currentPage, itemsPerPage, debouncedSearchQuery, _selectedDate, activeTab]);

  useEffect(() => {
    fetchRidesManagement();
  }, [currentPage, itemsPerPage, debouncedSearchQuery, _selectedDate, activeTab, fetchRidesManagement]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const filteredRides = activeTab === "all"
    ? rideManagementData
    : rideManagementData.filter((item) => {
      const bookingStatus = item.booking_status?.toLowerCase();
      if (activeTab.toLowerCase() === "ongoing") {
        return bookingStatus === "ongoing" || bookingStatus === "completed";
      }
      return bookingStatus === activeTab.toLowerCase();
    });

  const handleViewRide = async (ride) => {
    setIsLoading(true);
    lockBodyScroll();
    setIsViewOpen(true);

    try {
      const response = await apiGetRideById(ride.id);
      if (response?.data?.detail) {
        setSelectedRide(response.data.detail);
      } else {
        setSelectedRide(ride);
      }
    } catch (error) {
      console.error('Error fetching ride details:', error);
      setSelectedRide(ride);
    } finally {
      setIsLoading(false);
    }
  };

  const openDeleteModal = (ride) => {
    setRideToDelete(ride);
    setDeleteModalOpen(true);
    lockBodyScroll();
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setRideToDelete(null);
    unlockBodyScroll();
  };

  const handleDeleteRide = async () => {
    if (!rideToDelete) return;
    setIsDeleting(true);
    try {
      const response = await apiDeleteRide(rideToDelete.id);
      if (response?.data?.success === 1) {
        setDeleteModalOpen(false);
        setRideToDelete(null);
        unlockBodyScroll();
        toast.success("Ride deleted successfully");
        fetchRidesManagement();
      } else {
        toast.error(response?.data?.message || "Failed to delete ride");
        closeDeleteModal();
      }
    } catch (error) {
      console.error("Error deleting ride:", error);
      toast.error("An error occurred while deleting the ride");
      closeDeleteModal();
    } finally {
      setIsDeleting(false);
    }
  };

  const closeViewModal = () => {
    unlockBodyScroll();
    setIsViewOpen(false);
    setSelectedRide(null);
  };

  return (
    <div className="px-4 py-5 sm:p-6 lg:p-8 min-h-[calc(100vh-85px)] bg-[#F9FAFB]">
      <div className="flex flex-col gap-2 mb-6 sm:mb-8">
        <PageTitle title="Rides Management" />
        <PageSubTitle title="Monitor live rides and view ride history across your platform" />
      </div>

      <div className="overflow-x-auto pb-2 scrollbar-hide">
        <div className="bg-[#006FFF1A] p-1 rounded-xl mb-6 inline-flex gap-1 min-w-max">
          {["all", "pending", "ongoing", "cancelled"].map((tab) => (
            <Button
              key={tab}
              type="filled"
              btnSize="lg"
              className={`!px-6 !py-2.5 !rounded-lg transition-all duration-200 ${activeTab === tab
                ? "!bg-[#1F41BB] !text-white shadow-md"
                : "!bg-transparent !text-[#4B5563] hover:!bg-[#1F41BB1A]"
                }`}
              onClick={() => handleTabChange(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      <CardContainer className="!p-0 overflow-hidden bg-transparent shadow-none border-none">
        <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-[#E5E7EB] mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
            <div className="flex-1 max-w-xl">
              <SearchBar
                value={_searchQuery}
                onSearchChange={setSearchQuery}
                placeholder="Search by ID, Customer, or Driver..."
                className="w-full !bg-[#F3F4F6] !border-none !rounded-xl"
              />
            </div>
            <div className="flex flex-row gap-3">
              <div className="relative flex-1 md:flex-none">
                <input
                  type="date"
                  className="w-full md:w-auto bg-[#F3F4F6] border-none rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-[#1F41BB] outline-none transition-all"
                  value={_selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {tableLoading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-[#E5E7EB]">
              <AppLogoLoader />
              <p className="mt-4 text-[#6B7280] font-medium">Fetching your rides...</p>
            </div>
          ) : filteredRides.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-[#E5E7EB] text-center px-4">
              <div className="w-16 h-16 bg-[#F3F4F6] rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-[#9CA3AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[#111827]">No rides found</h3>
              <p className="text-[#6B7280] max-w-xs mt-1">We couldn't find any rides matching your current filters or search criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredRides.map((ride) => (
                <RidesManagementCard
                  key={ride.id}
                  ride={ride}
                  distanceUnit={distanceUnit}
                  onView={handleViewRide}
                  onDelete={openDeleteModal}
                />
              ))}
            </div>
          )}
        </div>

        {filteredRides.length > 0 && (
          <div className="mt-8 bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-sm">
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

      <Modal isOpen={isViewOpen} className="!p-0 !bg-transparent shadow-none max-w-4xl w-full mx-auto">
        <div className="bg-white rounded-3xl overflow-hidden shadow-2xl">
          <ViewBookingModel
            initialValue={selectedRide}
            setIsOpen={closeViewModal}
          />
        </div>
      </Modal>

      <Modal isOpen={deleteModalOpen} className="p-10">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-3">Delete Ride?</h2>
          <p className="text-gray-600 mb-6">Are you sure you want to delete this ride?</p>
          <div className="flex justify-center gap-4">
            <Button type="filledGray" onClick={closeDeleteModal} className="px-6 py-2 rounded-md">Cancel</Button>
            <Button
              type="filledRed"
              onClick={handleDeleteRide}
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
}

export default RidesManagement;