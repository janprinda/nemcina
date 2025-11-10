"use client";
import { useEffect, useState } from "react";

export default function PosGenderControls({ defaultPos = "", defaultGenders = [] as string[], defaultType = "WORD" as "WORD"|"PHRASE" }) {
  const [pos, setPos] = useState<string>(defaultPos || "");
  const [genders, setGenders] = useState<string[]>(defaultGenders || []);
  const [type, setType] = useState<"WORD"|"PHRASE">(defaultType);

  useEffect(() => {
    if (pos !== "noun" && genders.length) setGenders([]);
  }, [pos, genders]);

  const isNoun = pos === 'noun';

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-sm">Typ</label>
          <select name="type" value={type} onChange={(e)=> setType(e.target.value as any)} className="px-2 py-2 w-full">
            <option value="WORD">Slovo</option>
            <option value="PHRASE">Fráze</option>
          </select>
        </div>
        <div>
          <label className="block text-sm">Slovní druh</label>
          <select name="pos" value={pos} onChange={(e)=> setPos(e.target.value)} className="px-2 py-2 w-full">
            <option value="">—</option>
            <option value="noun">Podstatné jméno</option>
            <option value="verb">Sloveso</option>
            <option value="adj">Přídavné jméno</option>
            <option value="adv">Příslovce</option>
            <option value="phrase">Fráze</option>
            <option value="other">Jiné</option>
          </select>
        </div>
        <div>
          <label className="block text-sm">Rod (vyber jeden nebo více)</label>
          <input type="hidden" name="genders" value={genders.join(',')} />
          <div className="grid grid-cols-3 gap-2 mt-1">
            {(["der","die","das"] as const).map(g => {
              const active = genders.includes(g);
              const colorClass = g==='der' ? 'gender-der' : g==='die' ? 'gender-die' : 'gender-das';
              return (
                <button key={g}
                        type="button"
                        className={`btn w-full ${active ? colorClass : 'btn-secondary'} ${!isNoun ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => { if (!isNoun) return; setGenders(prev => prev.includes(g) ? prev.filter(x=>x!==g) : [...prev, g]); }}>
                  {g}
                </button>
              );
            })}
          </div>
          {!isNoun && <div className="text-xs muted mt-1">Rod je dostupný jen pro podstatná jména.</div>}
        </div>
      </div>
    </div>
  );
}
