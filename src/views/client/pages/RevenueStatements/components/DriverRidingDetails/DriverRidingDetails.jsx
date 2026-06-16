import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Button from "../../../../../../components/ui/Button/Button";
import { useTimezoneFormatting } from "../../../../../../utils/timezoneUtils";
import { useCurrency } from "../../../../../../contexts/CurrencyContext";
import { apiGetDriverRidingDetails } from "../../../../../../services/RevenueStatementsService";

const normalizeDriverDetails = (responseData) => {
  if (!responseData) return null;

  const payload = responseData.data ?? responseData;

  return {
    ...payload,
    ride_statistics: payload.ride_statistics ?? responseData.ride_statistics ?? null,
    revenue_summary: payload.revenue_summary ?? responseData.revenue_summary ?? null,
    rides: payload.rides ?? responseData.rides ?? [],
  };
};

const ACCOUNT_STATUS_FIELDS = [
  { label: "Completed", key: "completed", color: "text-green-600" },
  { label: "Cancelled", key: "cancelled", color: "text-red-500" },
  { label: "Pending", key: "pending", color: "text-amber-600" },
  { label: "Ongoing", key: "ongoing", color: "text-blue-600" },
  { label: "Arrived", key: "arrived", color: "text-indigo-600" },
  { label: "No Show", key: "no_show", color: "text-orange-600" },
];

const DriverRidingDetails = ({ revenueInfo, handleClose }) => {
  const { formatDateOr } = useTimezoneFormatting();
  const { currencySymbol } = useCurrency();
  const [loading, setLoading] = useState(false);
  const [driverDetails, setDriverDetails] = useState(null);

  const fetchDetails = async () => {
    const rawDriver = revenueInfo?.driver;
    const driverId =
      revenueInfo?.driver_detail?.id ||
      revenueInfo?.driver_id ||
      (typeof rawDriver === "object" ? rawDriver?.id : rawDriver);

    if (!driverId) {
      toast.error("Valid Driver ID not found");
      return;
    }

    setLoading(true);
    try {
      const response = await apiGetDriverRidingDetails(driverId);
      if (response?.status === 200 || response?.data?.success === 1) {
        setDriverDetails(normalizeDriverDetails(response.data));
      } else {
        toast.error("Failed to fetch driver riding details");
      }
    } catch (error) {
      console.error("Error fetching driver riding details: ", error);
      toast.error("Error fetching details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [revenueInfo]);

  const rideStats = driverDetails?.ride_statistics;
  const accountCounts = rideStats?.account_counts || [];

  const statCards = [
    { label: "Total Rides", value: rideStats?.total_rides ?? "0", className: "text-gray-800" },
    {
      label: "Total Earnings",
      value: `${currencySymbol}${Number(driverDetails?.revenue_summary?.total_revenue || 0).toFixed(2)}`,
      className: "text-[#4F46E5]",
    },
    { label: "Completed", value: rideStats?.completed ?? "0", className: "text-green-600" },
    { label: "Cancelled", value: rideStats?.cancelled ?? "0", className: "text-red-500" },
    { label: "Ongoing", value: rideStats?.ongoing ?? "0", className: "text-blue-600" },
    { label: "Arrived", value: rideStats?.arrived ?? "0", className: "text-indigo-600" },
    { label: "Pending", value: rideStats?.pending ?? "0", className: "text-amber-600" },
    { label: "No Show", value: rideStats?.no_show ?? "0", className: "text-orange-600" },
    { label: "Completion Rate", value: rideStats?.completion_rate ?? "0%", className: "text-gray-800" },
    { label: "Account Jobs", value: rideStats?.account_job_count ?? "0", className: "text-[#1F41BB]" },
  ];

  return (
    <div className="bg-white rounded-2xl w-full max-w-4xl mx-auto flex flex-col max-h-[85vh] overflow-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 border-b border-gray-200 shrink-0">
        <h2 className="text-xl sm:text-2xl font-semibold text-[#252525]">
          Driver Riding Details
        </h2>
        <div className="flex flex-col text-right">
          <p className="text-sm text-gray-500">Driver Name</p>
          <p className="font-semibold text-[#252525]">
            {revenueInfo?.driver_detail?.name ||
              revenueInfo?.driver?.name ||
              "N/A"}
          </p>
        </div>
      </div>

      <div className="p-4 sm:p-6 overflow-y-auto flex-1 min-h-0 bg-gray-50">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4F46E5]"></div>
          </div>
        ) : !driverDetails ? (
          <div className="text-center py-10 text-gray-500 bg-white rounded-xl shadow-sm">
            No details available for this driver.
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {statCards.map(({ label, value, className }) => (
                <div
                  key={label}
                  className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col"
                >
                  <span className="text-xs text-gray-500 mb-1">{label}</span>
                  <span className={`text-xl font-bold ${className}`}>{value}</span>
                </div>
              ))}
            </div>

            {(accountCounts.length > 0 || rideStats?.account_job_count) ? (
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-700">
                  Accounts ({rideStats?.account_job_count ?? accountCounts.length} jobs)
                </h3>
                {accountCounts.length > 0 ? (
                  <div className="space-y-3">
                    {accountCounts.map((account) => (
                      <div
                        key={account.account_id || account.account}
                        className="bg-white border border-gray-200 rounded-xl p-4 text-sm"
                      >
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-3">
                          <div>
                            <p className="font-semibold text-[#252525] text-base">
                              {account.name || "N/A"}
                            </p>
                            <p className="text-gray-500 text-xs mt-0.5">
                              {account.company || "—"}
                            </p>
                            {account.email && (
                              <p className="text-gray-500 text-xs mt-0.5">{account.email}</p>
                            )}
                            {(account.account_id || account.account) && (
                              <p className="text-gray-400 text-xs mt-0.5">
                                ID: {account.account_id || account.account}
                              </p>
                            )}
                          </div>
                          <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#006FFF1A] text-[#1F41BB] font-semibold text-sm">
                            {account.job_count ?? 0} jobs
                          </div>
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                          {ACCOUNT_STATUS_FIELDS.map(({ label, key, color }) => (
                            <div
                              key={key}
                              className="bg-gray-50 rounded-lg px-2 py-2 text-center"
                            >
                              <p className="text-[10px] text-gray-500 uppercase">{label}</p>
                              <p className={`font-semibold ${color}`}>{account[key] ?? 0}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white border border-gray-200 rounded-xl p-4 text-sm text-gray-500">
                    No account breakdown available.
                  </div>
                )}
              </div>
            ) : null}

            {/* Ride List */}
            {driverDetails.rides && driverDetails.rides.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-700">
                  Recent Rides
                </h3>
                <div className="space-y-3">
                  {driverDetails.rides.map((ride, idx) => (
                    <div
                      key={idx}
                      className="bg-white border text-sm border-gray-200 rounded-xl p-4 flex flex-col md:flex-row gap-4 md:items-center justify-between"
                    >
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold text-[#333]">
                          {ride.booking_id || "N/A"}
                        </span>
                        <span className="text-xs text-gray-500">
                          {ride.created_at ? formatDateOr(ride.created_at) : "-"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1 max-w-xs">
                        <span className="text-gray-700 truncate">
                          {ride.pickup_location || "Unknown"}
                        </span>
                        <span className="text-gray-700 truncate text-xs">
                          to {ride.destination_location || "Unknown"}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500">Amount</span>
                          <span className="font-semibold text-[#333]">
                            {currencySymbol}
                            {ride.effective_fare ||
                              ride.booking_amount ||
                              ride.offered_amount ||
                              "0"}
                          </span>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium uppercase md:w-[100px] text-center ${ride.booking_status?.toLowerCase() === "completed" ? "bg-green-100 text-green-700" : ride.booking_status?.toLowerCase() === "cancelled" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"}`}
                        >
                          {ride.booking_status || "Completed"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Generic JSON dump for debugging missing fields if needed */}
            {!driverDetails.rides && !driverDetails.total_rides && (
              <div className="bg-white p-4 rounded-xl border border-gray-200 overflow-auto">
                <pre className="text-xs text-gray-600">
                  {JSON.stringify(driverDetails, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-end p-4 sm:px-6 border-t border-gray-200 bg-white shrink-0">
        <Button
          type="filledGray"
          onClick={handleClose}
          className="px-6 py-2 rounded-lg font-medium"
        >
          Close
        </Button>
      </div>
    </div>
  );
};

export default DriverRidingDetails;
