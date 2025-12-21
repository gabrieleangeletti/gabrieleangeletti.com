import { useMemo } from "react";

type EventType = "race";

interface RunningEvent {
  id: string;
  name: string;
  dateISO: `${number}-${number}-${number}`;
  type: EventType;
  image: string | null;
  url: string;
  location: string;
  distanceKm: number;
  elevationGainM: number;
}

interface EnrichedEvent extends RunningEvent {
  weeksUntil: number;
  formattedDate: string;
  weeksLabel: string;
  formattedDistance: string;
  formattedElevation: string;
}

const upcomingEvents: RunningEvent[] = [
  {
    id: "linhas-de-torres-100-2026",
    name: "Linhas de Torres 100",
    dateISO: "2026-01-31",
    type: "race",
    image: null,
    url: "https://www.linhasdetorres100.com/home-en#events",
    location: "Torres Vedras, Portugal",
    distanceKm: 30,
    elevationGainM: 900,
  },
  {
    id: "utmb-oh-meus-deus-2026",
    name: "Oh Meus Deus by UTMB",
    dateISO: "2026-05-01",
    type: "race",
    image: "/images/events/utmb-world-series.png",
    url: "https://ohmeudeus.utmb.world/pt/races/omd50k",
    location: "Loriga, Portugal",
    distanceKm: 50,
    elevationGainM: 2800,
  },
  {
    id: "utmb-val-daran-2026",
    name: "Hoka Val d'Aran by UTMB",
    dateISO: "2026-07-03",
    type: "race",
    image: "/images/events/utmb-world-series.png",
    url: "https://valdaran.utmb.world/races/CDH",
    location: "Vielha, Spain",
    distanceKm: 110,
    elevationGainM: 6400,
  },
];

const formatter = new Intl.DateTimeFormat("en", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

const formatWeeksLabel = (weeksUntil: number): string => {
  if (weeksUntil <= 0) {
    return "This week";
  }

  if (weeksUntil === 1) {
    return "1 week";
  }

  return `${weeksUntil} weeks`;
};

const calculateWeeksUntil = (dateISO: string): number => {
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const eventDate = new Date(dateISO);

  const diffMs = eventDate.getTime() - startOfToday.getTime();
  const weeks = diffMs / (1000 * 60 * 60 * 24 * 7);

  if (weeks <= 0) {
    return 0;
  }

  return Math.ceil(weeks);
};

const formatDistance = (distanceKm: number): string => {
  if (Number.isInteger(distanceKm)) {
    return `${distanceKm} km`;
  }

  return `${distanceKm.toFixed(1)} km`;
};

const formatElevation = (elevationM: number): string => `${elevationM} m`;

const RunningEvents = () => {
  const events = useMemo<EnrichedEvent[]>(() => {
    return upcomingEvents
      .map((event) => {
        const weeksUntil = calculateWeeksUntil(event.dateISO);

        return {
          ...event,
          weeksUntil,
          formattedDate: formatter.format(new Date(event.dateISO)),
          weeksLabel: formatWeeksLabel(weeksUntil),
          formattedDistance: formatDistance(event.distanceKm),
          formattedElevation: formatElevation(event.elevationGainM),
        } satisfies EnrichedEvent;
      })
      .sort((a, b) => a.dateISO.localeCompare(b.dateISO));
  }, []);

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <article
          key={event.id}
          className="flex items-center gap-4 rounded-2xl border border-sky-500/10 bg-base-100/70 p-4 shadow-lg shadow-sky-500/10 backdrop-blur-sm"
        >
          <div className="h-20 w-20 overflow-hidden rounded-2xl border border-base-content/10">
            {event.image ? (
              <img
                src={event.image}
                alt={`${event.name} cover art`}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-base-content/5 text-2xl font-semibold text-base-content/40">
                {event.name.charAt(0)}
              </div>
            )}
          </div>
          <div className="flex flex-1 flex-col gap-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-lg font-semibold text-base-content">
                  <a href={event.url} target="_blank" rel="noopener noreferrer">
                    {event.name}
                  </a>
                </h3>
                <p className="text-sm text-base-content/60">{event.location}</p>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-2xl font-semibold text-sky-500">{event.weeksUntil}</span>
                <span className="text-xs uppercase tracking-[0.25em] text-base-content/60">
                  weeks
                </span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm text-base-content/70">
              <span className="rounded-full border border-base-content/10 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-base-content/60">
                {event.type === "race" ? "Race" : event.type}
              </span>
              <span>{event.formattedDate}</span>
              <span className="text-base-content/40">•</span>
              <span>{event.weeksLabel}</span>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-base-content/70">
              <span className="flex items-center gap-1">
                <span className="text-base-content/50">Distance</span>
                <span className="font-medium text-base-content">{event.formattedDistance}</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="text-base-content/50">Elevation</span>
                <span className="font-medium text-base-content">{event.formattedElevation}</span>
              </span>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
};

export default RunningEvents;
