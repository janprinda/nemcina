import LessonGrid from "@/components/LessonGrid";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  return (
    <div className="space-y-8">
      <section className="text-center space-y-1">
        <h1 className="text-3xl font-semibold">Němčina – lekce</h1>
        <p className="text-sm muted">Vyber lekci a začni trénovat.</p>
      </section>
      <LessonGrid />
    </div>
  );
}
