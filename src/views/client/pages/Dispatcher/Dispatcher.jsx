import React, { useState } from "react";
import PageTitle from "../../../../components/ui/PageTitle/PageTitle";
import PageSubTitle from "../../../../components/ui/PageSubTitle/PageSubTitle";
import Button from "../../../../components/ui/Button/Button";
import AddDispatcherIcon from "../../../../components/svg/AddDispatcherIcon";
import DownloadIcon from "../../../../components/svg/DownloadIcon";
import Modal from "../../../../components/shared/Modal/Modal";
import { lockBodyScroll } from "../../../../utils/functions/common.function";
import AddDispatcherModal from "./components/AddDispatcherModal";

const Dispatcher = () => {
  const [isDispatcherModalOpen, setIsDispatcherModalOpen] = useState({
    type: "new",
    isOpen: false,
  });
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
          <Button
            type="bgOutlined"
            btnSize="2xl"
            // onClick={() => {
            //   lockBodyScroll();
            //   setIsManualRequestModal({ isOpen: true, type: "new" });
            // }}
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
          </Button>
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
      <Modal
        isOpen={isDispatcherModalOpen.isOpen}
        className="p-4 sm:p-6 lg:p-10"
      >
        <AddDispatcherModal setIsOpen={setIsDispatcherModalOpen} />
      </Modal>
    </div>
  );
};

export default Dispatcher;
