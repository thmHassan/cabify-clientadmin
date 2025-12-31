import React, { useState, useCallback, useEffect } from 'react'
import PageTitle from '../../../../components/ui/PageTitle/PageTitle';
import PageSubTitle from '../../../../components/ui/PageSubTitle/PageSubTitle';
import Button from '../../../../components/ui/Button/Button';
import PlusIcon from '../../../../components/svg/PlusIcon';
import CardContainer from '../../../../components/shared/CardContainer';
import SearchBar from '../../../../components/shared/SearchBar/SearchBar';
import { PAGE_SIZE_OPTIONS, STATUS_OPTIONS } from '../../../../constants/selectOptions';
import Pagination from '../../../../components/ui/Pagination/Pagination';
import { useAppSelector } from '../../../../store';
import { lockBodyScroll } from '../../../../utils/functions/common.function';
import Modal from '../../../../components/shared/Modal/Modal';
import AddSubCompanyModel from './components/AddSubCompanyModel/AddSubCompanyModel';
import SubCompantCard from './components/SubCompanyCard';
import { apiGetSubCompany, apiDeleteSubCompany } from '../../../../services/SubCompanyServices';
import toast from 'react-hot-toast';
import AppLogoLoader from '../../../../components/shared/AppLogoLoader';

const SubCompany = () => {
  const [isSubCompanyModelOpen, setIsSubCompanyModelOpen] = useState({
    type: "new",
    isOpen: false,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [tableLoading, setTableLoading] = useState(false);
  const [subCompanyData, setSubCompanyData] = useState([]);
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
  const [subCompanyToDelete, setSubCompanyToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchSubCompanies = useCallback(async () => {
    setTableLoading(true);
    try {
      const params = {
        page: currentPage,
        perPage: itemsPerPage,
      };
      if (debouncedSearchQuery?.trim()) {
        params.search = debouncedSearchQuery.trim();
      }

      const response = await apiGetSubCompany(params);
      console.log("Sub-companies response:", response);

      if (response?.data?.success === 1) {
        const listData = response?.data?.list;
        setSubCompanyData(listData?.data || []);
        setTotalItems(listData?.total || 0);
        setTotalPages(listData?.last_page || 1);
      }
    } catch (error) {
      console.error("Error fetching sub-companies:", error);
      setSubCompanyData([]);
    } finally {
      setTableLoading(false);
    }
  }, [currentPage, itemsPerPage, debouncedSearchQuery]);

  useEffect(() => {
    fetchSubCompanies();
  }, [currentPage, itemsPerPage, debouncedSearchQuery, fetchSubCompanies, refreshTrigger]);

  const handleOnSubCompanyCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleDeleteClick = (company) => {
    setSubCompanyToDelete(company);
    setDeleteModalOpen(true);
  };

  const handleDeleteSubCompany = async () => {
    if (!subCompanyToDelete?.id) return;

    setIsDeleting(true);
    try {
      const response = await apiDeleteSubCompany(subCompanyToDelete.id);
      console.log("Delete sub-company response:", response);

      if (response?.data?.success === 1 || response?.status === 200) {
        toast.success(`${subCompanyToDelete.name} deleted successfully!`);
        setDeleteModalOpen(false);
        setSubCompanyToDelete(null);
        setRefreshTrigger(prev => prev + 1);
      } else {
        const msg = "Failed to delete sub-company";
        console.error(msg);
        toast.error(msg);
      }
    } catch (error) {
      console.error("Error deleting sub-company:", error);
      toast.error("Error deleting sub-company");
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const handleEdit = (account) => {
    setIsSubCompanyModelOpen({
      type: "edit",
      isOpen: true,
      accountData: account,
    });
  };
  if (tableLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <AppLogoLoader />
      </div>
    );
  }
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
                value={searchQuery}
                onSearchChange={setSearchQuery}
                className="w-full md:max-w-[400px] max-w-full"
              />
            </div>
          </div>

          <div className="flex flex-col gap-4 pt-4">
            {subCompanyData?.map((company) => (
              <SubCompantCard
                key={company.id}
                company={company}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
          {Array.isArray(subCompanyData) &&
            subCompanyData.length > 0 ? (
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
        <AddSubCompanyModel
          initialValue={isSubCompanyModelOpen.type === "edit" ? isSubCompanyModelOpen.accountData : {}}
          setIsOpen={setIsSubCompanyModelOpen}
          onSubCompanyCreated={handleOnSubCompanyCreated}
        />
      </Modal>
      <Modal isOpen={deleteModalOpen} className="p-10">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-3">Delete Sub Company?</h2>
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete {subCompanyToDelete?.name}?
          </p>

          <div className="flex justify-center gap-4">
            <Button
              type="filledGray"
              onClick={() => {
                setDeleteModalOpen(false);
                setSubCompanyToDelete(null);
              }}
              className="px-6 py-2 rounded-md"
            >
              Cancel
            </Button>

            <Button
              type="filledRed"
              onClick={handleDeleteSubCompany}
              disabled={isDeleting}
              className="px-6 py-2 rounded-md"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )

}
export default SubCompany