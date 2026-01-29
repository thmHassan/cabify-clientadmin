import { GET_DOCUMENT_REQUESTS } from "../constants/api.route.constant";
import { METHOD_GET } from "../constants/method.constant";
import { replaceSlash } from "../utils/functions/common.function";
import ApiService from "./ApiService";


export async function apiGetDocumentRequests(params) {
    try {
        return ApiService.fetchData({
            url: params ? replaceSlash(params, GET_DOCUMENT_REQUESTS) : GET_DOCUMENT_REQUESTS,
            method: METHOD_GET,
        });
    } catch (error) {
        console.log("Error fetching document types:", error);
        throw error;
    }
}