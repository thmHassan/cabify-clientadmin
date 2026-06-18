export const hasValidGoogleKey = (key) => {
  if (!key || typeof key !== "string") return false;
  return key.trim().length > 0;
};

export const getGoogleApiKey = (settings = {}) =>
  settings.google_api_keys || settings.google_api_key || "";

/** True when backend (or local settings) indicate Mapify is the active map provider. */
export const isMapifyMapProvider = (settings = {}) => {
  if (settings.uses_google_map === true || settings.google_api_key_configured === true) {
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

  if (settings.uses_mapify === true) {
    return true;
  }

  const mapProvider = String(settings.map_provider || "").trim().toLowerCase();
  if (mapProvider === "mapify") {
    return true;
  }

  return mapType === "default" || !mapType;
};

export const resolveMapProvider = ({ settings = {} } = {}) => {
  if (isMapifyMapProvider(settings)) {
    return { provider: "mapify" };
  }

  const googleKey = getGoogleApiKey(settings);

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
