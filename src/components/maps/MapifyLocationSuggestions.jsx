import {
  MAPIFY_SEARCH_EMPTY,
  MAPIFY_SEARCH_ERROR,
  MAPIFY_SEARCH_LOADING,
} from "../../hooks/useMapifyAutocomplete";

const LocationSuggestionsDropdown = ({
  show,
  suggestions = [],
  searchStatus = "idle",
  searchError = null,
  onSelect,
}) => {
  if (!show) return null;

  return (
    <ul className="absolute top-full left-0 mt-1 bg-white border w-full z-50 max-h-60 overflow-auto shadow-lg rounded">
      {searchStatus === MAPIFY_SEARCH_LOADING && (
        <li className="p-2 text-sm text-gray-500">Searching locations...</li>
      )}

      {searchStatus === MAPIFY_SEARCH_ERROR && (
        <li className="p-2 text-sm text-red-500">{searchError || "Search failed"}</li>
      )}

      {searchStatus === MAPIFY_SEARCH_EMPTY && (
        <li className="p-2 text-sm text-gray-500">No locations found</li>
      )}

      {searchStatus !== MAPIFY_SEARCH_LOADING &&
        searchStatus !== MAPIFY_SEARCH_ERROR &&
        searchStatus !== MAPIFY_SEARCH_EMPTY &&
        suggestions.length === 0 && (
          <li className="p-2 text-sm text-gray-500">No locations found</li>
        )}

      {suggestions.map((item) => (
        <li
          key={item.id || `${item.lat}-${item.lon ?? item.lng}-${item.label}`}
          onClick={() => onSelect(item)}
          className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
        >
          {item.label}
        </li>
      ))}
    </ul>
  );
};

export default LocationSuggestionsDropdown;
