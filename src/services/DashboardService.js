import { GET_DASHBOARD_DETAILS } from "../constants/api.route.constant";
import { METHOD_GET, METHOD_POST } from "../constants/method.constant";
import ApiService from "./ApiService";

export async function apiGetDashboardDetails(params) {
    try {
        
        return ApiService.fetchData({
            url: GET_DASHBOARD_DETAILS,
            method: METHOD_POST,
            params,
        });
    } catch (error) {
        console.log("Error in API call:", error);
        throw error;
    }
}