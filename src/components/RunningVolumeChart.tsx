import { memo } from "react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  type TooltipProps,
  XAxis,
  YAxis,
} from "recharts";
import useChartTheme from "../hooks/useChartTheme";
import { formatHoursMinutes } from "../utils/format";

interface RunningVolumeChartProps {
  data: RunningVolumePoint[];
  showHeading?: boolean;
}

export interface RunningVolumePoint {
  week: string;
  weekStartISO: string;
  timeSeconds: number;
  distanceKm: number;
  elevationM: number;
  previousWeekTimeChange: number;
  previousWeekDistanceChange: number;
  previousWeekElevationChange: number;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  const theme = useChartTheme();

  if (!active || !payload || !payload.length) {
    return null;
  }

  const dataPoint = payload[0].payload as RunningVolumePoint;

  const getFormattedDistancePrevWeek = () => {
    const change = dataPoint.previousWeekDistanceChange;
    const sign = change >= 0 ? "+" : "";
    const formattedChange =
      change !== Infinity ? `(${sign}${change.toFixed(1)}% vs. prev week)` : "";

    return formattedChange;
  };

  const getFormattedElevationPrevWeek = () => {
    const change = dataPoint.previousWeekElevationChange;
    const sign = change >= 0 ? "+" : "";
    const formattedChange =
      change !== Infinity ? `(${sign}${change.toFixed(1)}% vs. prev week)` : "";

    return formattedChange;
  };

  const getFormattedTimePrevWeek = () => {
    const change = dataPoint.previousWeekTimeChange;
    const sign = change >= 0 ? "+" : "";
    const formattedChange =
      change !== Infinity ? `(${sign}${change.toFixed(1)}% vs. prev week)` : "";

    return formattedChange;
  };

  return (
    <div
      style={{
        borderRadius: 12,
        backgroundColor: theme.tooltipBackground,
        border: `1px solid ${theme.tooltipBorder}`,
        padding: "12px",
        fontSize: "0.875rem",
        color: "black",
      }}
    >
      <p style={{ marginBottom: "8px", fontWeight: 600 }}>Week of {label}</p>

      <p style={{ margin: "4px 0" }}>
        <span style={{ color: payload.find((item) => item.dataKey === "distanceKm").color }}>
          Distance: {dataPoint.distanceKm.toFixed(1)} km {getFormattedDistancePrevWeek()}
        </span>
      </p>

      <p style={{ margin: "4px 0" }}>
        <span style={{ color: payload.find((item) => item.dataKey === "elevationM").color }}>
          Elevation: {dataPoint.elevationM.toFixed(1)} m {getFormattedElevationPrevWeek()}
        </span>
      </p>

      <p style={{ margin: "4px 0" }}>
        <span style={{ color: "black" }}>
          Time: {formatHoursMinutes(dataPoint.timeSeconds / 3600)} {getFormattedTimePrevWeek()}
        </span>
      </p>
    </div>
  );
};

const RunningVolumeChart = ({ data, showHeading = true }: RunningVolumeChartProps) => {
  const theme = useChartTheme();

  if (!data.length) {
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
          <ComposedChart data={data} margin={{ top: 8, right: 24, bottom: 16, left: 0 }}>
            <CartesianGrid stroke={theme.axisColor} strokeOpacity={0.2} strokeDasharray="3 3" />
            <XAxis dataKey="week" tick={{ fill: theme.axisColor, fontSize: 12 }} tickMargin={8} />
            <YAxis
              yAxisId="distance"
              tickFormatter={(value) => `${value} km`}
              tick={{ fill: theme.axisColor, fontSize: 12 }}
              width={60}
            />
            <YAxis
              yAxisId="elevation"
              orientation="right"
              tickFormatter={(value) => `${value} m`}
              tick={{ fill: theme.axisColor, fontSize: 12 }}
              width={60}
            />
            <Tooltip cursor={{ fill: "rgba(59, 130, 246, 0.08)" }} content={CustomTooltip} />
            <Legend
              wrapperStyle={{ color: theme.axisColor, fontSize: "0.75rem" }}
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

export default memo(RunningVolumeChart);
