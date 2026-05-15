import { memo } from "react";
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps,
} from "recharts";
import useChartTheme from "../hooks/useChartTheme";
import { formatDuration } from "../utils/format";

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
  activityCount: number;
  previousWeekTimeChange: number;
  previousWeekDistanceChange: number;
  previousWeekElevationChange: number;
  longest: {
    distanceKm: number;
    elevationM: number;
    elapsedTimeSeconds: number;
    movingTimeSeconds: number;
  };
  hrZoneDistribution: {
    "1": number;
    "2": number;
    "3": number;
    "4": number;
    "5": number;
  } | null;
}

const ZONE_COLORS: Record<string, string> = {
  "1": "#9ca3af", // Gray
  "2": "#3b82f6", // Blue
  "3": "#22c55e", // Green
  "4": "#eab308", // Yellow
  "5": "#ef4444", // Red
};

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  const theme = useChartTheme();

  if (!active || !payload || !payload.length) {
    return null;
  }

  const dataPoint = payload[0].payload as RunningVolumePoint;

  const getFormattedDistancePrevWeek = () => {
    const change = dataPoint.previousWeekDistanceChange;
    const sign = change >= 0 ? "+" : "";
    return change !== Infinity ? `(${sign}${change.toFixed(1)}% vs. prev week)` : "";
  };

  const getFormattedElevationPrevWeek = () => {
    const change = dataPoint.previousWeekElevationChange;
    const sign = change >= 0 ? "+" : "";
    return change !== Infinity ? `(${sign}${change.toFixed(1)}% vs. prev week)` : "";
  };

  const getFormattedTimePrevWeek = () => {
    const change = dataPoint.previousWeekTimeChange;
    const sign = change >= 0 ? "+" : "";
    return change !== Infinity ? `(${sign}${change.toFixed(1)}% vs. prev week)` : "";
  };

  const hasHrData = !!dataPoint.hrZoneDistribution;
  const totalHrTime = hasHrData
    ? Object.values(dataPoint.hrZoneDistribution!).reduce((sum, val) => sum + val, 0)
    : 0;
  const zoneData = hasHrData
    ? Object.entries(dataPoint.hrZoneDistribution!).map(([zone, value]) => ({
        name: `Zone ${zone}`,
        value,
        color: ZONE_COLORS[zone],
        percentage: totalHrTime > 0 ? ((value / totalHrTime) * 100).toFixed(0) : "0",
      }))
    : [];

  return (
    <div
      style={{
        borderRadius: 12,
        backgroundColor: "white",
        border: `1px solid ${theme.tooltipBorder}`,
        padding: "12px",
        fontSize: "0.875rem",
        color: "black",
        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
        minWidth: "280px", // Slightly wider to accommodate the % text
      }}
    >
      <p
        style={{
          marginBottom: "8px",
          fontWeight: 700,
          borderBottom: "1px solid #f3f4f6",
          paddingBottom: "4px",
        }}
      >
        Week of {label}
      </p>

      <div style={{ marginBottom: "8px" }}>
        <p style={{ margin: "4px 0" }}>
          <span
            style={{
              color: payload.find((item) => item.dataKey === "distanceKm")?.color || "#2563eb",
              fontWeight: 600,
            }}
          >
            Distance: {dataPoint.distanceKm.toFixed(1)} km
          </span>
          <span style={{ fontSize: "0.75rem", color: "#666", marginLeft: "4px" }}>
            {getFormattedDistancePrevWeek()}
          </span>
        </p>

        <p style={{ margin: "4px 0" }}>
          <span
            style={{
              color: payload.find((item) => item.dataKey === "elevationM")?.color || "#f97316",
              fontWeight: 600,
            }}
          >
            Elevation: {dataPoint.elevationM.toFixed(0)} m
          </span>
          <span style={{ fontSize: "0.75rem", color: "#666", marginLeft: "4px" }}>
            {getFormattedElevationPrevWeek()}
          </span>
        </p>

        <p style={{ margin: "4px 0" }}>
          <span style={{ color: "black", fontWeight: 600 }}>
            Time: {formatDuration(dataPoint.timeSeconds)}
          </span>
          <span style={{ fontSize: "0.75rem", color: "#666", marginLeft: "4px" }}>
            {getFormattedTimePrevWeek()}
          </span>
        </p>
      </div>

      {hasHrData && (
        <div style={{ marginTop: "12px", paddingTop: "8px", borderTop: "1px solid #f3f4f6" }}>
          <p
            style={{
              fontSize: "10px",
              fontWeight: 700,
              color: "#9ca3af",
              textTransform: "uppercase",
              marginBottom: "4px",
            }}
          >
            Intensity Distribution
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {/* Larger container to prevent clipping */}
            <div style={{ width: 80, height: 80 }}>
              <PieChart width={80} height={80}>
                <Pie
                  data={zoneData}
                  cx="50%"
                  cy="50%"
                  innerRadius={18}
                  outerRadius={35}
                  stroke="none"
                  dataKey="value"
                  isAnimationActive={false}
                >
                  {zoneData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </div>
            <div style={{ flex: 1 }}>
              {[...zoneData].reverse().map((zone) => (
                <div
                  key={zone.name}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "11px",
                    lineHeight: "1.4",
                    whiteSpace: "nowrap",
                  }}
                >
                  <span style={{ color: zone.color, fontWeight: 700, marginRight: "8px" }}>
                    {zone.name}:
                  </span>
                  <span style={{ color: "#374151" }}>
                    {formatDuration(zone.value, true)}
                    <span style={{ color: "#9ca3af", marginLeft: "4px", fontSize: "10px" }}>
                      ({zone.percentage}%)
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div
        style={{
          marginTop: "12px",
          paddingTop: "8px",
          borderTop: "1px solid #f3f4f6",
          fontSize: "0.75rem",
          color: "#666",
        }}
      >
        <p style={{ marginBottom: "2px" }}>
          <b>Longest:</b> {dataPoint.longest.distanceKm.toFixed(1)}km /{" "}
          {dataPoint.longest.elevationM}m / {formatDuration(dataPoint.longest.movingTimeSeconds)}
          <span style={{ color: "#9ca3af", marginLeft: "4px" }}>
            ({((dataPoint.longest.elapsedTimeSeconds / dataPoint.timeSeconds) * 100).toFixed(1)}%)
          </span>
        </p>
        <p>
          <b>Activities:</b> {dataPoint.activityCount}
        </p>
      </div>
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
      <div className="h-96 w-full overflow-hidden rounded-2xl border border-base-200 bg-base-100 p-4 shadow-sm">
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
