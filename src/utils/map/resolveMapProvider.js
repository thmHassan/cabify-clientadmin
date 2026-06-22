export const hasValidGoogleKey = (key) => {
  if (!key || typeof key !== "string") return false;
  return key.trim().length > 0;
};

export const isTruthyFlag = (value) =>
  value === true || value === 1 || value === "1";

/** Company-level maps_api from super-admin; legacy barikoi is treated as mapify. */
export const normalizeMapsApi = (value) => {
  const val = String(value || "").trim().toLowerCase();
  if (val === "barikoi" || val === "mapify") return "mapify";
  if (val === "google") return "google";
  return "";
};

export const getGoogleApiKey = (settings = {}, apiKeysData = {}) =>
  settings.google_api_keys ||
  settings.google_api_key ||
  apiKeysData.google_api_key ||
  "";

export const mergeMapSettingsFromSources = ({
  settings = {},
  apiKeysData = {},
  tenant = {},
} = {}) => {
  const mapsApi = normalizeMapsApi(
    apiKeysData.maps_api || settings.maps_api || tenant.maps_api
  );

  return {
    ...settings,
    ...(mapsApi ? { maps_api: mapsApi } : {}),
    google_api_keys: getGoogleApiKey(settings, apiKeysData),
    barikoi_api_keys:
      settings.barikoi_api_keys || apiKeysData.barikoi_api_key || "",
  };
};

/** True when backend (or local settings) indicate Mapify is the active map provider. */
export const isMapifyMapProvider = (settings = {}) => {
  const mapsApi = normalizeMapsApi(settings.maps_api);
  if (mapsApi === "mapify") {
    return true;
  }
  if (mapsApi === "google") {
    return false;
  }

  const mapProvider = String(settings.map_provider || "").trim().toLowerCase();

  if (mapProvider === "mapify") {
    return true;
  }
  if (mapProvider === "google") {
    return false;
  }

  if (isTruthyFlag(settings.uses_mapify)) {
    return true;
  }
  if (isTruthyFlag(settings.uses_google_map)) {
    return false;
  }

  if (isTruthyFlag(settings.google_api_key_configured)) {
    return false;
  }

  if (hasValidGoogleKey(getGoogleApiKey(settings))) {
    return false;
  }

  const mapType = String(settings.map_type || "").trim().toLowerCase();
  const barikoiKey = settings.barikoi_api_keys || "";
  if (mapType === "barikoi" && barikoiKey?.trim()) {
    return false;
  }

  return mapType === "default" || !mapType;
};

export const resolveMapProvider = ({
  settings = {},
  apiKeysData = {},
} = {}) => {
  const mapsApi = normalizeMapsApi(settings.maps_api || apiKeysData.maps_api);

  if (mapsApi === "mapify") {
    return { provider: "mapify" };
  }

  if (mapsApi === "google") {
    const googleKey = getGoogleApiKey(settings, apiKeysData);
    return {
      provider: "google",
      googleKey: hasValidGoogleKey(googleKey) ? googleKey.trim() : null,
    };
  }

  if (isMapifyMapProvider(settings)) {
    return { provider: "mapify" };
  }

  const googleKey = getGoogleApiKey(settings, apiKeysData);

  if (hasValidGoogleKey(googleKey)) {
    return {
      provider: "google",
      googleKey: googleKey.trim(),
    };
  }

  const mapType = String(settings.map_type || "")
    .trim()
    .toLowerCase();
  const barikoiKey = settings.barikoi_api_keys || "";

  if (mapType === "barikoi" && barikoiKey?.trim()) {
    return {
      provider: "barikoi",
      barikoiKey: barikoiKey.trim(),
    };
  }

  return { provider: "mapify" };
};
