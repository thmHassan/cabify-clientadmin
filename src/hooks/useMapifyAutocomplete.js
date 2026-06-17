import { useCallback, useEffect, useMemo, useRef } from "react";
import { debounce } from "lodash";
import { getCountryCenter } from "../utils/map/countryCenters";
import {
  autocompleteWithMapify,
  getMapifyErrorMessage,
  isMapifyRequestCanceled,
} from "../utils/map/mapifyPlaces";

export const MAPIFY_SEARCH_IDLE = "idle";
export const MAPIFY_SEARCH_LOADING = "loading";
export const MAPIFY_SEARCH_SUCCESS = "success";
export const MAPIFY_SEARCH_EMPTY = "empty";
export const MAPIFY_SEARCH_ERROR = "error";

export const useMapifyAutocomplete = ({
  countryOfUse = "",
  debounceMs = 400,
  minChars = 2,
} = {}) => {
  const abortRef = useRef(null);
  const requestIdRef = useRef(0);

  const cancelSearch = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
  }, []);

  useEffect(() => () => cancelSearch(), [cancelSearch]);

  const runSearch = useCallback(
    async (query, focusCoords, onResult) => {
      const trimmed = query?.trim() || "";

      if (trimmed.length < minChars) {
        onResult?.({
          status: MAPIFY_SEARCH_IDLE,
          items: [],
          error: null,
        });
        return [];
      }

      cancelSearch();
      const controller = new AbortController();
      abortRef.current = controller;
      const requestId = ++requestIdRef.current;

      onResult?.({
        status: MAPIFY_SEARCH_LOADING,
        items: [],
        error: null,
      });

      const center = focusCoords || getCountryCenter(countryOfUse);

      try {
        const results = await autocompleteWithMapify({
          query: trimmed,
          lat: center.lat,
          lon: center.lon ?? center.lng,
          boundaryCountry: countryOfUse,
          signal: controller.signal,
        });

        if (requestId !== requestIdRef.current) return [];

        if (!results.length) {
          onResult?.({
            status: MAPIFY_SEARCH_EMPTY,
            items: [],
            error: null,
          });
          return [];
        }

        onResult?.({
          status: MAPIFY_SEARCH_SUCCESS,
          items: results,
          error: null,
        });

        return results;
      } catch (error) {
        if (isMapifyRequestCanceled(error) || requestId !== requestIdRef.current) {
          return [];
        }

        const message = getMapifyErrorMessage(error);
        console.error("Mapify autocomplete error:", error);
        onResult?.({
          status: MAPIFY_SEARCH_ERROR,
          items: [],
          error: message,
        });
        return [];
      }
    },
    [cancelSearch, countryOfUse, minChars]
  );

  const debouncedSearch = useMemo(
    () =>
      debounce((query, focusCoords, onResult) => {
        runSearch(query, focusCoords, onResult);
      }, debounceMs),
    [debounceMs, runSearch]
  );

  useEffect(
    () => () => {
      debouncedSearch.cancel();
    },
    [debouncedSearch]
  );

  return {
    searchMapify: debouncedSearch,
    searchMapifyImmediate: runSearch,
    cancelMapifySearch: cancelSearch,
  };
};

export default useMapifyAutocomplete;
