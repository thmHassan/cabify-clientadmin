let maplibrePromise = null;

export const loadMapLibre = () => {
  if (window.maplibregl?.Map) return Promise.resolve();
  if (maplibrePromise) return maplibrePromise;

  maplibrePromise = new Promise((resolve, reject) => {
    if (!document.getElementById("maplibre-css")) {
      const link = document.createElement("link");
      link.id = "maplibre-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.css";
      document.head.appendChild(link);
    }

    const existing = document.getElementById("maplibre-script");
    if (existing) {
      const check = setInterval(() => {
        if (window.maplibregl?.Map) {
          clearInterval(check);
          resolve();
        }
      }, 100);
      setTimeout(() => {
        clearInterval(check);
        if (window.maplibregl?.Map) resolve();
        else reject(new Error("MapLibre load timeout"));
      }, 10000);
      return;
    }

    const script = document.createElement("script");
    script.id = "maplibre-script";
    script.src = "https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.js";
    script.async = true;
    script.onload = () => {
      setTimeout(() => {
        if (window.maplibregl?.Map) resolve();
        else reject(new Error("MapLibre not available after load"));
      }, 150);
    };
    script.onerror = () => {
      maplibrePromise = null;
      reject(new Error("MapLibre script failed to load"));
    };
    document.head.appendChild(script);
  });

  return maplibrePromise;
};
