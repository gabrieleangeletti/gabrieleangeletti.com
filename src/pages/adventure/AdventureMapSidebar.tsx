import React, { useState } from "react";

type LatLng = [number, number];

type Route = {
  id: string;
  title: string;
  distance: number;
  elevGain: number;
  polyline: string;
};

type Adventure = {
  name: string;
  description: string;
  completedAt: string;
  location: LatLng;
  stages: Route[];
};

const AdventureMapSidebar = ({ data }: { data: Adventure[] }) => {
  const [isOpen, setIsOpen] = useState(true);

  const handleSelectAdventure = (adventure: Adventure) => {
    const event = new CustomEvent("adventure-selected", { detail: adventure });
    window.dispatchEvent(event);
  };

  const containerClasses = [
    "absolute top-0 right-0 h-full z-10 flex flex-col",
    "bg-base-100 shadow-lg rounded-l-xl overflow-hidden",
    "transition-all duration-300 ease-in-out",
    isOpen ? "w-[350px]" : "w-[50px]",
  ].join(" ");

  return (
    <div className={containerClasses}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-circle btn-sm absolute top-2.5 left-2.5 z-20"
      >
        {isOpen ? "→" : "←"}
      </button>
      {isOpen && (
        <div className="p-5 pt-12 overflow-y-auto h-full">
          <h2 className="mt-0 mb-5 text-2xl font-bold">Adventures</h2>
          <ul className="list-none p-0 m-0">
            {data.map((adventure, index) => (
              <button key={index} onClick={() => handleSelectAdventure(adventure)}>
                <li className="cursor-pointer p-4 border-t border-base-300 hover:bg-base-200">
                  <h3 className="m-0 text-md font-semibold">{adventure.name}</h3>
                  <p className="mt-2 text-sm text-base-content/70 leading-normal">
                    {adventure.description.substring(0, 120)}...
                  </p>
                </li>
              </button>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AdventureMapSidebar;
