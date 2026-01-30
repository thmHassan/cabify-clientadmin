import React, { useState, useCallback, useEffect, useRef } from "react";
import { lockBodyScroll } from "../../../../utils/functions/common.function";
import PageTitle from "../../../../components/ui/PageTitle/PageTitle";
import PageSubTitle from "../../../../components/ui/PageSubTitle/PageSubTitle";
import PlusIcon from "../../../../components/svg/PlusIcon";
import Button from "../../../../components/ui/Button/Button";
import Modal from "../../../../components/shared/Modal/Modal";
import { useAppSelector } from "../../../../store";
import CardContainer from "../../../../components/shared/CardContainer";
import SearchBar from "../../../../components/shared/SearchBar/SearchBar";
import { PAGE_SIZE_OPTIONS, STATUS_OPTIONS } from "../../../../constants/selectOptions";
import Pagination from "../../../../components/ui/Pagination/Pagination";
import PlotsCard from "./components/PlotsCard/PlotsCard";
import AddPlotsModel from "./components/AddPlotsModel";
import { apiDeletePlot, apiGetPlot } from "../../../../services/PlotService";
import _ from "lodash";
import { getTenantData } from "../../../../utils/functions/tokenEncryption";
import AppLogoLoader from "../../../../components/shared/AppLogoLoader";

const Plots = () => {
  const [isPlotsModelOpen, setIsPlotsModelOpen] = useState({
    type: "new",
    isOpen: false,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [tableLoading, setTableLoading] = useState(false);
  const [plotsData, setPlotsData] = useState([]);
  const [_selectedStatus, setSelectedStatus] = useState(
    STATUS_OPTIONS.find((o) => o.value === "all") ?? STATUS_OPTIONS[0]
  );
  const savedPagination = useAppSelector(
    (state) => state?.app?.app?.pagination?.companies
  );
  const [currentPage, setCurrentPage] = useState(
    Number(savedPagination?.currentPage) || 1
  );
  const [itemsPerPage, setItemsPerPage] = useState(
    Number(savedPagination?.itemsPerPage) || 10
  );
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [plotToDelete, setPlotToDelete] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedPlot, setSelectedPlot] = useState(null);
  const mapRef = useRef(null);
  const googleMapRef = useRef(null);
  const googlePolygonsRef = useRef([]);
  const leafletMapRef = useRef(null);
  const leafletPolygonsRef = useRef([]);
  const [mapsReady, setMapsReady] = useState(false);
  const [leafletReady, setLeafletReady] = useState(false);
  const [mapProvider, setMapProvider] = useState("google");
  const [googleApiKey, setGoogleApiKey] = useState("");
  const [barikoiApiKey, setBarikoiApiKey] = useState("");
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchPlots = useCallback(async () => {
    setTableLoading(true);
    try {
      const params = {
        page: currentPage,
        perPage: itemsPerPage,
      };
      if (debouncedSearchQuery?.trim()) {
        params.search = debouncedSearchQuery.trim();
      }

      const response = await apiGetPlot(params);
      console.log("Plots response:", response);

      if (response?.data?.success === 1) {
        const listData = response?.data?.list;
        setPlotsData(listData?.data || []);
        setTotalItems(listData?.total || 0);
        setTotalPages(listData?.last_page || 1);
      }
    } catch (error) {
      console.error("Error fetching plots:", error);
      setPlotsData([]);
    } finally {
      setTableLoading(false);
    }
  }, [currentPage, itemsPerPage, debouncedSearchQuery]);

  const handleDeletePlot = async () => {
    if (!plotToDelete?.id) return;

    setIsDeleting(true);
    try {
      const response = await apiDeletePlot(plotToDelete.id);

      if (response?.data?.success === 1 || response?.status === 200) {
        setDeleteModalOpen(false);
        setPlotToDelete(null);
        setRefreshTrigger(prev => prev + 1);
      } else {
        console.error("Failed to delete plot");
      }
    } catch (error) {
      console.error("Error deleting plot:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    fetchPlots();
  }, [currentPage, itemsPerPage, debouncedSearchQuery, fetchPlots, refreshTrigger]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const handleOnPlotsCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const loadGoogleMaps = useCallback((apiKey) => {
    if (!apiKey) {
      console.warn('No Google Maps API key provided, falling back to Barikoi');
      setMapError(false);
      setMapProvider('barikoi');
      return;
    }
    if (window.google && window.google.maps) {
      setMapsReady(true);
      setMapError(false);
      return;
    }
    const existing = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existing) {
      if (window.google && window.google.maps) {
        setMapsReady(true);
        setMapError(false);
      } else {
        existing.addEventListener('load', () => {
          setMapsReady(true);
          setMapError(false);
        });
        existing.addEventListener('error', () => {
          console.error('Google Maps failed to load, switching to Barikoi');
          setMapError(true);
          setMapProvider('barikoi');
        });
      }
      return;
    }
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry`;
    script.async = true;
    script.defer = true;
    script.setAttribute('data-google-maps', 'true');
    script.onload = () => {
      console.log('Google Maps loaded successfully');
      setMapsReady(true);
      setMapError(false);
    };
    script.onerror = (error) => {
      console.error('Failed to load Google Maps:', error);
      console.error('API Key being used:', apiKey);
      console.log('Switching to Barikoi map provider');
      setMapError(true);
      setMapProvider('barikoi');
    };

    // Listen for Google Maps API errors
    window.gm_authFailure = () => {
      console.error('Google Maps authentication failed, switching to Barikoi');
      setMapError(true);
      setMapProvider('barikoi');
    };

    document.body.appendChild(script);
  }, []);

  const loadLeaflet = useCallback(() => {
    if (window.L) {
      setLeafletReady(true);
      setMapError(false);
      return;
    }
    const existingScript = document.querySelector('script[src*="leaflet.js"]');
    if (existingScript) {
      if (window.L) {
        setLeafletReady(true);
        setMapError(false);
      } else {
        existingScript.addEventListener("load", () => {
          setLeafletReady(true);
          setMapError(false);
        });
        existingScript.addEventListener("error", () => {
          console.error('Failed to load Leaflet');
          setMapError(true);
        });
      }
      return;
    }

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css";
    link.setAttribute('data-leaflet-css', 'true');
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js";
    script.async = true;
    script.defer = true;
    script.setAttribute('data-leaflet-script', 'true');
    script.onload = () => {
      console.log('Leaflet loaded successfully');
      setLeafletReady(true);
      setMapError(false);

      // Suppress React warnings about Leaflet's DOM attributes
      const originalError = console.error;
      console.error = (...args) => {
        if (
          typeof args[0] === 'string' &&
          (args[0].includes('clip-path') ||
            args[0].includes('Received `true` for a non-boolean attribute'))
        ) {
          return; // Suppress these specific warnings from Leaflet
        }
        originalError.apply(console, args);
      };
    };
    script.onerror = (error) => {
      console.error('Failed to load Leaflet:', error);
      setMapError(true);
    };
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    const tenant = getTenantData();

    // Get API keys from environment
    const envGoogleKey = import.meta?.env?.VITE_GOOGLE_MAPS_API_KEY || "";
    const envBarikoiKey = import.meta?.env?.VITE_BARIKOI_API_KEY ||
      import.meta?.env?.VITE_BARIKOI_KEY || "";

    // Resolve keys (tenant takes priority over env)
    const resolvedGoogleKey = tenant?.google_api_key || envGoogleKey || "";
    const resolvedBarikoiKey = tenant?.barikoi_api_key ||
      tenant?.barikoi_api_keys ||
      tenant?.barikoiApiKey ||
      envBarikoiKey || "";

    // Get map provider preference
    const prefRaw = tenant?.maps_api || tenant?.map || tenant?.search_api || "";
    const preference = prefRaw?.toLowerCase?.() || "";

    // Determine provider
    let provider = "google"; // default

    // If preference explicitly mentions barikoi
    if (preference.includes("barikoi") && !preference.includes("google")) {
      provider = "barikoi";
    }

    // Fallback logic based on available keys
    if (provider === "google" && !resolvedGoogleKey) {
      if (resolvedBarikoiKey) {
        console.log('No Google API key available, using Barikoi');
        provider = "barikoi";
      } else {
        console.warn('No map API keys configured');
      }
    }

    if (provider === "barikoi" && !resolvedBarikoiKey) {
      if (resolvedGoogleKey) {
        console.log('No Barikoi API key available, using Google');
        provider = "google";
      } else {
        console.warn('No map API keys configured');
      }
    }

    console.log('Map Provider:', provider);
    console.log('Google API Key available:', !!resolvedGoogleKey);
    console.log('Barikoi API Key available:', !!resolvedBarikoiKey);

    setMapProvider(provider);
    setGoogleApiKey(resolvedGoogleKey);
    setBarikoiApiKey(resolvedBarikoiKey);
  }, []);

  useEffect(() => {
    if (mapProvider === "google") {
      setLeafletReady(false);
      loadGoogleMaps(googleApiKey);
    } else if (mapProvider === "barikoi") {
      setMapsReady(false);
      loadLeaflet();
    }
    return () => {
      if (googleMapRef.current) {
        googleMapRef.current = null;
      }
      googlePolygonsRef.current.forEach(polygon => {
        if (polygon) polygon.setMap(null);
      });
      googlePolygonsRef.current = [];

      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
      leafletPolygonsRef.current = [];
    };
  }, [mapProvider, googleApiKey, loadGoogleMaps, loadLeaflet]);

  const parseCoordinates = useCallback((plot) => {
    if (!plot) return [];
    try {
      const features = typeof plot.features === "string" ? JSON.parse(plot.features) : plot.features;

      let coordinatesData = features?.geometry?.coordinates;
      if (typeof coordinatesData === "string") {
        coordinatesData = JSON.parse(coordinatesData);
      }

      const coords = Array.isArray(coordinatesData) ? coordinatesData[0] : coordinatesData;
      if (Array.isArray(coords) && coords.length) {
        return coords.map((pair) => {
          if (Array.isArray(pair) && pair.length >= 2) {
            const [lng, lat] = pair;
            return { lat: Number(lat), lng: Number(lng) };
          }
          return null;
        }).filter(Boolean);
      }

      if (Array.isArray(plot.coordinates) && plot.coordinates.length) {
        return plot.coordinates.map((pair) => {
          if (!Array.isArray(pair) || pair.length < 2) return null;
          const [first, second] = pair;
          const latFirstLooksLikeLat = Math.abs(Number(first)) <= 90;
          const lngSecondLooksLikeLng = Math.abs(Number(second)) <= 180;
          if (latFirstLooksLikeLat && lngSecondLooksLikeLng) {
            return { lat: Number(first), lng: Number(second) };
          }
          return { lat: Number(second), lng: Number(first) };
        }).filter(Boolean);
      }

      if (plot.lat && plot.lng) {
        return [{ lat: Number(plot.lat), lng: Number(plot.lng) }];
      }
    } catch (error) {
      console.error("Error parsing plot features:", error);
    }
    return [];
  }, []);

  // Helper function to check if coordinates are in expected region (India/South Asia)
  const isInExpectedRegion = useCallback((coords) => {
    if (!coords || coords.length === 0) return false;

    // Calculate center of coordinates
    const center = coords.reduce(
      (acc, coord) => ({
        lat: acc.lat + coord.lat / coords.length,
        lng: acc.lng + coord.lng / coords.length,
      }),
      { lat: 0, lng: 0 }
    );

    // Check if center is roughly in India/South Asia region
    // India bounds: lat 8-35, lng 68-97
    const isInIndia =
      center.lat >= 8 && center.lat <= 35 &&
      center.lng >= 68 && center.lng <= 97;

    return isInIndia;
  }, []);

  // Get filtered plots (only those in expected region)
  const getFilteredPlots = useCallback(() => {
    if (!plotsData || plotsData.length === 0) return [];

    return plotsData.filter(plot => {
      const coords = parseCoordinates(plot);
      return isInExpectedRegion(coords);
    });
  }, [plotsData, parseCoordinates, isInExpectedRegion]);

  const generatePlotColor = (index) => {
    const colors = [
      '#4285F4', // Blue
      '#EA4335', // Red
      '#FBBC04', // Yellow
      '#34A853', // Green
      '#9C27B0', // Purple
      '#FF6D00', // Orange
      '#00BCD4', // Cyan
      '#E91E63', // Pink
      '#795548', // Brown
      '#607D8B', // Blue Grey
    ];
    return colors[index % colors.length];
  };

  const renderAllPolygons = useCallback(() => {
    if (!plotsData || plotsData.length === 0) return;

    // Default center for Surat, India
    const defaultCenter = { lat: 21.1702, lng: 72.8311 };

    // Get plots that are in the expected region
    const validPlots = getFilteredPlots();

    if (validPlots.length === 0) {
      console.warn('No plots found in expected region (India). Showing all plots.');
      // If no valid plots in India, show all plots
      validPlots.push(...plotsData);
    }

    if (mapProvider === "google") {
      if (!mapsReady || !mapRef.current) return;

      // Initialize map if not already done
      if (!googleMapRef.current) {
        googleMapRef.current = new window.google.maps.Map(mapRef.current, {
          center: defaultCenter,
          zoom: 12,
        });
      }

      // Clear existing polygons
      googlePolygonsRef.current.forEach(polygon => {
        if (polygon) polygon.setMap(null);
      });
      googlePolygonsRef.current = [];

      const bounds = new window.google.maps.LatLngBounds();
      let hasValidCoords = false;

      // Draw all valid polygons
      validPlots.forEach((plot, index) => {
        const coords = parseCoordinates(plot);
        if (coords && coords.length >= 3) {
          hasValidCoords = true;
          const color = generatePlotColor(index);

          const polygon = new window.google.maps.Polygon({
            paths: coords,
            strokeColor: color,
            strokeOpacity: 0.9,
            strokeWeight: 2,
            fillColor: color,
            fillOpacity: selectedPlot?.id === plot.id ? 0.35 : 0.15,
            map: googleMapRef.current,
            clickable: true,
          });

          // Add click handler to select plot
          polygon.addListener('click', () => {
            setSelectedPlot(plot);
          });

          // Add info window with plot name
          const infoWindow = new window.google.maps.InfoWindow({
            content: `<div style="padding: 8px; font-weight: 600; color: #333;">${plot.name}</div>`,
          });

          polygon.addListener('mouseover', () => {
            const center = coords.reduce((acc, coord) => ({
              lat: acc.lat + coord.lat / coords.length,
              lng: acc.lng + coord.lng / coords.length,
            }), { lat: 0, lng: 0 });

            infoWindow.setPosition(center);
            infoWindow.open(googleMapRef.current);
          });

          polygon.addListener('mouseout', () => {
            infoWindow.close();
          });

          googlePolygonsRef.current.push(polygon);

          // Extend bounds
          coords.forEach(coord => bounds.extend(coord));
        }
      });

      // Fit map to show all polygons
      if (hasValidCoords) {
        googleMapRef.current.fitBounds(bounds);

        // Add some padding
        const padding = { top: 50, right: 50, bottom: 50, left: 50 };
        googleMapRef.current.fitBounds(bounds, padding);

        // Ensure we don't zoom out too much or too close
        const listener = window.google.maps.event.addListenerOnce(googleMapRef.current, 'bounds_changed', () => {
          const zoom = googleMapRef.current.getZoom();
          if (zoom > 16) {
            googleMapRef.current.setZoom(16);
          } else if (zoom < 8) {
            googleMapRef.current.setZoom(8);
          }
        });
      } else {
        // No valid coordinates, center on default location
        googleMapRef.current.setCenter(defaultCenter);
        googleMapRef.current.setZoom(12);
      }

      return;
    }

    if (mapProvider === "barikoi") {
      if (!leafletReady || !mapRef.current) return;

      // Initialize map if not already done
      if (!leafletMapRef.current) {
        leafletMapRef.current = window.L.map(mapRef.current).setView(
          [defaultCenter.lat, defaultCenter.lng],
          12
        );

        const tileUrl = barikoiApiKey
          ? `https://map.barikoi.com/styles/osm-bright/{z}/{x}/{y}.png?key=${barikoiApiKey}`
          : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

        const tileLayer = window.L.tileLayer(tileUrl, {
          attribution: "© OpenStreetMap contributors",
          maxZoom: 19,
        });

        tileLayer.on("tileerror", () => {
          if (!leafletMapRef.current) return;
          tileLayer.off("tileerror");
          leafletMapRef.current.removeLayer(tileLayer);
          window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "© OpenStreetMap contributors",
            maxZoom: 19,
          }).addTo(leafletMapRef.current);
        });

        tileLayer.addTo(leafletMapRef.current);
      }

      // Clear existing polygons
      leafletPolygonsRef.current.forEach(polygon => {
        if (polygon && leafletMapRef.current) {
          leafletMapRef.current.removeLayer(polygon);
        }
      });
      leafletPolygonsRef.current = [];

      const allBounds = [];

      // Draw all valid polygons
      validPlots.forEach((plot, index) => {
        const coords = parseCoordinates(plot);
        if (coords && coords.length >= 3) {
          const latLngs = coords.map(c => [c.lat, c.lng]);
          const color = generatePlotColor(index);

          const polygon = window.L.polygon(latLngs, {
            color: color,
            fillColor: color,
            fillOpacity: selectedPlot?.id === plot.id ? 0.35 : 0.15,
            weight: 2,
          }).addTo(leafletMapRef.current);

          // Add popup with plot name
          polygon.bindPopup(`<div style="padding: 8px; font-weight: 600; color: #333;">${plot.name}</div>`);

          // Add click handler
          polygon.on('click', () => {
            setSelectedPlot(plot);
          });

          leafletPolygonsRef.current.push(polygon);
          allBounds.push(polygon.getBounds());
        }
      });

      // Fit map to show all polygons
      if (allBounds.length > 0) {
        const combinedBounds = allBounds[0];
        allBounds.forEach(bounds => {
          combinedBounds.extend(bounds);
        });
        leafletMapRef.current.fitBounds(combinedBounds, {
          padding: [50, 50],
          maxZoom: 16
        });
      } else {
        // No valid coordinates, center on default location
        leafletMapRef.current.setView([defaultCenter.lat, defaultCenter.lng], 12);
      }
    }
  }, [mapProvider, mapsReady, leafletReady, plotsData, parseCoordinates, barikoiApiKey, selectedPlot, getFilteredPlots]);

  const handleDeleteClick = (plot) => {
    setPlotToDelete(plot);
    setDeleteModalOpen(true);
  };

  useEffect(() => {
    if (plotsData?.length && !selectedPlot) {
      setSelectedPlot(plotsData[0]);
    }
  }, [plotsData, selectedPlot]);

  // Render all polygons whenever data changes
  useEffect(() => {
    renderAllPolygons();
  }, [renderAllPolygons]);

  // Update polygon styles when selected plot changes
  useEffect(() => {
    const validPlots = getFilteredPlots();

    if (mapProvider === "google" && googlePolygonsRef.current.length > 0) {
      validPlots.forEach((plot, index) => {
        const polygon = googlePolygonsRef.current[index];
        if (polygon) {
          polygon.setOptions({
            fillOpacity: selectedPlot?.id === plot.id ? 0.35 : 0.15,
            strokeWeight: selectedPlot?.id === plot.id ? 3 : 2,
          });
        }
      });
    } else if (mapProvider === "barikoi" && leafletPolygonsRef.current.length > 0) {
      validPlots.forEach((plot, index) => {
        const polygon = leafletPolygonsRef.current[index];
        if (polygon) {
          polygon.setStyle({
            fillOpacity: selectedPlot?.id === plot.id ? 0.35 : 0.15,
            weight: selectedPlot?.id === plot.id ? 3 : 2,
          });
        }
      });
    }
  }, [selectedPlot, mapProvider, getFilteredPlots]);

  return (
    <div className="px-4 py-5 sm:p-6 lg:p-7 2xl:p-10 min-h-[calc(100vh-64px)] sm:min-h-[calc(100vh-85px)]">
      <div className="flex justify-between sm:flex-row flex-col items-start sm:items-center gap-3 sm:gap-0">
        <div className="flex flex-col gap-2.5 sm:mb-[30px] mb-1 sm:w-[calc(100%-240px)] w-full">
          <PageTitle title="Plots" />
          <PageSubTitle title="These plots will be pushed to all customer panels for their help or they can choose their own plots by creating in their own panels" />
        </div>
        <div className="sm:w-auto xs:w-auto w-full sm:mb-[50px] mb-8">
          <Button
            type="filled"
            btnSize="2xl"
            onClick={() => {
              lockBodyScroll();
              setIsPlotsModelOpen({ isOpen: true, type: "new" });
            }}
            className="w-auto -mb-2 sm:-mb-3 lg:-mb-3 !py-3.5 sm:!py-3 lg:!py-3"
          >
            <div className="flex gap-2 sm:gap-[15px] items-center whitespace-nowrap">
              <span className="hidden sm:inline-block">
                <PlusIcon />
              </span>
              <span className="sm:hidden">
                <PlusIcon height={16} width={16} />
              </span>
              <span>Add New Plots</span>
            </div>
          </Button>
        </div>
      </div>
      <div>
        <CardContainer className="p-3 sm:p-4 lg:p-5 bg-[#F5F5F5]">
          <div className="flex flex-row items-stretch sm:items-center gap-3 sm:gap-5 justify-between mb-4 sm:mb-0">
            <div className="md:w-full w-[calc(100%-54px)] sm:flex-1">
              <SearchBar
                value={searchQuery}
                onSearchChange={setSearchQuery}
                className="w-full md:max-w-[400px] max-w-full"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-4">
            <div className="flex flex-col gap-4 max-h-[600px] overflow-y-auto pr-2">
              {tableLoading ? (
                <div className="flex items-center justify-center py-20">
                  <AppLogoLoader />
                </div>
              ) : plotsData && plotsData.length > 0 ? (
                plotsData.map((plot) => {
                  const coords = parseCoordinates(plot);
                  const isOutOfRegion = !isInExpectedRegion(coords);

                  return (
                    <div key={plot.id || plot.name} className="relative">
                      <PlotsCard
                        plot={plot}
                        isSelected={selectedPlot?.id === plot.id}
                        onSelect={(p) => setSelectedPlot(p)}
                        onEdit={(plotToEdit) => {
                          lockBodyScroll();
                          setIsPlotsModelOpen({
                            isOpen: true,
                            type: "edit",
                            data: plotToEdit,
                          });
                        }}
                        onDelete={handleDeleteClick}
                      />
                    </div>
                  );
                })
              ) : (
                <div className="flex items-center justify-center py-20 text-gray-500">
                  No plots found
                </div>
              )}
            </div>
            <div className="relative w-full h-[600px] rounded-xl overflow-hidden border border-gray-200">
              <div ref={mapRef} className="w-full h-full" />
              {!plotsData || plotsData.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center bg-white/70 text-gray-600">
                  No plots to display
                </div>
              ) : (!mapsReady && !leafletReady) ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 text-gray-600">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-3"></div>
                  <p>Loading map...</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {mapProvider === 'google' ? 'Google Maps' : 'Barikoi Maps'}
                  </p>
                </div>
              ) : null}
              {selectedPlot && (mapsReady || leafletReady) && (
                <div className="absolute top-4 left-4 bg-white px-4 py-2 rounded-lg shadow-lg border border-gray-200">
                  <div className="font-semibold text-gray-800">{selectedPlot.name}</div>
                  <div className="text-xs text-gray-600 mt-1">
                    {parseCoordinates(selectedPlot).length} coordinates
                  </div>
                </div>
              )}
            </div>
          </div>
          {Array.isArray(plotsData) && plotsData.length > 0 ? (
            <div className="mt-4 sm:mt-4 border-t border-[#E9E9E9] pt-3 sm:pt-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
                itemsPerPageOptions={PAGE_SIZE_OPTIONS}
                pageKey="companies"
              />
            </div>
          ) : null}
        </CardContainer>
      </div>
      <Modal
        isOpen={isPlotsModelOpen.isOpen}
        className="p-4 sm:p-6 lg:p-10"
      >
        <AddPlotsModel
          initialValue={isPlotsModelOpen.type === "edit" ? {
            id: isPlotsModelOpen.data?.id,
            name: isPlotsModelOpen.data?.name,
            coordinates: isPlotsModelOpen.data?.features ? (() => {
              try {
                const features = typeof isPlotsModelOpen.data.features === 'string'
                  ? JSON.parse(isPlotsModelOpen.data.features)
                  : isPlotsModelOpen.data.features;

                let coordinatesData = features?.geometry?.coordinates;
                if (typeof coordinatesData === "string") {
                  coordinatesData = JSON.parse(coordinatesData);
                }

                const coords = Array.isArray(coordinatesData) ? coordinatesData[0] : coordinatesData;
                return coords || [[72.865475, 21.457506], [72.601643, 21.319401]];
              } catch (e) {
                console.error('Error parsing features:', e);
                return [[72.865475, 21.457506], [72.601643, 21.319401]];
              }
            })() : [[72.865475, 21.457506], [72.601643, 21.319401]],
          } : {}}
          setIsOpen={setIsPlotsModelOpen}
          onPlotsCreated={handleOnPlotsCreated}
        />
      </Modal>
      <Modal isOpen={deleteModalOpen} className="p-10">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-3">Delete Plot?</h2>
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete {plotToDelete?.name}?
          </p>

          <div className="flex justify-center gap-4">
            <Button
              type="filledGray"
              onClick={() => {
                setDeleteModalOpen(false);
                setPlotToDelete(null);
              }}
              className="px-6 py-2 rounded-md"
            >
              Cancel
            </Button>

            <Button
              type="filledRed"
              onClick={handleDeletePlot}
              disabled={isDeleting}
              className="px-6 py-2 rounded-md"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Plots;