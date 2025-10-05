import { useMemo } from "react";
import { Temporal } from "@js-temporal/polyfill";
import { useQuery } from "@tanstack/react-query";
import RunningVolumeChart, { type RunningVolumePoint } from "./RunningVolumeChart";
import RunningVolumeForecast from "./RunningVolumeForecast";
import CrossTrainingVolume from "./CrossTrainingVolume";
import { client, vo2Get } from "../utils/api";
import { formatWeek } from "../utils/format";

interface RunningVolumeData {
  data: {
    [sport: string]: {
      period: string;
      activityCount: number;
      totalDistanceMeters: number;
      totalElapsedTimeSeconds: number;
      totalMovingTimeSeconds: number;
      totalElevationGainMeters: number;
    }[];
  };
  frequency: string;
  provider: string;
  sports: string[];
  startDate: string;
  userId: string;
}

interface RunningVolumeProps {
  showHeading?: boolean;
}

const crossTrainingSports = ["elliptical", "cycling"];

const RunningVolume = ({ showHeading = true }: RunningVolumeProps) => {
  const { data, isPending, isError, error } = useQuery(
    {
      queryKey: ["running-volume"],
      queryFn: async () => {
        const userId = "c263ed11-624f-43c8-a217-666ae8427dbb";

        const now = Temporal.Now.plainDateISO();
        const threeMonthsAgo = now.subtract({ months: 3 });

        const { data, error } = await vo2Get(`athletes/${userId}/metrics/volume`, {
          provider: "strava",
          frequency: "week",
          sport: ["running", ...crossTrainingSports],
          startDate: threeMonthsAgo.toString(),
        });
        if (error) {
          throw new Error(error);
        }

        return data as RunningVolumeData;
      },
      staleTime: 1000 * 60 * 10,
    },
    client,
  );

  const chartData = useMemo<RunningVolumePoint[]>(() => {
    if (!data?.data) {
      return [];
    }

    return data.data["running"]
      .map((entry, index) => {
        const [weekLabel, weekStartISO] = formatWeek(entry.period);
        if (index === 0) {
          return {
            week: weekLabel,
            weekStartISO,
            timeSeconds: entry.totalMovingTimeSeconds,
            distanceKm: Number((entry.totalDistanceMeters / 1000).toFixed(1)),
            elevationM: Math.round(entry.totalElevationGainMeters),
            previousWeekTimeChange: 0,
            previousWeekDistanceChange: 0,
            previousWeekElevationChange: 0,
          };
        }

        const previousWeek = data.data["running"][index - 1];

        const previousWeekTimeSeconds = previousWeek ? previousWeek.totalElapsedTimeSeconds : 0;
        const previousWeekTimeChange =
          previousWeekTimeSeconds === 0
            ? Infinity
            : ((entry.totalElapsedTimeSeconds - previousWeekTimeSeconds) /
                previousWeekTimeSeconds) *
              100;

        const previousWeekDistanceMeters = previousWeek ? previousWeek.totalDistanceMeters : 0;
        const previousWeekDistanceChange =
          previousWeekDistanceMeters === 0
            ? Infinity
            : ((entry.totalDistanceMeters - previousWeekDistanceMeters) /
                previousWeekDistanceMeters) *
              100;

        const previousWeekElevationMeters = previousWeek
          ? previousWeek.totalElevationGainMeters
          : 0;
        const previousWeekElevationChange =
          previousWeekElevationMeters === 0
            ? Infinity
            : ((entry.totalElevationGainMeters - previousWeekElevationMeters) /
                previousWeekElevationMeters) *
              100;

        return {
          week: weekLabel,
          weekStartISO,
          timeSeconds: entry.totalElapsedTimeSeconds,
          distanceKm: Number((entry.totalDistanceMeters / 1000).toFixed(1)),
          elevationM: Math.round(entry.totalElevationGainMeters),
          previousWeekTimeChange: previousWeekTimeChange,
          previousWeekDistanceChange: previousWeekDistanceChange,
          previousWeekElevationChange: previousWeekElevationChange,
        };
      })
      .sort((a, b) => a.weekStartISO.localeCompare(b.weekStartISO));
  }, [data]);

  if (isPending) {
    return (
      <div className="flex h-80 items-center justify-center text-base-content/80">
        Loading weekly volume…
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-80 flex-col items-center justify-center gap-2 text-sm text-error">
        <span>Could not load running volume.</span>
        <span className="text-error-content/70">
          {error instanceof Error ? error.message : String(error)}
        </span>
      </div>
    );
  }

  if (!chartData.length) {
    return (
      <div className="flex h-80 items-center justify-center text-base-content/60">
        No running volume data available yet.
      </div>
    );
  }

  const mostRecentWeek = chartData.at(-1);

  return (
    <div className="w-full space-y-6">
      <RunningVolumeChart data={chartData} showHeading={showHeading} />
      <CrossTrainingVolume
        volumeBySport={data?.data}
        referenceWeeks={chartData.map(({ week, weekStartISO }) => ({ week, weekStartISO }))}
      />
      {mostRecentWeek && (
        <RunningVolumeForecast
          baselineDistanceKm={mostRecentWeek.distanceKm}
          lastWeekStartISO={mostRecentWeek.weekStartISO}
        />
      )}
    </div>
  );
};

export default RunningVolume;
