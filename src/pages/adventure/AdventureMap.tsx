import React, { useEffect, useState, useRef, useCallback } from "react";
import { decode } from "@googlemaps/polyline-codec";
import { Map, Popup, NavigationControl, ScaleControl } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { schemeCategory10 } from "d3-scale-chromatic";

type Adventure = {
  name: string;
  description: string;
  startedAt: string;
  completedAt: string;
  location: LatLng;
  stages: Route[];
};

type Route = {
  id: string;
  title: string;
  distance: number;
  elevGain: number;
  polyline: string;
};

type LatLng = [number, number];
type LngLat = [number, number];

const AdventureMap = ({ data }: { data: Adventure[] }) => {
  const mapRef = useRef<Map | null>(null);
  const [selectedAdventure, setSelectedAdventure] = useState<Adventure | null>(null);
  const activeItems = useRef<{ layers: string[]; sources: string[] }>({ layers: [], sources: [] });

  const getMostRecentAdventure = useCallback(() => {
    const sortedAdventures = [...data].sort(
      (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
    );

    return sortedAdventures[0];
  }, [data]);

  useEffect(() => {
    if (mapRef.current) return;

    const mostRecentAdventure = getMostRecentAdventure();

    const map = new Map({
      container: "map",
      style: "https://tiles.openfreemap.org/styles/liberty",
      center: [mostRecentAdventure.location[1], mostRecentAdventure.location[0]],
      zoom: 9,
    });

    map.addControl(new NavigationControl(), "top-left");
    map.addControl(new ScaleControl(), "bottom-left");

    const popupStyles = `
      .maplibregl-popup-content {
        border-radius: 12px !important;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15) !important;
        padding: 0 !important;
        max-width: 320px !important;
      }
      .trail-popup {
        padding: 20px;
        color: #374151;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      .trail-popup h3 {
        margin: 0 0 16px 0;
        font-size: 16px;
        font-weight: 600;
        color: #1f2937;
        line-height: 1.4;
      }
      .trail-popup p {
        margin: 0 0 12px 0;
        display: flex;
        align-items: center;
        font-size: 14px;
        line-height: 1.5;
      }
      .trail-popup p:last-child { margin-bottom: 0; }
      .trail-popup .icon {
        width: 18px;
        height: 18px;
        margin-right: 8px;
        color: #6b7280;
        flex-shrink: 0;
      }
    `;
    const styleElement = document.createElement("style");
    styleElement.textContent = popupStyles;
    document.head.appendChild(styleElement);

    mapRef.current = map;
  }, [getMostRecentAdventure]);

  useEffect(() => {
    if (data && data.length > 0 && !selectedAdventure) {
      setSelectedAdventure(getMostRecentAdventure());
    }
  }, [data, selectedAdventure, getMostRecentAdventure]);

  useEffect(() => {
    const handleAdventureSelect = (event: CustomEvent) => {
      setSelectedAdventure(event.detail);
    };
    window.addEventListener("adventure-selected", handleAdventureSelect as EventListener);
    return () => {
      window.removeEventListener("adventure-selected", handleAdventureSelect as EventListener);
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedAdventure) return;

    const updateLayers = () => {
      map.flyTo({
        center: [selectedAdventure.location[1], selectedAdventure.location[0]],
        zoom: 9,
        speed: 1.5,
      });

      activeItems.current.layers.forEach((layerId) => {
        if (map.getLayer(layerId)) map.removeLayer(layerId);
      });

      activeItems.current.sources.forEach((sourceId) => {
        if (map.getSource(sourceId)) map.removeSource(sourceId);
      });

      activeItems.current = { layers: [], sources: [] };

      const popup = new Popup({ closeButton: false, closeOnClick: false });

      selectedAdventure.stages.forEach((route, index) => {
        const sourceId = `route-source-${route.id}`;
        const layerId = `route-layer-${route.id}`;
        activeItems.current.layers.push(layerId);
        activeItems.current.sources.push(sourceId);

        const latLng = decode(route.polyline, 5);
        const coordinates: LngLat[] = latLng.map(([lng, lat]) => [lat, lng]);

        map.addSource(sourceId, {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {
              title: route.title,
              distance: route.distance,
              elevGain: route.elevGain,
            },
            geometry: { type: "LineString", coordinates: coordinates },
          },
        });

        map.addLayer({
          id: layerId,
          type: "line",
          source: sourceId,
          layout: { "line-join": "round", "line-cap": "round" },
          paint: {
            "line-color": schemeCategory10[index % schemeCategory10.length],
            "line-width": 3,
          },
        });

        map.on("mousemove", layerId, (e) => {
          map.getCanvas().style.cursor = "pointer";
          const properties = e.features[0].properties;
          popup
            .setLngLat(e.lngLat)
            .setHTML(
              `<div class="trail-popup">
              <h3>${properties.title}</h3>
              <p>
                <svg class="icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                Distance: ${(properties.distance / 1000).toFixed(1)} km
              </p>
              <p>
                <svg class="icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Elevation gain: ${properties.elevGain} m
              </p>
            </div>`,
            )
            .addTo(map);
        });
        map.on("mouseleave", layerId, () => {
          map.getCanvas().style.cursor = "";
          popup.remove();
        });
      });
    };

    if (map.isStyleLoaded()) {
      updateLayers();
    } else {
      map.once("load", updateLayers);
    }
  }, [selectedAdventure]);

  return <></>;
};

export default AdventureMap;
