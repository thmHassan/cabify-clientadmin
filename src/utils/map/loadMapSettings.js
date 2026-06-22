import { apiGetCompanyApiKeys } from "../../services/SettingsConfigurationServices";
import { apiGetThirdPartyInformation } from "../../services/SettingsConfigurationServices";
import { apiGetMapInformation } from "../../services/MapService";
import { getTenantData } from "../functions/tokenEncryption";
import {
  isTruthyFlag,
  mergeMapSettingsFromSources,
  normalizeMapsApi,
  resolveMapProvider,
} from "./resolveMapProvider";

export const extractMapSettings = (response) =>
  response?.data?.settings ||
  response?.data?.data ||
  response?.data ||
  {};

async function fetchThirdPartySettings() {
  try {
    const res = await apiGetThirdPartyInformation();
    if (res?.data?.success === 1) {
      return {
        settings: extractMapSettings(res),
        fromFallback: false,
        error: null,
      };
    }
  } catch (error) {
    const status = error?.response?.status ?? error?.status;
    if (status && status !== 503) {
      console.warn("third-party-information failed:", status);
    }
  }

  try {
    const fallback = await apiGetMapInformation();
    if (fallback?.data?.success === 1) {
      return {
        settings: extractMapSettings(fallback),
        fromFallback: true,
        error: null,
      };
    }
  } catch (error) {
    console.error("map-information fallback failed:", error);
  }

  return {
    settings: {},
    fromFallback: false,
    error: "Unable to load map configuration",
  };
}

async function fetchCompanyApiKeys() {
  try {
    const keysRes = await apiGetCompanyApiKeys();
    if (keysRes?.data?.success === 1) {
      return keysRes.data.data || keysRes.data || {};
    }
  } catch (error) {
    console.error("Failed to load company API keys:", error);
  }
  return {};
}

let inflightPromise = null;
let requestGeneration = 0;

/**
 * Loads map settings with parallel API calls and in-flight deduplication.
 * Pass force: true to bypass a pending request (e.g. explicit refresh).
 */
export async function loadMapSettings({ force = false } = {}) {
  if (!force && inflightPromise) {
    return inflightPromise;
  }

  const generation = ++requestGeneration;

  const currentFetch = (async () => {
    const tenant = getTenantData();

    const [thirdPartyResult, apiKeysData] = await Promise.all([
      fetchThirdPartySettings(),
      fetchCompanyApiKeys(),
    ]);

    const { settings, fromFallback, error: configError } = thirdPartyResult;
    const countryOfUse =
      apiKeysData.country_of_use || tenant?.country_of_use || "";

    const mergedSettings = mergeMapSettingsFromSources({
      settings,
      apiKeysData,
      tenant,
    });

    const resolved = resolveMapProvider({
      settings: mergedSettings,
      apiKeysData,
    });
    const provider = resolved.provider || "mapify";
    const mapsApi = normalizeMapsApi(mergedSettings.maps_api) || provider;

    const searchApi =
      provider === "google" && resolved.googleKey
        ? String(apiKeysData.search_api || "google").toLowerCase()
        : provider === "barikoi"
          ? String(apiKeysData.search_api || "barikoi").toLowerCase()
          : "mapify";

    return {
      generation,
      provider,
      mapsApi,
      googleKey: resolved.googleKey || null,
      barikoiKey: resolved.barikoiKey || null,
      countryOfUse: String(countryOfUse || "").trim().toUpperCase(),
      searchApi,
      configError: provider ? null : configError || "No map provider configured",
      settings: mergedSettings,
      apiKeysData,
      mapConfigSource: fromFallback
        ? "map-information"
        : "third-party-information",
    };
  })();

  inflightPromise = currentFetch;

  try {
    return await currentFetch;
  } finally {
    if (inflightPromise === currentFetch) {
      inflightPromise = null;
    }
  }
}

export function buildIntegrationFormState(settings = {}, tenant = {}) {
  const merged = mergeMapSettingsFromSources({ settings, tenant });

  return {
    maps_api: merged.maps_api || "",
    google_api_keys: merged.google_api_keys || "",
    barikoi_api_keys: merged.barikoi_api_keys || "",
    map_settings: settings.map_settings || "",
    map_type: settings.map_type || "default",
    map_provider: settings.map_provider || "mapify",
    uses_mapify:
      settings.uses_mapify !== undefined
        ? isTruthyFlag(settings.uses_mapify)
        : true,
    uses_google_map: isTruthyFlag(settings.uses_google_map),
    google_api_key_configured: isTruthyFlag(settings.google_api_key_configured),
    mail_server: settings.mail_server || "",
    mail_from: settings.mail_from || "",
    mail_user_name: settings.mail_user_name || "",
    mail_password: settings.mail_password || "",
    mail_port: settings.mail_port || "",
    tls_ssl_version: settings.tls_ssl_version || "TLSv1_2",
    tls_ssl_enabled:
      settings.tls_ssl_enabled !== undefined ? settings.tls_ssl_enabled : true,
    smtp_type: settings.mail_server ? "custom" : "default",
  };
}
