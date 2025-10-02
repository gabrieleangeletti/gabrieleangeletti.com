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
