import { requireUser } from "@/lib/auth/requireUser";
import { getUserTimezone, getTodayTotalFocusedSeconds, getTodaySessions } from "@/lib/analytics/day";
import { formatDuration } from "@/lib/timer/format";
import { SessionList } from "./_components/session-list";

export default async function DashboardPage() {
  const user = await requireUser();
  const timezone = await getUserTimezone(user.id);

  const [totalSeconds, todaySessions] = await Promise.all([
    getTodayTotalFocusedSeconds(user.id, timezone),
    getTodaySessions(user.id, timezone),
  ]);

  const untrackedSeconds = Math.max(0, 86400 - totalSeconds);

  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">Dashboard</h1>
      <section className="mb-6">
        <p className="text-sm text-muted-foreground">Focused today</p>
        <p className="text-3xl">{formatDuration(totalSeconds)}</p>
        <p className="text-sm text-muted-foreground mt-2">
          {formatDuration(untrackedSeconds)} untracked
        </p>
      </section>

      <section>
        <h2 className="text-lg mb-2">Today's sessions</h2>
        {todaySessions.length === 0 ? (
          <p>No sessions yet.</p>
        ) : (
          <SessionList sessions={todaySessions} />
        )}
      </section>
    </div>
  );
}