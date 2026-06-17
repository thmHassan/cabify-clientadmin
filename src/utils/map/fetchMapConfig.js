import { apiGetCompanyApiKeys } from "../../services/SettingsConfigurationServices";
import { getTenantData } from "../functions/tokenEncryption";
import { fetchThirdPartyMapSettings } from "./fetchThirdPartyMapSettings";
import { resolveMapProvider } from "./resolveMapProvider";

export async function fetchMapConfig() {
  const { settings, error: configError } = await fetchThirdPartyMapSettings();

  let apiKeysData = {};
  const tenant = getTenantData();
  let countryOfUse = tenant?.country_of_use || "";

  try {
    const keysRes = await apiGetCompanyApiKeys();
    if (keysRes?.data?.success === 1) {
      apiKeysData = keysRes.data.data || keysRes.data || {};
      countryOfUse = apiKeysData.country_of_use || countryOfUse;
    }
  } catch (error) {
    console.error("Failed to load company API keys:", error);
  }

  const resolved = resolveMapProvider({ settings });
  const provider = resolved.provider || "mapify";

  const searchApi =
    provider === "google" && resolved.googleKey
      ? String(apiKeysData.search_api || "google").toLowerCase()
      : provider === "barikoi"
        ? String(apiKeysData.search_api || "barikoi").toLowerCase()
        : "mapify";

  return {
    provider,
    mapsApi: provider,
    googleKey: resolved.googleKey || null,
    barikoiKey: resolved.barikoiKey || null,
    countryOfUse: String(countryOfUse || "").trim().toUpperCase(),
    searchApi,
    configError: provider ? null : configError || "No map provider configured",
    settings,
    apiKeysData,
  };
}
