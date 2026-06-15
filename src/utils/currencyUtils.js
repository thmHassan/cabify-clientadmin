import { getTenantData } from './functions/tokenEncryption';

export const DEFAULT_CURRENCY = 'INR';

export const CURRENCY_SYMBOLS = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  AUD: 'A$',
  CAD: 'C$',
  AED: 'د.إ',
};

export const getCompanyCurrency = () => {
  try {
    const tenantData = getTenantData();
    return tenantData?.currency || DEFAULT_CURRENCY;
  } catch {
    return DEFAULT_CURRENCY;
  }
};

export const getCurrencySymbol = (currencyCode = null) => {
  const code = currencyCode || getCompanyCurrency();
  return CURRENCY_SYMBOLS[code] || code;
};

export const formatAmountValue = (amount, fallback = '-') => {
  if (amount === null || amount === undefined || amount === '') return fallback;
  return Number(amount).toFixed(2);
};

export const formatCurrency = (amount, currencyCode = null, fallback = '-') => {
  if (amount === null || amount === undefined || amount === '') return fallback;
  const symbol = getCurrencySymbol(currencyCode);
  return `${symbol} ${Number(amount).toFixed(2)}`;
};
