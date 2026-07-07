let googleMapsPromise = null;

export const loadGoogleMaps = (apiKey) => {
  if (!apiKey) {
    return Promise.reject(new Error("Google Maps API key is missing"));
  }
  if (window.google?.maps?.places) return Promise.resolve();
  if (googleMapsPromise) return googleMapsPromise;

  const existing = document.querySelector('script[src*="maps.googleapis.com"]');
  if (existing) {
    googleMapsPromise = new Promise((resolve, reject) => {
      if (window.google?.maps) return resolve();
      existing.addEventListener("load", resolve);
      existing.addEventListener("error", reject);
      setTimeout(() => {
        if (window.google?.maps) resolve();
        else reject(new Error("Google Maps load timeout"));
      }, 10000);
    });
    return googleMapsPromise;
  }

  googleMapsPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.onload = resolve;
    script.onerror = () => {
      googleMapsPromise = null;
      reject(new Error("Google Maps script failed to load"));
    };
    document.head.appendChild(script);
  });

  return googleMapsPromise;
};
