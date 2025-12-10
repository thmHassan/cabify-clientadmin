import { CREATE_DISPATCHER, DELETE_DISPATCHER, EDIT_DISPATCHER } from "../constants/api.route.constant";
import { METHOD_GET, METHOD_POST } from "../constants/method.constant";
import { replaceSlash } from "../utils/functions/common.function";
import ApiService from "./ApiService";

export async function apiCreateDispatcher(data) {
    const isFormData = data instanceof FormData;

    return ApiService.fetchData({
        url: CREATE_DISPATCHER,
        method: METHOD_POST,
        data,
        ...(isFormData && {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }),
    });
}


// export async function apiGetSubCompanyById(params) {
//     return ApiService.fetchData({
//         url: params
//             ? replaceSlash(params, GET_SUB_COMPANY_BY_ID)
//             : GET_SUB_COMPANY_BY_ID,
//         method: METHOD_GET,
//     });
// }

export async function apiDeleteDispatcher(id) {
    return ApiService.fetchData({
        url: `${DELETE_DISPATCHER}?id=${id}`,
        method: METHOD_GET,
    });
}

export async function apiEditDispatcher(data) {
    const isFormData = data instanceof FormData;
    let dispatcherId = null;
    
    if (isFormData) {
        dispatcherId = data.get('id');
    }

    return ApiService.fetchData({
        url: dispatcherId ? `${EDIT_DISPATCHER}?id=${dispatcherId}` : EDIT,
        method: METHOD_POST,
        data,
        ...(isFormData && {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }),
    });
}

