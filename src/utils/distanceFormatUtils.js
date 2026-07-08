export const parseDistanceUnit = (unitsValue) => {
    if (!unitsValue) return null;
    return String(unitsValue).toLowerCase() === "km" ? "Km" : "Miles";
};

export const formatDistanceFromMeters = (distanceInMeters, distanceUnit = "Km") => {
    if (!distanceInMeters) return "-";

    if (distanceUnit === "Km") {
        return `${(distanceInMeters / 1000).toFixed(2)} Km`;
    }

    return `${(distanceInMeters / 1609.34).toFixed(2)} Miles`;
};

export const metersToDisplayDistanceValue = (distanceInMeters, distanceUnit = "Km") => {
    const meters = Number(distanceInMeters);
    if (!Number.isFinite(meters)) return "";
    if (distanceUnit === "Km") {
        return (meters / 1000).toFixed(2);
    }
    return (meters / 1609.344).toFixed(2);
};

export const formatDistanceValueWithUnit = (value, distanceUnit = "Km") => {
    if (value === "" || value == null) return "";
    const numeric = Number(value);
    const displayValue = Number.isFinite(numeric) ? numeric.toFixed(2) : value;
    return `${displayValue} ${distanceUnit === "Km" ? "Km" : "Miles"}`;
};

export const formatDistanceFromBooking = (booking, distanceUnit = "Km") => {
    if (booking?.distance_value != null && booking?.distance_unit) {
        const unit = parseDistanceUnit(booking.distance_unit);
        return formatDistanceValueWithUnit(booking.distance_value, unit || distanceUnit);
    }

    return formatDistanceFromMeters(booking?.distance, distanceUnit);
};
