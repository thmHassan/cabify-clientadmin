export const COUNTRY_CENTERS = {
  GB: { lat: 51.5074, lng: -0.1278 },
  US: { lat: 37.0902, lng: -95.7129 },
  IN: { lat: 20.5937, lng: 78.9629 },
  AU: { lat: -25.2744, lng: 133.7751 },
  CA: { lat: 56.1304, lng: -106.3468 },
  AE: { lat: 23.4241, lng: 53.8478 },
  PK: { lat: 30.3753, lng: 69.3451 },
  BD: { lat: 23.8103, lng: 90.4125 },
  SA: { lat: 23.8859, lng: 45.0792 },
  NG: { lat: 9.082, lng: 8.6753 },
  ZA: { lat: -30.5595, lng: 22.9375 },
  DE: { lat: 51.1657, lng: 10.4515 },
  FR: { lat: 46.2276, lng: 2.2137 },
  IT: { lat: 41.8719, lng: 12.5674 },
  ES: { lat: 40.4637, lng: -3.7492 },
  NL: { lat: 52.1326, lng: 5.2913 },
  SG: { lat: 1.3521, lng: 103.8198 },
  MY: { lat: 4.2105, lng: 101.9758 },
  NZ: { lat: -40.9006, lng: 172.886 },
  KE: { lat: -1.2921, lng: 36.8219 },
  ID: { lat: -0.7893, lng: 113.9213 },
  PH: { lat: 12.8797, lng: 121.774 },
  DEFAULT: { lat: 20, lng: 0 },
};

export const getCountryCenter = (countryCode) => {
  const code = (countryCode || "").trim().toUpperCase();
  return COUNTRY_CENTERS[code] || COUNTRY_CENTERS.DEFAULT;
};

export const getCountryCenterLngLat = (countryCode) => {
  const { lat, lng } = getCountryCenter(countryCode);
  return [lng, lat];
};
