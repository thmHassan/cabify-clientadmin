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

const loadGoogleMaps = () => {
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
    // If already fully loaded
    if (window.maplibregl && window.maplibregl.Map) {
      return resolve();
    }

    const existingScript = document.getElementById("maplibre-script");

    if (existingScript) {
      // Wait until it's actually ready
      existingScript.onload = () => {
        if (window.maplibregl && window.maplibregl.Map) {
          resolve();
        } else {
          reject(new Error("MapLibre failed to initialize"));
        }
      };
      return;
    }

    // Add CSS if not added
    if (!document.getElementById("maplibre-css")) {
      const link = document.createElement("link");
      link.id = "maplibre-css";
      link.rel = "stylesheet";
      link.href =
        "https://unpkg.com/maplibre-gl@2.4.0/dist/maplibre-gl.css";
      document.head.appendChild(link);
    }

    const script = document.createElement("script");
    script.id = "maplibre-script";
    script.src =
      "https://unpkg.com/maplibre-gl@2.4.0/dist/maplibre-gl.js";
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
  const mapsApi = tenant?.maps_api;

  // Only "barikoi" (case-insensitive) → Barikoi
  // Everything else (google, both, null, undefined, "") → Google
  if (typeof mapsApi === "string" && mapsApi.trim().toLowerCase() === "barikoi") {
    return "barikoi";
  }
  return "google";
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

    loadGoogleMaps()
      .then(() => {
        if (!isMounted || !mapRef.current || mapInstance.current) return;

        mapInstance.current = new window.google.maps.Map(mapRef.current, {
          center: { lat: 23.0225, lng: 72.5714 },
          zoom: 13,
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
      const phoneNo = data?.phone_no || "";
      const vehiclePlateNo = data?.plate_no || "";

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
        [driver_id]: { ...data, position, driving_status, name },
      }));

      const markerIcon =
        MARKER_ICONS[driving_status] || MARKER_ICONS.idle;

      const infoContent = `
        <div style="padding:5px;">
          <strong>${name}</strong><br/>
          Phone: ${phoneNo}<br/>
          Vehicle: ${vehiclePlateNo}
        </div>`;

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

        marker.setIcon(markerIcon);
        marker.infoWindow?.setContent(infoContent);
      } else {
        const marker = new window.google.maps.Marker({
          position,
          map: mapInstance.current,
          title: name,
          icon: markerIcon,
          animation: window.google.maps.Animation.DROP,
        });

        const infoWindow = new window.google.maps.InfoWindow({
          content: infoContent,
        });

        marker.addListener("click", () => {
          Object.values(markers.current).forEach((m) =>
            m.infoWindow?.close()
          );
          infoWindow.open(mapInstance.current, marker);
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

  const createBarikoiMarkerEl = (status) => {
    const color = status === "busy" ? "#22c55e" : "#ef4444";
    const el = document.createElement("div");
    el.style.cssText = `
      width: 40px; height: 40px;
      background-color: ${color};
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex; align-items: center; justify-content: center;
      font-size: 18px; cursor: pointer;
    `;
    el.innerHTML = "🚗";
    return el;
  };

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

        mapInstance.current = new window.maplibregl.Map({
          container: mapRef.current,
          style: `https://map.barikoi.com/styles/barikoi-light/style.json?key=${BARIKOI_KEY}`,
          // center: [72.5714, 23.0225],
          // zoom: 13,
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
      const phoneNo = data?.phone_no || "";
      const vehiclePlateNo = data?.plate_no || "";

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
        },
      }));

      const popupHTML = `
        <div style="padding:8px; min-width:150px;">
          <strong>${name}</strong><br/>
          Phone: ${phoneNo}<br/>
          Vehicle: ${vehiclePlateNo}<br/>
          Status: <span style="color:${driving_status === "busy" ? "#22c55e" : "#ef4444"}">${driving_status}</span>
        </div>`;

      if (markers.current[driver_id]) {
        markers.current[driver_id].setLngLat(position);

        const el = markers.current[driver_id].getElement();
        el.style.backgroundColor =
          driving_status === "busy" ? "#22c55e" : "#ef4444";

        markers.current[driver_id].getPopup()?.setHTML(popupHTML);
      } else {
        const el = createBarikoiMarkerEl(driving_status);

        const popup = new window.maplibregl.Popup({ offset: 25 }).setHTML(
          popupHTML
        );

        const marker = new window.maplibregl.Marker({ element: el })
          .setLngLat(position)
          .setPopup(popup)
          .addTo(mapInstance.current);

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
          {/* <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-1 rounded-full bg-gray-200 text-gray-600 font-medium">
              {mapType === "barikoi" ? "🗺 Barikoi Map" : "🗺 Google Map"}
            </span>
          </div> */}
        </div>
      </CardContainer>
    </div>
  );
};

export default Map;