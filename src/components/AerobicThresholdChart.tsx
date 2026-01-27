import { memo, useMemo } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  type TooltipProps,
  XAxis,
  YAxis,
} from "recharts";
import useChartTheme from "../hooks/useChartTheme";

export interface AerobicThresholdData {
  date: string;
  stravaURL: string;
  test: {
    inclinePercent: number;
    result: {
      totalTimeSeconds: number;
      firstHalfAvgHRbpm: number;
      secondHalfAvgHRbpm: number;
      rawDrift: number;
      simpleDriftPercentage: number;
    };
  };
  score: {
    value: number;
    efficiencyFactor: number;
    validityMultiplier: number;
    workingHeartRate: number;
  };
}

interface ChartPoint {
  date: string;
  dateFormatted: string;
  [key: string]: number | string | AerobicThresholdData | undefined;
}

interface AerobicThresholdChartProps {
  data: AerobicThresholdData[];
}

const INCLINE_COLORS: Record<number, string> = {
  0: "#06b6d4",
  1: "#0ea5e9",
  2: "#3b82f6",
  3: "#6366f1",
  4: "#8b5cf6",
  5: "#a855f7",
  6: "#d946ef",
  7: "#ec4899",
  8: "#f43f5e",
  9: "#ef4444",
  10: "#f97316",
  12: "#eab308",
  15: "#84cc16",
};

const getInclineColor = (incline: number): string => {
  if (INCLINE_COLORS[incline]) return INCLINE_COLORS[incline];
  const sortedKeys = Object.keys(INCLINE_COLORS)
    .map(Number)
    .sort((a, b) => a - b);
  const closest = sortedKeys.reduce((prev, curr) =>
    Math.abs(curr - incline) < Math.abs(prev - incline) ? curr : prev,
  );
  return INCLINE_COLORS[closest];
};

const formatDate = (isoDate: string): string => {
  const date = new Date(isoDate);
  return date.toLocaleDateString("en", { month: "short", day: "numeric", year: "2-digit" });
};

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  const theme = useChartTheme();

  if (!active || !payload || !payload.length) {
    return null;
  }

  const activePayload = payload.find((p) => p.value !== undefined && p.value !== null);
  if (!activePayload) return null;

  const inclineKey = activePayload.dataKey as string;
  const incline = parseFloat(inclineKey.replace("incline_", "").replace("_", "."));
  const dataPoint = activePayload.payload as ChartPoint;
  const originalData = dataPoint[`${inclineKey}_data`] as AerobicThresholdData | undefined;

  if (!originalData) return null;

  const { test, score } = originalData;

  return (
    <div
      style={{
        borderRadius: 12,
        backgroundColor: theme.tooltipBackground,
        border: `1px solid ${theme.tooltipBorder}`,
        padding: "14px 16px",
        fontSize: "0.875rem",
        color: "black",
        minWidth: 240,
        boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 12,
          paddingBottom: 10,
          borderBottom: `1px solid ${theme.tooltipBorder}`,
        }}
      >
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            backgroundColor: getInclineColor(incline),
            flexShrink: 0,
          }}
        />
        <span style={{ fontWeight: 600 }}>{dataPoint.dateFormatted}</span>
        <span
          style={{
            marginLeft: "auto",
            fontSize: "0.75rem",
            padding: "2px 8px",
            borderRadius: 6,
            backgroundColor: getInclineColor(incline) + "20",
            color: getInclineColor(incline),
            fontWeight: 600,
          }}
        >
          {incline}% incline
        </span>
      </div>

      <div style={{ marginBottom: 12 }}>
        <div
          style={{
            fontSize: "0.7rem",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            opacity: 0.6,
            marginBottom: 4,
          }}
        >
          Score
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span style={{ fontSize: "1.5rem", fontWeight: 700 }}>{score.value}</span>
          <span style={{ fontSize: "0.75rem", opacity: 0.7 }}>
            EF: {score.efficiencyFactor.toFixed(2)} | VM: {score.validityMultiplier.toFixed(2)}
          </span>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "8px 16px",
          fontSize: "0.8rem",
        }}
      >
        <div>
          <span style={{ opacity: 0.6 }}>Duration</span>
          <div style={{ fontWeight: 500 }}>{formatTime(test.result.totalTimeSeconds)}</div>
        </div>
        <div>
          <span style={{ opacity: 0.6 }}>Working HR</span>
          <div style={{ fontWeight: 500 }}>{score.workingHeartRate.toFixed(0)} bpm</div>
        </div>
        <div>
          <span style={{ opacity: 0.6 }}>1st Half HR</span>
          <div style={{ fontWeight: 500 }}>{test.result.firstHalfAvgHRbpm.toFixed(0)} bpm</div>
        </div>
        <div>
          <span style={{ opacity: 0.6 }}>2nd Half HR</span>
          <div style={{ fontWeight: 500 }}>{test.result.secondHalfAvgHRbpm.toFixed(0)} bpm</div>
        </div>
        <div style={{ gridColumn: "span 2" }}>
          <span style={{ opacity: 0.6 }}>HR Drift</span>
          <div style={{ fontWeight: 500, display: "flex", alignItems: "center", gap: 8 }}>
            <span>{test.result.rawDrift.toFixed(1)} bpm</span>
            <span
              style={{
                fontSize: "0.7rem",
                padding: "1px 6px",
                borderRadius: 4,
                backgroundColor:
                  test.result.simpleDriftPercentage <= 3.5
                    ? "rgba(34, 197, 94, 0.15)"
                    : test.result.simpleDriftPercentage <= 5
                      ? "rgba(234, 179, 8, 0.15)"
                      : "rgba(239, 68, 68, 0.15)",
                color:
                  test.result.simpleDriftPercentage <= 3.5
                    ? "#22c55e"
                    : test.result.simpleDriftPercentage <= 5
                      ? "#eab308"
                      : "#ef4444",
              }}
            >
              {test.result.simpleDriftPercentage.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const AerobicThresholdChart = ({ data }: AerobicThresholdChartProps) => {
  const theme = useChartTheme();

  const { chartData, inclines } = useMemo(() => {
    const inclineSet = new Set<number>();
    data.forEach((d) => inclineSet.add(d.test.inclinePercent));
    const sortedInclines = Array.from(inclineSet).sort((a, b) => a - b);

    const dateMap = new Map<string, ChartPoint>();

    data.forEach((d) => {
      const inclineKey = `incline_${d.test.inclinePercent.toString().replace(".", "_")}`;

      if (!dateMap.has(d.date)) {
        dateMap.set(d.date, {
          date: d.date,
          dateFormatted: formatDate(d.date),
        });
      }

      const point = dateMap.get(d.date)!;
      point[inclineKey] = d.score.value;
      point[`${inclineKey}_data`] = d;
    });

    const sorted = Array.from(dateMap.values()).sort((a, b) => a.date.localeCompare(b.date));

    return { chartData: sorted, inclines: sortedInclines };
  }, [data]);

  if (!data.length) {
    return (
      <div className="flex h-64 items-center justify-center text-base-content/60">
        No aerobic threshold data available yet.
      </div>
    );
  }

  const scoreValues = data.map((d) => d.score.value);
  const minScore = Math.min(...scoreValues);
  const maxScore = Math.max(...scoreValues);
  const yPadding = Math.max(50, (maxScore - minScore) * 0.15);

  return (
    <div className="w-full">
      <div className="h-96 w-full rounded-2xl border border-base-200 bg-base-100 p-4 shadow-sm">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 12, right: 24, bottom: 16, left: 0 }}>
            <CartesianGrid stroke={theme.axisColor} strokeOpacity={0.15} strokeDasharray="3 3" />
            <XAxis
              dataKey="dateFormatted"
              tick={{ fill: theme.axisColor, fontSize: 12 }}
              tickMargin={10}
              axisLine={{ stroke: theme.axisColor, strokeOpacity: 0.3 }}
              tickLine={{ stroke: theme.axisColor, strokeOpacity: 0.3 }}
            />
            <YAxis
              domain={[
                Math.floor((minScore - yPadding) / 50) * 50,
                Math.ceil((maxScore + yPadding) / 50) * 50,
              ]}
              tick={{ fill: theme.axisColor, fontSize: 12 }}
              tickMargin={8}
              width={50}
              axisLine={{ stroke: theme.axisColor, strokeOpacity: 0.3 }}
              tickLine={{ stroke: theme.axisColor, strokeOpacity: 0.3 }}
            />
            <Tooltip
              cursor={{ stroke: "rgba(59, 130, 246, 0.3)", strokeWidth: 2, strokeDasharray: "5 5" }}
              content={<CustomTooltip />}
            />
            <Legend
              wrapperStyle={{ fontSize: "0.75rem", paddingTop: 8 }}
              formatter={(value: string) => {
                const incline = value.replace("incline_", "").replace("_", ".");
                return `${incline}% incline`;
              }}
            />
            {inclines.map((incline) => {
              const inclineKey = `incline_${incline.toString().replace(".", "_")}`;
              return (
                <Line
                  key={inclineKey}
                  type="monotone"
                  dataKey={inclineKey}
                  name={inclineKey}
                  stroke={getInclineColor(incline)}
                  strokeWidth={2.5}
                  dot={{
                    r: 6,
                    fill: getInclineColor(incline),
                    stroke: "#fff",
                    strokeWidth: 2,
                  }}
                  activeDot={{
                    r: 8,
                    fill: getInclineColor(incline),
                    stroke: "#fff",
                    strokeWidth: 2,
                  }}
                  connectNulls={false}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default memo(AerobicThresholdChart);
