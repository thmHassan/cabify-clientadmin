import { GET_CUSTOMER_RATINGS, GET_DRIVER_RATING } from "../constants/api.route.constant";
import { METHOD_GET } from "../constants/method.constant";
import ApiService from "./ApiService";


export async function apiGetDriverRatings(params) {
    try {
        return ApiService.fetchData({
            url: GET_DRIVER_RATING,
            method: METHOD_GET,
            params,
        });
    } catch (error) {
        console.log("Error in API call:", error);
        throw error;
    }
}

export async function apiGetCustomerRatings(params) {
    try {
        return ApiService.fetchData({
            url: GET_CUSTOMER_RATINGS,
            method: METHOD_GET,
            params,
        });
    } catch (error) {
        console.log("Error in API call:", error);
        throw error;
    }
}