import React, { useState } from "react";
import { lockBodyScroll } from "../../../../utils/functions/common.function";
import PageTitle from "../../../../components/ui/PageTitle/PageTitle";
import PageSubTitle from "../../../../components/ui/PageSubTitle/PageSubTitle";
import PlusIcon from "../../../../components/svg/PlusIcon";
import Button from "../../../../components/ui/Button/Button";
import Modal from "../../../../components/shared/Modal/Modal";
import { useAppSelector } from "../../../../store";
import CardContainer from "../../../../components/shared/CardContainer";
import SearchBar from "../../../../components/shared/SearchBar/SearchBar";
import Loading from "../../../../components/shared/Loading/Loading";
import { PAGE_SIZE_OPTIONS, STATUS_OPTIONS } from "../../../../constants/selectOptions";
import Pagination from "../../../../components/ui/Pagination/Pagination";
import PlotsCard from "./components/PlotsCard/PlotsCard";
import AddPlotsModel from "./components/AddPlotsModel";

const Plots = () => {
  const [isPlotsModelOpen, setIsPlotsModelOpen] = useState({
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

  const staticPlots = [
    {
      name: "Abbottabad",
    },
    {
      name: "Rawalpindi",
    },
    {
      name: "Lahore",
    },
    {
      name: "Peshawar",
    },
    {
      name: "Karachi",
    },
  ];
  return (
    <div className="px-4 py-5 sm:p-6 lg:p-7 2xl:p-10 min-h-[calc(100vh-64px)] sm:min-h-[calc(100vh-85px)]">
      <div className="flex justify-between sm:flex-row flex-col items-start sm:items-center gap-3 sm:gap-0">
        <div className="flex flex-col gap-2.5 sm:mb-[30px] mb-1 sm:w-[calc(100%-240px)] w-full">
          <PageTitle title="Plots" />
          <PageSubTitle title="These plots will be pushed to all customer panels for their help or they can choose their own plots by creating in their own panels" />
        </div>
        <div className="sm:w-auto xs:w-auto w-full sm:mb-[50px] mb-8">
          <Button
            type="filled"
            btnSize="2xl"
            onClick={() => {
              lockBodyScroll();
              setIsPlotsModelOpen({ isOpen: true, type: "new" });

            }}
            className="w-auto -mb-2 sm:-mb-3 lg:-mb-3 !py-3.5 sm:!py-3 lg:!py-3"
          >
            <div className="flex gap-2 sm:gap-[15px] items-center whitespace-nowrap">
              <span className="hidden sm:inline-block">
                <PlusIcon />
              </span>
              <span className="sm:hidden">
                <PlusIcon height={16} width={16} />
              </span>
              <span>Add New Plots</span>
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-4">
              <div className="flex flex-col gap-4">
                {staticPlots.map((plot) => (
                  <PlotsCard
                    key={plot.name}
                    plot={plot}
                    onEdit={(plotToEdit) => {
                      lockBodyScroll();
                      setIsPlotsModelOpen({
                        isOpen: true,
                        type: "edit",
                        data: plotToEdit, // pass document to modal
                      });
                    }}
                  />
                ))}
              </div>
              <div className="relative w-full h-[450px] rounded-xl overflow-hidden border border-gray-200">
                <iframe
                  title="map"
                  src="https://maps.google.com/maps?q=london&t=&z=11&ie=UTF8&iwloc=&output=embed"
                  className="w-full h-full"
                ></iframe>
              </div>
            </div>
          </Loading>
          {Array.isArray(staticPlots) &&
            staticPlots.length > 0 ? (
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
        isOpen={isPlotsModelOpen.isOpen}
        className="p-4 sm:p-6 lg:p-10"
      >
        <AddPlotsModel setIsOpen={setIsPlotsModelOpen} />
      </Modal>
    </div>
  );
};

export default Plots;
