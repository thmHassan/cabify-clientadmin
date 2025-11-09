import React from "react";
import { lockBodyScroll } from "../../../../utils/functions/common.function";
import PageTitle from "../../../../components/ui/PageTitle/PageTitle";
import PageSubTitle from "../../../../components/ui/PageSubTitle/PageSubTitle";
import PlusIcon from "../../../../components/svg/PlusIcon";
import Button from "../../../../components/ui/Button/Button";

const Plots = () => {
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
              // setIsOpenLocationModal(true);
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
    </div>
  );
};

export default Plots;
