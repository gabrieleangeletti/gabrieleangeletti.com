import { memo } from "react";
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
import useChartTheme from "../hooks/useChartTheme";
interface RunningVolumeChartProps {
  data: RunningVolumePoint[];
  showHeading?: boolean;
}

export interface RunningVolumePoint {
  week: string;
  weekStartISO: string;
  distanceKm: number;
  elevationM: number;
}

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
            <Tooltip
              cursor={{ fill: "rgba(59, 130, 246, 0.08)" }}
              contentStyle={{
                borderRadius: 12,
                backgroundColor: theme.tooltipBackground,
                borderColor: theme.tooltipBorder,
                fontSize: "0.875rem",
                color: "black",
              }}
              labelStyle={{ color: "black" }}
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
