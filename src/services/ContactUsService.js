import { METHOD_GET, METHOD_POST } from "../constants/method.constant";
import { GET_CONTACT_US, GET_CONTACT_US_LIST, POST_CONTACT_US_RESPONSE } from "../constants/api.route.constant";
import ApiService from "./ApiService";

export async function apiGetContactUsList(params = {}) {
    return ApiService.fetchData({
        url: GET_CONTACT_US_LIST,
        method: METHOD_GET,
        params,
    });
}

export async function apiGetContactUsById(params) {
    return ApiService.fetchData({
        url: GET_CONTACT_US,
        method: METHOD_GET,
        params,
    });
}

export async function apiPostContactUsResponse(data) {
    return ApiService.fetchData({
        url: POST_CONTACT_US_RESPONSE,
        method: METHOD_POST,
        data,
        headers: {
            "Content-Type": "application/json",
        },
    });
}
