import { useEffect, useState } from "react";
import { apiGetCompanyApiKeys } from "../../services/SettingsConfigurationServices";
import { getTenantData } from "../functions/tokenEncryption";
import { hasTenantDistanceUnit, resolveDistanceUnit } from "../tenantFormatUtils";

const useDistanceUnit = () => {
    const [distanceUnit, setDistanceUnit] = useState(() =>
        resolveDistanceUnit({ tenant: getTenantData() })
    );

    useEffect(() => {
        const tenant = getTenantData();
        const tenantUnit = resolveDistanceUnit({ tenant });

        if (hasTenantDistanceUnit(tenant)) {
            setDistanceUnit(tenantUnit);
            return;
        }

        let cancelled = false;

        const fetchUnit = async () => {
            try {
                const res = await apiGetCompanyApiKeys();
                if (!cancelled && res?.data?.success) {
                    setDistanceUnit(
                        resolveDistanceUnit({
                            tenant,
                            apiUnits: res.data.data?.units,
                        })
                    );
                }
            } catch (err) {
                console.error("Fetch distance unit error:", err);
            }
        };

        fetchUnit();

        return () => {
            cancelled = true;
        };
    }, []);

    return distanceUnit;
};

export default useDistanceUnit;
