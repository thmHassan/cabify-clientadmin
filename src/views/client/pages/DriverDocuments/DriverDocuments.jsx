import React, { useState, useEffect, useCallback } from "react";
import PageTitle from "../../../../components/ui/PageTitle/PageTitle";
import PageSubTitle from "../../../../components/ui/PageSubTitle/PageSubTitle";
import Button from "../../../../components/ui/Button/Button";
import PlusIcon from "../../../../components/svg/PlusIcon";
import { useAppSelector } from "../../../../store";
import Modal from "../../../../components/shared/Modal/Modal";
import AddDriverDocumentModel from "./components/AddDriverDocumentModel";
import Pagination from "../../../../components/ui/Pagination/Pagination";
import { PAGE_SIZE_OPTIONS, STATUS_OPTIONS } from "../../../../constants/selectOptions";
import CardContainer from "../../../../components/shared/CardContainer";
import SearchBar from "../../../../components/shared/SearchBar/SearchBar";
import Loading from "../../../../components/shared/Loading/Loading";
import DriverDocumentCard from "./components/DriverDocumentCard";
import { lockBodyScroll } from "../../../../utils/functions/common.function";
import { apiDeleteDriverDocument, apiGetDocumentTypes } from "../../../../services/DriversDocumentServices";
import { set } from "lodash";

const DriverDocuments = () => {
  const [isDriverDocumentModelOpen, setIsDriverDocumentModelOpen] = useState({
    type: "new",
    isOpen: false,
  });
  const [_searchQuery, setSearchQuery] = useState("");
  const [tableLoading, setTableLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
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
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [driverDocumentToDelete, setDriverDocumentToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(_searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [_searchQuery]);

  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {
        page: currentPage,
        perPage: itemsPerPage,
      };

      if (debouncedSearchQuery?.trim()) {
        params.search = debouncedSearchQuery.trim();
      }

      const result = await apiGetDocumentTypes(params);

      if (result?.status === 200 && result?.data) {
        const rawList = result.data.list?.data || [];

        const mappedList = rawList.map((item) => ({
          id: item.id,
          name: item.document_name,
          frontPhoto: item.front_photo === "yes",
          backPhoto: item.back_photo === "yes",
          profilePhoto: item.profile_photo === "yes",
          issueDate: item.has_issue_date === "yes",
          expiryDate: item.has_expiry_date === "yes",
          numberField: item.has_number_field === "yes",
          uploadedDocument: item.uploaded_document,
        }));

        setDocuments(mappedList);
        setTotalItems(result.data.list.total || 0);
        setTotalPages(result.data.list.last_page || 1);
      } else {
        setDocuments([]);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
      setDocuments([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, debouncedSearchQuery]);

  useEffect(() => {
    fetchDocuments();
  }, [currentPage, itemsPerPage, debouncedSearchQuery, fetchDocuments, refreshTrigger]);

  const handleDeleteClick = (company) => {
    setDriverDocumentToDelete(company);
    setDeleteModalOpen(true);
  };

  const handleDeleteDriverDocument = async () => {
    if (!driverDocumentToDelete?.id) return;

    setIsDeleting(true);
    try {
      const response = await apiDeleteDriverDocument(driverDocumentToDelete.id);

      if (response?.data?.success === 1 || response?.status === 200) {
        setDeleteModalOpen(false);
        setDriverDocumentToDelete(null);
        setRefreshTrigger(prev => prev + 1);
      } else {
        console.error("Failed to delete driver document");
      }
    } catch (error) {
      console.error("Error deleting driver document:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDriveDocumetCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleEdit = (doc) => {
    // Convert mapped data back to API format
    const apiFormatData = {
      id: doc.id,
      document_name: doc.name,
      front_photo: doc.frontPhoto ? 'yes' : 'no',
      back_photo: doc.backPhoto ? 'yes' : 'no',
      profile_photo: doc.profilePhoto ? 'yes' : 'no',
      has_issue_date: doc.issueDate ? 'yes' : 'no',
      has_expiry_date: doc.expiryDate ? 'yes' : 'no',
      has_number_field: doc.numberField ? 'yes' : 'no',
    };

    setIsDriverDocumentModelOpen({
      type: "edit",
      isOpen: true,
      documentData: apiFormatData,
    });
    lockBodyScroll();
  };

  return (
    <div className="px-4 py-5 sm:p-6 lg:p-10 min-h-[calc(100vh-85px)]">
      <div className="flex justify-between sm:flex-row flex-col items-start sm:items-center gap-3 sm:gap-0 2xl:mb-6 1.5xl:mb-10 mb-0">
        <div className="sm:mb-[30px] mb-1 sm:w-[calc(100%-240px)] w-full flex gap-5 items-center">
          <div className="flex flex-col gap-2.5 w-[calc(100%-100px)]">
            <PageTitle title="Driver’s Documents" />
            <PageSubTitle title="Manage driver documents across all panels" />
          </div>
        </div>
        <div className="sm:w-auto xs:w-auto w-full sm:mb-[50px] mb-8">
          <Button
            type="filled"
            btnSize="2xl"
            onClick={() => {
              lockBodyScroll();
              setIsDriverDocumentModelOpen({ isOpen: true, type: "new" });
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
              <span>Add Document</span>
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
                onSearchChange={setSearchQuery}
                className="w-full md:max-w-[400px] max-w-full"
              />
            </div>
          </div>
          <Loading loading={isLoading} type="cover">
            <div className="flex flex-col gap-4 pt-4">
              {documents && documents.length > 0 ? (
                documents.map((doc) => (
                  <DriverDocumentCard
                    key={doc.id || doc.name}
                    doc={doc}
                    onDelete={handleDeleteClick}
                    onEdit={handleEdit}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No documents found
                </div>
              )}
            </div>
          </Loading>
          {Array.isArray(documents) &&
            documents.length > 0 ? (
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
        isOpen={isDriverDocumentModelOpen.isOpen}
        className="p-4 sm:p-6 lg:p-10"
      >
        <AddDriverDocumentModel
          initialValue={isDriverDocumentModelOpen.type === "edit" ? isDriverDocumentModelOpen.documentData : {}}
          setIsOpen={setIsDriverDocumentModelOpen}
          onDocumentCreated={handleDriveDocumetCreated}
        />
      </Modal>
      <Modal isOpen={deleteModalOpen} className="p-6 sm:p-8 w-full max-w-md">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-3">Delete Driver Document?</h2>
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete {driverDocumentToDelete?.name}?
          </p>

          <div className="flex justify-center gap-4">
            <Button
              type="filledGray"
              onClick={() => {
                setDeleteModalOpen(false);
                setDriverDocumentToDelete(null);
              }}
              className="px-6 py-2"
            >
              Cancel
            </Button>

            <Button
              type="filledRed"
              onClick={handleDeleteDriverDocument}
              disabled={isDeleting}
              className="px-6 py-2"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DriverDocuments;