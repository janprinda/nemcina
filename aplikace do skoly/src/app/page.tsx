import LessonGrid from "@/components/LessonGrid";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/authOptions";
import { getAttempts, getLessons } from "@/server/store";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await getServerSession(authOptions as any);
  const uid = (session as any)?.user?.id as string | undefined;

  let score = 0;
  let nextTarget: number | null = null;
  let fromScore = 0;

  if (uid) {
    const [attempts, lessons] = await Promise.all([
      getAttempts(),
      getLessons(),
    ]);
    const myAttempts = attempts.filter((a) => a.userId === uid);
    const rawScore = myAttempts.reduce(
      (sum, a) => sum + (a.points ?? 0),
      0
    );
    score = Math.max(0, rawScore);

    const thresholds = lessons
      .filter((l) => typeof l.unlockScore === "number")
      .map((l) => l.unlockScore as number)
      .filter((n) => n > 0)
      .sort((a, b) => a - b);

    if (thresholds.length) {
      fromScore = 0;
      nextTarget = thresholds[thresholds.length - 1];
      for (const t of thresholds) {
        if (score < t) {
          nextTarget = t;
          break;
        }
        fromScore = t;
      }
    }
  }

  let pct = 0;
  if (nextTarget && nextTarget > fromScore) {
    pct = Math.min(100, ((score - fromScore) / (nextTarget - fromScore)) * 100);
  }

  return (
    <div className="space-y-8">
      <section className="text-center space-y-3">
        <h1 className="text-3xl font-semibold">Němčina – lekce</h1>
        <p className="text-sm muted">Vyber lekci a začni trénovat.</p>
        {uid && (
          <div className="max-w-xl mx-auto text-left space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="muted">
                Tvé body:{" "}
                <span className="text-gray-100 font-semibold">{score}</span>
              </span>
              {nextTarget && (
                <span className="muted">
                  Do další lekce zbývá{" "}
                  <span className="font-semibold">
                    {Math.max(0, nextTarget - score)} b
                  </span>
                </span>
              )}
            </div>
            {nextTarget && (
              <div className="h-3 rounded bg-[var(--border)] overflow-hidden">
                <div
                  className="h-full bg-[var(--accent)]"
                  style={{ width: `${pct}%` }}
                />
              </div>
            )}
          </div>
        )}
      </section>
      <LessonGrid />
    </div>
  );
}

