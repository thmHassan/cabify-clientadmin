export const ROUTE_FEATURE_MAP = {
    "accounts": "accounts",
    "finance-center": { flag: "finance_center", defaultVisible: true },
    // "map": "map",
    "manage-zones": "manage_zones",
    "plots": { flag: "zone", defaultVisible: true },
    "lost-found": "lost_found",
    "dispatcher": "dispatcher",
    "sub-company": "sub_company",
    "revenue-statements": "revenue_statements",
    "general-notification": "push_notification", 
};

/**
 * Checks if a feature is enabled across common backend payload formats.
 * @param {string|number|boolean} value
 * @returns {boolean}
 */
const isFeatureEnabled = (value) => {
    if (value === true) return true;
    if (value === false || value === null || value === undefined) return false;

    const normalized = String(value).trim().toLowerCase();
    return normalized === "enable" || normalized === "yes" || normalized === "true" || normalized === "on" || normalized === "1";
};

/**
 * Checks if a feature is explicitly disabled.
 * @param {string|number|boolean} value
 * @returns {boolean}
 */
const isFeatureDisabled = (value) => {
    if (value === false) return true;
    if (value === null || value === undefined || value === "") return false;

    const normalized = String(value).trim().toLowerCase();
    return normalized === "disable" || normalized === "no" || normalized === "false" || normalized === "off" || normalized === "0";
};

/**
 * Filters navigation items based on tenant feature flags
 * @param {Array} navElements - Navigation elements array from NAV_ELEMENTS
 * @param {Object} tenantData - Tenant data from getTenantData()
 * @returns {Array} Filtered navigation elements
 */
export const filterNavByTenantFeatures = (navElements, tenantData) => {
    if (!tenantData) return navElements;

    return navElements.map(({ title, routes }) => ({
        title,
        routes: routes.filter((route) => {
            // Get the feature flag name from the route key
            const featureConfig = ROUTE_FEATURE_MAP[route.key];
            const featureFlagName = typeof featureConfig === "string"
                ? featureConfig
                : featureConfig?.flag;

            // If route has no feature mapping, show it by default (always visible)
            if (!featureFlagName) return true;

            if (
                typeof featureConfig === "object" &&
                featureConfig.defaultVisible &&
                tenantData[featureFlagName] == null
            ) {
                return true;
            }

            const featureValue = tenantData[featureFlagName];

            if (isFeatureDisabled(featureValue)) return false;
            return isFeatureEnabled(featureValue);
        }),
    }));
};
