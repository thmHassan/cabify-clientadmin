import { GET_VEHICLE_TYPES, CREATE_VEHICLE_TYPE, EDIT_VEHICLE_TYPE, DELETE_VEHICLE_TYPE, GET_VEHICLE_TYPE_BY_ID } from "../constants/api.route.constant";
import { METHOD_GET, METHOD_POST } from "../constants/method.constant";
import { replaceSlash } from "../utils/functions/common.function";
import ApiService from "./ApiService";

export async function apiGetVehicleTypes(params) {
    try {
        console.log("Making API call to:", GET_VEHICLE_TYPES, "with params:", params);
        return ApiService.fetchData({
            url: GET_VEHICLE_TYPES,
            method: METHOD_GET,
            params,
        });
    } catch (error) {
        console.log("Error in API call:", error);
        throw error;
    }
}

export async function apiGetVehicleTypeById(params) {
    return ApiService.fetchData({
        url: params
            ? replaceSlash(params, GET_VEHICLE_TYPE_BY_ID)
            : GET_VEHICLE_TYPE_BY_ID,
        method: METHOD_GET,
    });
}

export async function apiCreateVehicleType(data) {
    const isFormData = data instanceof FormData;

    return ApiService.fetchData({
        url: CREATE_VEHICLE_TYPE,
        method: METHOD_POST,
        data,
        ...(isFormData && {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }),
    });
}

export async function apiEditVehicleType(data) {
    const isFormData = data instanceof FormData;
    let vehicleTypeId = null;

    if (isFormData) {
        vehicleTypeId = data.get('id');
    }

    return ApiService.fetchData({
        url: vehicleTypeId ? `${EDIT_VEHICLE_TYPE}?id=${vehicleTypeId}` : EDIT_VEHICLE_TYPE,
        method: METHOD_POST,
        data,
        ...(isFormData && {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }),
    });
}

export async function apiDeleteVehicleType(id) {
    return ApiService.fetchData({
        url: `${DELETE_VEHICLE_TYPE}?id=${id}`,
        method: METHOD_GET,
    });
}