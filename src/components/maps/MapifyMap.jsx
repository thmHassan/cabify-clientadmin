import { useEffect, useRef, useState } from "react";
import { getCountryCenter } from "../../utils/map/countryCenters";
import { fetchMapifyStyle } from "../../utils/map/fetchMapifyStyle";
import { loadMapLibre } from "../../utils/map/loadMapLibre";
import { buildOsmFallbackStyle } from "../../utils/map/osmFallbackStyle";
import { reverseGeocodeWithMapify } from "../../utils/map/mapifyPlaces";
import {
  useMapifyAutocomplete,
  MAPIFY_SEARCH_SUCCESS,
} from "../../hooks/useMapifyAutocomplete";
import MapifyLocationSuggestions from "./MapifyLocationSuggestions";

const LoadingPlaceholder = () => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#f3f4f6",
      borderRadius: "8px",
    }}
  >
    <p style={{ color: "#6b7280", fontFamily: "Roboto,Arial,sans-serif" }}>
      Loading map...
    </p>
  </div>
);

const mkEl = (color, text) => {
  const el = document.createElement("div");
  el.style.cssText = [
    `background:${color}`,
    "width:26px",
    "height:26px",
    "border-radius:50%",
    "border:2.5px solid #fff",
    "display:flex",
    "align-items:center",
    "justify-content:center",
    "color:#fff",
    "font-weight:bold",
    "font-size:12px",
    "font-family:Roboto,Arial,sans-serif",
    "box-shadow:0 2px 6px rgba(0,0,0,0.35)",
    "cursor:pointer",
  ].join(";");
  el.textContent = text;
  return el;
};

const MapSearchBox = ({
  countryOfUse,
  pickupCoords,
  destinationCoords,
  onPlaceSelect,
}) => {
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [searchStatus, setSearchStatus] = useState("idle");
  const [searchError, setSearchError] = useState(null);

  const { searchMapify, cancelMapifySearch } = useMapifyAutocomplete({
    countryOfUse,
  });

  const handleChange = (value) => {
    setQuery(value);
    if (!value || value.trim().length < 2) {
      setShowSuggestions(false);
      setSuggestions([]);
      setSearchStatus("idle");
      setSearchError(null);
      cancelMapifySearch();
      return;
    }

    const focus = pickupCoords?.lat
      ? { lat: pickupCoords.lat, lon: pickupCoords.lng ?? pickupCoords.lon }
      : destinationCoords?.lat
        ? { lat: destinationCoords.lat, lon: destinationCoords.lng ?? destinationCoords.lon }
        : getCountryCenter(countryOfUse);

    searchMapify(value, focus, (result) => {
      setSearchStatus(result.status);
      setSearchError(result.error);
      setShowSuggestions(true);
      if (result.status === MAPIFY_SEARCH_SUCCESS) {
        setSuggestions(result.items);
      } else {
        setSuggestions([]);
      }
    });
  };

  const handleSelect = (place) => {
    setQuery(place.label);
    setShowSuggestions(false);
    onPlaceSelect?.(place);
  };

  return (
    <div
      style={{
        position: "absolute",
        top: 12,
        left: 12,
        right: 12,
        zIndex: 10,
      }}
    >
      <div style={{ position: "relative", maxWidth: 420 }}>
        <input
          type="text"
          value={query}
          placeholder="Search places on map..."
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => {
            if (query.trim().length >= 2) setShowSuggestions(true);
          }}
          style={{
            width: "100%",
            padding: "10px 14px",
            borderRadius: 8,
            border: "1px solid #d1d5db",
            boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
            fontSize: 14,
            outline: "none",
          }}
        />
        <MapifyLocationSuggestions
          show={showSuggestions}
          suggestions={suggestions}
          searchStatus={searchStatus}
          searchError={searchError}
          onSelect={handleSelect}
        />
      </div>
    </div>
  );
};

const MapifyMap = ({
  countryOfUse = "",
  pickupCoords,
  destinationCoords,
  viaCoords,
  setFieldValue,
  fetchPlotName,
  setPickupPlotData,
  setDestinationPlotData,
  onPickupConfirmed,
  onDestinationConfirmed,
  enableMapSearch = true,
}) => {
  const containerRef = useRef(null);
  const wrapperRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const previewMarkerRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const clickCountRef = useRef(0);
  const mountedRef = useRef(true);

  const flyToPlace = (place) => {
    if (!mapRef.current || !place?.lat) return;

    const lon = place.lon ?? place.lng;
    mapRef.current.flyTo({
      center: [lon, place.lat],
      zoom: 15,
      essential: true,
    });

    if (previewMarkerRef.current) {
      try {
        previewMarkerRef.current.remove();
      } catch {
        /* ignore */
      }
    }

    previewMarkerRef.current = new window.maplibregl.Marker({
      element: mkEl("#6366F1", "•"),
    })
      .setLngLat([lon, place.lat])
      .addTo(mapRef.current);
  };

  useEffect(() => {
    mountedRef.current = true;
    loadMapLibre()
      .then(() => {
        if (mountedRef.current) setIsLoaded(true);
      })
      .catch(() => {
        if (mountedRef.current) setLoadError("Failed to load map library");
      });
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(() => {
      if (mapRef.current?.resize) mapRef.current.resize();
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!isLoaded || !containerRef.current || mapRef.current) return;

    let cancelled = false;

    const initMap = async () => {
      try {
        const center = getCountryCenter(countryOfUse);
        let style = await fetchMapifyStyle();
        if (cancelled) return;

        const tryInit = (mapStyle, isFallback = false) => {
          try {
            const map = new window.maplibregl.Map({
              container: containerRef.current,
              style: mapStyle,
              center: [center.lng, center.lat],
              zoom: 8,
              attributionControl: false,
            });

            map.addControl(
              new window.maplibregl.NavigationControl({ showCompass: true }),
              "bottom-right"
            );

            map.on("load", () => {
              if (cancelled) return;
              map.resize();
              setMapReady(true);
            });

            map.on("error", (e) => {
              const msg = e?.error?.message || String(e);
              if (
                !isFallback &&
                (msg.includes("403") ||
                  msg.includes("401") ||
                  msg.includes("Failed to fetch"))
              ) {
                if (!map._usingFallback) {
                  map._usingFallback = true;
                  console.warn("Mapify tiles unavailable, switching to OSM fallback");
                  map.setStyle(buildOsmFallbackStyle());
                }
              }
            });

            map.on("click", async (e) => {
              const lat = e.lngLat.lat;
              const lng = e.lngLat.lng;
              clickCountRef.current += 1;

              let address = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
              try {
                const label = await reverseGeocodeWithMapify({
                  lat,
                  lng,
                  boundaryCountry: countryOfUse,
                });
                if (label) address = label;
              } catch (error) {
                console.warn("Mapify reverse geocode failed:", error);
              }

              const plotData = await fetchPlotName(lat, lng);

              if (clickCountRef.current === 1) {
                setFieldValue("pickup_point", address);
                setFieldValue("pickup_latitude", lat);
                setFieldValue("pickup_longitude", lng);
                setFieldValue("pickup_plot_id", plotData.id);
                setPickupPlotData(plotData);
                onPickupConfirmed?.({ lat, lng });
              } else if (clickCountRef.current === 2) {
                setFieldValue("destination", address);
                setFieldValue("destination_latitude", lat);
                setFieldValue("destination_longitude", lng);
                setFieldValue("destination_plot_id", plotData.id);
                setDestinationPlotData(plotData);
                onDestinationConfirmed?.({ lat, lng });
                clickCountRef.current = 0;
              }

              flyToPlace({ lat, lon: lng, lng });
            });

            mapRef.current = map;
          } catch (err) {
            console.error("Mapify map init failed:", err);
            if (!isFallback) {
              tryInit(buildOsmFallbackStyle(), true);
            } else {
              setLoadError("Failed to initialize map");
            }
          }
        };

        if (!style?.version) {
          style = buildOsmFallbackStyle();
        }
        tryInit(style);
      } catch (error) {
        console.error("Mapify init error:", error);
        if (!cancelled) setLoadError("Failed to load map");
      }
    };

    initMap();

    return () => {
      cancelled = true;
      if (previewMarkerRef.current) {
        try {
          previewMarkerRef.current.remove();
        } catch {
          /* ignore */
        }
        previewMarkerRef.current = null;
      }
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch {
          /* ignore */
        }
        mapRef.current = null;
      }
      setMapReady(false);
    };
  }, [isLoaded, countryOfUse]);

  useEffect(() => {
    if (!mapReady || !mapRef.current) return;

    if (pickupCoords?.lat && pickupCoords?.lng && !destinationCoords?.lat) {
      flyToPlace({ lat: pickupCoords.lat, lon: pickupCoords.lng });
    } else if (destinationCoords?.lat && destinationCoords?.lng && !pickupCoords?.lat) {
      flyToPlace({ lat: destinationCoords.lat, lon: destinationCoords.lng });
    }
  }, [pickupCoords, destinationCoords, mapReady]);

  const drawRoute = (map) => {
    const removeLayers = () => {
      ["route-outline", "route"].forEach((id) => {
        try {
          if (map.getLayer(id)) map.removeLayer(id);
        } catch {
          /* ignore */
        }
      });
      try {
        if (map.getSource("route")) map.removeSource("route");
      } catch {
        /* ignore */
      }
    };

    removeLayers();
    if (!pickupCoords?.lat || !destinationCoords?.lat) return;

    const paint = (geometry) => {
      removeLayers();
      try {
        map.addSource("route", {
          type: "geojson",
          data: { type: "Feature", properties: {}, geometry },
        });
        map.addLayer({
          id: "route-outline",
          type: "line",
          source: "route",
          layout: { "line-join": "round", "line-cap": "round" },
          paint: { "line-color": "#fff", "line-width": 8 },
        });
        map.addLayer({
          id: "route",
          type: "line",
          source: "route",
          layout: { "line-join": "round", "line-cap": "round" },
          paint: { "line-color": "#4285F4", "line-width": 5 },
        });
      } catch {
        /* ignore */
      }
    };

    const pts = [
      `${pickupCoords.lng},${pickupCoords.lat}`,
      ...(viaCoords || [])
        .filter((c) => c?.lat && c?.lng)
        .map((c) => `${c.lng},${c.lat}`),
      `${destinationCoords.lng},${destinationCoords.lat}`,
    ];

    fetch(
      `https://router.project-osrm.org/route/v1/driving/${pts.join(";")}?overview=full&geometries=geojson`
    )
      .then((r) => r.json())
      .then((data) => {
        if (!mapRef.current || !data?.routes?.[0]) throw new Error("no route");
        paint(data.routes[0].geometry);
      })
      .catch(() => {
        paint({
          type: "LineString",
          coordinates: [
            [pickupCoords.lng, pickupCoords.lat],
            ...(viaCoords || [])
              .filter((c) => c?.lat && c?.lng)
              .map((c) => [c.lng, c.lat]),
            [destinationCoords.lng, destinationCoords.lat],
          ],
        });
      });
  };

  useEffect(() => {
    if (!mapRef.current || !mapReady) return;

    const id = setTimeout(() => {
      const doUpdate = () => {
        if (!mapRef.current) return;
        markersRef.current.forEach((m) => {
          try {
            m.remove();
          } catch {
            /* ignore */
          }
        });
        markersRef.current = [];

        const bounds = new window.maplibregl.LngLatBounds();
        let hasCoords = false;

        const addMarker = (coords, color, label) => {
          if (!coords?.lat || !coords?.lng) return;
          const m = new window.maplibregl.Marker({ element: mkEl(color, label) })
            .setLngLat([coords.lng, coords.lat])
            .addTo(mapRef.current);
          markersRef.current.push(m);
          bounds.extend([coords.lng, coords.lat]);
          hasCoords = true;
        };

        addMarker(pickupCoords, "#4CAF50", "P");
        (viaCoords || []).forEach((c, i) => addMarker(c, "#2196F3", `${i + 1}`));
        addMarker(destinationCoords, "#F44336", "D");

        if (hasCoords) {
          mapRef.current.fitBounds(bounds, { padding: 60, maxZoom: 15 });
        }
        drawRoute(mapRef.current);
      };

      if (mapRef.current?.isStyleLoaded()) doUpdate();
      else mapRef.current?.once("load", doUpdate);
    }, 300);

    return () => clearTimeout(id);
  }, [pickupCoords, destinationCoords, viaCoords, mapReady]);

  if (loadError) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "400px",
          background: "#fef2f2",
          borderRadius: "8px",
        }}
      >
        <p style={{ color: "#dc2626", fontSize: "14px" }}>{loadError}</p>
      </div>
    );
  }

  return (
    <div
      ref={wrapperRef}
      style={{
        position: "relative",
        width: "100%",
        height: "400px",
        borderRadius: "8px",
        overflow: "hidden",
      }}
    >
      {enableMapSearch && mapReady && (
        <MapSearchBox
          countryOfUse={countryOfUse}
          pickupCoords={pickupCoords}
          destinationCoords={destinationCoords}
          onPlaceSelect={flyToPlace}
        />
      )}
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
      {(!isLoaded || !mapReady) && <LoadingPlaceholder />}
    </div>
  );
};

export default MapifyMap;
