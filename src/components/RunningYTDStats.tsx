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
            minutes: Math.floor((seconds % 3600) / 60)
        };
    };

    if (isError) return null;

    const volume = data?.volume;
    const currentYear = new Date().getFullYear();
    const { hours, minutes } = getDurationUnits(volume?.totalMovingTimeSeconds || 0);

    const StatItem = ({ icon: Icon, label, value, sub, colorClass, delay }: any) => (
        <div className={`flex flex-col items-start gap-1 group animate-in fade-in slide-in-from-bottom-4 duration-700 ${delay}`}>
            <div className={`flex items-center gap-1.5 ${colorClass} mb-1 opacity-70`}>
                <Icon className="size-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-base-content/60">{label}</span>
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="shrink-0">
                <span className="text-[10px] font-bold text-base-content/30 uppercase tracking-[0.2em]">{currentYear} Totals</span>
            </div>

            <div className="flex-1 grid grid-cols-3 gap-4 md:gap-12 border-t md:border-t-0 border-base-content/5 pt-4 md:pt-0">
                <StatItem
                    icon={TbActivity}
                    label="Distance"
                    value={formatDistance(volume?.totalDistanceMeters || 0)}
                    sub="km"
                    colorClass="text-sky-500"
                    delay="delay-100"
                />
                <StatItem
                    icon={TbMountain}
                    label="Elevation"
                    value={formatElevation(volume?.totalElevationGainMeters || 0)}
                    sub="m"
                    colorClass="text-emerald-500"
                    delay="delay-200"
                />
                <StatItem
                    icon={TbClock}
                    label="Time"
                    value={hours}
                    sub={`h ${minutes}m`}
                    colorClass="text-orange-400"
                    delay="delay-300"
                />
            </div>
        </div>
    );
};

export default RunningYTDStats;