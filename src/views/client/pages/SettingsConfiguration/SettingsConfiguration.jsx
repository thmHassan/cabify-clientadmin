// import React, { useState } from 'react'
// import PageTitle from '../../../../components/ui/PageTitle/PageTitle';
// import PageSubTitle from '../../../../components/ui/PageSubTitle/PageSubTitle';
// import CardContainer from '../../../../components/shared/CardContainer';
// import Loading from '../../../../components/shared/Loading/Loading';

// const SettingsConfiguration = () => {
//   const [tableLoading, setTableLoading] = useState(false);
//   return (
//     <div className="px-4 py-5 sm:p-6 lg:p-10 min-h-[calc(100vh-85px)]">
//       <div className="flex flex-col gap-2.5 sm:mb-[30px] mb-6">
//         <div className="flex justify-between">
//           <PageTitle title="Settings & Configuration" />
//         </div>
//         <div>
//           <PageSubTitle title="Manage your company profile, system preferences, and integrations" />
//         </div>
//       </div>
//       <div>
//         <CardContainer className="p-3 sm:p-4 lg:p-5 bg-[#F5F5F5]">
//           <Loading loading={tableLoading} type="cover">
//             <div className="flex gap-4 pt-4 a">
//               <div className="text-black font-semibold p-3 border border-[#02295c1a] rounded-lg">
//                 <p>Company Profile</p>
//                 <p>Security</p>
//                 <p>Billing</p>
//                 <p>Integrations</p>
//                 <p>Mobile App</p>
//                 <p>Commission</p>
//               </div>
//               <div></div>
//             </div>
//           </Loading>
//         </CardContainer>
//       </div>
//     </div>
//   );
// }

// export default SettingsConfiguration



import React, { useState } from 'react';
import PageTitle from '../../../../components/ui/PageTitle/PageTitle';
import PageSubTitle from '../../../../components/ui/PageSubTitle/PageSubTitle';
import CardContainer from '../../../../components/shared/CardContainer';
import Loading from '../../../../components/shared/Loading/Loading';

// Import different setting pages
import CompanyProfile from './components/CompanyProfile/CompanyProfile';
import Security from './components/Security/Security';
import Billing from './components/Billing/Billing';
import Integrations from './components/Integrations/Integrations';
import MobileApp from './components/MobileApp/MobileApp';
import Commission from './components/Commission/Commission';

const SettingsConfiguration = () => {
  const [tableLoading] = useState(false);
  const [activeMenu, setActiveMenu] = useState("Company Profile");

  const renderPage = () => {
    switch (activeMenu) {
      case "Company Profile": return <CompanyProfile />;
      case "Security": return <Security />;
      case "Billing": return <Billing />;
      case "Integrations": return <Integrations />;
      case "Mobile App": return <MobileApp />;
      case "Commission": return <Commission />;
      default: return null;
    }
  };

  const menuItems = [
    "Company Profile",
    "Security",
    "Billing",
    "Integrations",
    "Mobile App",
    "Commission",
  ];

  return (
    <div className="px-4 py-5 sm:p-6 lg:p-10 min-h-[calc(100vh-85px)]">

      {/* Header */}
      <div className="flex flex-col gap-2.5 sm:mb-[30px] mb-6">
        <div className="flex justify-between">
          <PageTitle title="Settings & Configuration" />
        </div>
        <PageSubTitle title="Manage your company profile, system preferences, and integrations" />
      </div>

      {/* Body */}
      <CardContainer className="p-3 sm:p-4 lg:p-5 bg-[#F5F5F5]">
        <Loading loading={tableLoading} type="cover">
          <div className='flex flex-row gap-4 '>

            <div className="flex gap-4 pt-4">

              {/* Left Sidebar Menu */}
              <div className="bg-[#006FFF1A] w-56 text-black font-semibold p-3 border border-[#02295c1a] rounded-lg h-fit">
                {menuItems.map((item) => (
                  <p
                    key={item}
                    onClick={() => setActiveMenu(item)}
                    className={`cursor-pointer p-2 rounded-lg transition-all 
                    ${activeMenu === item ? "bg-blue-500 text-white" : "hover:bg-blue-100"}`}
                  >
                    {item}
                  </p>
                ))}
              </div>



            </div>
            {/* Right Page Panel */}
            <div className="flex-1 bg-white p-4 mt-4 rounded-lg border">
              {renderPage()}
            </div>
          </div>
        </Loading>
      </CardContainer>
    </div>
  );
};

export default SettingsConfiguration;
