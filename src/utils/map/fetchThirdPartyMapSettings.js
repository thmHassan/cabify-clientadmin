import { apiGetThirdPartyInformation } from "../../services/SettingsConfigurationServices";
import { apiGetMapInformation } from "../../services/MapService";

export const extractMapSettings = (response) =>
  response?.data?.settings ||
  response?.data?.data ||
  response?.data ||
  {};

export async function fetchThirdPartyMapSettings() {
  try {
    const res = await apiGetThirdPartyInformation();
    if (res?.data?.success === 1) {
      return { settings: extractMapSettings(res), fromFallback: false, error: null };
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
