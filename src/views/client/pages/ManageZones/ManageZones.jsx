import React, { useCallback, useEffect, useMemo, useState } from "react";
import PageTitle from "../../../../components/ui/PageTitle/PageTitle";
import PageSubTitle from "../../../../components/ui/PageSubTitle/PageSubTitle";
import { apiAssignBackupPlot, apiGetBackupPlot, apiGetManagePlot } from "../../../../services/PlotService";

const normalizeId = (id) => (id == null || id === "" ? null : String(id));

const DEFAULT_BACKUP_OPTION = "";

const ManageZones = () => {
  const [plots, setPlots] = useState([]);
  const [rows, setRows] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);

  const buildRows = useCallback((plotList, backupList = []) => {
    const backupByPlotId = new Map(
      backupList.map((item) => [normalizeId(item.id), item])
    );
    const columnCount = Math.max(plotList.length - 1, 0);

    return plotList.map((plot) => {
      const backupItem = backupByPlotId.get(normalizeId(plot.id));
      const backupIds = (backupItem?.backup_plots || plot.backup_plots || [])
        .map((backupId) => normalizeId(backupId))
        .filter(Boolean);

      const selectedBackups = Array.from({ length: columnCount }, (_, index) =>
        backupIds[index] || DEFAULT_BACKUP_OPTION
      );

      return {
        selectedPlot: {
          id: plot.id,
          name: plot.name,
        },
        selectedBackups,
      };
    });
  }, []);

  const fetchData = useCallback(async () => {
    setTableLoading(true);
    try {
      const [plotsResponse, backupResponse] = await Promise.all([
        apiGetManagePlot(),
        apiGetBackupPlot(),
      ]);

      const plotList = (plotsResponse?.data?.list || []).map((plot) => ({
        ...plot,
        backup_plots: Array.isArray(plot.backup_plots) ? plot.backup_plots : [],
      }));

      const backupList =
        backupResponse?.data?.success === 1 ? backupResponse.data.list || [] : [];

      setPlots(plotList);
      setRows(buildRows(plotList, backupList));
    } catch (error) {
      console.error("Error fetching manage zones data:", error);
    } finally {
      setTableLoading(false);
    }
  }, [buildRows]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const backupColumnCount = useMemo(
    () => Math.max(plots.length - 1, 0),
    [plots.length]
  );

  const saveBackupPlots = async (row) => {
    if (!row?.selectedPlot?.id) return;

    const form = new FormData();
    form.append("id", row.selectedPlot.id);

    row.selectedBackups
      .slice(0, backupColumnCount)
      .filter(Boolean)
      .forEach((backupId) => {
        form.append("backup_plot_array[]", backupId);
      });

    try {
      await apiAssignBackupPlot(form);
    } catch (err) {
      console.error("Backup update failed:", err);
    }
  };

  const handleSelectBackup = async (value, rowIndex, colIndex) => {
    const row = rows[rowIndex];
    if (!row?.selectedPlot) return;

    const updatedRows = [...rows];
    const selectedBackups = [...updatedRows[rowIndex].selectedBackups];

    if (value === DEFAULT_BACKUP_OPTION) {
      const trimmed = selectedBackups.slice(0, colIndex);
      updatedRows[rowIndex].selectedBackups = Array.from(
        { length: backupColumnCount },
        (_, index) => trimmed[index] || DEFAULT_BACKUP_OPTION
      );
    } else {
      const nextBackups = Array.from(
        { length: backupColumnCount },
        (_, index) => selectedBackups[index] || DEFAULT_BACKUP_OPTION
      );
      nextBackups[colIndex] = normalizeId(value);
      updatedRows[rowIndex].selectedBackups = nextBackups;
    }

    setRows(updatedRows);
    await saveBackupPlots(updatedRows[rowIndex]);
  };

  const filteredBackupOptions = (rowIndex, colIndex = null) => {
    const row = rows[rowIndex];
    const selectedPlotId = normalizeId(row.selectedPlot?.id);

    return plots.filter((plot) => {
      const plotId = normalizeId(plot.id);
      if (plotId === selectedPlotId) return false;

      return !row.selectedBackups.some((backupId, index) => {
        if (colIndex !== null && index === colIndex) return false;
        return normalizeId(backupId) === plotId;
      });
    });
  };

  const renderBackupCell = (row, rowIndex, colIndex) => {
    if (!row.selectedPlot) {
      return <span className="text-gray-400">Select Backup Plot</span>;
    }

    const selectedBackupId = row.selectedBackups[colIndex] || DEFAULT_BACKUP_OPTION;

    return (
      <select
        className={`border p-1 rounded text-sm w-full ${
          selectedBackupId === DEFAULT_BACKUP_OPTION ? "text-gray-400" : ""
        }`}
        value={selectedBackupId}
        onChange={(e) => handleSelectBackup(e.target.value, rowIndex, colIndex)}
      >
        <option value={DEFAULT_BACKUP_OPTION}>Select Backup Plot</option>
        {filteredBackupOptions(rowIndex, colIndex).map((plot) => (
          <option key={plot.id} value={normalizeId(plot.id)}>
            {plot.name}
          </option>
        ))}
      </select>
    );
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
              {Array.from({ length: backupColumnCount }).map((_, index) => (
                <th key={index} className="border-b border-l px-2 py-2 font-medium">
                  BACKUP PLOT {index + 1}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {tableLoading ? (
              <tr>
                <td colSpan={backupColumnCount + 2} className="px-2 py-6 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={backupColumnCount + 2} className="px-2 py-6 text-center text-gray-500">
                  No plots found
                </td>
              </tr>
            ) : (
              rows.map((row, rowIndex) => (
                <tr
                  key={normalizeId(row.selectedPlot?.id) || rowIndex}
                  className={`text-sm ${rowIndex % 2 === 0 ? "bg-white" : "bg-[#E8F1FF]"}`}
                >
                  <td className="px-2 py-2 font-medium">{rowIndex + 1}</td>
                  <td className="px-2 py-2 font-medium">
                    <span className="font-semibold">{row.selectedPlot?.name}</span>
                  </td>
                  {Array.from({ length: backupColumnCount }).map((_, colIndex) => (
                    <td key={colIndex} className="border-l px-2 py-2">
                      {renderBackupCell(row, rowIndex, colIndex)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageZones;
