import { loadMapSettings } from "./loadMapSettings";

export { extractMapSettings } from "./loadMapSettings";

export async function fetchThirdPartyMapSettings() {
  const result = await loadMapSettings();

  return {
    settings: result.settings,
    fromFallback: result.mapConfigSource === "map-information",
    error: result.configError,
  };
}
