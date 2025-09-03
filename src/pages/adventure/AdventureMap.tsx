import React, { useEffect, useState, useRef } from "react";
import { renderToString } from "react-dom/server";
import { decode } from "@googlemaps/polyline-codec";
import { Map, Popup, NavigationControl, ScaleControl, LngLatLike } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { schemeCategory10 } from "d3-scale-chromatic";
import AdventureMapPopup from "./AdventureMapPopup";
import type { Adventure, Route, LngLat } from "./types";

const AdventureMap = ({ data }: { data: Adventure[] }) => {
  const mapRef = useRef<Map | null>(null);
  const [selectedAdventure, setSelectedAdventure] = useState<Adventure | null>(null);
  const activeItems = useRef<{ layers: string[]; sources: string[] }>({ layers: [], sources: [] });

  const drawAdventureRoute = (adventure: Adventure) => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    map.flyTo({
      center: adventure.location.slice().reverse() as LngLatLike,
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

    adventure.stages.forEach((route, index) => {
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
          "line-width": 4,
        },
      });

      map.on("mousemove", layerId, (e) => {
        map.getCanvas().style.cursor = "pointer";
        const properties = e.features?.[0].properties;
        if (properties) {
          popup
            .setLngLat(e.lngLat)
            .setHTML(
              renderToString(
                <AdventureMapPopup
                  title={properties.title}
                  distance={properties.distance}
                  elevGain={properties.elevGain}
                />,
              ),
            )
            .addTo(map);
        }
      });

      map.on("mouseleave", layerId, () => {
        map.getCanvas().style.cursor = "";
        popup.remove();
      });
    });
  };

  useEffect(() => {
    if (mapRef.current) return;

    const mostRecentAdventure = data.sort(
      (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
    )[0];

    const map = new Map({
      container: "map",
      style: "https://tiles.openfreemap.org/styles/liberty",
      center: mostRecentAdventure.location.slice().reverse() as LngLatLike,
      zoom: 9,
    });

    map.addControl(new NavigationControl(), "top-left");
    map.addControl(new ScaleControl(), "bottom-left");
    mapRef.current = map;

    map.on("load", () => {
      setSelectedAdventure(mostRecentAdventure);
    });
  }, [data]);

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
    if (!map) return;

    const handleStageSelect = (event: CustomEvent<Route>) => {
      const stage = event.detail;
      if (stage.location) {
        map.flyTo({
          center: stage.location.slice().reverse() as LngLatLike,
          zoom: 13,
          speed: 1.5,
        });
      }
    };

    window.addEventListener("stage-selected", handleStageSelect as EventListener);

    return () => {
      window.removeEventListener("stage-selected", handleStageSelect as EventListener);
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const handleStyleChange = (event: CustomEvent) => {
      map.once("idle", () => {
        if (selectedAdventure) {
          drawAdventureRoute(selectedAdventure);
        }
      });
      map.setStyle(event.detail);
    };

    window.addEventListener("map-style-changed", handleStyleChange as EventListener);

    return () => {
      window.removeEventListener("map-style-changed", handleStyleChange as EventListener);
    };
  }, [selectedAdventure]);

  useEffect(() => {
    if (selectedAdventure) {
      drawAdventureRoute(selectedAdventure);
    }
  }, [selectedAdventure]);

  return <></>;
};

export default AdventureMap;
