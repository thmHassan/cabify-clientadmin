import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { fetchMapConfig } from "../utils/map/fetchMapConfig";
import { isAuthenticated } from "../utils/functions/tokenEncryption";
import { useAppSelector } from "../store";

const defaultConfig = {
  loading: true,
  provider: "mapify",
  mapsApi: "mapify",
  googleKey: null,
  barikoiKey: null,
  countryOfUse: "",
  searchApi: "mapify",
  configError: null,
  settings: {},
  apiKeysData: {},
};

const MapConfigContext = createContext(null);

export const useMapConfig = () => {
  const context = useContext(MapConfigContext);
  if (!context) {
    throw new Error("useMapConfig must be used within a MapConfigProvider");
  }
  return context;
};

export const MapConfigProvider = ({ children }) => {
  const [config, setConfig] = useState(defaultConfig);
  const [reloadKey, setReloadKey] = useState(0);
  const authToken = useAppSelector((state) => state.auth.session.token);
  const signedIn = useAppSelector((state) => state.auth.session.signedIn);

  const refreshMapConfig = useCallback(() => {
    setReloadKey((key) => key + 1);
  }, []);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (!isAuthenticated()) {
        if (!mounted) return;
        setConfig({ ...defaultConfig, loading: false });
        return;
      }

      setConfig((prev) => ({ ...prev, loading: true }));

      try {
        const result = await fetchMapConfig();
        if (!mounted) return;

        setConfig({
          loading: false,
          provider: result.provider,
          mapsApi: result.mapsApi,
          googleKey: result.googleKey,
          barikoiKey: result.barikoiKey,
          countryOfUse: result.countryOfUse,
          searchApi: result.searchApi,
          configError: result.configError,
          settings: result.settings,
          apiKeysData: result.apiKeysData,
        });
      } catch (error) {
        console.error("MapConfigProvider error:", error);
        if (!mounted) return;
        setConfig({
          ...defaultConfig,
          loading: false,
          configError: "Unable to load map configuration",
        });
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [reloadKey, authToken, signedIn]);

  const value = {
    ...config,
    refreshMapConfig,
  };

  return (
    <MapConfigContext.Provider value={value}>{children}</MapConfigContext.Provider>
  );
};

export default MapConfigContext;
