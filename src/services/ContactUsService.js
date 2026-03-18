import socketApi from "./SocketApiService";

export async function apiGetContactUs(params = {}) {
    return socketApi.get(`/contact-us`, { params });
}