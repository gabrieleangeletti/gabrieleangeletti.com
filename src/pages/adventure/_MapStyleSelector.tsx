import React from "react";

const mapStyles = [
  {
    name: "Default",
    url: "https://tiles.openfreemap.org/styles/liberty",
  },
  {
    name: "Topo",
    url: {
      version: 8,
      sources: {
        opentopomap: {
          type: "raster",
          tiles: ["https://a.tile.opentopomap.org/{z}/{x}/{y}.png"],
          tileSize: 256,
          attribution:
            'Map data: &copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
        },
      },
      layers: [
        {
          id: "opentopomap",
          type: "raster",
          source: "opentopomap",
        },
      ],
    },
  },
  {
    name: "Satellite",
    url: {
      version: 8,
      sources: {
        "esri-world-imagery": {
          type: "raster",
          tiles: [
            "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          ],
          tileSize: 256,
          attribution:
            "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
        },
      },
      layers: [
        {
          id: "esri-world-imagery",
          type: "raster",
          source: "esri-world-imagery",
        },
      ],
    },
  },
];

const MapStyleSelector = () => {
  const handleStyleChange = (styleUrl: string | object) => {
    const event = new CustomEvent("map-style-changed", { detail: styleUrl });
    window.dispatchEvent(event);
  };

  return (
    <div className="absolute bottom-4 right-4 z-10 bg-base-100 rounded-lg shadow-lg p-1 flex space-x-1">
      {mapStyles.map((style) => (
        <button
          key={style.name}
          onClick={() => handleStyleChange(style.url)}
          className="btn btn-sm btn-ghost"
          aria-label={`Switch to ${style.name} map style`}
        >
          {style.name}
        </button>
      ))}
    </div>
  );
};

export default MapStyleSelector;
