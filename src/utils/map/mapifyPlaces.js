import {
  apiGetMapifyGeocoding,
  apiGetMapifySearch,
} from "../../services/MapService";
import { getCountryCenter } from "./countryCenters";

export const isMapifyRequestCanceled = (error) =>
  error?.name === "CanceledError" ||
  error?.code === "ERR_CANCELED" ||
  error?.message === "canceled";

export const getMapifyErrorMessage = (error) => {
  if (isMapifyRequestCanceled(error)) return null;
  return (
    error?.response?.data?.message ||
    error?.message ||
    "Location search failed. Please try again."
  );
};

export const extractMapifyFeatures = (response) => {
  if (!response?.data) return [];

  if (response.data.success === 0) return [];

  const data = response.data.data ?? response.data ?? {};
  if (Array.isArray(data?.features)) return data.features;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
};

export const normalizeMapifyFeatures = (features = []) =>
  features
    .map((feature, index) => {
      const coords = feature?.geometry?.coordinates;
      if (!Array.isArray(coords) || coords.length < 2) return null;

      const [lon, lat] = coords;
      const props = feature?.properties || {};

      const name = String(
        props.name || props.place_name || props.display_name || ""
      ).trim();

      const label = String(
        props.label ||
          props.address ||
          props.formatted ||
          name ||
          ""
      ).trim();

      if (!label || Number.isNaN(Number(lat)) || Number.isNaN(Number(lon))) {
        return null;
      }

      const id =
        feature.id ||
        props.id ||
        props.place_id ||
        `mapify-${lat}-${lon}-${index}`;

      return {
        id: String(id),
        lat: Number(lat),
        lon: Number(lon),
        lng: Number(lon),
        name,
        label,
        source: "mapify",
        raw: feature,
      };
    })
    .filter(Boolean);

const buildFocusParams = ({ lat, lon }) => {
  const params = {};
  if (lat != null && !Number.isNaN(Number(lat))) params.lat = Number(lat);
  if (lon != null && !Number.isNaN(Number(lon))) params.lon = Number(lon);
  return params;
};

/** GET /company/mapify-geocoding — primary autocomplete & address lookup */
export async function geocodeWithMapify({
  query,
  lat,
  lon,
  boundaryCountry,
  signal,
}) {
  if (!query?.trim()) return [];

  const response = await apiGetMapifyGeocoding(
    {
      q: query.trim(),
      boundary_country: (boundaryCountry || "").toUpperCase(),
      ...buildFocusParams({ lat, lon }),
    },
    signal
  );

  return normalizeMapifyFeatures(extractMapifyFeatures(response));
}

/** GET /company/mapify-search — legacy fallback */
export async function searchWithMapify({
  query,
  lat,
  lon,
  size = 8,
  signal,
}) {
  if (!query?.trim()) return [];

  const response = await apiGetMapifySearch(
    {
      q: query.trim(),
      size,
      ...buildFocusParams({ lat, lon }),
    },
    signal
  );

  return normalizeMapifyFeatures(extractMapifyFeatures(response));
}

/** Prefer geocoding (country filter); fall back to legacy search if empty */
export async function autocompleteWithMapify({
  query,
  lat,
  lon,
  boundaryCountry,
  signal,
}) {
  if (!query?.trim()) return [];

  const geocoded = await geocodeWithMapify({
    query,
    lat,
    lon,
    boundaryCountry,
    signal,
  });

  if (geocoded.length) return geocoded;

  return searchWithMapify({ query, lat, lon, signal });
}

export async function addressToCoordinatesMapify({
  address,
  lat,
  lon,
  boundaryCountry,
  signal,
}) {
  const results = await geocodeWithMapify({
    query: address,
    lat,
    lon,
    boundaryCountry,
    signal,
  });

  if (!results.length) return null;

  const first = results[0];
  return {
    latitude: first.lat,
    longitude: first.lon,
    label: first.label,
    name: first.name,
    id: first.id,
  };
}

export async function reverseGeocodeWithMapify({
  lat,
  lng,
  boundaryCountry,
  signal,
}) {
  const results = await geocodeWithMapify({
    query: `${lat},${lng}`,
    lat,
    lon: lng,
    boundaryCountry,
    signal,
  });

  if (!results.length) {
    return `${Number(lat).toFixed(6)}, ${Number(lng).toFixed(6)}`;
  }

  return results[0].label;
}

export const resolveMapifyFocus = ({
  countryOfUse,
  pickupCoords,
  destinationCoords,
  fieldType,
}) => {
  if (fieldType === "pickup" && destinationCoords?.lat && destinationCoords?.lng) {
    return { lat: destinationCoords.lat, lon: destinationCoords.lng };
  }
  if (fieldType === "destination" && pickupCoords?.lat && pickupCoords?.lng) {
    return { lat: pickupCoords.lat, lon: pickupCoords.lng };
  }
  if (fieldType === "via") {
    if (pickupCoords?.lat && pickupCoords?.lng) {
      return { lat: pickupCoords.lat, lon: pickupCoords.lng };
    }
    if (destinationCoords?.lat && destinationCoords?.lng) {
      return { lat: destinationCoords.lat, lon: destinationCoords.lng };
    }
  }

  const center = getCountryCenter(countryOfUse);
  return { lat: center.lat, lon: center.lng };
};
