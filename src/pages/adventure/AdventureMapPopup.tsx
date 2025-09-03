import React from "react";

type Props = {
  title: string;
  distance: number;
  elevGain: number;
};

const AdventureMapPopup = ({ title, distance, elevGain }: Props) => {
  return (
    <div className="w-80 rounded-lg border border-base-300 bg-base-200 p-4 font-sans shadow-md">
      <h3 className="mb-2 font-semibold text-base-content">{title}</h3>
      <div className="divider my-1"></div>
      <div className="space-y-2 text-sm">
        <p className="flex items-center justify-between">
          <span className="flex items-center text-base-content/70">
            <svg
              className="mr-2 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
            Distance
          </span>
          <span className="font-medium text-base-content">{(distance / 1000).toFixed(1)} km</span>
        </p>
        <p className="flex items-center justify-between">
          <span className="flex items-center text-base-content/70">
            <svg
              className="mr-2 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Elevation
          </span>
          <span className="font-medium text-base-content">{elevGain} m</span>
        </p>
      </div>
    </div>
  );
};

export default AdventureMapPopup;
