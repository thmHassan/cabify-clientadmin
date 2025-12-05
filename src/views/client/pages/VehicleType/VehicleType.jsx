import React, { useState } from "react";
import PageTitle from "../../../../components/ui/PageTitle/PageTitle";
import PageSubTitle from "../../../../components/ui/PageSubTitle/PageSubTitle";
import Button from "../../../../components/ui/Button/Button";
import PlusIcon from "../../../../components/svg/PlusIcon";
import CardContainer from "../../../../components/shared/CardContainer";
import SearchBar from "../../../../components/shared/SearchBar/SearchBar";
import CustomSelect from "../../../../components/ui/CustomSelect";
import { PAGE_SIZE_OPTIONS, STATUS_OPTIONS } from "../../../../constants/selectOptions";
import Loading from "../../../../components/shared/Loading/Loading";
import Pagination from "../../../../components/ui/Pagination/Pagination";
import { useAppSelector } from "../../../../store";
import VehicleTypeCard from "./components/VehicleTypeCard";
import AddVehicleType from "./components/AddVehicleType";

const VehicleType = () => {
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

  const staticVehicle = [
    {
      id: 1,
      name: "Camry(sedan)",
      picture: "https://randomuser.me/api/portraits/men/44.jpg",
      seats: "5 seater",
      cubic: "15.1 cubic feet",
    },
    {
      id: 2,
      name: "Highlander(SUV)",
      picture: "https://randomuser.me/api/portraits/women/65.jpg",
      seats: "7 seater",
      cubic: "20.5 cubic feet",
    },
    {
      id: 3,
      name: "Olivia Rhye",
      picture: "https://randomuser.me/api/portraits/men/67.jpg",
      seats: "4 seater",
      cubic: "12.3 cubic feet",
    },
    {
      id: 4,
      name: "Cody Fisher",
      picture: "https://randomuser.me/api/portraits/men/22.jpg",
      seats: "6 seater",
      cubic: "18.4 cubic feet",
    },
    {
      id: 5,
      name: "Esther Howard",
      picture: "https://randomuser.me/api/portraits/women/33.jpg",
      seats: "5 seater",
      cubic: "14.7 cubic feet",
    },
    {
      id: 6,
      name: "Robert Fox",
      picture: "https://randomuser.me/api/portraits/men/55.jpg",
      seats: "8 seater",
      cubic: "22.0 cubic feet",
    },
  ];

  const actionOptions = [
    {
      label: "View",
      onClick: (dispatcher) => alert(`Viewing ${dispatcher.name}`),
    },
    {
      label: "Edit",
      onClick: (dispatcher) => {
        setIsDispatcherModalOpen({ type: "edit", isOpen: true, data: dispatcher });
        lockBodyScroll();
      },
    },
    {
      label: "Delete",
      onClick: (dispatcher) => alert(`Deleting ${dispatcher.name}`),
    },
  ];
  return (
    <div className="px-4 py-5 sm:p-6 lg:p-10 min-h-[calc(100vh-85px)]">
      <div className="flex justify-between sm:flex-row flex-col items-start sm:items-center gap-3 sm:gap-0 2xl:mb-6 1.5xl:mb-10 mb-0">
        <div className="sm:mb-[30px] mb-1 sm:w-[calc(100%-240px)] w-full flex gap-5 items-center">
          <div className="flex flex-col gap-2.5 w-[calc(100%-100px)]">
            <PageTitle title="Vehicle Types" />
            <PageSubTitle title="Manage vehicle related documents across all panels" />
          </div>
        </div>
        <div className="sm:w-auto xs:w-auto w-full sm:mb-[50px] mb-8">
          {/* <Button
            type="filled"
            btnSize="2xl"
            onClick={() => {
             <AddVehicleType setIsOpen={setIsAddVehicleOpen} isOpen={isAddVehicleOpen} />;
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
              <span>Add Vehicle Type</span>
            </div>
          </Button> */}
          <Button
            type="filled"
            btnSize="2xl"
            onClick={() => setIsAddVehicleOpen(true)}
            className="w-full sm:w-auto -mb-2 sm:-mb-3 lg:-mb-3 !py-3.5 sm:!py-3 lg:!py-3"
          >
            <div className="flex gap-2 sm:gap-[15px] items-center justify-center whitespace-nowrap">
              <PlusIcon />
              <span>Add Vehicle Type</span>
            </div>
          </Button>

          {isAddVehicleOpen && (
            <AddVehicleType
              isOpen={isAddVehicleOpen}
              setIsOpen={setIsAddVehicleOpen}
            />
          )}
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
              {staticVehicle.map((vehicle) => (
                <VehicleTypeCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          </Loading>
          {Array.isArray(staticVehicle) &&
            staticVehicle.length > 0 ? (
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

export default VehicleType;
