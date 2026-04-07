import {
  GET_CARD_REVENUE,
  GET_REVENUE_HISTORY,
} from "../constants/api.route.constant";
import { METHOD_GET, METHOD_POST } from "../constants/method.constant";
import ApiService from "./ApiService";
import socketApi from "./SocketApiService";

export async function apiGetRevenueCard(params) {
  try {
    return ApiService.fetchData({
      url: GET_CARD_REVENUE,
      method: METHOD_GET,
      params,
    });
  } catch (error) {
    console.log("Error in API call:", error);
    throw error;
  }
}

export async function apiGetRevenueHistory(params) {
  try {
    return ApiService.fetchData({
      url: GET_REVENUE_HISTORY,
      method: METHOD_GET,
      params,
    });
  } catch (error) {
    console.log("Error in API call:", error);
    throw error;
  }
}

export const apiGetDriverRidingDetails = (driverId) => {
  return socketApi.get(`/driver/${driverId}/riding-details`);
};
