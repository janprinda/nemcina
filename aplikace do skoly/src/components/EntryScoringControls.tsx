type Props = {
  defaultCorrect?: number | null;
  defaultPartial?: number | null;
  defaultWrong?: number | null;
};

export default function EntryScoringControls({
  defaultCorrect,
  defaultPartial,
  defaultWrong,
}: Props) {
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-center">Bodové hodnocení</div>
      <div className="text-xs muted mb-1 text-center">
        První (Správně) a poslední (Špatně) jsou ve výchozím stavu zapnuté.
        Částečně správně použij jen tam, kde dává smysl (např. špatný rod, ale
        opraví si ho).
      </div>
      <div className="grid md:grid-cols-3 gap-3 text-xs items-stretch">
        <label className="border border-[var(--border)] rounded px-3 py-3 flex flex-col justify-between cursor-pointer hover:bg-[var(--card)]/60">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-emerald-300">Správně</span>
            <input
              type="checkbox"
              name="pointsCorrectEnabled"
              defaultChecked
              className="accent-emerald-400 w-4 h-4"
            />
          </div>
          <input
            name="pointsCorrect"
            type="number"
            className="input text-xs"
            placeholder="body"
            defaultValue={defaultCorrect ?? ""}
          />
        </label>

        <label className="border border-[var(--border)] rounded px-3 py-3 flex flex-col justify-between cursor-pointer hover:bg-[var(--card)]/60">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-yellow-300">
              Částečně správně
            </span>
            <input
              type="checkbox"
              name="pointsPartialEnabled"
              defaultChecked={defaultPartial != null}
              className="accent-yellow-300 w-4 h-4"
            />
          </div>
          <input
            name="pointsPartial"
            type="number"
            className="input text-xs"
            placeholder="body"
            defaultValue={defaultPartial ?? ""}
          />
        </label>

        <label className="border border-[var(--border)] rounded px-3 py-3 flex flex-col justify-between cursor-pointer hover:bg-[var(--card)]/60">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-red-300">Špatně</span>
            <input
              type="checkbox"
              name="pointsWrongEnabled"
              defaultChecked
              className="accent-red-400 w-4 h-4"
            />
          </div>
          <input
            name="pointsWrong"
            type="number"
            className="input text-xs"
            placeholder="body"
            defaultValue={defaultWrong ?? ""}
          />
        </label>
      </div>
    </div>
  );
}

