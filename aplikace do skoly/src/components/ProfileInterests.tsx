"use client";
import { useState } from "react";

export default function ProfileInterests({ initial }: { initial: string[] }) {
  const [interests, setInterests] = useState<string[]>(initial || []);
  const [custom, setCustom] = useState("");

  const addCustom = () => {
    const value = custom.trim();
    if (!value) return;
    setInterests((prev) => (prev.includes(value) ? prev : [...prev, value]));
    setCustom("");
  };

  return (
    <div className="md:col-span-2 space-y-2 text-left">
      <label className="block text-sm">Zájmy</label>
      <div className="flex flex-wrap gap-2">
        {interests.length === 0 && (
          <span className="text-xs muted">Zatím žádné vybrané zájmy.</span>
        )}
        {interests.map((i) => (
          <button
            key={i}
            type="button"
            className="btn btn-primary"
            onClick={() =>
              setInterests((prev) => prev.filter((x) => x !== i))
            }
          >
            {i}
          </button>
        ))}
      </div>
      <div className="flex gap-2 mt-2">
        <input
          className="input flex-1"
          placeholder="Vlastní zájem"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
        />
        <button type="button" className="btn btn-secondary" onClick={addCustom}>
          Přidat
        </button>
      </div>
      <input type="hidden" name="interests" value={interests.join(", ")} />
    </div>
  );
}

