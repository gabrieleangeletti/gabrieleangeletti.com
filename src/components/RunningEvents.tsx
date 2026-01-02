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
  if (weeksUntil <= 0) return "This week";
  if (weeksUntil === 1) return "1 week";
  return `${weeksUntil} weeks`;
};

const calculateWeeksUntil = (dateISO: string): number => {
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const eventDate = new Date(dateISO);
  const diffMs = eventDate.getTime() - startOfToday.getTime();
  const weeks = diffMs / (1000 * 60 * 60 * 24 * 7);
  return weeks <= 0 ? 0 : Math.ceil(weeks);
};

const formatDistance = (distanceKm: number): string =>
  Number.isInteger(distanceKm) ? `${distanceKm} km` : `${distanceKm.toFixed(1)} km`;

const formatElevation = (elevationM: number): string => `${elevationM} m`;

const RunningEvents = () => {
  const events = useMemo<EnrichedEvent[]>(() => {
    return upcomingEvents
      .map((event) => {
        const weeksUntil = calculateWeeksUntil(event.dateISO);
        return {
          ...event,
          weeksUntil,
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
        <a
          key={event.id}
          href={event.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex items-start gap-4 p-4 rounded-2xl bg-base-100 border border-base-content/5 transition-all duration-300 hover:shadow-lg hover:border-sky-500/30 overflow-hidden"
        >
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-base-content/10 bg-base-content/5">
            {event.image ? (
              <img
                src={event.image}
                alt={event.name}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-lg font-bold text-base-content/30">
                {event.name.charAt(0)}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 flex flex-col gap-1 py-0.5">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-md font-bold text-base-content leading-tight group-hover:text-sky-600 transition-colors line-clamp-2">
                {event.name}
              </h3>
            </div>

            <p className="text-xs text-base-content/50 truncate">{event.location}</p>

            <div className="mt-auto flex items-center gap-3 text-xs font-medium text-base-content/70">
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3 text-base-content/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                {event.formattedDistance}
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3 text-base-content/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 11l7-7 7 7M5 19l7-7 7 7" /></svg>
                {event.formattedElevation}
              </span>
            </div>
          </div>

          <div className="absolute top-4 right-4 flex flex-col items-end leading-none pointer-events-none">
            <span className="text-2xl font-bold text-sky-500">{event.weeksUntil}</span>
            <span className="text-[9px] uppercase tracking-wide text-base-content/40">wks</span>
          </div>
        </a>
      ))}

      {events.length === 0 && (
        <div className="col-span-full p-8 text-center border border-dashed border-base-content/20 rounded-2xl">
          <p className="text-sm text-base-content/50">No upcoming races configured.</p>
        </div>
      )}
    </div>
  );
};

export default RunningEvents;
