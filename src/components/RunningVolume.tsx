import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Temporal } from "@js-temporal/polyfill";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { client, vo2Get } from "../utils/api";

interface RunningVolumeData {
  data: {
    period: string;
    activityCount: number;
    totalDistanceMeters: number;
    totalElapsedTimeSeconds: number;
    totalMovingTimeSeconds: number;
    totalElevationGainMeters: number;
  }[];
  frequency: string;
  provider: string;
  sport: string;
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
          sport: "running",
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

  const chartData = useMemo(() => {
    if (!data?.data) {
      return [];
    }

    return data.data
      .map((entry) => {
        const [weekLabel, weekStartISO] = formatWeek(entry.period);
        return {
          week: weekLabel,
          weekStartISO,
          distanceKm: Number((entry.totalDistanceMeters / 1000).toFixed(1)),
          elevationM: Math.round(entry.totalElevationGainMeters),
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

  return (
    <div className="w-full">
      {showHeading && (
        <h2 className="mb-4 text-lg font-semibold text-base-content">Weekly Running Volume</h2>
      )}
      <div className="h-80 w-full overflow-hidden rounded-2xl border border-base-200 bg-base-100 p-4 shadow-sm">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 8, right: 24, bottom: 16, left: 0 }}>
            <CartesianGrid stroke="rgba(148, 163, 184, 0.3)" strokeDasharray="3 3" />
            <XAxis
              dataKey="week"
              tick={{ fill: "hsl(var(--bc, 215 28% 17%))", fontSize: 12 }}
              tickMargin={8}
            />
            <YAxis
              yAxisId="distance"
              tickFormatter={(value) => `${value} km`}
              tick={{ fill: "hsl(var(--bc, 215 28% 17%))", fontSize: 12 }}
              width={60}
            />
            <YAxis
              yAxisId="elevation"
              orientation="right"
              tickFormatter={(value) => `${value} m`}
              tick={{ fill: "hsl(var(--bc, 215 28% 17%))", fontSize: 12 }}
              width={60}
            />
            <Tooltip
              cursor={{ fill: "rgba(59, 130, 246, 0.08)" }}
              contentStyle={{
                borderRadius: 12,
                borderColor: "hsl(var(--bc, 215 28% 17%))",
                fontSize: "0.875rem",
              }}
              formatter={(value: number | string, name) => {
                if (name === "distanceKm") {
                  const numericValue = typeof value === "number" ? value : Number(value);
                  return [`${numericValue.toFixed(1)} km`, "Distance"];
                }
                if (name === "elevationM") {
                  const numericValue = typeof value === "number" ? value : Number(value);
                  return [`${numericValue.toLocaleString()} m`, "Elevation gain"];
                }
                return [value, name];
              }}
              labelFormatter={(label) => `Week of ${label}`}
            />
            <Legend
              formatter={(value) => (value === "distanceKm" ? "Distance" : "Elevation gain")}
            />
            <Bar
              yAxisId="distance"
              dataKey="distanceKm"
              name="distanceKm"
              barSize={16}
              radius={[4, 4, 0, 0]}
              fill="#2563eb"
            />
            <Line
              yAxisId="elevation"
              type="monotone"
              dataKey="elevationM"
              name="elevationM"
              stroke="#f97316"
              strokeWidth={3}
              dot={{ r: 3 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
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
