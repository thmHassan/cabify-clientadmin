import { useEffect, useRef, useState } from "react";

const GoogleMap = ({
  googleApiKey,
  pickupCoords,
  destinationCoords,
  viaCoords = [],
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const directionsRendererRef = useRef(null);

  const [isLoaded, setIsLoaded] = useState(false);

  /* ----------------------------------
     Load Google Maps Script (once)
  -----------------------------------*/
  useEffect(() => {
    if (window.google?.maps) {
      setIsLoaded(true);
      return;
    }

    const existingScript = document.getElementById("google-maps-script");
    if (existingScript) {
      existingScript.onload = () => setIsLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.id = "google-maps-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${googleApiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setIsLoaded(true);
    script.onerror = () => console.error("❌ Failed to load Google Maps");
    document.head.appendChild(script);
  }, [googleApiKey]);

  /* ----------------------------------
     Initialize Map (once)
  -----------------------------------*/
  useEffect(() => {
    if (!isLoaded || !mapRef.current || mapInstanceRef.current) return;

    const center = { lat: 23.8103, lng: 90.4125 };

    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
      center,
      zoom: 12,
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
  }, [isLoaded]);

  /* ----------------------------------
     Update Markers & Route
  -----------------------------------*/
  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current) return;

    const map = mapInstanceRef.current;

    // Clear markers
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    const bounds = new window.google.maps.LatLngBounds();
    let hasPoints = false;

    const addMarker = (position, label, color, title) => {
      const marker = new window.google.maps.Marker({
        position,
        map,
        title,
        label: {
          text: label,
          color: "#fff",
          fontWeight: "bold",
        },
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: color,
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        },
      });

      markersRef.current.push(marker);
      bounds.extend(position);
      hasPoints = true;
    };

    // Pickup
    if (pickupCoords?.lat && pickupCoords?.lng) {
      addMarker(pickupCoords, "P", "#4CAF50", "Pickup");
    }

    // Via
    viaCoords.forEach((coord, index) => {
      if (coord?.lat && coord?.lng) {
        addMarker(coord, `${index + 1}`, "#2196F3", `Via ${index + 1}`);
      }
    });

    // Destination
    if (destinationCoords?.lat && destinationCoords?.lng) {
      addMarker(destinationCoords, "D", "#F44336", "Destination");
    }

    // Draw Route
    if (
      pickupCoords?.lat &&
      pickupCoords?.lng &&
      destinationCoords?.lat &&
      destinationCoords?.lng
    ) {
      const directionsService = new window.google.maps.DirectionsService();

      const waypoints = viaCoords
        .filter((c) => c?.lat && c?.lng)
        .map((c) => ({
          location: new window.google.maps.LatLng(c.lat, c.lng),
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
          if (status === "OK") {
            directionsRendererRef.current.setDirections(result);
          } else {
            console.error("❌ Directions failed:", status);
            directionsRendererRef.current.setDirections({ routes: [] });
          }
        }
      );
    } else {
      directionsRendererRef.current.setDirections({ routes: [] });
    }

    // Fit bounds
    if (hasPoints) {
      map.fitBounds(bounds);
      window.google.maps.event.addListenerOnce(map, "bounds_changed", () => {
        if (map.getZoom() > 15) map.setZoom(15);
      });
    }
  }, [pickupCoords, destinationCoords, viaCoords, isLoaded]);

  /* ----------------------------------
     Cleanup
  -----------------------------------*/
  useEffect(() => {
    return () => {
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];
    };
  }, []);

  return (
    <div
      ref={mapRef}
      style={{
        width: "100%",
        height: "100%",
        borderRadius: "8px",
        position: "relative",
      }}
    >
      {!isLoaded && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#f3f4f6",
            borderRadius: "8px",
            zIndex: 1,
          }}
        >
          <p style={{ color: "#6b7280" }}>Loading map...</p>
        </div>
      )}
    </div>
  );
};

export default GoogleMap;
