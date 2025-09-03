export type Adventure = {
  name: string;
  description: string;
  startedAt: string;
  completedAt: string;
  location: LatLng;
  stages: Route[];
};

export type Route = {
  id: string;
  title: string;
  distance: number;
  elevGain: number;
  polyline: string;
};

export type LatLng = [number, number];
export type LngLat = [number, number];
