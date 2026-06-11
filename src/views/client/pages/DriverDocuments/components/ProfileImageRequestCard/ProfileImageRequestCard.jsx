import React, { useState } from "react";
import Button from "../../../../../../components/ui/Button/Button";
import appConfig from "../../../../../../components/configs/app.config";
import {
  apiApproveDriverProfileImageApproval,
  apiRejectDriverProfileImageApproval,
} from "../../../../../../services/DriverManagementService";
import toast from "react-hot-toast";

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusLabel = (status) => {
  if (!status) return "Unknown";
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const ProfileImageRequestCard = ({ request, onStatusChange }) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const driverId = request?.driver_id ?? request?.id;
  const driverName =
    request?.driver_name ?? request?.driver?.name ?? request?.name ?? "N/A";
  const driverEmail =
    request?.driver_email ?? request?.driver?.email ?? request?.email ?? "N/A";
  const profileImage =
    request?.profile_image ?? request?.driver?.profile_image ?? null;
  const description = request?.description ?? "-";
  const status =
    request?.approval_status ?? request?.status ?? request?.profile_image_approval_status ?? "pending";
  const requestedAt = request?.created_at ?? request?.requested_at ?? null;

  const handleAction = async (action) => {
    if (!driverId) return;

    setIsUpdating(true);
    try {
      const formData = new FormData();
      formData.append("id", driverId);

      const response =
        action === "approve"
          ? await apiApproveDriverProfileImageApproval(formData)
          : await apiRejectDriverProfileImageApproval(formData);

      if (response?.data?.success === 1 || response?.status === 200) {
        toast.success(
          response?.data?.message ||
            `Profile image update request ${action === "approve" ? "approved" : "rejected"}`
        );
        onStatusChange?.();
      } else {
        toast.error(response?.data?.message || "Failed to update request");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-white rounded-[15px] p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:shadow-md">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full overflow-hidden bg-[#EFEFEF] flex items-center justify-center flex-shrink-0">
          {profileImage ? (
            <img
              src={appConfig.getAssetUrl(profileImage)}
              alt={driverName}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-lg font-semibold text-gray-500">
              {driverName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div>
          <p className="font-semibold text-lg">{driverName}</p>
          <p className="text-xs text-gray-500">{driverEmail}</p>
          <p className="text-sm text-gray-700 mt-1">
            <span className="font-medium">Reason:</span> {description}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Requested: {formatDate(requestedAt)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <span
          className={`text-sm font-semibold px-3 py-1 rounded-full ${
            status === "pending"
              ? "bg-[#F5C60B] text-white"
              : status === "approved"
                ? "bg-[#10B981] text-white"
                : status === "rejected"
                  ? "bg-[#FF4747] text-white"
                  : "bg-gray-200 text-gray-700"
          }`}
        >
          {getStatusLabel(status)}
        </span>

        {status === "pending" && (
          <>
            <Button
              onClick={() => handleAction("approve")}
              type="filledGreen"
              className="px-6 py-2 rounded-md"
              disabled={isUpdating}
            >
              {isUpdating ? "Processing..." : "Approve"}
            </Button>
            <Button
              onClick={() => handleAction("reject")}
              type="filledRed"
              className="px-6 py-2 rounded-md"
              disabled={isUpdating}
            >
              Reject
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfileImageRequestCard;
