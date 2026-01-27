import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useMemo } from "react";
import { type IconType } from "react-icons";
import { TbActivity, TbClock, TbMountain } from "react-icons/tb";
import { client, vo2Get } from "../utils/api";

interface AthleteTotalRunningVolume {
  totalDistanceMeters: number;
  totalMovingTimeSeconds: number;
  totalElevationGainMeters: number;
}

interface YTDResponse {
  athleteId: string;
  volume: AthleteTotalRunningVolume;
}

// Trail races with both distance and elevation requirements
const RACE_EQUIVALENTS = [
  { name: "marathon", meters: 42195, elevation: 0, emoji: "🏃" },
  { name: "Comrades Marathon", meters: 89000, elevation: 1900, emoji: "🇿🇦" },
  { name: "Ultra-Trail Australia", meters: 100000, elevation: 4400, emoji: "🇦🇺" },
  { name: "CCC", meters: 101000, elevation: 6100, emoji: "🏔️" },
  { name: "Lavaredo Ultra Trail", meters: 120000, elevation: 5850, emoji: "🇮🇹" },
  { name: "Transgrancanaria", meters: 128000, elevation: 7500, emoji: "🇪🇸" },
  { name: "TDS", meters: 145000, elevation: 9100, emoji: "🏔️" },
  { name: "Western States", meters: 161000, elevation: 5500, emoji: "🇺🇸" },
  { name: "Hardrock 100", meters: 161000, elevation: 10000, emoji: "⛏️" },
  { name: "Leadville 100", meters: 161000, elevation: 4800, emoji: "🏔️" },
  { name: "Diagonale des Fous", meters: 165000, elevation: 9900, emoji: "🇷🇪" },
  { name: "UTMB", meters: 171000, elevation: 10000, emoji: "🏔️" },
  { name: "Badwater 135", meters: 217000, elevation: 4450, emoji: "🏜️" },
  { name: "Spartathlon", meters: 246000, elevation: 1200, emoji: "🇬🇷" },
  { name: "Marathon des Sables", meters: 250000, elevation: 1000, emoji: "🏜️" },
  { name: "Tor des Géants", meters: 330000, elevation: 24000, emoji: "🇮🇹" },
];

// Pure distance comparisons (routes and country lengths)
const DISTANCE_EQUIVALENTS = [
  { name: "Paris → London", meters: 344000, emoji: "🚄" },
  { name: "London → Edinburgh", meters: 666000, emoji: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" },
  { name: "the length of Belgium", meters: 280000, emoji: "🇧🇪" },
  { name: "the length of Switzerland", meters: 350000, emoji: "🇨🇭" },
  { name: "the length of Austria", meters: 575000, emoji: "🇦🇹" },
  { name: "the length of Italy", meters: 1200000, emoji: "🇮🇹" },
  { name: "Land's End → John o' Groats", meters: 1400000, emoji: "🇬🇧" },
  { name: "the length of New Zealand", meters: 1600000, emoji: "🇳🇿" },
  { name: "the length of Japan", meters: 3000000, emoji: "🇯🇵" },
  { name: "the length of Chile", meters: 4300000, emoji: "🇨🇱" },
];

const ELEVATION_EQUIVALENTS = [
  // Popular mountains worldwide
  { name: "Ben Nevis", meters: 1345, emoji: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" },
  { name: "Snowdon", meters: 1085, emoji: "🏴󠁧󠁢󠁷󠁬󠁳󠁿" },
  { name: "Scafell Pike", meters: 978, emoji: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { name: "Mount Olympus", meters: 2918, emoji: "🇬🇷" },
  { name: "Mount Fuji", meters: 3776, emoji: "🇯🇵" },
  { name: "Mount Teide", meters: 3718, emoji: "🇪🇸" },
  { name: "Matterhorn", meters: 4478, emoji: "🇨🇭" },
  { name: "Mont Blanc", meters: 4809, emoji: "🇫🇷" },
  { name: "Mount Elbrus", meters: 5642, emoji: "🇷🇺" },
  { name: "Kilimanjaro", meters: 5895, emoji: "🇹🇿" },
  { name: "Denali", meters: 6190, emoji: "🇺🇸" },
  { name: "Aconcagua", meters: 6961, emoji: "🇦🇷" },
  { name: "Annapurna", meters: 8091, emoji: "🇳🇵" },
  { name: "Nanga Parbat", meters: 8126, emoji: "🇵🇰" },
  { name: "Manaslu", meters: 8163, emoji: "🇳🇵" },
  { name: "Cho Oyu", meters: 8188, emoji: "🇳🇵" },
  { name: "Makalu", meters: 8485, emoji: "🇳🇵" },
  { name: "Lhotse", meters: 8516, emoji: "🇳🇵" },
  { name: "Kangchenjunga", meters: 8586, emoji: "🇳🇵" },
  { name: "K2", meters: 8611, emoji: "🇵🇰" },
  { name: "Everest", meters: 8849, emoji: "🇳🇵" },
];

interface StatItem {
  Icon: IconType;
  label: string;
  value: number | string;
  sub: string;
  colorClass: string;
  delayClass: string;
}

const generateFunFacts = (distanceMeters: number, elevationMeters: number): string[] => {
  const facts: string[] = [];

  for (const race of RACE_EQUIVALENTS) {
    const distanceRatio = distanceMeters / race.meters;
    const elevationRatio = race.elevation > 0 ? elevationMeters / race.elevation : distanceRatio;
    const count = Math.min(distanceRatio, elevationRatio);

    if (count >= 0.3) {
      if (count >= 1) {
        const rounded = count >= 2 ? Math.round(count) : parseFloat(count.toFixed(1));
        facts.push(`${race.emoji} That's ${rounded}× the ${race.name}`);
      } else {
        const pct = Math.round(count * 100);
        facts.push(`${race.emoji} ${pct}% of the way through ${race.name}`);
      }
    }
  }

  for (const eq of DISTANCE_EQUIVALENTS) {
    const count = distanceMeters / eq.meters;
    if (count >= 0.3) {
      if (count >= 1) {
        const rounded = count >= 2 ? Math.round(count) : parseFloat(count.toFixed(1));
        facts.push(`${eq.emoji} That's ${rounded}× ${eq.name}`);
      } else {
        const pct = Math.round(count * 100);
        facts.push(`${eq.emoji} ${pct}% of ${eq.name}`);
      }
    }
  }

  for (const eq of ELEVATION_EQUIVALENTS) {
    const count = elevationMeters / eq.meters;
    if (count >= 0.5) {
      if (count >= 1) {
        const rounded = count >= 2 ? Math.round(count) : parseFloat(count.toFixed(1));
        facts.push(`${eq.emoji} Climbed ${rounded}× ${eq.name}`);
      } else {
        const pct = Math.round(count * 100);
        facts.push(`${eq.emoji} ${pct}% up ${eq.name}`);
      }
    }
  }

  return facts;
};

const RunningYTDStats = () => {
  const { data, isPending, isError } = useQuery(
    {
      queryKey: ["running-ytd"],
      queryFn: async () => {
        const athleteId = "7e9ce9cd-46df-4a79-a086-4ec357ed1724";
        const { data, error } = await vo2Get(`athletes/${athleteId}/metrics/running-ytd-volume`, {
          provider: "strava",
        });
        if (error) throw new Error(error);
        return data as YTDResponse;
      },
      staleTime: 1000 * 60 * 30, // 30 minutes
    },
    client,
  );

  const formatDistance = (meters: number) => {
    const km = meters / 1000;
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    }).format(km);
  };

  const formatElevation = (meters: number) => {
    return new Intl.NumberFormat("en-US").format(meters);
  };

  const getDurationUnits = (seconds: number) => {
    return {
      hours: Math.floor(seconds / 3600),
      minutes: Math.floor((seconds % 3600) / 60),
    };
  };

  const volume = data?.volume;
  const currentYear = new Date().getFullYear();
  const { hours, minutes } = getDurationUnits(volume?.totalMovingTimeSeconds || 0);

  const funFacts = useMemo(() => {
    if (!volume) return [];
    return generateFunFacts(volume.totalDistanceMeters, volume.totalElevationGainMeters);
  }, [volume]);

  const [factIndex, setFactIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (funFacts.length <= 1) return;

    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setFactIndex((prev) => (prev + 1) % funFacts.length);
        setIsVisible(true);
      }, 300);
    }, 4000);

    return () => clearInterval(interval);
  }, [funFacts.length]);

  const StatItem = ({ Icon, label, value, sub, colorClass, delayClass }: StatItem) => (
    <div
      className={`flex flex-col items-start gap-1 group animate-in fade-in slide-in-from-bottom-4 duration-700 ${delayClass}`}
    >
      <div className={`flex items-center gap-1.5 ${colorClass} mb-1 opacity-70`}>
        <Icon className="size-4" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-base-content/60">
          {label}
        </span>
      </div>
      {isPending ? (
        <div className="h-10 w-24 bg-base-content/5 animate-pulse rounded" />
      ) : (
        <div className="flex items-baseline gap-1">
          <span className="text-4xl md:text-5xl font-black tracking-tighter text-base-content">
            {value}
          </span>
          <span className="text-sm font-bold text-base-content/40">{sub}</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="shrink-0">
          <span className="text-[10px] font-bold text-base-content/30 uppercase tracking-[0.2em]">
            {currentYear} Totals
          </span>
        </div>

        <div className="flex-1 grid grid-cols-3 gap-4 md:gap-12 border-t md:border-t-0 border-base-content/5 pt-4 md:pt-0">
          <StatItem
            Icon={TbActivity}
            label="Distance"
            value={formatDistance(volume?.totalDistanceMeters || 0)}
            sub="km"
            colorClass="text-sky-500"
            delayClass="delay-100"
          />
          <StatItem
            Icon={TbMountain}
            label="Elevation"
            value={formatElevation(volume?.totalElevationGainMeters || 0)}
            sub="m"
            colorClass="text-emerald-500"
            delayClass="delay-200"
          />
          <StatItem
            Icon={TbClock}
            label="Time"
            value={hours}
            sub={`h ${minutes}m`}
            colorClass="text-orange-400"
            delayClass="delay-300"
          />
        </div>
      </div>

      {funFacts.length > 0 && !isPending && !isError && (
        <div className="border-t border-base-content/5 pt-3 animate-in fade-in duration-500 delay-500">
          <div className="flex items-center gap-2 overflow-hidden">
            <span
              className={`text-xs text-base-content/40 italic transition-all duration-300 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
              }`}
            >
              {funFacts[factIndex]}
            </span>
            {funFacts.length > 1 && (
              <span className="text-[9px] text-base-content/20 tabular-nums ml-auto shrink-0">
                {factIndex + 1}/{funFacts.length}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RunningYTDStats;
