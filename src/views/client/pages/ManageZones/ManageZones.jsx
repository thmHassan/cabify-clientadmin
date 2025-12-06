// import React from "react";
// import PageTitle from "../../../../components/ui/PageTitle/PageTitle";
// import PageSubTitle from "../../../../components/ui/PageSubTitle/PageSubTitle";

// const ManageZones = () => {
//   return (
//     <div className="px-4 py-5 sm:p-6 lg:p-10 min-h-[calc(100vh-85px)]">
//       <div className="flex flex-col gap-2.5 sm:mb-[30px] mb-6">
//         <div className="flex justify-between">
//           <PageTitle title="Manage Zones" />
//         </div>
//         <div>
//           <PageSubTitle title="Add, monitor and manage your company's dispatch team" />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ManageZones;
import React from "react";
import PageTitle from "../../../../components/ui/PageTitle/PageTitle";
import PageSubTitle from "../../../../components/ui/PageSubTitle/PageSubTitle";

const ManageZones = () => {
  return (
    <div className="px-4 py-5 sm:p-6 lg:p-10 min-h-[calc(100vh-85px)]">
      {/* PAGE HEADER */}
      <div className="flex flex-col gap-2.5 sm:mb-[30px] mb-6">
        <div className="flex justify-between">
          <PageTitle title="Manage Zones" />
        </div>

        <PageSubTitle title="Add, monitor and manage your company's dispatch team" />
      </div>

      {/* TABLE CONTAINER */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="text-left text-[12px] font-semibold text-[#1F41BB]">
              <th className="border-b px-3 py-2">PLOT #</th>
              <th className="border-b px-3 py-2">PLOT NAME</th>
              <th className="border-b px-3 py-2">BACKUP PLOT 1</th>
              <th className="border-b px-3 py-2">BACKUP PLOT 2</th>
              <th className="border-b px-3 py-2">BACKUP PLOT 3</th>
              <th className="border-b px-3 py-2">BACKUP PLOT 4</th>
              <th className="border-b px-3 py-2">BACKUP PLOT 5</th>
              <th className="border-b px-3 py-2">BACKUP PLOT 6</th>
              <th className="border-b px-3 py-2">BACKUP PLOT 7</th>
              <th className="border-b px-3 py-2">BACKUP PLOT 8</th>
              <th className="border-b px-3 py-2">BACKUP PLOT 9</th>
              <th className="border-b px-3 py-2">BACKUP PLOT 10</th>
            </tr>
          </thead>

          <tbody>
            <tr className="text-sm">
              <td className="border-b px-3 py-3">1</td>
              <td className="border-b px-3 py-3">SMALL WOOD</td>
              <td className="border-b px-3 py-3">LODGE PARK</td>
              <td className="border-b px-3 py-3"></td>
              <td className="border-b px-3 py-3"></td>
              <td className="border-b px-3 py-3"></td>
              <td className="border-b px-3 py-3"></td>
              <td className="border-b px-3 py-3"></td>
              <td className="border-b px-3 py-3"></td>
              <td className="border-b px-3 py-3"></td>
              <td className="border-b px-3 py-3"></td>
              <td className="border-b px-3 py-3"></td>
            </tr>

            {/* EMPTY ROWS TO MATCH DESIGN */}
            {[...Array(15)].map((_, i) => (
              <tr key={i} className="text-sm">
                {[...Array(12)].map((_, col) => (
                  <td key={col} className="border-b px-3 py-3"></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageZones;
