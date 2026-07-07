import { COUNTRY_CODE_MAP } from "../constants/countryCode.constant";
import { getTenantData } from "./functions/tokenEncryption";
import {
    formatDistanceFromBooking,
    formatDistanceFromMeters,
    formatDistanceValueWithUnit,
    metersToDisplayDistanceValue,
    parseDistanceUnit,
} from "./distanceFormatUtils.js";

export {
    formatDistanceFromBooking,
    formatDistanceFromMeters,
    formatDistanceValueWithUnit,
    metersToDisplayDistanceValue,
    parseDistanceUnit,
};

export const getTenantCountryIso = (tenant = getTenantData()) => {
    const iso = tenant?.country_of_use || tenant?.data?.country_of_use;
    return iso?.trim().toUpperCase() || null;
};

export const getDefaultDialCode = (tenant = getTenantData()) => {
    const iso = getTenantCountryIso(tenant);
    return (iso && COUNTRY_CODE_MAP[iso]) || "";
};

export const normalizeDialCode = (code) => {
    if (code == null || code === "") return "";
    const trimmed = String(code).trim();
    if (!trimmed) return "";
    return trimmed.startsWith("+") ? trimmed : `+${trimmed.replace(/^\+/, "")}`;
};

export const formatPhoneNumber = (countryCode, phoneNumber, tenant = getTenantData()) => {
    if (!phoneNumber) return "-";
    const dial = normalizeDialCode(countryCode) || getDefaultDialCode(tenant);
    return dial ? `${dial} ${phoneNumber}` : String(phoneNumber);
};

export const getDistanceUnitFromTenant = (tenant = getTenantData()) => {
    const units = tenant?.units || tenant?.data?.units;
    return parseDistanceUnit(units);
};

export const hasTenantDistanceUnit = (tenant = getTenantData()) =>
    Boolean(tenant?.units || tenant?.data?.units);

export const resolveDistanceUnit = ({ tenant = getTenantData(), apiUnits } = {}) => {
    return getDistanceUnitFromTenant(tenant) || parseDistanceUnit(apiUnits) || "Km";
};
