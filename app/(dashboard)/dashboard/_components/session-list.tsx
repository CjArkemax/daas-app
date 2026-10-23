import { formatDuration } from "@/lib/timer/format";
import { TZDate } from "@date-fns/tz";

type Session = {
  id: string;
  taskTitle: string;
  projectName: string;
  startedAt: Date;
  endedAt: Date;
  actualSeconds: number | null;
};

function formatLocalTime(date: Date, timezone: string) {
  const zoned = new TZDate(date, timezone);
  const hours = String(zoned.getHours()).padStart(2, '0');
  const minutes = String(zoned.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function SessionList({ 
  sessions, 
  timezone 
}: { 
  sessions: Session[], 
  timezone: string 
}) {
  return (
    <ul className="space-y-2">
      {sessions.map((s) => (
        <li key={s.id} className="flex items-baseline gap-3 text-sm">
          <span className="text-muted-foreground font-mono">
            {formatLocalTime(s.startedAt, timezone)}–{formatLocalTime(s.endedAt, timezone)}
          </span>
          <span>{s.projectName} · {s.taskTitle}</span>
          <span className="ml-auto font-mono">
            {formatDuration(s.actualSeconds ?? 0)}
          </span>
        </li>
      ))}
    </ul>
  );
}
