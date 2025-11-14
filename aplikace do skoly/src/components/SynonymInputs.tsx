"use client";
import { useState } from "react";

type SynonymInputsProps = {
  name: string;
  initial?: string[];
  label?: string;
  placeholder?: string;
};

export default function SynonymInputs({
  name,
  initial = [],
  label,
  placeholder,
}: SynonymInputsProps) {
  const [values, setValues] = useState<string[]>(
    initial.length ? initial : [""]
  );

  const updateValue = (idx: number, val: string) => {
    setValues((prev) => {
      const next = [...prev];
      next[idx] = val;
      return next;
    });
  };

  const addField = () => {
    setValues((prev) => [...prev, ""]);
  };

  return (
    <div className="space-y-1">
      {label && <div className="text-xs muted">{label}</div>}
      <div className="space-y-1">
        {values.map((val, idx) => (
          <input
            key={idx}
            name={name}
            className="w-full px-3 py-2 text-xs input"
            placeholder={placeholder}
            value={val}
            onChange={(e) => updateValue(idx, e.target.value)}
          />
        ))}
      </div>
      <button
        type="button"
        onClick={addField}
        className="mt-1 text-[11px] px-2 py-1 rounded bg-[var(--card)]/60 hover:bg-[var(--card)] border border-dashed border-[var(--border)]"
      >
        Přidat
      </button>
    </div>
  );
}

