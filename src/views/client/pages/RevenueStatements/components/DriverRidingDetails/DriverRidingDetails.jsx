import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Button from "../../../../../../components/ui/Button/Button";
import { getTenantData } from "../../../../../../utils/functions/tokenEncryption";
import { apiGetDriverRidingDetails } from "../../../../../../services/RevenueStatementsService";

const DriverRidingDetails = ({ revenueInfo, handleClose }) => {
  const [loading, setLoading] = useState(false);
  const [driverDetails, setDriverDetails] = useState(null);
  const [currencySymbol, setCurrencySymbol] = useState("₹");
  const [distanceUnit, setDistanceUnit] = useState("Miles");

  const currencySymbols = {
    INR: "₹",
    USD: "$",
    EUR: "€",
    GBP: "£",
    AUD: "A$",
    CAD: "C$",
    AED: "د.إ",
  };

  const fetchDetails = async () => {
    console.log("revenueInfo======", revenueInfo);
    const rawDriver = revenueInfo?.driver;
    const driverId = revenueInfo?.driver_detail?.id || revenueInfo?.driver_id || (typeof rawDriver === 'object' ? rawDriver?.id : rawDriver);
    console.log("driverId--", driverId);

    if (!driverId) {
      console.log("Invalid revenueInfo:", revenueInfo);
      toast.error("Valid Driver ID not found");
      return;
    }

    setLoading(true);
    try {
      const response = await apiGetDriverRidingDetails(driverId);
      console.log("apiGetDriverRidingDetails response========", response);
      if (response?.status === 200 || response?.data?.success === 1) {
        setDriverDetails(response.data?.data || response.data || null);
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

  useEffect(() => {
    const tenant = getTenantData();

    if (tenant?.units) {
      const unit = tenant.units.toLowerCase() === "km" ? "Km" : "Miles";
      setDistanceUnit(unit);
    }

    if (tenant?.currency) {
      setCurrencySymbol(currencySymbols[tenant.currency] || tenant.currency);
    }
  }, []);

  const formatDistance = (dist) => {
    if (!dist) return "-";
    if (distanceUnit === "Km") {
      return `${(dist / 1000).toFixed(2)}km`;
    }
    return `${(dist / 1609.34).toFixed(2)} Miles`;
  };

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
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col">
                <span className="text-xs text-gray-500 mb-1">Total Rides</span>
                <span className="text-xl font-bold text-gray-800">
                  {driverDetails.ride_statistics?.total_rides || "0"}
                </span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col">
                <span className="text-xs text-gray-500 mb-1">
                  Total Earnings
                </span>
                <span className="text-xl font-bold text-[#4F46E5]">
                  {currencySymbol}
                  {Number(
                    driverDetails.revenue_summary?.total_revenue || 0,
                  ).toFixed(2)}
                </span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col">
                <span className="text-xs text-gray-500 mb-1">
                  Completed Rides
                </span>
                <span className="text-xl font-bold text-green-600">
                  {driverDetails.ride_statistics?.completed || "0"}
                </span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col">
                <span className="text-xs text-gray-500 mb-1">
                  Cancelled Rides
                </span>
                <span className="text-xl font-bold text-red-500">
                  {driverDetails.ride_statistics?.cancelled || "0"}
                </span>
              </div>
            </div>

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
                          {ride.created_at
                            ? new Date(ride.created_at).toLocaleString()
                            : "-"}
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
