import React from 'react'
import PageTitle from '../../../../components/ui/PageTitle/PageTitle';
import PageSubTitle from '../../../../components/ui/PageSubTitle/PageSubTitle';

const Map = () => {
  return (
    <div className="px-4 py-5 sm:p-6 lg:p-10 min-h-[calc(100vh-85px)]">
      <div className="flex flex-col gap-2.5 sm:mb-[30px] mb-6">
        <div className="flex justify-between">
          <PageTitle title="Map" />
        </div>
        <div>
          <PageSubTitle title="Driver Location & Aerial View " />
        </div>
      </div>
    </div>
  );
}

export default Map