import React, { useState } from "react";
import { FaHiking, FaRunning } from "react-icons/fa";
import type { Adventure, Route } from "./types";

const AdventureMapSidebar = ({ data }: { data: Adventure[] }) => {
  const [isOpen, setIsOpen] = useState(true);

  const mostRecentAdventure = data.sort(
    (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
  )[0];

  const [activeAdventureName, setActiveAdventureName] = useState<string | null>(
    mostRecentAdventure.name,
  );

  const handleSelectAdventure = (adventure: Adventure) => {
    const newActiveAdventureName = activeAdventureName === adventure.name ? null : adventure.name;
    setActiveAdventureName(newActiveAdventureName);

    const event = new CustomEvent("adventure-selected", { detail: adventure });
    window.dispatchEvent(event);
  };

  const handleSelectStage = (stage: Route) => {
    const event = new CustomEvent("stage-selected", { detail: stage });
    window.dispatchEvent(event);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const AdventureIcon = ({ kind }: { kind: "thru-hiking" | "fast-packing" }) => {
    if (kind === "fast-packing") {
      return <FaRunning className="inline-block ml-2 text-base-content/60" />;
    }
    return <FaHiking className="inline-block ml-2 text-base-content/60" />;
  };

  const containerClasses = [
    "absolute top-0 right-0 h-full z-10 flex flex-col",
    "bg-base-100 shadow-lg rounded-l-xl overflow-hidden",
    "transition-all duration-300 ease-in-out",
    isOpen ? "w-[35%]" : "w-[50px]",
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
          <div className="join join-vertical w-full">
            {data.map((adventure) => (
              <div
                key={adventure.name}
                className={`collapse collapse-arrow join-item border border-base-300 ${
                  activeAdventureName === adventure.name ? "collapse-open" : "collapse-close"
                }`}
              >
                <button
                  className="collapse-title text-md font-semibold cursor-pointer"
                  onClick={() => handleSelectAdventure(adventure)}
                >
                  {adventure.name} <AdventureIcon kind={adventure.kind} />
                </button>
                <div className="collapse-content">
                  <div className="mb-4">
                    <p className="text-sm text-base-content/80 mb-4">{adventure.description}</p>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="font-semibold text-base-content/60">Started</div>
                        <div className="text-base-content">{formatDate(adventure.startedAt)}</div>
                      </div>
                      <div>
                        <div className="font-semibold text-base-content/60">Completed</div>
                        <div className="text-base-content">{formatDate(adventure.completedAt)}</div>
                      </div>
                      <div>
                        <div className="font-semibold text-base-content/60">Style</div>
                        <div className="text-base-content capitalize">
                          {adventure.kind.replace("-", " ")}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="divider my-0"></div>
                  <h4 className="font-semibold text-sm mt-4 mb-2">Stages</h4>
                  <ul className="list-none p-0 m-0 space-y-1">
                    {adventure.stages.map((stage) => (
                      <li key={stage.id}>
                        <button
                          className="p-2 rounded-md hover:bg-base-200 w-full text-left cursor-pointer"
                          onClick={() => handleSelectStage(stage)}
                        >
                          {stage.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdventureMapSidebar;
