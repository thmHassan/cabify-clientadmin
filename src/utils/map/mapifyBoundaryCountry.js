const MAPIFY_BOUNDARY_COUNTRY_ALIASES = {
  PK: "PAK",
  PAK: "PAK",
  PAKISTAN: "PAK",
  AE: "ARE",
  UAE: "ARE",
  ARE: "ARE",
  "UNITED ARAB EMIRATES": "ARE",
  BD: "BGD",
  BGD: "BGD",
  BANGLADESH: "BGD",
  IN: "IND",
  IND: "IND",
  INDIA: "IND",
  GB: "GBR",
  GBR: "GBR",
  UK: "GBR",
  "UNITED KINGDOM": "GBR",
  SA: "SAU",
  SAU: "SAU",
  QA: "QAT",
  QAT: "QAT",
  OM: "OMN",
  OMN: "OMN",
  KW: "KWT",
  KWT: "KWT",
  BH: "BHR",
  BHR: "BHR",
  US: "USA",
  USA: "USA",
  "UNITED STATES": "USA",
  "UNITED STATES OF AMERICA": "USA",
  CA: "CAN",
  CAN: "CAN",
  AU: "AUS",
  AUS: "AUS",
  MY: "MYS",
  MYS: "MYS",
  SG: "SGP",
  SGP: "SGP",
};

export const toMapifyBoundaryCountryCode = (code) => {
  const normalized = String(code ?? "").trim().toUpperCase();
  if (!normalized) return null;
  const mapped = MAPIFY_BOUNDARY_COUNTRY_ALIASES[normalized] || normalized;
  return /^[A-Z]{2,3}$/.test(mapped) ? mapped : null;
};
