
import { CREATE_PACKAGE_TOPUP, DELETE_PACKAGE_TOPUPS, EDIT_PACKAGE_TOPUP, GATE_DISPATCH_SYSTEM, GATE_INVOICE_HISTORY, GATE_PLAN_DETAILS, GATE_STRIPE_INFORMATION, GET_COMMISSION, GET_COMPANY_PROFILE, GET_MOBILE_APP_SETTINGS, GET_THIRD_PARTY_INFORMATION, MATCH_PASSWORD, SAVE_COMMISSION, SAVE_COMPANY_PROFILE, SAVE_DISPATCH_SYSTEM, SAVE_MOBILE_APP_SETTINGS, SAVE_STRIPE_INFORMATION, SAVE_THIRD_PARTY_INFORMATION, UPDATE_PASWORD } from "../constants/api.route.constant";
import { METHOD_GET, METHOD_POST } from "../constants/method.constant";
import ApiService from "./ApiService";

export async function apiSaveCompanyProfile(data) {
    const isFormData = data instanceof FormData;

    return ApiService.fetchData({
        url: SAVE_COMPANY_PROFILE,
        method: METHOD_POST,
        data,
        ...(isFormData && {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }),
    });
}

export async function apiGetCompanyProfile() {
    try {
        console.log("Making API call to:", GET_COMPANY_PROFILE, "with params:");
        return ApiService.fetchData({
            url: GET_COMPANY_PROFILE,
            method: METHOD_GET,

        });
    } catch (error) {
        console.log("Error in API call:", error);
        throw error;
    }
}

export async function apiSaveUpdatePassword(data) {
    const isFormData = data instanceof FormData;

    return ApiService.fetchData({
        url: UPDATE_PASWORD,
        method: METHOD_POST,
        data,
        ...(isFormData && {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }),
    });
}

export async function apiSaveMobileAppSetting(data) {
    const isFormData = data instanceof FormData;

    return ApiService.fetchData({
        url: SAVE_MOBILE_APP_SETTINGS,
        method: METHOD_POST,
        data,
        ...(isFormData && {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }),
    });
}

export async function apiGetMobileAppSetting() {
    try {
        console.log("Making API call to:", GET_MOBILE_APP_SETTINGS, "with params:");
        return ApiService.fetchData({
            url: GET_MOBILE_APP_SETTINGS,
            method: METHOD_GET,
        });
    } catch (error) {
        console.log("Error in API call:", error);
        throw error;
    }
}

export async function apiSaveCommissionData(data) {
    const isFormData = data instanceof FormData;

    return ApiService.fetchData({
        url: SAVE_COMMISSION,
        method: METHOD_POST,
        data,
        ...(isFormData && {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }),
    });
}

export async function apiGetCommissionData() {
    try {
        console.log("Making API call to:", GET_COMMISSION, "with params:");
        return ApiService.fetchData({
            url: GET_COMMISSION,
            method: METHOD_GET,
        });
    } catch (error) {
        console.log("Error in API call:", error);
        throw error;
    }
}

export async function apiCreatePackageToPup(data) {
    const isFormData = data instanceof FormData;

    return ApiService.fetchData({
        url: CREATE_PACKAGE_TOPUP,
        method: METHOD_POST,
        data,
        ...(isFormData && {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }),
    });
}

export async function apiDeletePackageToPup(id) {
    return ApiService.fetchData({
        url: `${DELETE_PACKAGE_TOPUPS}?id=${id}`,
        method: METHOD_GET,
    });
}

export async function apiEditPackageToPup(data) {
    const isFormData = data instanceof FormData;
    let plotId = null;

    if (isFormData) {
        plotId = data.get('id');
    }

    return ApiService.fetchData({
        url: plotId ? `${EDIT_PACKAGE_TOPUP}?id=${plotId}` : EDIT,
        method: METHOD_POST,
        data,
        ...(isFormData && {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }),
    });
}

export async function apiSaveThirdPartyInformation(data) {
    const isFormData = data instanceof FormData;

    return ApiService.fetchData({
        url: SAVE_THIRD_PARTY_INFORMATION,
        method: METHOD_POST,
        data,
        ...(isFormData && {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }),
    });
}

export async function apiGetThirdPartyInformation() {
    try {
        return ApiService.fetchData({
            url: GET_THIRD_PARTY_INFORMATION,
            method: METHOD_GET,

        });
    } catch (error) {
        console.log("Error in API call:", error);
        throw error;
    }
}

export async function apiGetPlanDetails() {
    try {
        return ApiService.fetchData({
            url: GATE_PLAN_DETAILS,
            method: METHOD_GET,

        });
    } catch (error) {
        console.log("Error in API call:", error);
        throw error;
    }
}

export async function apiGetInvoiceHistory() {
    try {
        return ApiService.fetchData({
            url: GATE_INVOICE_HISTORY,
            method: METHOD_GET,

        });
    } catch (error) {
        console.log("Error in API call:", error);
        throw error;
    }
}

export async function apiSaveStripeInformation(data) {
    const isFormData = data instanceof FormData;

    return ApiService.fetchData({
        url: SAVE_STRIPE_INFORMATION,
        method: METHOD_POST,
        data,
        ...(isFormData && {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }),
    });
}

export async function apiGetStripeInformation() {
    try {
        return ApiService.fetchData({
            url: GATE_STRIPE_INFORMATION,
            method: METHOD_GET,

        });
    } catch (error) {
        console.log("Error in API call:", error);
        throw error;
    }
}

export async function apiSavePassword(data) {
    const isFormData = data instanceof FormData;

    return ApiService.fetchData({
        url: MATCH_PASSWORD,
        method: METHOD_POST,
        data,
        ...(isFormData && {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }),
    });
}

export async function apiSaveDispatchSystem(data) {
    const isFormData = data instanceof FormData;

    return ApiService.fetchData({
        url: SAVE_DISPATCH_SYSTEM,
        method: METHOD_POST,
        data,
        ...(isFormData && {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }),
    });
}

export async function apiGetDispatchSystem() {
    try {
        return ApiService.fetchData({
            url: GATE_DISPATCH_SYSTEM,
            method: METHOD_GET,

        });
    } catch (error) {
        console.log("Error in API call:", error);
        throw error;
    }
}