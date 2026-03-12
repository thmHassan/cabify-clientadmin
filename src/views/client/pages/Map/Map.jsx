import { useEffect, useRef, useState } from "react";
import { useSocket } from "../../../../components/routes/SocketProvider";
import PageTitle from "../../../../components/ui/PageTitle/PageTitle";
import PageSubTitle from "../../../../components/ui/PageSubTitle";
import CardContainer from "../../../../components/shared/CardContainer";
import CustomSelect from "../../../../components/ui/CustomSelect";
import { MAP_STATUS_OPTIONS } from "../../../../constants/selectOptions";
import { renderToString } from "react-dom/server";
import RedCarIcon from "../../../../components/svg/RedCarIcon";
import GreenCarIcon from "../../../../components/svg/GreenCarIcon";
import { getTenantData } from "../../../../utils/functions/tokenEncryption";

const GOOGLE_KEY = "AIzaSyDTlV1tPVuaRbtvBQu4-kjDhTV54tR4cDU";
const BARIKOI_KEY = "bkoi_a468389d0211910bd6723de348e0de79559c435f07a17a5419cbe55ab55a890a";

const svgToDataUrl = (SvgComponent, width = 40, height = 40) => {
  const svgString = renderToString(
    <SvgComponent width={width} height={height} />
  );
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svgString)}`;
};

const MARKER_ICONS = {
  idle: {
    url: svgToDataUrl(RedCarIcon, 40, 40),
    scaledSize: { width: 40, height: 40 },
    anchor: { x: 20, y: 20 },
  },
  busy: {
    url: svgToDataUrl(GreenCarIcon, 40, 40),
    scaledSize: { width: 40, height: 40 },
    anchor: { x: 20, y: 20 },
  },
};

const createSvgMarkerEl = (status) => {
  const iconData = MARKER_ICONS[status] || MARKER_ICONS.idle;
  const el = document.createElement("div");
  el.style.cssText = `
    width: ${iconData.scaledSize.width}px;
    height: ${iconData.scaledSize.height}px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  `;
  const img = document.createElement("img");
  img.src = iconData.url;
  img.style.cssText = `
    width: 100%;
    height: 100%;
    object-fit: contain;
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
  `;
  el.appendChild(img);
  return el;
};

// ── Shared info popup HTML ────────────────────────────────────────────────────
const buildInfoHTML = ({ name, phoneNo, vehiclePlateNo, driving_status }) => {
  const statusColor = driving_status === "busy" ? "#10B981" : "#EF4444";
  const statusLabel = driving_status === "busy" ? "Active" : "Idle";

  return `
    <div style="
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      min-width: 180px;
      padding: 4px 2px;
    ">
      <!-- Driver name -->
      <div style="
        font-weight: 700;
        font-size: 14px;
        color: #111827;
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        gap: 6px;
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#6B7280" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        ${name || "Unknown Driver"}
      </div>

      <!-- Divider -->
      <div style="border-top: 1px solid #F3F4F6; margin-bottom: 8px;"></div>

      <!-- Phone -->
      <div style="
        font-size: 12px;
        color: #374151;
        margin-bottom: 6px;
        display: flex;
        align-items: center;
        gap: 6px;
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="#6B7280" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
        <span style="font-weight: 500;">${phoneNo || "N/A"}</span>
      </div>

      <!-- Plate number -->
      <div style="
        font-size: 12px;
        color: #374151;
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        gap: 6px;
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="#6B7280" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h8l2-2z" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M13 6l3 5h3l1 3H13" />
        </svg>
        <span style="
          font-weight: 600;
          font-size: 11px;
          letter-spacing: 1px;
          background: #F3F4F6;
          padding: 2px 6px;
          border-radius: 4px;
          border: 1px solid #D1D5DB;
          color: #111827;
        ">${vehiclePlateNo || "N/A"}</span>
      </div>

      <!-- Status badge -->
      <div style="
        display: inline-flex;
        align-items: center;
        gap: 4px;
        background: ${statusColor}18;
        color: ${statusColor};
        font-size: 11px;
        font-weight: 600;
        padding: 3px 8px;
        border-radius: 99px;
        border: 1px solid ${statusColor}40;
      ">
        <span style="
          width: 6px; height: 6px;
          border-radius: 50%;
          background: ${statusColor};
          display: inline-block;
        "></span>
        ${statusLabel}
      </div>
    </div>
  `;
};

const loadGoogleMaps = (apiKey) => {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.maps) return resolve();

    const existingScript = document.getElementById("google-maps-script");
    if (existingScript) {
      existingScript.onload = resolve;
      return;
    }

    const script = document.createElement("script");
    script.id = "google-maps-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

const loadBarikoiMaps = () => {
  return new Promise((resolve, reject) => {
    if (window.maplibregl && window.maplibregl.Map) {
      return resolve();
    }

    const existingScript = document.getElementById("maplibre-script");

    if (existingScript) {
      existingScript.onload = () => {
        if (window.maplibregl && window.maplibregl.Map) {
          resolve();
        } else {
          reject(new Error("MapLibre failed to initialize"));
        }
      };
      return;
    }

    if (!document.getElementById("maplibre-css")) {
      const link = document.createElement("link");
      link.id = "maplibre-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/maplibre-gl@2.4.0/dist/maplibre-gl.css";
      document.head.appendChild(link);
    }

    const script = document.createElement("script");
    script.id = "maplibre-script";
    script.src = "https://unpkg.com/maplibre-gl@2.4.0/dist/maplibre-gl.js";
    script.async = true;

    script.onload = () => {
      if (window.maplibregl && window.maplibregl.Map) {
        resolve();
      } else {
        reject(new Error("MapLibre loaded but Map is undefined"));
      }
    };

    script.onerror = reject;
    document.head.appendChild(script);
  });
};

const animateMarker = (marker, newPosition, duration = 1000) => {
  const startPosition = marker.getPosition();
  const startLat = startPosition.lat();
  const startLng = startPosition.lng();
  const endLat = newPosition.lat;
  const endLng = newPosition.lng;
  const startTime = Date.now();

  const animate = () => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const ease =
      progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;

    marker.setPosition({
      lat: startLat + (endLat - startLat) * ease,
      lng: startLng + (endLng - startLng) * ease,
    });

    if (progress < 1) requestAnimationFrame(animate);
  };

  animate();
};

const getMapType = () => {
  const tenant = getTenantData();
  const mapsApi = tenant?.maps_api?.trim().toLowerCase();
  const countryOfUse = tenant?.country_of_use?.trim().toUpperCase();

  if (countryOfUse === "IN") {
    if (mapsApi === "google") return "google";
    return "barikoi";
  }

  if (mapsApi === "barikoi") return "barikoi";
  return "google";
};

const getApiKeys = () => {
  const tenant = getTenantData();
  return {
    googleKey: tenant?.google_api_key || GOOGLE_KEY,
    barikoiKey: tenant?.barikoi_api_key || BARIKOI_KEY,
  };
};

const COUNTRY_CENTERS = {
  IN: { lat: 20.5937, lng: 78.9629 },
  AU: { lat: -25.2744, lng: 133.7751 },
  US: { lat: 37.0902, lng: -95.7129 },
  GB: { lat: 55.3781, lng: -3.4360 },
  BD: { lat: 23.8103, lng: 90.4125 },
  PK: { lat: 30.3753, lng: 69.3451 },
  AE: { lat: 23.4241, lng: 53.8478 },
  SA: { lat: 23.8859, lng: 45.0792 },
  CA: { lat: 56.1304, lng: -106.3468 },
  NG: { lat: 9.0820, lng: 8.6753 },
  KE: { lat: -1.2921, lng: 36.8219 },
  ZA: { lat: -30.5595, lng: 22.9375 },
  SG: { lat: 1.3521, lng: 103.8198 },
  MY: { lat: 4.2105, lng: 101.9758 },
  ID: { lat: -0.7893, lng: 113.9213 },
  PH: { lat: 12.8797, lng: 121.7740 },
  NZ: { lat: -40.9006, lng: 174.8860 },
  DEFAULT: { lat: 0, lng: 0 },
};

const getCountryCenter = () => {
  const tenant = getTenantData();
  const countryCode = tenant?.country_of_use?.trim().toUpperCase();
  return COUNTRY_CENTERS[countryCode] || COUNTRY_CENTERS.DEFAULT;
};

const parseDriverData = (rawData) => {
  try {
    if (typeof rawData === "string") {
      let fixed = rawData
        .replace(/,\s*}/g, "}")
        .replace(/,\s*]/g, "]")
        .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":');
      return JSON.parse(fixed);
    }
    return rawData;
  } catch {
    if (typeof rawData === "string") {
      const latMatch = rawData.match(/"latitude":\s*([\d.]+)/);
      const lngMatch = rawData.match(/"longitude":\s*([\d.]+)/);
      const clientMatch = rawData.match(/"client_id":\s*"([^"]*)/);
      const dispatchMatch = rawData.match(/"dispatcher_id":\s*(\d+)/);
      const statusMatch = rawData.match(/"driving_status":\s*"([^"]*)"/);

      if (latMatch && lngMatch) {
        return {
          latitude: parseFloat(latMatch[1]),
          longitude: parseFloat(lngMatch[1]),
          client_id: clientMatch?.[1] ?? null,
          dispatcher_id: dispatchMatch ? parseInt(dispatchMatch[1]) : null,
          driving_status: statusMatch?.[1] ?? "idle",
        };
      }
    }
    return null;
  }
};

const GoogleMapView = ({
  mapRef,
  mapInstance,
  markers,
  driverData,
  selectedStatus,
  searchQuery,
  socket,
  setDriverData,
}) => {
  const { googleKey } = getApiKeys();

  const fitMapToMarkers = () => {
    if (!mapInstance.current || Object.keys(markers.current).length === 0)
      return;

    const bounds = new window.google.maps.LatLngBounds();
    let hasVisible = false;

    Object.values(markers.current).forEach((marker) => {
      if (marker.getVisible()) {
        bounds.extend(marker.getPosition());
        hasVisible = true;
      }
    });

    if (hasVisible) {
      mapInstance.current.fitBounds(bounds);
      if (mapInstance.current.getZoom() > 15) {
        mapInstance.current.setZoom(15);
      }
    }
  };

  useEffect(() => {
    let isMounted = true;

    loadGoogleMaps(googleKey)
      .then(() => {
        if (!isMounted || !mapRef.current || mapInstance.current) return;

        const center = getCountryCenter();
        mapInstance.current = new window.google.maps.Map(mapRef.current, {
          center: { lat: center.lat, lng: center.lng },
          zoom: 5,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }],
            },
          ],
        });
      })
      .catch((err) => console.error("Google Maps load failed:", err));

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleDriverUpdate = (rawData) => {
      if (!mapInstance.current) return;

      const data = parseDriverData(rawData);
      if (!data) return;

      const driver_id =
        data.client_id ||
        data.dispatcher_id ||
        data.driver_id ||
        data.id ||
        `driver_${Date.now()}`;
      const latitude = data.latitude;
      const longitude = data.longitude;
      const driving_status = data.driving_status || "idle";
      const name = data.name || data.driver_name || `Driver ${driver_id}`;
      const phoneNo = data?.phone_no || data?.mobile || "";
      const vehiclePlateNo = data?.plate_no || data?.vehicle_plate_no || "";

      if (
        latitude == null ||
        longitude == null ||
        isNaN(latitude) ||
        isNaN(longitude)
      )
        return;

      const position = { lat: Number(latitude), lng: Number(longitude) };

      setDriverData((prev) => ({
        ...prev,
        [driver_id]: { ...data, position, driving_status, name, phoneNo, vehiclePlateNo },
      }));

      const markerIcon = MARKER_ICONS[driving_status] || MARKER_ICONS.idle;
      // ── Rich popup with name + phone + plate ──
      const infoContent = buildInfoHTML({ name, phoneNo, vehiclePlateNo, driving_status });

      if (markers.current[driver_id]) {
        const marker = markers.current[driver_id];
        const oldPos = marker.getPosition();
        const latDiff = Math.abs(oldPos.lat() - position.lat);
        const lngDiff = Math.abs(oldPos.lng() - position.lng);
        const dist = Math.sqrt(latDiff ** 2 + lngDiff ** 2);

        if (dist < 0.01) {
          animateMarker(marker, position, 1000);
        } else {
          marker.setPosition(position);
        }

        marker.setIcon({
          url: markerIcon.url,
          scaledSize: new window.google.maps.Size(
            markerIcon.scaledSize.width,
            markerIcon.scaledSize.height
          ),
          anchor: new window.google.maps.Point(
            markerIcon.anchor.x,
            markerIcon.anchor.y
          ),
        });
        marker.infoWindow?.setContent(infoContent);
      } else {
        const marker = new window.google.maps.Marker({
          position,
          map: mapInstance.current,
          title: name,
          icon: {
            url: markerIcon.url,
            scaledSize: new window.google.maps.Size(
              markerIcon.scaledSize.width,
              markerIcon.scaledSize.height
            ),
            anchor: new window.google.maps.Point(
              markerIcon.anchor.x,
              markerIcon.anchor.y
            ),
          },
          animation: window.google.maps.Animation.DROP,
        });

        const infoWindow = new window.google.maps.InfoWindow({
          content: infoContent,
        });

        marker.isOpen = false;

        marker.addListener("click", () => {
          if (marker.isOpen) {
            infoWindow.close();
            marker.isOpen = false;
          } else {
            Object.values(markers.current).forEach((m) => {
              m.infoWindow?.close();
              m.isOpen = false;
            });

            infoWindow.open(mapInstance.current, marker);
            marker.isOpen = true;
          }
        });

        marker.infoWindow = infoWindow;
        markers.current[driver_id] = marker;
      }

      if (Object.keys(markers.current).length <= 1) {
        setTimeout(() => fitMapToMarkers(), 100);
      }
    };

    socket.on("driver-location-update", handleDriverUpdate);
    return () => socket.off("driver-location-update", handleDriverUpdate);
  }, [socket]);

  useEffect(() => {
    Object.entries(markers.current).forEach(([id, marker]) => {
      const driver = driverData[id];
      if (!driver) return;

      let visible = true;
      if (selectedStatus.value !== "all") {
        visible = driver.driving_status === selectedStatus.value;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          driver.name?.toLowerCase().includes(q) ||
          id.toString().includes(q);
        visible = visible && matches;
      }
      marker.setVisible(visible);
    });

    setTimeout(() => fitMapToMarkers(), 100);
  }, [selectedStatus, searchQuery, driverData]);

  return (
    <div
      ref={mapRef}
      className="w-full h-[550px] rounded-xl border border-gray-300 shadow-sm"
    />
  );
};

const BarikoiMapView = ({
  mapRef,
  mapInstance,
  markers,
  driverData,
  selectedStatus,
  searchQuery,
  socket,
  setDriverData,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const { barikoiKey } = getApiKeys();

  const fitMapToMarkers = () => {
    if (!mapInstance.current || Object.keys(markers.current).length === 0)
      return;

    let minLat = Infinity,
      maxLat = -Infinity,
      minLng = Infinity,
      maxLng = -Infinity;
    let hasVisible = false;

    Object.values(markers.current).forEach((marker) => {
      if (marker._visible === false) return;
      const lngLat = marker.getLngLat();
      minLat = Math.min(minLat, lngLat.lat);
      maxLat = Math.max(maxLat, lngLat.lat);
      minLng = Math.min(minLng, lngLat.lng);
      maxLng = Math.max(maxLng, lngLat.lng);
      hasVisible = true;
    });

    if (hasVisible && mapInstance.current) {
      mapInstance.current.fitBounds(
        [
          [minLng, minLat],
          [maxLng, maxLat],
        ],
        { padding: 60, maxZoom: 15 }
      );
    }
  };

  useEffect(() => {
    let isMounted = true;

    loadBarikoiMaps()
      .then(() => {
        if (!isMounted || !mapRef.current || mapInstance.current) return;

        const center = getCountryCenter();
        mapInstance.current = new window.maplibregl.Map({
          container: mapRef.current,
          style: `https://map.barikoi.com/styles/osm-liberty/style.json?key=${BARIKOI_KEY}`,
          center: [center.lng, center.lat],
          zoom: 5,
        });

        mapInstance.current.on("load", () => {
          mapInstance.current.resize();
        });

        mapInstance.current.addControl(
          new window.maplibregl.NavigationControl()
        );

        setIsLoaded(true);
      })
      .catch((err) => console.error("Barikoi Maps load failed:", err));

    return () => {
      isMounted = false;
      if (mapInstance.current) {
        Object.values(markers.current).forEach((m) => m.remove());
        markers.current = {};
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!socket || !isLoaded) return;

    const handleDriverUpdate = (rawData) => {
      if (!mapInstance.current) return;

      const data = parseDriverData(rawData);
      if (!data) return;

      const driver_id =
        data.client_id ||
        data.dispatcher_id ||
        data.driver_id ||
        data.id ||
        `driver_${Date.now()}`;
      const latitude = data.latitude;
      const longitude = data.longitude;
      const driving_status = data.driving_status || "idle";
      const name = data.name || data.driver_name || `Driver ${driver_id}`;
      const phoneNo = data?.phone_no || data?.mobile || "";
      const vehiclePlateNo = data?.plate_no || data?.vehicle_plate_no || "";

      if (
        latitude == null ||
        longitude == null ||
        isNaN(latitude) ||
        isNaN(longitude)
      )
        return;

      const position = [Number(longitude), Number(latitude)];

      setDriverData((prev) => ({
        ...prev,
        [driver_id]: {
          ...data,
          position: { lat: Number(latitude), lng: Number(longitude) },
          driving_status,
          name,
          phoneNo,
          vehiclePlateNo,
        },
      }));

      // ── Rich popup with name + phone + plate ──
      const popupHTML = buildInfoHTML({ name, phoneNo, vehiclePlateNo, driving_status });

      if (markers.current[driver_id]) {
        markers.current[driver_id].setLngLat(position);

        const el = markers.current[driver_id].getElement();
        const img = el.querySelector("img");
        if (img) {
          const iconData = MARKER_ICONS[driving_status] || MARKER_ICONS.idle;
          img.src = iconData.url;
        }

        markers.current[driver_id].getPopup()?.setHTML(popupHTML);
      } else {
        const el = createSvgMarkerEl(driving_status);

        const popup = new window.maplibregl.Popup({
          offset: 25,
          closeButton: false,
          closeOnClick: false,
          maxWidth: "240px",
        }).setHTML(popupHTML);

        const marker = new window.maplibregl.Marker({ element: el })
          .setLngLat(position)
          .setPopup(popup)
          .addTo(mapInstance.current);

        marker._isOpen = false;

        el.addEventListener("click", () => {
          if (marker._isOpen) {
            popup.remove();
            marker._isOpen = false;
          } else {
            Object.values(markers.current).forEach((m) => {
              m.getPopup()?.remove();
              m._isOpen = false;
            });

            popup.addTo(mapInstance.current);
            marker._isOpen = true;
          }
        });

        marker._visible = true;
        markers.current[driver_id] = marker;
      }

      if (Object.keys(markers.current).length <= 1) {
        setTimeout(() => fitMapToMarkers(), 100);
      }
    };

    socket.on("driver-location-update", handleDriverUpdate);
    return () => socket.off("driver-location-update", handleDriverUpdate);
  }, [socket, isLoaded]);

  useEffect(() => {
    Object.entries(markers.current).forEach(([id, marker]) => {
      const driver = driverData[id];
      if (!driver) return;

      let visible = true;
      if (selectedStatus.value !== "all") {
        visible = driver.driving_status === selectedStatus.value;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          driver.name?.toLowerCase().includes(q) ||
          id.toString().includes(q);
        visible = visible && matches;
      }

      marker._visible = visible;
      const el = marker.getElement();
      el.style.display = visible ? "flex" : "none";
    });

    setTimeout(() => fitMapToMarkers(), 100);
  }, [selectedStatus, searchQuery, driverData]);

  return (
    <div
      ref={mapRef}
      className="w-full h-[550px] rounded-xl border border-gray-300 shadow-sm"
    />
  );
};

const Map = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(
    MAP_STATUS_OPTIONS.find((o) => o.value === "all") ?? MAP_STATUS_OPTIONS[0]
  );
  const [driverData, setDriverData] = useState({});
  const [mapType] = useState(() => getMapType());
  const socket = useSocket();
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markers = useRef({});

  const sharedProps = {
    mapRef,
    mapInstance,
    markers,
    driverData,
    selectedStatus,
    searchQuery,
    socket,
    setDriverData,
  };

  return (
    <div className="px-4 py-5 sm:p-6 lg:p-10 min-h-[calc(100vh-85px)]">
      <div className="flex flex-col gap-2.5 sm:mb-[30px] mb-6">
        <PageTitle title="Map" />
        <PageSubTitle title="Driver Location & Aerial View" />
      </div>

      <CardContainer className="p-4 bg-[#F5F5F5]">
        <div className="flex flex-row items-stretch sm:items-center gap-3 sm:gap-5 justify-end mb-4 sm:mb-0 pb-4">
          <div className="md:flex flex-row gap-3 sm:gap-5 w-full sm:w-auto">
            <CustomSelect
              variant={2}
              options={MAP_STATUS_OPTIONS}
              value={selectedStatus}
              onChange={setSelectedStatus}
              placeholder="Driver Status"
            />
          </div>
        </div>

        {mapType === "barikoi" ? (
          <BarikoiMapView {...sharedProps} />
        ) : (
          <GoogleMapView {...sharedProps} />
        )}

        <div className="flex justify-center gap-10 flex-wrap py-4 mt-3 border-t">
          <div className="flex items-center gap-2">
            <RedCarIcon width={30} height={30} />
            <span className="text-sm font-medium">Idle Drivers</span>
          </div>
          <div className="flex items-center gap-2">
            <GreenCarIcon width={30} height={30} />
            <span className="text-sm font-medium">Active Drivers</span>
          </div>
        </div>
      </CardContainer>
    </div>
  );
};

export default Map;