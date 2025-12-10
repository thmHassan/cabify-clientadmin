// import React, { useEffect, useState } from "react";
// import PageTitle from "../../../../components/ui/PageTitle/PageTitle";
// import PageSubTitle from "../../../../components/ui/PageSubTitle/PageSubTitle";
// import {
//   apiAssignBackupPlot,
//   apiGetManagePlot,
// } from "../../../../services/PlotService";

// const ManageZones = () => {
//   const [plots, setPlots] = useState([]);
//   const [selectedPlot, setSelectedPlot] = useState(null);
//   const [selectedBackups, setSelectedBackups] = useState([]);

//   useEffect(() => {
//     fetchPlots();
//   }, []);

//   const fetchPlots = async () => {
//     try {
//       const res = await apiGetManagePlot();

//       if (res?.data?.list) {
//         const cleaned = res.data.list.map((p) => ({
//           ...p,
//           backup_plots: Array.isArray(p.backup_plots) ? p.backup_plots : [],
//         }));

//         setPlots(cleaned);
//       }
//     } catch (err) {
//       console.error("Error fetching plots:", err);
//     }
//   };

//   // Handle selecting main plot
//   const handleSelectPlot = (value) => {
//     if (!value) return;

//     const plot = plots.find((p) => p.id == value);
//     setSelectedPlot(plot);
//     setSelectedBackups([]); // reset existing backup selections
//   };

//   // API call on selecting backup
//   const handleSelectBackup = async (value, colIndex) => {
//     if (!value || !selectedPlot) return;

//     const updated = [...selectedBackups];
//     updated[colIndex] = parseInt(value);
//     setSelectedBackups(updated);

//     const form = new FormData();
//     form.append("id", selectedPlot.id);

//     updated.forEach((id) => {
//       if (id) form.append("backup_plot_array[]", id);
//     });

//     try {
//       await apiAssignBackupPlot(form);
//       fetchPlots();
//     } catch (err) {
//       console.error("Backup update failed:", err);
//     }
//   };

//   // Filter backup options
//   const filteredBackupOptions = () => {
//     return plots.filter(
//       (p) =>
//         p.id !== selectedPlot?.id && !selectedBackups.includes(p.id)
//     );
//   };

//   return (
//     <div className="px-4 py-5 sm:p-6 lg:p-10 min-h-[calc(100vh-85px)]">
//       <div className="flex flex-col gap-2.5 sm:mb-[30px] mb-6">
//         <div className="flex justify-between">
//           <PageTitle title="Manage Zones" />
//         </div>

//         <PageSubTitle title="Add, monitor and manage your company's dispatch team" />
//       </div>

//       <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
//         <table className="w-full border-collapse">
//           <thead className="bg-[#E8F1FF]">
//             <tr className="text-left text-[12px] font-medium text-black">
//               <th className="px-2 py-2 font-medium">plot #</th>
//               <th className="border-b border-y border-t-0 px-2 py-2 font-medium">Plot Name</th>
//               {Array.from({ length: Math.max(plots.length - 1, 0) }).map((_, i) => (
//                 <th key={i} className="border-b border-l px-2 py-2 font-medium">
//                   BACKUP PLOT {i + 1}
//                 </th>
//               ))}
//             </tr>
//           </thead>

//           <tbody>
//             <tr className="text-sm">
//               <td className="px-2 py-2 font-medium">1</td>
//               <td className=" px-2 py-2 font-medium">
//                 {!selectedPlot ? (
//                   <select
//                     className=" p-1 rounded text-sm w-full"
//                     onChange={(e) => handleSelectPlot(e.target.value)}
//                   >
//                     <option value="">Select Plot Name</option>
//                     {plots.map((p) => (
//                       <option key={p.id} value={p.id}>
//                         {p.name}
//                       </option>
//                     ))}
//                   </select>
//                 ) : (
//                   <span className="font-semibold">{selectedPlot.name}</span>
//                 )}
//               </td>

//               {Array.from({ length: Math.max(plots.length - 1, 0) }).map((_, colIndex) => (
//                 <td key={colIndex} className="border-l px-2 py-2">
//                   {!selectedPlot ? (
//                     <span className="text-gray-400">Select Plot First</span>
//                   ) : selectedBackups[colIndex] ? (
//                     <span className="font-semibold">
//                       {
//                         plots.find(
//                           (p) => p.id === selectedBackups[colIndex]
//                         )?.name
//                       }
//                     </span>
//                   ) : (
//                     (colIndex === 0 || selectedBackups[colIndex - 1]) ? (
//                       <select
//                         className="border p-1 rounded text-sm w-full"
//                         onChange={(e) =>
//                           handleSelectBackup(e.target.value, colIndex)
//                         }
//                       >
//                         <option value="">Select Backup Plot</option>

//                         {filteredBackupOptions().map((fp) => (
//                           <option key={fp.id} value={fp.id}>
//                             {fp.name}
//                           </option>
//                         ))}
//                       </select>
//                     ) : (
//                       <span className="text-gray-400">
//                         Select previous backup
//                       </span>
//                     )
//                   )}
//                 </td>
//               ))}
//             </tr>
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default ManageZones;



import React, { useEffect, useState } from "react";
import PageTitle from "../../../../components/ui/PageTitle/PageTitle";
import PageSubTitle from "../../../../components/ui/PageSubTitle/PageSubTitle";
import { apiAssignBackupPlot, apiGetManagePlot } from "../../../../services/PlotService";

const ManageZones = () => {
  const [plots, setPlots] = useState([]);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    fetchPlots();
    // initialize with 1 row
    setRows([{ selectedPlot: null, selectedBackups: [] }]);
  }, []);

  const fetchPlots = async () => {
    try {
      const res = await apiGetManagePlot();

      if (res?.data?.list) {
        const cleaned = res.data.list.map((p) => ({
          ...p,
          backup_plots: Array.isArray(p.backup_plots) ? p.backup_plots : [],
        }));

        setPlots(cleaned);
      }
    } catch (err) {
      console.error("Error fetching plots:", err);
    }
  };

  // Handle selecting main plot for a row
  const handleSelectPlot = (value, rowIndex) => {
    if (!value) return;

    const plot = plots.find((p) => p.id == value);
    const updatedRows = [...rows];
    updatedRows[rowIndex].selectedPlot = plot;
    updatedRows[rowIndex].selectedBackups = [];
    setRows(updatedRows);
  };

  // Handle selecting backup for a row
  const handleSelectBackup = async (value, rowIndex, colIndex) => {
    if (!value || !rows[rowIndex].selectedPlot) return;

    const updatedRows = [...rows];
    updatedRows[rowIndex].selectedBackups[colIndex] = parseInt(value);
    setRows(updatedRows);

    const form = new FormData();
    form.append("id", updatedRows[rowIndex].selectedPlot.id);
    updatedRows[rowIndex].selectedBackups.forEach((id) => {
      if (id) form.append("backup_plot_array[]", id);
    });

    try {
      await apiAssignBackupPlot(form);
      fetchPlots();
    } catch (err) {
      console.error("Backup update failed:", err);
    }
  };

  // Filter backup options for a row
  const filteredBackupOptions = (rowIndex) => {
    const row = rows[rowIndex];
    return plots.filter(
      (p) => p.id !== row.selectedPlot?.id && !row.selectedBackups.includes(p.id)
    );
  };

  // Add a new row
  const addRow = () => {
    setRows([...rows, { selectedPlot: null, selectedBackups: [] }]);
  };

  // Remove a row
  const removeRow = (rowIndex) => {
    const updatedRows = rows.filter((_, index) => index !== rowIndex);
    setRows(updatedRows);
  };

  return (
    <div className="px-4 py-5 sm:p-6 lg:p-10 min-h-[calc(100vh-85px)]">
      <div className="flex flex-col gap-2.5 sm:mb-[30px] mb-6">
        <div className="flex justify-between">
          <PageTitle title="Manage Zones" />
        </div>
        <PageSubTitle title="Add, monitor and manage your company's dispatch team" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-[#E8F1FF]">
            <tr className="text-left text-[12px] font-medium text-black">
              <th className="px-2 py-2 font-medium">Plot #</th>
              <th className="border-b border-y border-t-0 px-2 py-2 font-medium">Plot Name</th>
              {Array.from({ length: Math.max(plots.length - 1, 0) }).map((_, i) => (
                <th key={i} className="border-b border-l px-2 py-2 font-medium">
                  BACKUP PLOT {i + 1}
                </th>
              ))}
              <th className="px-2 py-2 font-medium">Actions</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className={`text-sm ${rowIndex % 2 === 0 ? "bg-white" : "bg-[#E8F1FF]"
                }`}>
                <td className="px-2 py-2 font-medium">{rowIndex + 1}</td>

                {/* Plot Name */}
                <td className="px-2 py-2 font-medium">
                  {!row.selectedPlot ? (
                    <select
                      className="p-1 rounded text-sm w-full"
                      onChange={(e) => handleSelectPlot(e.target.value, rowIndex)}
                    >
                      <option value="">Select Plot Name</option>
                      {plots.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="font-semibold">{row.selectedPlot.name}</span>
                  )}
                </td>

                {/* Backup columns */}
                {Array.from({ length: Math.max(plots.length - 1, 0) }).map((_, colIndex) => (
                  <td key={colIndex} className="border-l px-2 py-2">
                    {!row.selectedPlot ? (
                      <span className="text-gray-400">Select Backup Plot</span>
                    ) : row.selectedBackups[colIndex] ? (
                      <span className="font-semibold">
                        {plots.find((p) => p.id === row.selectedBackups[colIndex])?.name}
                      </span>
                    ) : colIndex === 0 || row.selectedBackups[colIndex - 1] ? (
                      <select
                        className="border p-1 rounded text-sm w-full"
                        onChange={(e) => handleSelectBackup(e.target.value, rowIndex, colIndex)}
                      >
                        <option value="">Select Backup Plot</option>
                        {filteredBackupOptions(rowIndex).map((fp) => (
                          <option key={fp.id} value={fp.id}>
                            {fp.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-gray-400">Select previous backup</span>
                    )}
                  </td>
                ))}

                {/* Actions */}
                <td className="px-2 py-2">
                  <button
                    className="text-red-500 hover:underline"
                    onClick={() => removeRow(rowIndex)}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="p-4">
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={addRow}
          >
            Add Row
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageZones;
