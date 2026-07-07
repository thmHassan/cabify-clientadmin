import {
  FINANCE_ACCOUNTS,
  FINANCE_DRIVERS,
  FINANCE_PACKAGES,
  FINANCE_PAYMENTS,
  FINANCE_RIDES,
  FINANCE_SETTLEMENTS,
  FINANCE_STATEMENTS,
  FINANCE_SUMMARY,
} from "../constants/api.route.constant";
import { METHOD_GET, METHOD_POST } from "../constants/method.constant";
import ApiService from "./ApiService";

const get = (url, params) => ApiService.fetchData({ url, method: METHOD_GET, params });
const post = (url, data) => ApiService.fetchData({ url, method: METHOD_POST, data });

export const apiGetFinanceSummary = (params) => get(FINANCE_SUMMARY, params);
export const apiGetFinanceAccounts = (params) => get(FINANCE_ACCOUNTS, params);
export const apiCreateFinanceAccount = (data) => post(FINANCE_ACCOUNTS, data);
export const apiUpdateFinanceAccount = (id, data) => post(`${FINANCE_ACCOUNTS}/${id}`, data);
export const apiGetFinanceAccountLedger = (id, params) => get(`${FINANCE_ACCOUNTS}/${id}/ledger`, params);
export const apiGetFinancePayments = (params) => get(FINANCE_PAYMENTS, params);
export const apiPostFinancePayment = (data) => post(FINANCE_PAYMENTS, data);
export const apiGetFinanceRides = (params) => get(FINANCE_RIDES, params);
export const apiGetFinanceDrivers = (params) => get(FINANCE_DRIVERS, params);
export const apiGetFinanceDriver = (id, params) => get(`${FINANCE_DRIVERS}/${id}`, params);
export const apiGetFinancePackages = (params) => get(FINANCE_PACKAGES, params);
export const apiGetFinanceStatements = (params) => get(FINANCE_STATEMENTS, params);
export const apiGetFinanceStatement = (id) => get(`${FINANCE_STATEMENTS}/${id}`);
export const apiCreateFinanceStatement = (data) => post(FINANCE_STATEMENTS, data);
export const apiSendFinanceStatement = (id) => post(`${FINANCE_STATEMENTS}/${id}/send`, {});
export const apiCollectFinanceStatement = (id, data) => post(`${FINANCE_STATEMENTS}/${id}/collect`, data);
export const apiVoidFinanceStatement = (id) => post(`${FINANCE_STATEMENTS}/${id}/void`, {});
export const apiGetFinanceSettlements = (params) => get(FINANCE_SETTLEMENTS, params);
export const apiGetFinanceSettlement = (id) => get(`${FINANCE_SETTLEMENTS}/${id}`);
export const apiCreateFinanceSettlement = (data) => post(FINANCE_SETTLEMENTS, data);
export const apiMarkFinanceSettlementSettled = (id, data) => post(`${FINANCE_SETTLEMENTS}/${id}/mark-settled`, data);
export const apiVoidFinanceSettlement = (id) => post(`${FINANCE_SETTLEMENTS}/${id}/void`, {});
