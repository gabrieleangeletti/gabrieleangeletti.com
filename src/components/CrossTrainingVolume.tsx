import { useEffect, useMemo, useState } from "react";
import {
  Area,
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
import { formatWeek } from "../utils/formatWeek";

const crossTrainingSports = ["elliptical", "cycling"] as const;

type CrossTrainingSport = (typeof crossTrainingSports)[number];

const sportLabels: Record<CrossTrainingSport, string> = {
  elliptical: "Elliptical",
  cycling: "Cycling",
};

const sportColors: Record<CrossTrainingSport, string> = {
  elliptical: "#14b8a6",
  cycling: "#6366f1",
};

type VolumeEntry = {
  period: string;
  activityCount: number;
  totalDistanceMeters: number;
  totalElapsedTimeSeconds: number;
  totalMovingTimeSeconds: number;
  totalElevationGainMeters: number;
};

type VolumeBySport = Partial<Record<string, VolumeEntry[]>>;

interface WeekReference {
  week: string;
  weekStartISO: string;
}

type WeeklyTotals = {
  movingSeconds: number;
  distanceMeters: number;
  elevationMeters: number;
  activityCount: number;
};

type OverviewPoint = {
  week: string;
  weekStartISO: string;
  totalHours: number;
  ellipticalHours: number;
  cyclingHours: number;
};

type EllipticalPoint = {
  week: string;
  weekStartISO: string;
  movingHours: number;
  activityCount: number;
};

type CyclingPoint = {
  week: string;
  weekStartISO: string;
  movingHours: number;
  distanceKm: number;
  elevationM: number;
  activityCount: number;
};

interface PerSportSeries {
  elliptical: EllipticalPoint[];
  cycling: CyclingPoint[];
}

interface CrossTrainingVolumeProps {
  volumeBySport?: VolumeBySport;
  referenceWeeks?: WeekReference[];
}

const secondsToHours = (seconds: number) => seconds / 3600;
const metersToKilometers = (meters: number) => Math.round((meters / 1000) * 10) / 10;
const formatHoursLabel = (hours: number) => `${hours.toFixed(1)} h`;
const formatHoursMinutes = (hours: number) => {
  const totalMinutes = Math.round(hours * 60);
  const wholeHours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (wholeHours === 0) {
    return `${minutes} min`;
  }

  if (minutes === 0) {
    return `${wholeHours} h`;
  }

  return `${wholeHours} h ${minutes} min`;
};

const CrossTrainingVolume = ({ volumeBySport, referenceWeeks = [] }: CrossTrainingVolumeProps) => {
  const theme = useChartTheme();

  const { overallSeries, perSportSeries } = useMemo<{
    overallSeries: OverviewPoint[];
    perSportSeries: PerSportSeries;
  }>(() => {
    if (!volumeBySport) {
      return {
        overallSeries: [],
        perSportSeries: {
          elliptical: [],
          cycling: [],
        },
      };
    }

    const weekMap = new Map<
      string,
      {
        week: string;
        weekStartISO: string;
        totals: Record<CrossTrainingSport, WeeklyTotals>;
      }
    >();

    const emptyTotals = (): WeeklyTotals => ({
      movingSeconds: 0,
      distanceMeters: 0,
      elevationMeters: 0,
      activityCount: 0,
    });

    const ensureWeek = (weekStartISO: string, weekLabel: string) => {
      if (weekMap.has(weekStartISO)) {
        return;
      }

      weekMap.set(weekStartISO, {
        week: weekLabel,
        weekStartISO,
        totals: {
          elliptical: emptyTotals(),
          cycling: emptyTotals(),
        },
      });
    };

    crossTrainingSports.forEach((sport) => {
      const entries = volumeBySport[sport] ?? [];

      entries.forEach((entry) => {
        const [weekLabel, weekStartISO] = formatWeek(entry.period);
        ensureWeek(weekStartISO, weekLabel);

        const accumulator = weekMap.get(weekStartISO);
        if (!accumulator) {
          return;
        }

        const totals = accumulator.totals[sport];
        totals.movingSeconds += entry.totalMovingTimeSeconds;
        totals.distanceMeters += entry.totalDistanceMeters;
        totals.elevationMeters += entry.totalElevationGainMeters;
        totals.activityCount += entry.activityCount;
        accumulator.week = weekLabel;
      });
    });

    referenceWeeks.forEach(({ weekStartISO, week }) => {
      ensureWeek(weekStartISO, week);
    });

    const sortedWeeks = Array.from(weekMap.values()).sort((a, b) =>
      a.weekStartISO.localeCompare(b.weekStartISO),
    );

    const overallSeries = sortedWeeks.map<OverviewPoint>((weekData) => {
      const ellipticalHours = secondsToHours(weekData.totals.elliptical.movingSeconds);
      const cyclingHours = secondsToHours(weekData.totals.cycling.movingSeconds);
      const totalHours = ellipticalHours + cyclingHours;

      return {
        week: weekData.week,
        weekStartISO: weekData.weekStartISO,
        totalHours,
        ellipticalHours,
        cyclingHours,
      };
    });
    const ellipticalSeries = sortedWeeks.map<EllipticalPoint>((weekData) => ({
      week: weekData.week,
      weekStartISO: weekData.weekStartISO,
      movingHours: secondsToHours(weekData.totals.elliptical.movingSeconds),
      activityCount: weekData.totals.elliptical.activityCount,
    }));

    const cyclingSeries = sortedWeeks.map<CyclingPoint>((weekData) => ({
      week: weekData.week,
      weekStartISO: weekData.weekStartISO,
      movingHours: secondsToHours(weekData.totals.cycling.movingSeconds),
      distanceKm: metersToKilometers(weekData.totals.cycling.distanceMeters),
      elevationM: Math.round(weekData.totals.cycling.elevationMeters),
      activityCount: weekData.totals.cycling.activityCount,
    }));

    return {
      overallSeries,
      perSportSeries: {
        elliptical: ellipticalSeries,
        cycling: cyclingSeries,
      },
    };
  }, [referenceWeeks, volumeBySport]);

  const firstSportWithData = useMemo<CrossTrainingSport | null>(() => {
    for (const sport of crossTrainingSports) {
      const sportSeries =
        sport === "elliptical" ? perSportSeries.elliptical : perSportSeries.cycling;
      if (sportSeries.some((point) => point.movingHours > 0)) {
        return sport;
      }
    }
    return null;
  }, [perSportSeries]);

  const [selectedSport, setSelectedSport] = useState<CrossTrainingSport>(
    () => firstSportWithData ?? "elliptical",
  );

  useEffect(() => {
    if (!firstSportWithData) {
      return;
    }
    const selectedSeries =
      selectedSport === "elliptical" ? perSportSeries.elliptical : perSportSeries.cycling;
    const hasData = selectedSeries.some((point) => point.movingHours > 0);
    if (!hasData) {
      setSelectedSport(firstSportWithData);
    }
  }, [firstSportWithData, perSportSeries, selectedSport]);

  if (!overallSeries.length) {
    return (
      <div className="flex h-80 items-center justify-center rounded-2xl border border-base-200 bg-base-100 text-base-content/60">
        No cross-training data available yet.
      </div>
    );
  }

  const selectedSeries =
    selectedSport === "elliptical" ? perSportSeries.elliptical : perSportSeries.cycling;
  const latestWeek = selectedSeries.at(-1);

  const summaryMetrics = (() => {
    if (!latestWeek) {
      return [] as { label: string; value: string }[];
    }

    if (selectedSport === "elliptical") {
      const point = latestWeek as EllipticalPoint;
      return [
        { label: "Weekly time", value: formatHoursMinutes(point.movingHours) },
        { label: "Sessions", value: `${point.activityCount}` },
      ];
    }

    const point = latestWeek as CyclingPoint;
    return [
      { label: "Weekly time", value: formatHoursMinutes(point.movingHours) },
      { label: "Distance", value: `${point.distanceKm.toFixed(1)} km` },
      { label: "Elevation", value: `${point.elevationM.toLocaleString()} m` },
    ];
  })();

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <div>
          <h3 className="text-lg font-semibold text-base-content">Weekly Cross-Training Time</h3>
          <p className="text-sm text-base-content/60">
            Stack elliptical and cycling hours to monitor non-running load alongside mileage.
          </p>
        </div>
        <div className="h-72 w-full overflow-hidden rounded-2xl border border-base-200 bg-base-100 p-4 shadow-sm">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={overallSeries} margin={{ top: 8, right: 24, bottom: 16, left: 0 }}>
              <CartesianGrid stroke={theme.axisColor} strokeOpacity={0.12} strokeDasharray="3 3" />
              <XAxis dataKey="week" tick={{ fill: theme.axisColor, fontSize: 12 }} tickMargin={8} />
              <YAxis
                yAxisId="timeLeft"
                tickFormatter={formatHoursLabel}
                tick={{ fill: theme.axisColor, fontSize: 12 }}
                width={60}
              />
              <YAxis
                yAxisId="timeRight"
                orientation="right"
                tickFormatter={formatHoursLabel}
                tick={{ fill: theme.axisColor, fontSize: 12 }}
                width={60}
              />
              <Tooltip
                cursor={{ fill: "rgba(20, 184, 166, 0.08)" }}
                contentStyle={{
                  borderRadius: 12,
                  backgroundColor: theme.tooltipBackground,
                  borderColor: theme.tooltipBorder,
                  color: "black",
                  fontSize: "0.875rem",
                }}
                labelStyle={{ color: "black" }}
                formatter={(value: number | string, name) => {
                  const numericValue = typeof value === "number" ? value : Number(value);
                  if (name === "ellipticalHours" || name === "cyclingHours") {
                    const sport = name === "ellipticalHours" ? "elliptical" : "cycling";
                    return [formatHoursMinutes(numericValue), sportLabels[sport]];
                  }
                  if (name === "totalHours") {
                    return [formatHoursMinutes(numericValue), "Total"];
                  }
                  return [value, name];
                }}
                labelFormatter={(label) => `Week of ${label}`}
              />
              <Legend
                wrapperStyle={{ color: theme.axisColor, fontSize: "0.75rem" }}
                formatter={(value) => {
                  if (value === "ellipticalHours") {
                    return sportLabels.elliptical;
                  }
                  if (value === "cyclingHours") {
                    return sportLabels.cycling;
                  }
                  return "Total";
                }}
              />
              <Bar
                yAxisId="timeLeft"
                dataKey="ellipticalHours"
                stackId="hours"
                name="ellipticalHours"
                fill={sportColors.elliptical}
                radius={[4, 4, 0, 0]}
                barSize={18}
              />
              <Bar
                yAxisId="timeLeft"
                dataKey="cyclingHours"
                stackId="hours"
                name="cyclingHours"
                fill={sportColors.cycling}
                radius={[4, 4, 0, 0]}
                barSize={18}
              />
              <Line
                yAxisId="timeRight"
                type="monotone"
                dataKey="totalHours"
                name="totalHours"
                stroke="#0ea5e9"
                strokeWidth={3}
                dot={{ r: 3 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h4 className="text-lg font-semibold text-base-content">Cross-Training Detail</h4>
            <p className="text-sm text-base-content/60">
              Drill into a single sport to compare weekly sessions and terrain demands.
            </p>
          </div>
          <div className="flex rounded-full border border-base-200 bg-base-100 p-1 shadow-sm">
            {crossTrainingSports.map((sport) => {
              const isActive = sport === selectedSport;
              return (
                <button
                  key={sport}
                  type="button"
                  onClick={() => setSelectedSport(sport)}
                  className={`flex items-center rounded-full px-3 py-1 text-sm font-medium transition ${
                    isActive
                      ? "bg-primary text-primary-content shadow"
                      : "text-base-content/70 hover:text-base-content"
                  }`}
                >
                  {sportLabels[sport]}
                </button>
              );
            })}
          </div>
        </div>

        {summaryMetrics.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-3">
            {summaryMetrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-2xl border border-base-200 bg-base-100 px-4 py-3 text-sm shadow-sm"
              >
                <div className="text-base-content/50">{metric.label}</div>
                <div className="text-lg font-semibold text-base-content">{metric.value}</div>
              </div>
            ))}
          </div>
        )}

        <div className="h-72 w-full overflow-hidden rounded-2xl border border-base-200 bg-base-100 p-4 shadow-sm">
          {selectedSeries.length ? (
            <ResponsiveContainer width="100%" height="100%">
              {selectedSport === "elliptical" ? (
                <ComposedChart
                  data={perSportSeries.elliptical}
                  margin={{ top: 8, right: 24, bottom: 16, left: 0 }}
                >
                  <CartesianGrid
                    stroke={theme.axisColor}
                    strokeOpacity={0.12}
                    strokeDasharray="3 3"
                  />
                  <XAxis
                    dataKey="week"
                    tick={{ fill: theme.axisColor, fontSize: 12 }}
                    tickMargin={8}
                  />
                  <YAxis
                    tickFormatter={formatHoursLabel}
                    tick={{ fill: theme.axisColor, fontSize: 12 }}
                    width={60}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(20, 184, 166, 0.08)" }}
                    contentStyle={{
                      borderRadius: 12,
                      backgroundColor: theme.tooltipBackground,
                      borderColor: theme.tooltipBorder,
                      color: "black",
                      fontSize: "0.875rem",
                    }}
                    labelStyle={{ color: "black" }}
                    formatter={(value: number | string) => {
                      const numericValue = typeof value === "number" ? value : Number(value);
                      return [formatHoursMinutes(numericValue), "Time"];
                    }}
                    labelFormatter={(label) => `Week of ${label}`}
                  />
                  <Legend
                    wrapperStyle={{ color: theme.axisColor, fontSize: "0.75rem" }}
                    formatter={() => "Time"}
                  />
                  <Area
                    type="monotone"
                    dataKey="movingHours"
                    name="movingHours"
                    stroke={sportColors.elliptical}
                    fill={sportColors.elliptical}
                    fillOpacity={0.25}
                    strokeWidth={3}
                    dot={{ r: 3 }}
                  />
                </ComposedChart>
              ) : (
                <ComposedChart
                  data={perSportSeries.cycling}
                  margin={{ top: 8, right: 32, bottom: 16, left: 0 }}
                >
                  <CartesianGrid
                    stroke={theme.axisColor}
                    strokeOpacity={0.12}
                    strokeDasharray="3 3"
                  />
                  <XAxis
                    dataKey="week"
                    tick={{ fill: theme.axisColor, fontSize: 12 }}
                    tickMargin={8}
                  />
                  <YAxis
                    yAxisId="time"
                    tickFormatter={formatHoursLabel}
                    tick={{ fill: theme.axisColor, fontSize: 12 }}
                    width={50}
                  />
                  <YAxis
                    yAxisId="distance"
                    orientation="right"
                    tickFormatter={(value) => `${value} km`}
                    tick={{ fill: theme.axisColor, fontSize: 12 }}
                    width={60}
                  />
                  <YAxis yAxisId="elevation" orientation="right" hide />
                  <Tooltip
                    cursor={{ fill: "rgba(99, 102, 241, 0.08)" }}
                    contentStyle={{
                      borderRadius: 12,
                      backgroundColor: theme.tooltipBackground,
                      borderColor: theme.tooltipBorder,
                      color: "black",
                      fontSize: "0.875rem",
                    }}
                    labelStyle={{ color: "black" }}
                    formatter={(value: number | string, name) => {
                      const numericValue = typeof value === "number" ? value : Number(value);
                      if (name === "movingHours") {
                        return [formatHoursMinutes(numericValue), "Time"];
                      }
                      if (name === "distanceKm") {
                        return [`${numericValue.toFixed(1)} km`, "Distance"];
                      }
                      if (name === "elevationM") {
                        return [`${Math.round(numericValue).toLocaleString()} m`, "Elevation gain"];
                      }
                      return [value, name];
                    }}
                    labelFormatter={(label) => `Week of ${label}`}
                  />
                  <Legend
                    wrapperStyle={{ color: theme.axisColor, fontSize: "0.75rem" }}
                    formatter={(value) => {
                      if (value === "movingHours") {
                        return "Time";
                      }
                      if (value === "distanceKm") {
                        return "Distance";
                      }
                      if (value === "elevationM") {
                        return "Elevation";
                      }
                      return value;
                    }}
                  />
                  <Bar
                    yAxisId="time"
                    dataKey="movingHours"
                    name="movingHours"
                    barSize={18}
                    radius={[4, 4, 0, 0]}
                    fill={sportColors.cycling}
                  />
                  <Line
                    yAxisId="distance"
                    type="monotone"
                    dataKey="distanceKm"
                    name="distanceKm"
                    stroke="#2563eb"
                    strokeWidth={3}
                    dot={{ r: 3 }}
                  />
                  <Line
                    yAxisId="elevation"
                    type="monotone"
                    dataKey="elevationM"
                    name="elevationM"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={{ r: 2 }}
                  />
                </ComposedChart>
              )}
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-base-content/60">
              No {sportLabels[selectedSport].toLowerCase()} data yet.
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default CrossTrainingVolume;
