export type Adventure = {
  name: string;
  description: string;
  kind: "thru-hiking" | "fast-packing";
  distance: number;
  elevGain: number;
  startedAt: string;
  completedAt: string;
  location: {
    lat: number;
    lng: number;
  };
  countries: string[];
  stages: Route[];
};

export type Route = {
  id: string;
  title: string;
  distance: number;
  elevGain: number;
  polyline: string;
  location: {
    lat: number;
    lng: number;
  };
};

export type LatLng = [number, number];
export type LngLat = [number, number];
