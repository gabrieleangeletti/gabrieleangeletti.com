import { Temporal } from "@js-temporal/polyfill";

export const formatWeek = (period: string): [string, string] => {
  try {
    if (period.includes("-W")) {
      const [yearPart, weekPart] = period.split("-W");
      if (!yearPart || !weekPart) {
        throw new Error("unexpected ISO week format");
      }

      const year = Number(yearPart);
      const weekOfYear = Number(weekPart);

      const startOfWeek = Temporal.PlainDate.from({ year, weekOfYear, dayOfWeek: 1 });
      const formatted = startOfWeek.toLocaleString("en", {
        month: "short",
        day: "numeric",
      });

      return [formatted, startOfWeek.toString()];
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(period)) {
      const date = Temporal.PlainDate.from(period);
      const dayOffset = date.dayOfWeek - 1;
      const startOfWeek = dayOffset ? date.subtract({ days: dayOffset }) : date;
      const formatted = startOfWeek.toLocaleString("en", {
        month: "short",
        day: "numeric",
      });

      return [formatted, startOfWeek.toString()];
    }

    throw new Error("unhandled period format");
  } catch {
    const today = Temporal.Now.plainDateISO();
    return [period, today.toString()];
  }
};

/**
 * Formats seconds into a human-readable string.
 * @param seconds Total time in seconds
 * @param includeSeconds If true, shows "1m 5s". If false, rounds to nearest minute.
 */
export const formatDuration = (seconds: number, includeSeconds = false) => {
  if (seconds === 0) return "0m";

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const hLabel = h > 0 ? `${h}h ` : "";

  if (!includeSeconds) {
    const roundedM = s >= 30 ? m + 1 : m;
    // Handle the case where rounding 59s to 60m should add an hour
    if (roundedM === 60) return `${h + 1}h`;
    if (h === 0) return `${roundedM}m`;
    return roundedM > 0 ? `${h}h ${roundedM}m` : `${h}h`;
  }

  const mLabel = m > 0 || h > 0 ? `${m}m ` : "";
  const sLabel = s > 0 || (h === 0 && m === 0) ? `${s}s` : "";

  return `${hLabel}${mLabel}${sLabel}`.trim();
};
