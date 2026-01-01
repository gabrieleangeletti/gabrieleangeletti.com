import { useQuery } from "@tanstack/react-query";
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

const RunningYTDStats = () => {
    const { data, isPending, isError } = useQuery(
        {
            queryKey: ["running-ytd"],
            queryFn: async () => {
                const athleteId = "7e9ce9cd-46df-4a79-a086-4ec357ed1724";
                const { data, error } = await vo2Get(
                    `athletes/${athleteId}/metrics/running-ytd-volume`, {
                    provider: "strava",
                });
                if (error) throw new Error(error);
                return data as YTDResponse;
            },
            staleTime: 1000 * 60 * 30, // 30 minutes
        },
        client
    );

    // Formatters
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

    const formatDuration = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        return new Intl.NumberFormat("en-US").format(hours);
    };

    if (isError) return null;

    const volume = data?.volume;
    const currentYear = new Date().getFullYear();

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-base-content/50">
                    {currentYear} Year to Date
                </h4>
            </div>

            <div className="grid grid-cols-3 gap-4 divide-x divide-base-content/10">
                <div className="flex flex-col gap-1 pr-4">
                    <div className="flex items-center gap-2 text-sky-500 mb-1">
                        <TbActivity className="size-4" />
                        <span className="text-xs font-semibold uppercase tracking-wider text-base-content/60">
                            Distance
                        </span>
                    </div>
                    {isPending ? (
                        <div className="h-8 w-24 bg-base-content/10 animate-pulse rounded" />
                    ) : (
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-black text-base-content tracking-tight">
                                {formatDistance(volume?.totalDistanceMeters || 0)}
                            </span>
                            <span className="text-sm font-medium text-base-content/60">km</span>
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-1 px-4">
                    <div className="flex items-center gap-2 text-emerald-500 mb-1">
                        <TbMountain className="size-4" />
                        <span className="text-xs font-semibold uppercase tracking-wider text-base-content/60">
                            Elevation
                        </span>
                    </div>
                    {isPending ? (
                        <div className="h-8 w-24 bg-base-content/10 animate-pulse rounded" />
                    ) : (
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-black text-base-content tracking-tight">
                                {formatElevation(volume?.totalElevationGainMeters || 0)}
                            </span>
                            <span className="text-sm font-medium text-base-content/60">m</span>
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-1 pl-4">
                    <div className="flex items-center gap-2 text-orange-400 mb-1">
                        <TbClock className="size-4" />
                        <span className="text-xs font-semibold uppercase tracking-wider text-base-content/60">
                            Time
                        </span>
                    </div>
                    {isPending ? (
                        <div className="h-8 w-24 bg-base-content/10 animate-pulse rounded" />
                    ) : (
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-black text-base-content tracking-tight">
                                {formatDuration(volume?.totalMovingTimeSeconds || 0)}
                            </span>
                            <span className="text-sm font-medium text-base-content/60">hrs</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RunningYTDStats;