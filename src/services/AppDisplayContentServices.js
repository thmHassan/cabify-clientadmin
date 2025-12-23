import { GET_APP_CONTENT, SAVE_APP_CONTENT } from "../constants/api.route.constant";
import { METHOD_GET, METHOD_POST } from "../constants/method.constant";
import ApiService from "./ApiService";

export async function apiSaveAppDisplayContent(data) {
    const isFormData = data instanceof FormData;

    return ApiService.fetchData({
        url: SAVE_APP_CONTENT,
        method: METHOD_POST,
        data,
        ...(isFormData && {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }),
    });
}

export async function apiGetAppContent(params) {
    try {
        return ApiService.fetchData({
            url: GET_APP_CONTENT,
            method: METHOD_GET,
            params,
        });
    } catch (error) {
        console.log("Error in API call:", error);
        throw error;
    }
}