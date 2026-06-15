import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  DEFAULT_CURRENCY,
  formatAmountValue,
  formatCurrency,
  getCompanyCurrency,
  getCurrencySymbol,
} from '../utils/currencyUtils';
import { getTenantData, storeTenantData } from '../utils/functions/tokenEncryption';

const CurrencyContext = createContext();

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(DEFAULT_CURRENCY);

  useEffect(() => {
    setCurrency(getCompanyCurrency());
  }, []);

  const currencySymbol = useMemo(() => getCurrencySymbol(currency), [currency]);

  const updateCurrency = useCallback((newCurrency) => {
    if (!newCurrency) return;

    setCurrency(newCurrency);

    const tenantData = getTenantData() || {};
    storeTenantData({
      ...tenantData,
      currency: newCurrency,
    });
  }, []);

  const formatAmount = useCallback(
    (amount, fallback = '-') => formatAmountValue(amount, fallback),
    []
  );

  const formatWithCurrency = useCallback(
    (amount, fallback = '-') => formatCurrency(amount, currency, fallback),
    [currency]
  );

  const value = {
    currency,
    currencySymbol,
    updateCurrency,
    formatAmount,
    formatWithCurrency,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

export default CurrencyContext;
