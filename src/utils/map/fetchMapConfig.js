import { loadMapSettings } from "./loadMapSettings";

export async function fetchMapConfig(options) {
  return loadMapSettings(options);
}
