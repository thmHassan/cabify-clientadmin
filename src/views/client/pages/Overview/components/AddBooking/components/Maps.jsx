import { useEffect, useRef, useState } from "react";
import { getTenantData } from "../../../../../../../utils/functions/tokenEncryption";

const COUNTRY_CENTERS = {
    IN: { lat: 20.5937, lng: 78.9629 },    // India
    AU: { lat: -25.2744, lng: 133.7751 },  // Australia
    US: { lat: 37.0902, lng: -95.7129 },   // USA
    GB: { lat: 55.3781, lng: -3.4360 },    // UK
    BD: { lat: 23.8103, lng: 90.4125 },    // Bangladesh
    PK: { lat: 30.3753, lng: 69.3451 },    // Pakistan
    AE: { lat: 23.4241, lng: 53.8478 },    // UAE
    SA: { lat: 23.8859, lng: 45.0792 },    // Saudi Arabia
    CA: { lat: 56.1304, lng: -106.3468 },  // Canada
    NG: { lat: 9.0820, lng: 8.6753 },     // Nigeria
    KE: { lat: -1.2921, lng: 36.8219 },    // Kenya
    ZA: { lat: -30.5595, lng: 22.9375 },   // South Africa
    SG: { lat: 1.3521, lng: 103.8198 },   // Singapore
    MY: { lat: 4.2105, lng: 101.9758 },   // Malaysia
    ID: { lat: -0.7893, lng: 113.9213 },   // Indonesia
    PH: { lat: 12.8797, lng: 121.7740 },   // Philippines
    NZ: { lat: -40.9006, lng: 174.8860 },  // New Zealand
    DEFAULT: { lat: 0, lng: 20 },
};

const getCountryCenter = () => {
    const tenant = getTenantData();
    const countryCode = tenant?.country_of_use?.trim().toUpperCase();
    return COUNTRY_CENTERS[countryCode] || COUNTRY_CENTERS.DEFAULT;
};

const GoogleMap = ({
    googleApiKey,
    pickupCoords,
    destinationCoords,
    viaCoords,
    setFieldValue,
    fetchPlotName,
    setPickupPlotData,
    setDestinationPlotData,
    SEARCH_API
}) => {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markersRef = useRef([]);
    const directionsRendererRef = useRef(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const clickCountRef = useRef(0);

    useEffect(() => {
        if (window.google?.maps) {
            setIsLoaded(true);
            return;
        }

        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${googleApiKey}&libraries=places`;
        script.async = true;
        script.onload = () => setIsLoaded(true);
        script.onerror = () => console.error("Failed to load Google Maps");
        document.head.appendChild(script);
    }, [googleApiKey]);

    const getAddressFromCoords = async (lat, lng) => {
        if (SEARCH_API === "google" || SEARCH_API === "both") {
            const geocoder = new window.google.maps.Geocoder();
            return new Promise((resolve) => {
                geocoder.geocode({ location: { lat, lng } }, (results, status) => {
                    if (status === "OK" && results[0]) {
                        resolve(results[0].formatted_address);
                    } else {
                        resolve(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
                    }
                });
            });
        }
        return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    };

    // Initialize map once
    useEffect(() => {
        if (!isLoaded || !mapRef.current || mapInstanceRef.current) return;

        try {
            // Use country-based center instead of hardcoded coordinates
            const center = getCountryCenter();

            mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
                zoom: 5,
                center: { lat: center.lat, lng: center.lng },
                mapTypeControl: true,
                streetViewControl: false,
                fullscreenControl: true,
            });

            directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
                map: mapInstanceRef.current,
                suppressMarkers: true,
                polylineOptions: {
                    strokeColor: "#4285F4",
                    strokeWeight: 4,
                },
            });

            // Click listener
            mapInstanceRef.current.addListener('click', async (event) => {
                const lat = event.latLng.lat();
                const lng = event.latLng.lng();

                clickCountRef.current += 1;

                const address = await getAddressFromCoords(lat, lng);
                const plotData = await fetchPlotName(lat, lng);

                if (clickCountRef.current === 1) {
                    setFieldValue('pickup_point', address);
                    setFieldValue('pickup_latitude', lat);
                    setFieldValue('pickup_longitude', lng);
                    setFieldValue('pickup_plot_id', plotData.id);
                    setPickupPlotData(plotData);
                } else if (clickCountRef.current === 2) {
                    setFieldValue('destination', address);
                    setFieldValue('destination_latitude', lat);
                    setFieldValue('destination_longitude', lng);
                    setFieldValue('destination_plot_id', plotData.id);
                    setDestinationPlotData(plotData);
                    clickCountRef.current = 0;
                }
            });

        } catch (error) {
            console.error("Error initializing map:", error);
        }
    }, [isLoaded]);

    // Update markers and route (debounced)
    useEffect(() => {
        if (!mapInstanceRef.current || !isLoaded) return;

        const timeoutId = setTimeout(() => {
            const map = mapInstanceRef.current;

            markersRef.current.forEach(marker => {
                if (marker && marker.setMap) marker.setMap(null);
            });
            markersRef.current = [];

            const bounds = new window.google.maps.LatLngBounds();
            let hasCoordinates = false;

            if (pickupCoords?.lat && pickupCoords?.lng) {
                try {
                    const marker = new window.google.maps.Marker({
                        position: pickupCoords,
                        map,
                        icon: {
                            path: window.google.maps.SymbolPath.CIRCLE,
                            scale: 10,
                            fillColor: "#4CAF50",
                            fillOpacity: 1,
                            strokeColor: "#ffffff",
                            strokeWeight: 2,
                        },
                        label: { text: "P", color: "#ffffff", fontWeight: "bold" },
                        title: "Pickup Point",
                    });
                    markersRef.current.push(marker);
                    bounds.extend(pickupCoords);
                    hasCoordinates = true;
                } catch (e) { console.error("Pickup marker error:", e); }
            }

            if (viaCoords && Array.isArray(viaCoords)) {
                viaCoords.forEach((coord, index) => {
                    if (coord?.lat && coord?.lng) {
                        try {
                            const marker = new window.google.maps.Marker({
                                position: coord,
                                map,
                                icon: {
                                    path: window.google.maps.SymbolPath.CIRCLE,
                                    scale: 10,
                                    fillColor: "#2196F3",
                                    fillOpacity: 1,
                                    strokeColor: "#ffffff",
                                    strokeWeight: 2,
                                },
                                label: { text: `${index + 1}`, color: "#ffffff", fontWeight: "bold" },
                                title: `Via Point ${index + 1}`,
                            });
                            markersRef.current.push(marker);
                            bounds.extend(coord);
                            hasCoordinates = true;
                        } catch (e) { console.error(`Via marker ${index} error:`, e); }
                    }
                });
            }

            if (destinationCoords?.lat && destinationCoords?.lng) {
                try {
                    const marker = new window.google.maps.Marker({
                        position: destinationCoords,
                        map,
                        icon: {
                            path: window.google.maps.SymbolPath.CIRCLE,
                            scale: 10,
                            fillColor: "#F44336",
                            fillOpacity: 1,
                            strokeColor: "#ffffff",
                            strokeWeight: 2,
                        },
                        label: { text: "D", color: "#ffffff", fontWeight: "bold" },
                        title: "Destination",
                    });
                    markersRef.current.push(marker);
                    bounds.extend(destinationCoords);
                    hasCoordinates = true;
                } catch (e) { console.error("Destination marker error:", e); }
            }

            if (pickupCoords?.lat && pickupCoords?.lng &&
                destinationCoords?.lat && destinationCoords?.lng &&
                directionsRendererRef.current) {

                const directionsService = new window.google.maps.DirectionsService();
                const waypoints = (viaCoords || [])
                    .filter(coord => coord?.lat && coord?.lng)
                    .map(coord => ({
                        location: new window.google.maps.LatLng(coord.lat, coord.lng),
                        stopover: true,
                    }));

                directionsService.route(
                    {
                        origin: pickupCoords,
                        destination: destinationCoords,
                        waypoints,
                        travelMode: window.google.maps.TravelMode.DRIVING,
                    },
                    (result, status) => {
                        if (status === "OK" && directionsRendererRef.current) {
                            directionsRendererRef.current.setDirections(result);
                        } else {
                            if (directionsRendererRef.current) {
                                directionsRendererRef.current.setDirections({ routes: [] });
                            }
                        }
                    }
                );
            } else {
                if (directionsRendererRef.current) {
                    directionsRendererRef.current.setDirections({ routes: [] });
                }
            }

            if (hasCoordinates) {
                map.fitBounds(bounds);
                window.google.maps.event.addListenerOnce(map, 'bounds_changed', () => {
                    if (map.getZoom() > 15) map.setZoom(15);
                });
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [pickupCoords, destinationCoords, viaCoords, isLoaded]);

    useEffect(() => {
        return () => {
            markersRef.current.forEach(marker => {
                if (marker && marker.setMap) marker.setMap(null);
            });
            markersRef.current = [];
        };
    }, []);

    return (
        <div ref={mapRef} style={{ width: "100%", height: "400px", borderRadius: "8px" }}>
            {!isLoaded && (
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    height: '100%', backgroundColor: '#f3f4f6', borderRadius: '8px'
                }}>
                    <p style={{ color: '#6b7280' }}>Loading map...</p>
                </div>
            )}
        </div>
    );
};

const BarikoiMap = ({
    apiKey,
    pickupCoords,
    destinationCoords,
    viaCoords,
    setFieldValue,
    fetchPlotName,
    setPickupPlotData,
    setDestinationPlotData
}) => {
    const containerRef = useRef(null);
    const mapRef = useRef(null);
    const markersRef = useRef([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const clickCountRef = useRef(0);

    useEffect(() => {
        if (window.maplibregl) {
            setIsLoaded(true);
            return;
        }

        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/maplibre-gl@2.4.0/dist/maplibre-gl.css";
        document.head.appendChild(link);

        const script = document.createElement("script");
        script.src = "https://unpkg.com/maplibre-gl@2.4.0/dist/maplibre-gl.js";
        script.async = true;
        script.onload = () => setIsLoaded(true);
        script.onerror = () => console.error("Failed to load MapLibre GL");
        document.head.appendChild(script);
    }, []);

    // Initialize map once
    useEffect(() => {
        if (!isLoaded || !containerRef.current || mapRef.current || !apiKey) return;

        try {
            // Use country-based center instead of hardcoded coordinates
            const center = getCountryCenter();

            mapRef.current = new window.maplibregl.Map({
                container: containerRef.current,
                style: `https://map.barikoi.com/styles/barikoi-light/style.json?key=${apiKey}`,
                // center: [center.lng, center.lat],
                // zoom: 5,
                center: [90.4125, 23.8103],
                zoom: 13,
            });

            mapRef.current.addControl(new window.maplibregl.NavigationControl());

            // Click listener
            mapRef.current.on('click', async (e) => {
                const lat = e.lngLat.lat;
                const lng = e.lngLat.lng;

                clickCountRef.current += 1;

                const address = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
                const plotData = await fetchPlotName(lat, lng);

                if (clickCountRef.current === 1) {
                    setFieldValue('pickup_point', address);
                    setFieldValue('pickup_latitude', lat);
                    setFieldValue('pickup_longitude', lng);
                    setFieldValue('pickup_plot_id', plotData.id);
                    setPickupPlotData(plotData);
                } else if (clickCountRef.current === 2) {
                    setFieldValue('destination', address);
                    setFieldValue('destination_latitude', lat);
                    setFieldValue('destination_longitude', lng);
                    setFieldValue('destination_plot_id', plotData.id);
                    setDestinationPlotData(plotData);
                    clickCountRef.current = 0;
                }
            });

        } catch (error) {
            console.error("Error initializing Barikoi map:", error);
        }

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, [apiKey, isLoaded]);

    // Update markers and route (debounced)
    useEffect(() => {
        if (!mapRef.current || !isLoaded) return;

        const timeoutId = setTimeout(() => {
            const updateMap = () => {
                markersRef.current.forEach(marker => marker.remove());
                markersRef.current = [];

                const bounds = new window.maplibregl.LngLatBounds();
                let hasCoordinates = false;

                const createMarkerEl = (color, text) => {
                    const el = document.createElement('div');
                    el.style.cssText = `
                        background-color: ${color};
                        width: 30px; height: 30px;
                        border-radius: 50%;
                        border: 3px solid white;
                        display: flex; align-items: center; justify-content: center;
                        color: white; font-weight: bold; font-size: 14px;
                        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                    `;
                    el.innerHTML = text;
                    return el;
                };

                if (pickupCoords?.lat && pickupCoords?.lng) {
                    const marker = new window.maplibregl.Marker({ element: createMarkerEl('#4CAF50', 'P') })
                        .setLngLat([pickupCoords.lng, pickupCoords.lat])
                        .addTo(mapRef.current);
                    markersRef.current.push(marker);
                    bounds.extend([pickupCoords.lng, pickupCoords.lat]);
                    hasCoordinates = true;
                }

                if (viaCoords && Array.isArray(viaCoords)) {
                    viaCoords.forEach((coord, index) => {
                        if (coord?.lat && coord?.lng) {
                            const marker = new window.maplibregl.Marker({ element: createMarkerEl('#2196F3', `${index + 1}`) })
                                .setLngLat([coord.lng, coord.lat])
                                .addTo(mapRef.current);
                            markersRef.current.push(marker);
                            bounds.extend([coord.lng, coord.lat]);
                            hasCoordinates = true;
                        }
                    });
                }

                if (destinationCoords?.lat && destinationCoords?.lng) {
                    const marker = new window.maplibregl.Marker({ element: createMarkerEl('#F44336', 'D') })
                        .setLngLat([destinationCoords.lng, destinationCoords.lat])
                        .addTo(mapRef.current);
                    markersRef.current.push(marker);
                    bounds.extend([destinationCoords.lng, destinationCoords.lat]);
                    hasCoordinates = true;
                }

                // Remove existing route
                if (mapRef.current.getLayer('route')) mapRef.current.removeLayer('route');
                if (mapRef.current.getSource('route')) mapRef.current.removeSource('route');

                if (pickupCoords?.lat && pickupCoords?.lng &&
                    destinationCoords?.lat && destinationCoords?.lng) {

                    const coordinates = [
                        [pickupCoords.lng, pickupCoords.lat],
                        ...(viaCoords || []).filter(c => c?.lat && c?.lng).map(c => [c.lng, c.lat]),
                        [destinationCoords.lng, destinationCoords.lat],
                    ];

                    mapRef.current.addSource('route', {
                        type: 'geojson',
                        data: {
                            type: 'Feature',
                            properties: {},
                            geometry: { type: 'LineString', coordinates },
                        },
                    });

                    mapRef.current.addLayer({
                        id: 'route',
                        type: 'line',
                        source: 'route',
                        layout: { 'line-join': 'round', 'line-cap': 'round' },
                        paint: { 'line-color': '#4285F4', 'line-width': 4 },
                    });
                }

                if (hasCoordinates) {
                    mapRef.current.fitBounds(bounds, { padding: 50, maxZoom: 15 });
                }
            };

            if (mapRef.current.isStyleLoaded()) {
                updateMap();
            } else {
                mapRef.current.on('load', updateMap);
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [pickupCoords, destinationCoords, viaCoords, isLoaded]);

    return (
        <div ref={containerRef} style={{ width: "100%", height: "400px", borderRadius: "8px" }}>
            {!isLoaded && (
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    height: '100%', backgroundColor: '#f3f4f6', borderRadius: '8px'
                }}>
                    <p style={{ color: '#6b7280' }}>Loading map...</p>
                </div>
            )}
        </div>
    );
};

export default function Maps({
    mapsApi,
    pickupCoords,
    destinationCoords,
    viaCoords = [],
    setFieldValue,
    fetchPlotName,
    setPickupPlotData,
    setDestinationPlotData,
    SEARCH_API
}) {
    const tenant = getTenantData();
    const barikoiApiKey = tenant?.barikoi_api_key || "bkoi_a468389d0211910bd6723de348e0de79559c435f07a17a5419cbe55ab55a890a";
    const googleApiKey = tenant?.google_api_key || "AIzaSyDTlV1tPVuaRbtvBQu4-kjDhTV54tR4cDU";

    if (mapsApi === "barikoi") {
        return (
            <BarikoiMap
                apiKey={barikoiApiKey}
                pickupCoords={pickupCoords}
                destinationCoords={destinationCoords}
                viaCoords={viaCoords}
                setFieldValue={setFieldValue}
                fetchPlotName={fetchPlotName}
                setPickupPlotData={setPickupPlotData}
                setDestinationPlotData={setDestinationPlotData}
            />
        );
    }

    return (
        <GoogleMap
            googleApiKey={googleApiKey}
            pickupCoords={pickupCoords}
            destinationCoords={destinationCoords}
            viaCoords={viaCoords}
            setFieldValue={setFieldValue}
            fetchPlotName={fetchPlotName}
            setPickupPlotData={setPickupPlotData}
            setDestinationPlotData={setDestinationPlotData}
            SEARCH_API={SEARCH_API}
        />
    );
}