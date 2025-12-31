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
  const googlePolygonRef = useRef(null);
  const leafletMapRef = useRef(null);
  const leafletPolygonRef = useRef(null);
  const [mapsReady, setMapsReady] = useState(false);
  const [leafletReady, setLeafletReady] = useState(false);
  const [mapProvider, setMapProvider] = useState("google");
  const [googleApiKey, setGoogleApiKey] = useState("");
  const [barikoiApiKey, setBarikoiApiKey] = useState("");

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
    if (!apiKey) return;
    if (window.google && window.google.maps) {
      setMapsReady(true);
      return;
    }
    const existing = document.querySelector('script[data-google-maps]');
    if (existing) {
      existing.addEventListener('load', () => setMapsReady(true));
      return;
    }
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry`;
    script.async = true;
    script.defer = true;
    script.dataset.googleMaps = 'true';
    script.onload = () => setMapsReady(true);
    document.body.appendChild(script);
  }, []);

  const loadLeaflet = useCallback(() => {
    if (window.L) {
      setLeafletReady(true);
      return;
    }
    const existingScript = document.querySelector('script[data-leaflet]');
    if (existingScript) {
      existingScript.addEventListener("load", () => setLeafletReady(true));
      return;
    }
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css";
    link.dataset.leaflet = "true";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js";
    script.async = true;
    script.defer = true;
    script.dataset.leaflet = "true";
    script.onload = () => setLeafletReady(true);
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    const tenant = getTenantData();
    const envGoogleKey =
      import.meta?.env?.VITE_GOOGLE_MAPS_API_KEY ||
      (typeof process !== "undefined" ? process.env.REACT_APP_GOOGLE_MAPS_API_KEY : "") ||
      "";
    const envBarikoiKey =
      import.meta?.env?.VITE_BARIKOI_API_KEY ||
      (typeof process !== "undefined" ? process.env.REACT_APP_BARIKOI_API_KEY : "") ||
      "";

    const resolvedGoogleKey =
      tenant?.google_api_key ||
      envGoogleKey ||
      "";

    const resolvedBarikoiKey =
      tenant?.barikoi_api_key ||
      tenant?.barikoi_api_keys ||
      tenant?.barikoiApiKey ||
      envBarikoiKey ||
      "";

    const prefRaw =
      tenant?.maps_api ||
      tenant?.map ||
      tenant?.search_api ||
      "";
    const preference = prefRaw?.toLowerCase?.() || "google";

    let provider =
      preference.includes("barikoi") && !preference.includes("google")
        ? "barikoi"
        : "google";

    // If preferred provider lacks a key, fall back to the other if available
    if (provider === "google" && !resolvedGoogleKey && resolvedBarikoiKey) {
      provider = "barikoi";
    }
    if (provider === "barikoi" && !resolvedBarikoiKey && resolvedGoogleKey) {
      provider = "google";
    }

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
      if (googlePolygonRef.current) {
        googlePolygonRef.current = null;
      }
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
      if (leafletPolygonRef.current) {
        leafletPolygonRef.current = null;
      }
    };
  }, [mapProvider, googleApiKey, loadGoogleMaps, loadLeaflet]);

  const parseCoordinates = useCallback((plot) => {
    if (!plot) return [];
    try {
      // Primary: GeoJSON Feature stored in plot.features
      const features = typeof plot.features === "string" ? JSON.parse(plot.features) : plot.features;

      // Handle coordinates - it might be a string (double-encoded) or an array
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

      // Fallback: direct coordinates array on plot (array of [lat, lng] or [lng, lat])
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

      // Fallback: single lat/lng props
      if (plot.lat && plot.lng) {
        return [{ lat: Number(plot.lat), lng: Number(plot.lng) }];
      }
    } catch (error) {
      console.error("Error parsing plot features:", error);
    }
    return [];
  }, []);

  const renderPolygon = useCallback((plotToRender) => {
    const coords = parseCoordinates(plotToRender);
    const defaultCenter = coords[0] || { lat: 21.1702, lng: 72.8311 };

    if (mapProvider === "google") {
      if (!mapsReady || !mapRef.current) return;
      if (!googleMapRef.current) {
        googleMapRef.current = new window.google.maps.Map(mapRef.current, {
          center: defaultCenter,
          zoom: 12,
        });
      }
      if (googlePolygonRef.current) {
        googlePolygonRef.current.setMap(null);
        googlePolygonRef.current = null;
      }
      if (!coords.length) return;
      googlePolygonRef.current = new window.google.maps.Polygon({
        paths: coords,
        strokeColor: "#4285F4",
        strokeOpacity: 0.9,
        strokeWeight: 2,
        fillColor: "#4285F4",
        fillOpacity: 0.2,
        map: googleMapRef.current,
      });
      const bounds = new window.google.maps.LatLngBounds();
      coords.forEach((c) => bounds.extend(c));
      googleMapRef.current.fitBounds(bounds);
      return;
    }

    if (mapProvider === "barikoi") {
      if (!leafletReady || !mapRef.current) return;
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

        // If the Barikoi key is invalid/unauthorized, fall back to OpenStreetMap tiles
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
      if (leafletPolygonRef.current) {
        leafletMapRef.current.removeLayer(leafletPolygonRef.current);
        leafletPolygonRef.current = null;
      }
      if (!coords.length) return;
      const latLngs = coords.map((c) => [c.lat, c.lng]);
      leafletPolygonRef.current = window.L.polygon(latLngs, {
        color: "#4285F4",
        fillColor: "#4285F4",
        fillOpacity: 0.2,
        weight: 2,
      }).addTo(leafletMapRef.current);
      leafletMapRef.current.fitBounds(leafletPolygonRef.current.getBounds());
    }
  }, [mapProvider, mapsReady, leafletReady, parseCoordinates, barikoiApiKey]);

  const handleDeleteClick = (plot) => {
    setPlotToDelete(plot);
    setDeleteModalOpen(true);
  };

  useEffect(() => {
    if (plotsData?.length && !selectedPlot) {
      setSelectedPlot(plotsData[0]);
    }
  }, [plotsData, selectedPlot]);

  useEffect(() => {
    renderPolygon(selectedPlot);
  }, [selectedPlot, renderPolygon]);

  if (tableLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <AppLogoLoader />
      </div>
    );
  }

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
              <div className="flex flex-col gap-4">
                {plotsData?.map((plot) => (
                  <PlotsCard
                    key={plot.id || plot.name}
                    plot={plot}
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
                ))}
              </div>
              <div className="relative w-full h-[450px] rounded-xl overflow-hidden border border-gray-200">
                <div ref={mapRef} className="w-full h-full" />
                {!selectedPlot && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/70 text-gray-600">
                    Select a plot to preview coordinates
                  </div>
                )}
              </div>
            </div>
          {Array.isArray(plotsData) &&
            plotsData.length > 0 ? (
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
                return features?.geometry?.coordinates || [[72.865475, 21.457506], [72.601643, 21.319401]];
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