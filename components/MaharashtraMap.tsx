"use client";

import React, { useState, useEffect } from "react";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { geoCentroid, geoBounds } from "d3-geo";

interface MapProps {
    onRegionSelect: (regionName: string, regionType?: "district" | "taluka") => void;
    selectedRegion?: string;
}

const geoUrl = "/maharashtra.json";
const talukasGeoUrl = "/talukas.json";

export default function MaharashtraMap({ onRegionSelect, selectedRegion }: MapProps) {
    const [tooltipContent, setTooltipContent] = useState("");
    const [activeDistrict, setActiveDistrict] = useState<string | null>(null);
    const defaultCenter: [number, number] = [76.77, 18.81];
    const [position, setPosition] = useState({ coordinates: defaultCenter, zoom: 1 });

    // Handle resetting the map view if the selection is cleared from outside
    useEffect(() => {
        if (!selectedRegion) {
            setPosition({ coordinates: defaultCenter, zoom: 1 });
            setActiveDistrict(null);
        }
    }, [selectedRegion]);

    const handleRegionClick = (geo: any) => {
        // Calculate the geographic center of the clicked district
        const centroid = geoCentroid(geo);

        // Calculate a dynamic zoom level based on the district's bounding box size
        const bounds = geoBounds(geo);
        const dx = bounds[1][0] - bounds[0][0];
        const dy = bounds[1][1] - bounds[0][1];
        const maxDim = Math.max(dx, dy);

        // The entire state is roughly 8 degrees wide.
        // Make the zoom much more aggressive to simulate drilling down
        let calculatedZoom = 6 / maxDim * 1.5;
        calculatedZoom = Math.max(3, Math.min(calculatedZoom, 15));

        setPosition({ coordinates: centroid as [number, number], zoom: calculatedZoom });

        setTooltipContent("");
        const districtName = geo.properties.name || "Unknown District";
        setActiveDistrict(districtName);
        onRegionSelect(districtName, "district");
    };

    const handleTalukaClick = (e: any, talukaGeo: any) => {
        e.stopPropagation(); // Don't trigger the district click underneath
        setTooltipContent("");
        const talukaName = talukaGeo.properties.name || "Unknown Taluka";
        onRegionSelect(talukaName, "taluka");
    };

    return (
        <div style={{ width: "100%", height: "100%", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ComposableMap
                projection="geoMercator"
                projectionConfig={{
                    scale: 5000,
                    center: [76.77, 18.81],
                }}
                style={{
                    width: "100%",
                    height: "100%",
                }}
            >
                <ZoomableGroup
                    center={position.coordinates as [number, number]}
                    zoom={position.zoom}
                    minZoom={1}
                    maxZoom={10}
                    style={{ transition: "all 0.6s ease-in-out" }} // Smooth cinematic zoom
                >
                    <Geographies geography={geoUrl}>
                        {({ geographies }) =>
                            geographies.map((geo) => {
                                // Based on our custom parser script, we mapped the desired name to properties.name
                                const districtName = geo.properties.name || "Unknown District";
                                const isSelected = activeDistrict?.toLowerCase() === districtName.toLowerCase() || selectedRegion?.toLowerCase() === districtName.toLowerCase();

                                return (
                                    <Geography
                                        key={geo.rsmKey}
                                        geography={geo}
                                        onClick={() => handleRegionClick(geo)}
                                        onMouseEnter={() => setTooltipContent(districtName)}
                                        onMouseLeave={() => setTooltipContent("")}
                                        style={{
                                            default: {
                                                fill: isSelected ? "#0B6CF5" : (position.zoom > 1 ? "#F8FAFC" : "#EAF2FF"), // Fade out unselected districts when zoomed in
                                                stroke: isSelected ? "#0B6CF5" : "#BFDBFE",
                                                strokeWidth: isSelected ? (activeDistrict ? 0 : 1) : 0.75 / position.zoom, // Hide border if it has talukas rendered on top
                                                outline: "none",
                                                transition: "all 0.4s ease"
                                            },
                                            hover: {
                                                fill: isSelected ? "#1D4ED8" : "#93C5FD",
                                                stroke: "#3B82F6",
                                                strokeWidth: 1 / position.zoom,
                                                outline: "none",
                                                cursor: "pointer",
                                                transition: "all 0.2s"
                                            },
                                            pressed: {
                                                fill: "#1D4ED8",
                                                outline: "none",
                                            },
                                        }}
                                    />
                                );
                            })
                        }
                    </Geographies>

                    {/* TALUKA LAYER (Renders on top of the selected district) */}
                    {activeDistrict && position.zoom > 1 && (
                        <Geographies geography={talukasGeoUrl}>
                            {({ geographies }) =>
                                geographies.map((geo) => {
                                    // Make talukas clickable
                                    const talukaName = geo.properties.name || "Unknown Taluka";
                                    const isTalukaSelected = selectedRegion?.toLowerCase() === talukaName.toLowerCase();

                                    return (
                                        <Geography
                                            key={geo.rsmKey}
                                            geography={geo}
                                            onClick={(e) => handleTalukaClick(e, geo)}
                                            onMouseEnter={() => setTooltipContent(`Taluka: ${talukaName}`)}
                                            onMouseLeave={() => setTooltipContent("")}
                                            style={{
                                                default: {
                                                    fill: isTalukaSelected ? "#1E3A8A" : "#0B6CF5", // Highlight the specific taluka darker
                                                    fillOpacity: isTalukaSelected ? 0.9 : 0.08, // Lower opacity baseline to distinguish border lines more clearly
                                                    stroke: "#FFFFFF",
                                                    strokeWidth: 1.5 / position.zoom, // Thicker base so it's visible even highly zoomed
                                                    outline: "none",
                                                    transition: "all 0.2s ease"
                                                },
                                                hover: {
                                                    fill: "#2563EB", // Darker blue on hover
                                                    fillOpacity: 0.8,
                                                    stroke: "#FFFFFF",
                                                    strokeWidth: 1 / position.zoom,
                                                    outline: "none",
                                                    cursor: "pointer",
                                                    transition: "all 0.2s"
                                                },
                                                pressed: {
                                                    fill: "#1E3A8A",
                                                    outline: "none",
                                                },
                                            }}
                                        />
                                    );
                                })
                            }
                        </Geographies>
                    )}
                </ZoomableGroup>
            </ComposableMap>

            {/* Hover Tooltip Overlay */}
            {tooltipContent && (
                <div
                    style={{
                        position: "absolute",
                        bottom: "20px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        background: "#0F1724",
                        color: "white",
                        padding: "8px 16px",
                        borderRadius: "8px",
                        fontSize: "14px",
                        fontWeight: 600,
                        pointerEvents: "none",
                        boxShadow: "0 8px 16px rgba(15,23,36,0.2)"
                    }}
                >
                    {tooltipContent}
                </div>
            )}
        </div>
    );
}
