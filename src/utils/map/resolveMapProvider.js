export const hasValidGoogleKey = (key) => {
  if (!key || typeof key !== "string") return false;
  return key.trim().length > 0;
};

export const getGoogleApiKey = (settings = {}) =>
  settings.google_api_keys || settings.google_api_key || "";

export const resolveMapProvider = ({ settings = {} } = {}) => {
  const googleKey = getGoogleApiKey(settings);

  // Google Maps when a key is saved in Settings → Integrations
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
