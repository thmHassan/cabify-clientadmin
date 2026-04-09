import { useTimezone } from '../contexts/TimezoneContext';

/**
 * Format date with timezone support
 * @param {string|Date} date - Date to format
 * @param {object} options - Formatting options
 * @param {string} timezone - Timezone to use (optional, defaults to company timezone)
 * @returns {string} - Formatted date string
 */
export const formatDate = (date, options = {}, timezone = null) => {
  if (!date) return 'N/A';
  
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return 'N/A';
    
    // Get timezone from context if not provided
    const targetTimezone = timezone || 'UTC';
    
    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      ...options
    };
    
    return dateObj.toLocaleString('en-GB', {
      ...defaultOptions,
      timeZone: targetTimezone
    }).replace(',', '');
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'N/A';
  }
};

/**
 * Format date only (no time) with timezone support
 * @param {string|Date} date - Date to format
 * @param {object} options - Formatting options
 * @param {string} timezone - Timezone to use (optional)
 * @returns {string} - Formatted date string
 */
export const formatDateOnly = (date, options = {}, timezone = null) => {
  if (!date) return 'N/A';
  
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return 'N/A';
    
    const targetTimezone = timezone || 'UTC';
    
    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      ...options
    };
    
    return dateObj.toLocaleDateString('en-GB', {
      ...defaultOptions,
      timeZone: targetTimezone
    });
  } catch (error) {
    console.error('Error formatting date only:', error);
    return 'N/A';
  }
};

/**
 * Format time only (no date) with timezone support
 * @param {string|Date} date - Date to format
 * @param {object} options - Formatting options
 * @param {string} timezone - Timezone to use (optional)
 * @returns {string} - Formatted time string
 */
export const formatTimeOnly = (date, options = {}, timezone = null) => {
  if (!date) return 'N/A';
  
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return 'N/A';
    
    const targetTimezone = timezone || 'UTC';
    
    const defaultOptions = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      ...options
    };
    
    return dateObj.toLocaleTimeString('en-GB', {
      ...defaultOptions,
      timeZone: targetTimezone
    });
  } catch (error) {
    console.error('Error formatting time only:', error);
    return 'N/A';
  }
};

/**
 * Format date with weekday and timezone support
 * @param {string|Date} date - Date to format
 * @param {object} options - Formatting options
 * @param {string} timezone - Timezone to use (optional)
 * @returns {string} - Formatted date string with weekday
 */
export const formatDateWithWeekday = (date, options = {}, timezone = null) => {
  if (!date) return 'N/A';
  
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return 'N/A';
    
    const targetTimezone = timezone || 'UTC';
    
    const defaultOptions = {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      ...options
    };
    
    return dateObj.toLocaleString('en-GB', {
      ...defaultOptions,
      timeZone: targetTimezone
    }).replace(',', '');
  } catch (error) {
    console.error('Error formatting date with weekday:', error);
    return 'N/A';
  }
};

/**
 * React hook for timezone-aware date formatting
 * @returns {object} - Formatting functions with company timezone applied
 */
export const useTimezoneFormatting = () => {
  const { timezone } = useTimezone();
  
  return {
    formatDate: (date, options = {}) => formatDate(date, options, timezone),
    formatDateOnly: (date, options = {}) => formatDateOnly(date, options, timezone),
    formatTimeOnly: (date, options = {}) => formatTimeOnly(date, options, timezone),
    formatDateWithWeekday: (date, options = {}) => formatDateWithWeekday(date, options, timezone),
    currentTimezone: timezone
  };
};

/**
 * Get current time in company timezone
 * @param {string} timezone - Timezone to use (optional)
 * @returns {Date} - Current date in company timezone
 */
export const getCurrentTimeInTimezone = (timezone = null) => {
  const targetTimezone = timezone || 'UTC';
  return new Date(new Date().toLocaleString("en-US", { timeZone: targetTimezone }));
};

/**
 * Convert date from one timezone to another
 * @param {string|Date} date - Date to convert
 * @param {string} fromTimezone - Source timezone
 * @param {string} toTimezone - Target timezone
 * @returns {Date} - Converted date
 */
export const convertTimezone = (date, fromTimezone, toTimezone) => {
  if (!date) return null;
  
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return null;
    
    // Format in source timezone and parse in target timezone
    const formatted = dateObj.toLocaleString('en-US', { 
      timeZone: fromTimezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    
    return new Date(formatted + ' ' + toTimezone);
  } catch (error) {
    console.error('Error converting timezone:', error);
    return date;
  }
};
