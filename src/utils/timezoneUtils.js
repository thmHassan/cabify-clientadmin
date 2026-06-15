import { useTimezone } from '../contexts/TimezoneContext';
import { getTenantData } from './functions/tokenEncryption';

export const getCompanyTimezone = () => {
  try {
    const tenantData = getTenantData();
    return tenantData?.company_timezone || tenantData?.time_zone || 'UTC';
  } catch {
    return 'UTC';
  }
};

const resolveTimezone = (timezone) => timezone || getCompanyTimezone();

/**
 * Format date with timezone support
 */
export const formatDate = (date, options = {}, timezone = null) => {
  if (!date) return 'N/A';

  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return 'N/A';

    const targetTimezone = resolveTimezone(timezone);

    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      ...options,
    };

    return dateObj
      .toLocaleString('en-GB', {
        ...defaultOptions,
        timeZone: targetTimezone,
      })
      .replace(',', '');
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'N/A';
  }
};

/**
 * Format date only (no time) with timezone support
 */
export const formatDateOnly = (date, options = {}, timezone = null) => {
  if (!date) return 'N/A';

  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return 'N/A';

    const targetTimezone = resolveTimezone(timezone);

    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      ...options,
    };

    return dateObj.toLocaleDateString('en-GB', {
      ...defaultOptions,
      timeZone: targetTimezone,
    });
  } catch (error) {
    console.error('Error formatting date only:', error);
    return 'N/A';
  }
};

/**
 * Format time only (no date) with timezone support
 */
export const formatTimeOnly = (date, options = {}, timezone = null) => {
  if (!date) return 'N/A';

  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return 'N/A';

    const targetTimezone = resolveTimezone(timezone);

    const defaultOptions = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      ...options,
    };

    return dateObj.toLocaleTimeString('en-GB', {
      ...defaultOptions,
      timeZone: targetTimezone,
    });
  } catch (error) {
    console.error('Error formatting time only:', error);
    return 'N/A';
  }
};

/**
 * Format date with weekday and timezone support
 */
export const formatDateWithWeekday = (date, options = {}, timezone = null) => {
  if (!date) return 'N/A';

  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return 'N/A';

    const targetTimezone = resolveTimezone(timezone);

    const defaultOptions = {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      ...options,
    };

    return dateObj
      .toLocaleString('en-GB', {
        ...defaultOptions,
        timeZone: targetTimezone,
      })
      .replace(',', '');
  } catch (error) {
    console.error('Error formatting date with weekday:', error);
    return 'N/A';
  }
};

/**
 * YYYY-MM-DD for the given instant in company timezone (date inputs, API filters)
 */
export const getDateStringInTimezone = (date = new Date(), timezone = null) => {
  const targetTimezone = resolveTimezone(timezone);
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: targetTimezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
};

/**
 * Hour and minute strings (24h) for the given instant in company timezone
 */
export const getTimePartsInTimezone = (date = new Date(), timezone = null) => {
  const targetTimezone = resolveTimezone(timezone);
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: targetTimezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date);

  return {
    hour: parts.find((p) => p.type === 'hour')?.value ?? '00',
    minute: parts.find((p) => p.type === 'minute')?.value ?? '00',
  };
};

/**
 * React hook for timezone-aware date formatting
 */
export const useTimezoneFormatting = () => {
  const { timezone } = useTimezone();

  const withFallback = (value, fallback = '-') =>
    !value || value === 'N/A' ? fallback : value;

  return {
    formatDate: (date, options = {}) => formatDate(date, options, timezone),
    formatDateOnly: (date, options = {}) => formatDateOnly(date, options, timezone),
    formatTimeOnly: (date, options = {}) => formatTimeOnly(date, options, timezone),
    formatDateWithWeekday: (date, options = {}) =>
      formatDateWithWeekday(date, options, timezone),
    formatDateOr: (date, fallback = '-') =>
      withFallback(formatDateWithWeekday(date), fallback),
    formatDateOnlyOr: (date, fallback = '-') =>
      withFallback(formatDateOnly(date), fallback),
    formatTimeOr: (date, fallback = '-') =>
      withFallback(formatTimeOnly(date), fallback),
    getTodayDateString: () => getDateStringInTimezone(new Date(), timezone),
    getTimeParts: (date = new Date()) => getTimePartsInTimezone(date, timezone),
    currentTimezone: timezone,
  };
};

/**
 * Get current time in company timezone
 */
export const getCurrentTimeInTimezone = (timezone = null) => {
  const targetTimezone = resolveTimezone(timezone);
  return new Date(new Date().toLocaleString('en-US', { timeZone: targetTimezone }));
};

/**
 * Convert date from one timezone to another
 */
export const convertTimezone = (date, fromTimezone, toTimezone) => {
  if (!date) return null;

  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return null;

    const formatted = dateObj.toLocaleString('en-US', {
      timeZone: fromTimezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });

    return new Date(`${formatted} ${toTimezone}`);
  } catch (error) {
    console.error('Error converting timezone:', error);
    return date;
  }
};
