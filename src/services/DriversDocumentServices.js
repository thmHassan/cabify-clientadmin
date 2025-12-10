import { method } from "lodash";
import { METHOD_GET, METHOD_POST } from "../constants/method.constant";
import { replaceSlash } from "../utils/functions/common.function";
import ApiService from "./ApiService";
import { CREATE_DRIVERS_DOCUMENT, DELETE_DRIVERS_DOCUMENT, EDIT_DRIVERS_DOCUMENT, GET_DRIVERS_DOCUMENT, GET_DRIVERS_DOCUMENT_BY_ID, POST_EDIT_DRIVER_STATUS } from "../constants/api.route.constant";

export async function apiCreateDriveDocument(data) {
    const isFormData = data instanceof FormData;

    return ApiService.fetchData({
        url: CREATE_DRIVERS_DOCUMENT,
        method: METHOD_POST,
        data,
        ...(isFormData && {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }),
    });
}

export async function apiGetDocumentTypes(params) {
    try {
        console.log("Making API call to:", GET_DRIVERS_DOCUMENT, "with params:", params);
        return ApiService.fetchData({
            url: params ? replaceSlash(params, GET_DRIVERS_DOCUMENT) : GET_DRIVERS_DOCUMENT,
            method: METHOD_GET,
        });
    } catch (error) {
        console.log("Error fetching document types:", error);
        throw error;
    }
}


export async function apiGetDriverDocumentById(params) {
    return ApiService.fetchData({
        url: params
            ? replaceSlash(params, GET_DRIVERS_DOCUMENT_BY_ID)
            : GET_DRIVERS_DOCUMENT_BY_ID,
        method: METHOD_GET,
    });
}

export async function apiEditDriverDocument(data) {
    const isFormData = data instanceof FormData;
    let driverId = null;

    if (isFormData) {
        driverId = data.get('id');
    }

    return ApiService.fetchData({
        url: driverId ? `${EDIT_DRIVERS_DOCUMENT}?id=${driverId}` : EDIT_DRIVERS_DOCUMENT,
        method: METHOD_POST,
        data,
        ...(isFormData && {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }),
    });
}

export async function apiDeleteDriverDocument(id) {
    return ApiService.fetchData({
        url: `${DELETE_DRIVERS_DOCUMENT}?id=${id}`,
        method: METHOD_GET,
    });
}

export async function apieditDriverStatus(params) {
    return ApiService.fetchData({
        url: POST_EDIT_DRIVER_STATUS,
        method: METHOD_GET,
        params: params, 
    });
}