import { GET_NOTIFICATION_RECIPIENTS, SEND_NOTIFICATION } from "../constants/api.route.constant";
import { METHOD_GET, METHOD_POST } from "../constants/method.constant";
import ApiService from "./ApiService";

export async function apiGetNotificationRecipients(params) {
    try {
        return ApiService.fetchData({
            url: GET_NOTIFICATION_RECIPIENTS,
            method: METHOD_GET,
            params,
        });
    } catch (error) {
        console.log("Error in API call:", error);
        throw error;
    }
}

export async function apiSendNotifiction(data) {
    const isFormData = data instanceof FormData;

    return ApiService.fetchData({
        url: SEND_NOTIFICATION,
        method: METHOD_POST,
        data,
        ...(isFormData && {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }),
    });
}
