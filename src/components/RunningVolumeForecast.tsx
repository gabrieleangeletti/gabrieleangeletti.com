import { useEffect, useMemo, useState } from "react";
import { Temporal } from "@js-temporal/polyfill";
import type { DotProps } from "recharts";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import useChartTheme from "../hooks/useChartTheme";

interface RunningVolumeForecastProps {
  baselineDistanceKm: number;
  lastWeekStartISO: string;
}

interface ForecastPoint {
  weekLabel: string;
  weekStartISO: string;
  mileageKm: number;
  isRestWeek: boolean;
}

const formatForecastLabel = (date: Temporal.PlainDate) =>
  date.toLocaleString("en", { month: "short", day: "numeric" });

const parseStartDate = (isoString: string) => {
  try {
    return Temporal.PlainDate.from(isoString);
  } catch {
    return Temporal.Now.plainDateISO();
  }
};

const RunningVolumeForecast = ({
  baselineDistanceKm,
  lastWeekStartISO,
}: RunningVolumeForecastProps) => {
  const theme = useChartTheme();
  const [weeksAhead, setWeeksAhead] = useState(8);
  const [weeklyIncreasePct, setWeeklyIncreasePct] = useState(5);
  const [restFrequency, setRestFrequency] = useState(3);
  const [baselineInput, setBaselineInput] = useState(() => Number(baselineDistanceKm.toFixed(1)));
  const [baselineDirty, setBaselineDirty] = useState(false);

  useEffect(() => {
    if (!baselineDirty) {
      setBaselineInput(Number(baselineDistanceKm.toFixed(1)));
    }
  }, [baselineDistanceKm, baselineDirty]);

  const forecastData = useMemo<ForecastPoint[]>(() => {
    if (!Number.isFinite(baselineInput) || baselineInput <= 0) {
      return [];
    }

    const lastWeekStart = parseStartDate(lastWeekStartISO);
    const growthFactor = weeklyIncreasePct / 100;
    const points: ForecastPoint[] = [];
    let currentMileage = baselineInput;

    for (let week = 1; week <= weeksAhead; week += 1) {
      const targetWeekStart = lastWeekStart.add({ weeks: week });
      const isRestWeek = restFrequency > 0 && week % (restFrequency + 1) === 0;

      if (isRestWeek) {
        points.push({
          weekLabel: formatForecastLabel(targetWeekStart),
          weekStartISO: targetWeekStart.toString(),
          mileageKm: 0,
          isRestWeek: true,
        });
        continue;
      }

      currentMileage = Number((currentMileage * (1 + growthFactor)).toFixed(1));
      points.push({
        weekLabel: formatForecastLabel(targetWeekStart),
        weekStartISO: targetWeekStart.toString(),
        mileageKm: currentMileage,
        isRestWeek: false,
      });
    }

    return points;
  }, [baselineInput, lastWeekStartISO, restFrequency, weeksAhead, weeklyIncreasePct]);

  const totalMileage = useMemo(
    () => forecastData.reduce((sum, item) => sum + item.mileageKm, 0),
    [forecastData],
  );

  const renderDot = (dotProps: DotProps) => {
    const payload = (dotProps as DotProps & { payload: ForecastPoint }).payload as
      | ForecastPoint
      | undefined;

    if (typeof dotProps.cx !== "number" || typeof dotProps.cy !== "number") {
      return null;
    }

    if (payload?.isRestWeek) {
      return (
        <circle
          key={dotProps.key}
          cx={dotProps.cx}
          cy={dotProps.cy}
          r={5}
          fill="#f97316"
          stroke="#f97316"
        />
      );
    }

    return (
      <circle
        key={dotProps.key}
        cx={dotProps.cx}
        cy={dotProps.cy}
        r={4}
        stroke="#2563eb"
        fill="#2563eb"
      />
    );
  };

  return (
    <section className="rounded-2xl border border-base-200 bg-base-100 p-6 shadow-sm">
      <header className="mb-4 flex flex-col gap-1">
        <h3 className="text-lg font-semibold text-base-content">Volume forecast</h3>
        <p className="text-sm text-base-content/70">
          Project the next {weeksAhead} weeks starting from the latest completed block.
        </p>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,280px)_1fr]">
        <form className="grid gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <label className="text-sm font-medium text-base-content" htmlFor="startingMileage">
                Starting mileage (km)
              </label>
              {baselineDirty && (
                <button
                  type="button"
                  className="btn btn-ghost btn-xs"
                  onClick={() => {
                    setBaselineDirty(false);
                    setBaselineInput(Number(baselineDistanceKm.toFixed(1)));
                  }}
                >
                  Reset
                </button>
              )}
            </div>
            <input
              type="number"
              id="startingMileage"
              min={0}
              max={400}
              step={0.5}
              value={baselineInput}
              onChange={(event) => {
                const value = Number(event.target.value);
                if (Number.isNaN(value)) {
                  setBaselineInput(0);
                  setBaselineDirty(true);
                  return;
                }
                setBaselineInput(Number(Math.max(0, value).toFixed(1)));
                setBaselineDirty(true);
              }}
              className="input input-bordered w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-base-content" htmlFor="weeksAhead">
              Weeks to forecast
            </label>
            <input
              type="number"
              min={1}
              max={24}
              value={weeksAhead}
              id="weeksAhead"
              onChange={(event) => {
                const value = Number(event.target.value);
                setWeeksAhead(Number.isNaN(value) ? 1 : Math.max(1, Math.min(24, value)));
              }}
              className="input input-bordered w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-base-content" htmlFor="weeklyIncrease">
              Weekly increase (%)
            </label>
            <input
              type="number"
              min={0}
              max={50}
              step={0.5}
              value={weeklyIncreasePct}
              id="weeklyIncrease"
              onChange={(event) => {
                const value = Number(event.target.value);
                setWeeklyIncreasePct(Number.isNaN(value) ? 0 : Math.max(0, Math.min(50, value)));
              }}
              className="input input-bordered w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-base-content" htmlFor="restFrequency">
              Rest week cadence
            </label>
            <input
              type="number"
              min={0}
              max={12}
              value={restFrequency}
              id="restFrequency"
              onChange={(event) => {
                const value = Number(event.target.value);
                setRestFrequency(Number.isNaN(value) ? 0 : Math.max(0, Math.min(12, value)));
              }}
              className="input input-bordered w-full"
            />
            <p className="text-xs text-base-content/60">
              0 disables rest weeks. With a value of 3, every fourth week is marked as rest.
            </p>
          </div>

          <div className="rounded-xl border border-base-200 bg-base-100/80 p-4 text-sm text-base-content/80">
            <p>
              Starting from <span className="font-medium">{baselineInput.toFixed(1)} km</span>
              {` with a ${weeklyIncreasePct}% weekly increase, the block totals `}
              <span className="font-medium">{totalMileage.toFixed(1)} km</span>.
            </p>
          </div>
        </form>

        <div className="flex flex-col gap-4">
          <div className="h-64 w-full overflow-hidden rounded-xl border border-base-200 bg-base-100/70 p-4">
            {forecastData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={forecastData} margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
                  <CartesianGrid
                    stroke={theme.axisColor}
                    strokeOpacity={0.2}
                    strokeDasharray="3 3"
                  />
                  <XAxis
                    dataKey="weekLabel"
                    tick={{ fill: theme.axisColor, fontSize: 12 }}
                    tickMargin={8}
                  />
                  <YAxis
                    tickFormatter={(value) => `${value} km`}
                    tick={{ fill: theme.axisColor, fontSize: 12 }}
                    width={60}
                  />
                  <Tooltip
                    cursor={{ stroke: "rgba(59, 130, 246, 0.4)", strokeWidth: 2 }}
                    contentStyle={{
                      borderRadius: 12,
                      backgroundColor: theme.tooltipBackground,
                      borderColor: theme.tooltipBorder,
                      fontSize: "0.875rem",
                      color: "black",
                    }}
                    labelStyle={{ color: "black" }}
                    formatter={(value: number, _name, payload) => {
                      if (payload?.payload?.isRestWeek) {
                        return ["Rest week", "Status"];
                      }
                      return [`${value.toFixed(1)} km`, "Mileage"];
                    }}
                    labelFormatter={(label, payload) => {
                      const iso = payload?.[0]?.payload?.weekStartISO;
                      if (!iso) return `Week of ${label}`;
                      return `Week of ${formatForecastLabel(parseStartDate(iso))}`;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="mileageKm"
                    stroke="#2563eb"
                    fill="rgba(37, 99, 235, 0.25)"
                    strokeWidth={3}
                    dot={renderDot}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-base-content/60">
                Provide a valid baseline to view the forecast.
              </div>
            )}
          </div>

          <div className="pr-1 lg:max-h-80 lg:overflow-y-auto">
            <ul className="grid gap-2 text-sm">
              {forecastData.map((point) => (
                <li
                  key={point.weekStartISO}
                  className="flex items-center justify-between rounded-lg border border-base-200 bg-base-100 px-3 py-2"
                >
                  <span className="font-medium text-base-content">Week of {point.weekLabel}</span>
                  {point.isRestWeek ? (
                    <span className="text-warning">Rest week</span>
                  ) : (
                    <span className="text-base-content/80">{point.mileageKm.toFixed(1)} km</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RunningVolumeForecast;
