import { useMemo } from "react";
import { Temporal } from "@js-temporal/polyfill";
import { useQuery } from "@tanstack/react-query";
import RunningVolumeChart, { type RunningVolumePoint } from "./RunningVolumeChart";
import RunningVolumeForecast from "./RunningVolumeForecast";
import { client, vo2Get } from "../utils/api";

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
          sport: ["running", "elliptical"],
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
      .map((entry) => {
        const [weekLabel, weekStartISO] = formatWeek(entry.period);
        return {
          week: weekLabel,
          weekStartISO,
          distanceKm: Number((entry.totalDistanceMeters / 1000).toFixed(1)),
          elevationM: Math.round(entry.totalElevationGainMeters),
        } satisfies RunningVolumePoint;
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

const formatWeek = (period: string): [string, string] => {
  try {
    const [yearPart, weekPart] = period.split("-W");
    if (!yearPart || !weekPart) {
      throw new Error("unexpected period format");
    }

    const year = Number(yearPart);
    const weekOfYear = Number(weekPart);

    const startOfWeek = Temporal.PlainDate.from({ year, weekOfYear, dayOfWeek: 1 });
    const formatted = startOfWeek.toLocaleString("en", {
      month: "short",
      day: "numeric",
    });

    return [formatted, startOfWeek.toString()];
  } catch {
    const today = Temporal.Now.plainDateISO();
    return [period, today.toString()];
  }
};
