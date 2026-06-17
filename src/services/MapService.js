import {
  GET_MAP_INFORMATION,
  GET_MAPIFY_GEOCODING,
  GET_MAPIFY_SEARCH,
  GET_MAPIFY_TILES_BRIGHT,
} from "../constants/api.route.constant";
import { METHOD_GET } from "../constants/method.constant";
import ApiService from "./ApiService";

export async function apiGetMapInformation() {
  return ApiService.fetchData({
    url: GET_MAP_INFORMATION,
    method: METHOD_GET,
    headers: { Accept: "application/json" },
  });
}

export async function apiGetMapifyTilesBright() {
  return ApiService.fetchData({
    url: GET_MAPIFY_TILES_BRIGHT,
    method: METHOD_GET,
    headers: { Accept: "application/json" },
  });
}

export async function apiGetMapifyGeocoding(params, signal) {
  return ApiService.fetchData({
    url: GET_MAPIFY_GEOCODING,
    method: METHOD_GET,
    params,
    headers: { Accept: "application/json" },
    signal,
  });
}

export async function apiGetMapifySearch(params, signal) {
  return ApiService.fetchData({
    url: GET_MAPIFY_SEARCH,
    method: METHOD_GET,
    params,
    headers: { Accept: "application/json" },
    signal,
  });
}
