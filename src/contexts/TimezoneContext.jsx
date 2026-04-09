import React, { createContext, useContext, useState, useEffect } from 'react';
import { getTenantData, storeTenantData } from '../utils/functions/tokenEncryption';

const TimezoneContext = createContext();

export const useTimezone = () => {
  const context = useContext(TimezoneContext);
  if (!context) {
    throw new Error('useTimezone must be used within a TimezoneProvider');
  }
  return context;
};

export const TimezoneProvider = ({ children }) => {
  const [timezone, setTimezone] = useState('UTC');
  const [loading, setLoading] = useState(true);

  // Initialize timezone from tenant data
  useEffect(() => {
    const initializeTimezone = () => {
      try {
        const tenantData = getTenantData();
        const companyTimezone = tenantData?.company_timezone || tenantData?.time_zone || 'UTC';
        setTimezone(companyTimezone);
      } catch (error) {
        console.error('Error initializing timezone:', error);
        setTimezone('UTC');
      } finally {
        setLoading(false);
      }
    };

    initializeTimezone();
  }, []);

  // Update timezone when company profile changes
  const updateTimezone = (newTimezone) => {
    try {
      if (newTimezone && newTimezone !== timezone) {
        setTimezone(newTimezone);
        
        // Update tenant data with new timezone
        const tenantData = getTenantData() || {};
        const updatedTenantData = {
          ...tenantData,
          company_timezone: newTimezone,
          time_zone: newTimezone // Keep both for compatibility
        };
        storeTenantData(updatedTenantData);
      }
    } catch (error) {
      console.error('Error updating timezone:', error);
    }
  };

  const value = {
    timezone,
    updateTimezone,
    loading
  };

  return (
    <TimezoneContext.Provider value={value}>
      {children}
    </TimezoneContext.Provider>
  );
};

export default TimezoneContext;
