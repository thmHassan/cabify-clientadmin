import { ErrorMessage, Field, Form, Formik } from "formik";
import React, { useRef, useState, useEffect } from "react";
import _ from "lodash";
import FormLabel from "../../../../../../components/ui/FormLabel/FormLabel";
import { unlockBodyScroll } from "../../../../../../utils/functions/common.function";
import Button from "../../../../../../components/ui/Button/Button";
import { apiCreatePlot, apiEditPlot, apiGetPlot } from "../../../../../../services/PlotService";
import { PLOT_VALIDATION_SCHEMA } from "../../../../validators/pages/plot.validation";
import toast from "react-hot-toast";

const AddPlotsModel = ({ initialValue = {}, setIsOpen, onPlotsCreated }) => {
    const [submitError, setSubmitError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [clickedCoord, setClickedCoord] = useState(null);
    const [allPlots, setAllPlots] = useState([]);
    const [loadingPlots, setLoadingPlots] = useState(false);

    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const polygonRef = useRef(null);
    const markersRef = useRef([]);
    const coordinatesRef = useRef([]);
    const existingPlotsPolygonsRef = useRef([]);

    useEffect(() => {
        setIsEditMode(!!initialValue?.id);
    }, [initialValue]);

    // Fetch all existing plots
    useEffect(() => {
        const fetchAllPlots = async () => {
            setLoadingPlots(true);
            try {
                const response = await apiGetPlot({ page: 1, perPage: 100 });
                if (response?.data?.success === 1) {
                    const plots = response?.data?.list?.data || [];
                    // Filter out the current plot being edited
                    const otherPlots = initialValue?.id
                        ? plots.filter(plot => plot.id !== initialValue.id)
                        : plots;
                    setAllPlots(otherPlots);
                }
            } catch (error) {
                console.error("Error fetching plots:", error);
            } finally {
                setLoadingPlots(false);
            }
        };
        fetchAllPlots();
    }, [initialValue?.id]);

    useEffect(() => {
        // Check if Leaflet is already loaded
        if (window.L) {
            setMapLoaded(true);
            return;
        }

        const existingLink = document.querySelector('link[href*="leaflet.css"]');
        const existingScript = document.querySelector('script[src*="leaflet.js"]');

        if (!existingLink) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css';
            link.setAttribute('data-leaflet-modal-css', 'true');
            document.head.appendChild(link);
        }

        if (!existingScript) {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js';
            script.setAttribute('data-leaflet-modal-script', 'true');
            script.onload = () => setMapLoaded(true);
            script.onerror = () => console.error('Failed to load Leaflet');
            document.body.appendChild(script);
        } else if (window.L) {
            setMapLoaded(true);
        }

        return () => {
            // Cleanup is handled by parent component
        };
    }, []);

    const parseCoordinates = (plot) => {
        if (!plot) return [];
        try {
            const features = typeof plot.features === "string" ? JSON.parse(plot.features) : plot.features;

            let coordinatesData = features?.geometry?.coordinates;
            if (typeof coordinatesData === "string") {
                coordinatesData = JSON.parse(coordinatesData);
            }

            const coords = Array.isArray(coordinatesData) ? coordinatesData[0] : coordinatesData;
            if (Array.isArray(coords) && coords.length) {
                return coords.map((pair) => {
                    if (Array.isArray(pair) && pair.length >= 2) {
                        const [lng, lat] = pair;
                        return { lat: Number(lat), lng: Number(lng) };
                    }
                    return null;
                }).filter(Boolean);
            }

            if (Array.isArray(plot.coordinates) && plot.coordinates.length) {
                return plot.coordinates.map((pair) => {
                    if (!Array.isArray(pair) || pair.length < 2) return null;
                    const [first, second] = pair;
                    const latFirstLooksLikeLat = Math.abs(Number(first)) <= 90;
                    const lngSecondLooksLikeLng = Math.abs(Number(second)) <= 180;
                    if (latFirstLooksLikeLat && lngSecondLooksLikeLng) {
                        return { lat: Number(first), lng: Number(second) };
                    }
                    return { lat: Number(second), lng: Number(first) };
                }).filter(Boolean);
            }

            if (plot.lat && plot.lng) {
                return [{ lat: Number(plot.lat), lng: Number(plot.lng) }];
            }
        } catch (error) {
            console.error("Error parsing plot features:", error);
        }
        return [];
    };

    const renderExistingPlots = (map) => {
        // Clear existing plot polygons
        existingPlotsPolygonsRef.current.forEach(polygon => {
            if (polygon && map) {
                map.removeLayer(polygon);
            }
        });
        existingPlotsPolygonsRef.current = [];

        // Render all existing plots
        allPlots.forEach((plot, index) => {
            const coords = parseCoordinates(plot);
            if (coords && coords.length >= 3) {
                const latLngs = coords.map(c => [c.lat, c.lng]);

                // Generate color for existing plots (gray-ish colors)
                const colors = ['#9CA3AF', '#6B7280', '#4B5563', '#374151'];
                const color = colors[index % colors.length];

                const polygon = window.L.polygon(latLngs, {
                    color: color,
                    fillColor: color,
                    fillOpacity: 0.1,
                    weight: 2,
                    dashArray: '5, 5' // Dashed line to differentiate from current plot
                }).addTo(map);

                polygon.bindPopup(`<div style="padding: 8px; font-weight: 600; color: #333;">${plot.name}</div>`);

                existingPlotsPolygonsRef.current.push(polygon);
            }
        });
    };

    const handleSubmit = async (values) => {
        console.log("values===", values);
        setIsLoading(true);
        setSubmitError(null);

        try {
            const formDataObj = new FormData();

            if (isEditMode) {
                formDataObj.append('id', initialValue.id);
            }

            formDataObj.append('name', values.name || '');
            formDataObj.append('features[type]', 'Feature');
            formDataObj.append('features[properties][name]', values.name);
            formDataObj.append('features[geometry][type]', 'Polygon');
            const closedCoordinates = [...values.coordinates, values.coordinates[0]];

            const polygonCoordinates = [closedCoordinates];

            formDataObj.append('features[geometry][coordinates]', JSON.stringify(polygonCoordinates));

            console.log('Sending coordinates to API:');
            console.log('Total points (including closing point):', closedCoordinates.length);
            console.log('Coordinates structure:', polygonCoordinates);
            console.log('Coordinates as JSON:', JSON.stringify(polygonCoordinates));

            console.log('FormData contents:');
            for (let pair of formDataObj.entries()) {
                console.log(pair[0] + ': ' + pair[1]);
            }

            const response = isEditMode
                ? await apiEditPlot(formDataObj)
                : await apiCreatePlot(formDataObj);

            if (response?.data?.success === 1 || response?.status === 200) {
                toast.success(
                    isEditMode ? "Plot updated successfully" : "Plot created successfully"
                );

                if (onPlotsCreated) {
                    onPlotsCreated();
                }
                unlockBodyScroll();
                setIsOpen({ type: "new", isOpen: false });
            } else {
                setSubmitError(response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} plot`);
            }
        } catch (error) {
            console.error(`Plot ${isEditMode ? 'edit' : 'creation'} error:`, error);
            setSubmitError(error?.response?.data?.message || error?.message || `Error ${isEditMode ? 'updating' : 'creating'} plot`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full">
            <Formik
                initialValues={{
                    name: initialValue?.name || "",
                    coordinates: Array.isArray(initialValue?.coordinates) ? initialValue.coordinates : [],
                }}
                validationSchema={PLOT_VALIDATION_SCHEMA}
                onSubmit={handleSubmit}
            >
                {({ values, setFieldValue, errors, touched }) => {
                    useEffect(() => {
                        coordinatesRef.current = values.coordinates;
                    }, [values.coordinates]);

                    useEffect(() => {
                        if (mapLoaded && mapRef.current && !mapInstanceRef.current && window.L) {

                            const map = window.L.map(mapRef.current).setView([21.1702, 72.8311], 12);
                            window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                                attribution: '© OpenStreetMap contributors',
                                maxZoom: 19
                            }).addTo(map);

                            // Render existing plots
                            if (allPlots.length > 0) {
                                renderExistingPlots(map);
                            }

                            map.on('click', (e) => {
                                console.log("clicked");

                                const { lat, lng } = e.latlng;
                                setClickedCoord({ lat, lng });

                                const currentCoordinates = coordinatesRef.current;
                                const newCoordinates = [...currentCoordinates, [lng, lat]];
                                setFieldValue('coordinates', newCoordinates);

                                console.log('Point added:', { lat, lng });
                                console.log('Previous coordinates count:', currentCoordinates.length);
                                console.log('New coordinates count:', newCoordinates.length);
                                console.log('All coordinates so far:', newCoordinates);

                                // Add marker for the clicked point
                                const marker = window.L.circleMarker([lat, lng], {
                                    radius: 6,
                                    fillColor: '#3B82F6',
                                    color: '#fff',
                                    weight: 2,
                                    opacity: 1,
                                    fillOpacity: 0.8
                                }).addTo(map);

                                // Add number label to show order
                                marker.bindTooltip(`${newCoordinates.length}`, {
                                    permanent: true,
                                    direction: 'center',
                                    className: 'coordinate-label'
                                });

                                markersRef.current.push(marker);
                                console.log("markersRef===", markersRef);

                                // Draw/update polygon if we have at least 3 points
                                if (newCoordinates.length >= 3) {
                                    // Remove old polygon if exists
                                    if (polygonRef.current) {
                                        map.removeLayer(polygonRef.current);
                                    }

                                    // Convert coordinates back to [lat, lng] for Leaflet polygon
                                    const latLngs = newCoordinates.map(coord => [coord[1], coord[0]]);

                                    // Create new polygon
                                    polygonRef.current = window.L.polygon(latLngs, {
                                        color: '#3B82F6',
                                        fillColor: '#3B82F6',
                                        fillOpacity: 0.2,
                                        weight: 2
                                    }).addTo(map);
                                }
                            });

                            mapInstanceRef.current = map;

                            // If editing, draw existing coordinates
                            const initialCoords = Array.isArray(coordinatesRef.current) ? coordinatesRef.current : [];
                            if (initialCoords.length >= 3) {
                                const latLngs = initialCoords.map(coord => [coord[1], coord[0]]);

                                // Add markers for existing points
                                initialCoords.forEach((coord, index) => {
                                    const marker = window.L.circleMarker([coord[1], coord[0]], {
                                        radius: 6,
                                        fillColor: '#3B82F6',
                                        color: '#fff',
                                        weight: 2,
                                        opacity: 1,
                                        fillOpacity: 0.8
                                    }).addTo(map);

                                    marker.bindTooltip(`${index + 1}`, {
                                        permanent: true,
                                        direction: 'center',
                                        className: 'coordinate-label'
                                    });

                                    markersRef.current.push(marker);
                                });

                                // Draw polygon
                                polygonRef.current = window.L.polygon(latLngs, {
                                    color: '#3B82F6',
                                    fillColor: '#3B82F6',
                                    fillOpacity: 0.2,
                                    weight: 2
                                }).addTo(map);

                                // Fit map to polygon bounds
                                map.fitBounds(polygonRef.current.getBounds());
                            }
                        }

                        return () => {
                            if (mapInstanceRef.current) {
                                mapInstanceRef.current.remove();
                                mapInstanceRef.current = null;
                            }
                        };
                    }, [mapLoaded, allPlots]);

                    const handleClearCoordinates = () => {
                        setFieldValue('coordinates', []);
                        setClickedCoord(null);

                        // Clear all markers
                        markersRef.current.forEach(marker => {
                            if (mapInstanceRef.current) {
                                mapInstanceRef.current.removeLayer(marker);
                            }
                        });
                        markersRef.current = [];

                        // Clear polygon
                        if (polygonRef.current && mapInstanceRef.current) {
                            mapInstanceRef.current.removeLayer(polygonRef.current);
                            polygonRef.current = null;
                        }

                        console.log('All coordinates cleared');
                    };

                    const handleRemoveLastPoint = () => {
                        if (values.coordinates.length > 0) {
                            // Remove last coordinate
                            const newCoordinates = values.coordinates.slice(0, -1);
                            setFieldValue('coordinates', newCoordinates);

                            // Remove last marker
                            const lastMarker = markersRef.current.pop();
                            if (lastMarker && mapInstanceRef.current) {
                                mapInstanceRef.current.removeLayer(lastMarker);
                            }

                            // Update polygon
                            if (polygonRef.current && mapInstanceRef.current) {
                                mapInstanceRef.current.removeLayer(polygonRef.current);
                                polygonRef.current = null;
                            }

                            if (newCoordinates.length >= 3 && mapInstanceRef.current) {
                                const latLngs = newCoordinates.map(coord => [coord[1], coord[0]]);
                                polygonRef.current = window.L.polygon(latLngs, {
                                    color: '#3B82F6',
                                    fillColor: '#3B82F6',
                                    fillOpacity: 0.2,
                                    weight: 2
                                }).addTo(mapInstanceRef.current);
                            }

                            if (newCoordinates.length === 0) {
                                setClickedCoord(null);
                            }
                        }
                    };

                    return (
                     <div className="w-full">
                           <Form>
                            <div className="text-xl sm:text-2xl lg:text-[26px] leading-7 sm:leading-8 lg:leading-9 font-semibold text-[#252525] mb-4 sm:mb-6 lg:mb-7 text-center mx-auto max-w-full sm:max-w-[85%] lg:max-w-[75%] w-full px-2">
                                <span className="w-full text-center block">
                                    {isEditMode ? 'Edit Plot' : 'Add New Plot'}
                                </span>
                            </div>

                            {submitError && (
                                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                                    {submitError}
                                </div>
                            )}

                            <div className="">
                                <div className="w-full mb-4">
                                    <FormLabel htmlFor="name">Plot Name</FormLabel>
                                    <div className="sm:h-16 h-10">
                                        <Field
                                            type="text"
                                            name="name"
                                            className="sm:px-5 px-4 sm:py-[21px] py-3 border border-[#8D8D8D] rounded-lg w-full h-full shadow-[-4px_4px_6px_0px_#0000001F] placeholder:text-[#6C6C6C] sm:text-base text-sm leading-[22px] font-semibold"
                                            placeholder="Enter Plot Name"
                                        />
                                    </div>
                                    <ErrorMessage
                                        name="name"
                                        component="div"
                                        className="text-red-500 text-sm mt-1"
                                    />
                                </div>
                            </div>

                            {/* Points Counter and Actions */}
                            <div className="mb-3">
                                <div className="flex justify-between items-center">
                                    <div>
                                    </div>
                                    {values.coordinates.length > 0 && (
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={handleRemoveLastPoint}
                                                className="text-orange-600 hover:text-orange-800 font-medium text-xs bg-white px-2 py-1 rounded border border-orange-200"
                                            >
                                                Remove Last
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleClearCoordinates}
                                                className="text-red-600 hover:text-red-800 font-medium text-xs bg-white px-2 py-1 rounded border border-red-200"
                                            >
                                                Clear All
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Map Container */}
                            <div className="relative w-full h-[500px] rounded-xl overflow-hidden border border-gray-200 mb-3">
                                <div
                                    ref={mapRef}
                                    className="w-full h-full"
                                >
                                    {!mapLoaded && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                                            <div className="text-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                                <p className="text-gray-600 text-sm">Loading map...</p>
                                            </div>
                                        </div>
                                    )}
                                    {loadingPlots && (
                                        <div className="absolute top-4 right-4 bg-white px-3 py-2 rounded-lg shadow-md border border-gray-200">
                                            <div className="flex items-center gap-2">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                                <span className="text-sm text-gray-600">Loading plots...</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {allPlots.length > 0 && mapLoaded && (
                                    <div className="absolute bottom-4 left-4 bg-white px-3 py-2 rounded-lg shadow-md border border-gray-200">
                                        <div className="text-xs text-gray-600">
                                            Showing {allPlots.length} existing plot{allPlots.length !== 1 ? 's' : ''}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <ErrorMessage
                                name="coordinates"
                                component="div"
                                className="text-red-500 text-sm mb-3"
                            />

                            {/* Style for coordinate labels */}
                            <style>{`
                                    .coordinate-label {
                                        background: transparent !important;
                                        border: none !important;
                                        box-shadow: none !important;
                                        font-weight: bold;
                                        color: #1e40af;
                                        font-size: 12px;
                                    }
                                    .coordinate-label::before {
                                        display: none;
                                    }
                                `}</style>

                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-5 justify-end mt-3">
                                <Button
                                    btnSize="md"
                                    type="filledGray"
                                    className="!px-10 pt-4 pb-[15px] leading-[25px] w-full sm:w-auto"
                                    onClick={() => {
                                        unlockBodyScroll();
                                        setIsOpen({ type: "new", isOpen: false });
                                    }}
                                >
                                    <span>Cancel</span>
                                </Button>
                                <Button
                                    btnType="submit"
                                    btnSize="md"
                                    type="filled"
                                    className="!px-10 pt-4 pb-[15px] leading-[25px] w-full sm:w-auto"
                                    disabled={isLoading || values.coordinates.length < 3}
                                >
                                    <span>
                                        {isLoading
                                            ? (isEditMode ? "Updating..." : "Creating...")
                                            : (isEditMode ? "Update" : "Create")
                                        }
                                    </span>
                                </Button>
                            </div>
                        </Form>
                     </div>
                    );
                }}
            </Formik>
        </div>
    );
};

export default AddPlotsModel;