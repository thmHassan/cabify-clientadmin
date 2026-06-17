import { apiGetMapifyTilesBright } from "../../services/MapService";
import { buildOsmFallbackStyle } from "./osmFallbackStyle";

export async function fetchMapifyStyle() {
  try {
    const response = await apiGetMapifyTilesBright();
    const style = response?.data?.data || response?.data;

    if (style?.version && Array.isArray(style?.layers)) {
      return style;
    }

    console.warn("Invalid Mapify style response, using OSM fallback");
    return buildOsmFallbackStyle();
  } catch (error) {
    console.error("Failed to fetch Mapify tiles:", error);
    return buildOsmFallbackStyle();
  }
}
