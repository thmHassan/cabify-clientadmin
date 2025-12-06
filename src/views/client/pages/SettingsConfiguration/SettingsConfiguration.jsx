import React, { useState } from 'react'
import PageTitle from '../../../../components/ui/PageTitle/PageTitle';
import PageSubTitle from '../../../../components/ui/PageSubTitle/PageSubTitle';
import CardContainer from '../../../../components/shared/CardContainer';
import Loading from '../../../../components/shared/Loading/Loading';

const SettingsConfiguration = () => {
  const [tableLoading, setTableLoading] = useState(false);
  return (
    <div className="px-4 py-5 sm:p-6 lg:p-10 min-h-[calc(100vh-85px)]">
      <div className="flex flex-col gap-2.5 sm:mb-[30px] mb-6">
        <div className="flex justify-between">
          <PageTitle title="Settings & Configuration" />
        </div>
        <div>
          <PageSubTitle title="Manage your company profile, system preferences, and integrations" />
        </div>
      </div>
      <div>
        <CardContainer className="p-3 sm:p-4 lg:p-5 bg-[#F5F5F5]">
          <Loading loading={tableLoading} type="cover">
            <div className="flex gap-4 pt-4 #02295c1a">
              <div className="bg-[#006FFF1A] text-black font-semibold p-3 border border-[#02295c1a] rounded-lg">
                <p>Company Profile</p>
                <p>Security</p>
                <p>Billing</p>
                <p>Integrations</p>
                <p>Mobile App</p>
                <p>Commission</p>
              </div>
            </div>
          </Loading>
        </CardContainer>
      </div>
    </div>
  );
}

export default SettingsConfiguration