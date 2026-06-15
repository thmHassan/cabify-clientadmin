import { useCallback, useEffect, useState } from "react";
import appConfig from "../../../../../../components/configs/app.config";
import Button from "../../../../../../components/ui/Button/Button";
import AppLogoLoader from "../../../../../../components/shared/AppLogoLoader";
import {
  apiGetDriverDocumentList,
  apiGetDriverManagementById,
} from "../../../../../../services/DriverManagementService";
import { apiGetSubCompany } from "../../../../../../services/SubCompanyServices";
import { apiGetAllVehicleType } from "../../../../../../services/VehicleTypeServices";
import { formatPhoneNumber } from "../../../../../../utils/tenantFormatUtils";
import { useTimezoneFormatting } from "../../../../../../utils/timezoneUtils";
import { useCurrency } from "../../../../../../contexts/CurrencyContext";

const DetailItem = ({ label, value, className = "" }) => (
  <div className={className}>
    <p className="text-xs text-gray-500 mb-1">{label}</p>
    <p className="text-sm font-medium text-gray-900 break-words">{value || "-"}</p>
  </div>
);

const SectionTitle = ({ title }) => (
  <h3 className="text-base font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
    {title}
  </h3>
);

const getVehicleFields = (data) => {
  const hasChangeRequest = Number(data?.vehicle_change_request) === 1;

  return {
    vehicle_name: hasChangeRequest
      ? data?.change_vehicle_name || data?.vehicle_name
      : data?.vehicle_name,
    vehicle_type: hasChangeRequest
      ? data?.change_vehicle_type || data?.vehicle_type
      : data?.vehicle_type,
    vehicle_service: hasChangeRequest
      ? data?.change_vehicle_service || data?.vehicle_service
      : data?.vehicle_service,
    seats: hasChangeRequest ? data?.change_seats || data?.seats : data?.seats,
    color: hasChangeRequest ? data?.change_color || data?.color : data?.color,
    capacity: hasChangeRequest
      ? data?.change_capacity || data?.capacity
      : data?.capacity,
    plate_no: hasChangeRequest
      ? data?.change_plate_no || data?.plate_no
      : data?.plate_no,
    vehicle_registration_date: hasChangeRequest
      ? data?.change_vehicle_registration_date || data?.vehicle_registration_date
      : data?.vehicle_registration_date,
  };
};

const formatStatus = (status) => {
  if (!status) return "-";
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const DriverDetailsModal = ({ driverId, onClose, onEdit }) => {
  const { formatDateOnlyOr } = useTimezoneFormatting();
  const { currencySymbol } = useCurrency();
  const [driverData, setDriverData] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [subCompanyList, setSubCompanyList] = useState([]);
  const [vehicleList, setVehicleList] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDriverDetails = useCallback(async () => {
    if (!driverId) return;

    setLoading(true);
    try {
      const [driverResponse, documentsResponse, subCompanyResponse, vehicleResponse] =
        await Promise.all([
          apiGetDriverManagementById({ id: driverId }),
          apiGetDriverDocumentList({ driver_id: driverId }),
          apiGetSubCompany({ page: 1, perPage: 100 }),
          apiGetAllVehicleType(),
        ]);

      if (driverResponse?.data?.success === 1 || driverResponse?.status === 200) {
        const data =
          driverResponse?.data?.driver ||
          driverResponse?.data?.data ||
          driverResponse?.data ||
          {};
        setDriverData(data);
      }

      if (documentsResponse?.data?.success === 1 || documentsResponse?.status === 200) {
        const docs =
          documentsResponse?.data?.documentList ||
          documentsResponse?.data?.data ||
          documentsResponse?.data?.list ||
          [];
        setDocuments(Array.isArray(docs) ? docs : []);
      }

      const companies = subCompanyResponse?.data?.list?.data || [];
      setSubCompanyList(
        companies.map((company) => ({
          label: company.name,
          value: company.id.toString(),
        }))
      );

      const vehicles = vehicleResponse?.data?.list || [];
      setVehicleList(
        vehicles.map((vehicle) => ({
          label: vehicle.vehicle_type_name,
          value: vehicle.id?.toString(),
        }))
      );
    } catch (error) {
      console.error("Error loading driver details:", error);
    } finally {
      setLoading(false);
    }
  }, [driverId]);

  useEffect(() => {
    loadDriverDetails();
  }, [loadDriverDetails]);

  const getSubCompanyLabel = (value) =>
    subCompanyList.find((item) => item.value === value?.toString())?.label || value;

  const getVehicleTypeLabel = (value) =>
    vehicleList.find((item) => item.value === value?.toString())?.label || value;

  const getAssignedVehicleLabel = (value) =>
    vehicleList.find((item) => item.value === value?.toString())?.label || value;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 min-w-[300px]">
        <AppLogoLoader />
      </div>
    );
  }

  if (!driverData) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500 mb-4">Unable to load driver details.</p>
        <Button type="filledGray" onClick={onClose}>
          Close
        </Button>
      </div>
    );
  }

  const vehicleFields = getVehicleFields(driverData);
  const phoneNumber = formatPhoneNumber(
    driverData.country_code,
    driverData.phone_no || driverData.phone
  );

  const statusClass =
    driverData.status === "accepted"
      ? "bg-[#10B981] text-white"
      : driverData.status === "rejected"
        ? "bg-[#FF4747] text-white"
        : "bg-[#F5C60B] text-white";

  return (
    <div className="max-h-[85vh] overflow-y-auto">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-[#EFEFEF] flex items-center justify-center flex-shrink-0">
            {driverData.profile_image ? (
              <img
                src={appConfig.getAssetUrl(driverData.profile_image)}
                alt={driverData.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-[#333333] font-semibold text-2xl">
                {driverData.name?.charAt(0)?.toUpperCase() || "?"}
              </span>
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{driverData.name}</h2>
            <p className="text-sm text-gray-500">{driverData.email}</p>
            <span
              className={`inline-block mt-2 text-xs font-semibold px-3 py-1 rounded-full ${statusClass}`}
            >
              {formatStatus(driverData.status)}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          aria-label="Close"
        >
          ×
        </button>
      </div>

      <div className="space-y-6">
        <section>
          <SectionTitle title="Driver Details" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <DetailItem label="Name" value={driverData.name} />
            <DetailItem label="Email" value={driverData.email} />
            <DetailItem label="Phone Number" value={phoneNumber} />
            <DetailItem label="Address" value={driverData.address} />
            <DetailItem label="Driver License" value={driverData.driver_license} />
            <DetailItem
              label="Assigned Vehicle"
              value={getAssignedVehicleLabel(driverData.assigned_vehicle)}
            />
            <DetailItem label="Joined Date" value={formatDateOnlyOr(driverData.joined_date)} />
            <DetailItem
              label="Wallet Balance"
              value={`${currencySymbol} ${driverData.wallet_balance ?? "0"}`}
            />
            <DetailItem
              label="Sub Company"
              value={getSubCompanyLabel(driverData.sub_company)}
            />
            <DetailItem
              label="Vehicle Change Request"
              value={Number(driverData.vehicle_change_request) > 0 ? "Yes" : "No"}
            />
            <DetailItem
              label="Document Approved In Office"
              value={
                Number(driverData.document_approved_office) === 1 ? "Yes" : "No"
              }
            />
          </div>
        </section>

        <section>
          <SectionTitle title="Vehicle Information" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <DetailItem label="Vehicle Name" value={vehicleFields.vehicle_name} />
            <DetailItem
              label="Vehicle Type"
              value={getVehicleTypeLabel(vehicleFields.vehicle_type)}
            />
            <DetailItem label="Vehicle Service" value={vehicleFields.vehicle_service} />
            <DetailItem label="Seats" value={vehicleFields.seats} />
            <DetailItem label="Color" value={vehicleFields.color} />
            <DetailItem label="Capacity" value={vehicleFields.capacity} />
            <DetailItem label="Plate Number" value={vehicleFields.plate_no} />
            <DetailItem
              label="Vehicle Registration Date"
              value={formatDateOnlyOr(vehicleFields.vehicle_registration_date)}
            />
          </div>
        </section>

        <section>
          <SectionTitle title="Bank Information" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <DetailItem label="Bank Name" value={driverData.bank_name} />
            <DetailItem
              label="Bank Account Number"
              value={driverData.bank_account_number}
            />
            <DetailItem
              label="Account Holder Name"
              value={driverData.account_holder_name}
            />
            <DetailItem label="Bank Phone Number" value={driverData.bank_phone_no} />
            <DetailItem label="IBAN Number" value={driverData.iban_no} />
          </div>
        </section>

        <section>
          <SectionTitle title="Document Information" />
          {documents.length === 0 ? (
            <p className="text-sm text-gray-500">No documents found.</p>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between gap-3 bg-gray-50 rounded-lg px-4 py-3"
                >
                  <p className="text-sm font-medium text-gray-900">
                    {doc.document_detail?.document_name ||
                      doc.document_name ||
                      "Unnamed Document"}
                  </p>
                  <span className="text-xs font-semibold capitalize text-gray-600">
                    {doc.status === "approved" ? "verified" : doc.status || "pending"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="flex flex-col sm:flex-row justify-end gap-3 mt-8 pt-4 border-t border-gray-200">
        <Button type="filledGray" onClick={onClose} className="px-6">
          Close
        </Button>
        <Button type="filled" onClick={() => onEdit?.(driverId)} className="px-6">
          Edit Driver
        </Button>
      </div>
    </div>
  );
};

export default DriverDetailsModal;
