import { CHANGE_PASSWORD, UPDATE_PROFILE } from "../constants/api.route.constant";
import { METHOD_POST } from "../constants/method.constant";
import ApiService from "./ApiService";

export async function apiChangePassword(data) {
  return ApiService.fetchData({
    url: CHANGE_PASSWORD,
    method: METHOD_POST,
    data,
  });
}

export async function apiProfileUpdate(data) {
  return ApiService.fetchData({
    url: UPDATE_PROFILE,
    method: METHOD_POST,
    data,
  });
}
