export {
  isMapifyRequestCanceled,
  extractMapifyFeatures,
  normalizeMapifyFeatures,
  searchWithMapify,
  geocodeWithMapify,
  autocompleteWithMapify,
  addressToCoordinatesMapify,
  reverseGeocodeWithMapify,
} from "./mapifyPlaces";

// Backward-compatible alias used by older imports
export { normalizeMapifyFeatures as normalizeGeocodingFeatures } from "./mapifyPlaces";
