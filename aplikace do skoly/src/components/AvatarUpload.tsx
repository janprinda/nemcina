"use client";
import { useEffect, useRef, useState } from "react";

export default function AvatarUpload({ name, initialSrc }: { name: string; initialSrc: string }) {
  const [preview, setPreview] = useState(initialSrc);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => { setPreview(initialSrc); }, [initialSrc]);

  return (
    <div
      className="border border-[var(--border)] rounded-lg p-4 bg-[var(--card)] text-center"
      onDragOver={(e)=>{ e.preventDefault(); }}
      onDrop={(e)=>{
        e.preventDefault();
        const f = e.dataTransfer.files?.[0];
        if (f && inputRef.current) {
          const dt = new DataTransfer();
          dt.items.add(f);
          inputRef.current.files = dt.files;
          setPreview(URL.createObjectURL(f));
        }
      }}
    >
      <img src={preview} alt="avatar" className="w-28 h-28 mx-auto rounded-full object-cover mb-3" />
      <input ref={inputRef} type="file" name={name} accept="image/*" className="hidden" onChange={(e)=>{
        const f = e.target.files?.[0];
        if (f) setPreview(URL.createObjectURL(f));
      }} />
      <div className="flex items-center justify-center gap-2">
        <button type="button" className="btn btn-secondary" onClick={()=> inputRef.current?.click()}>Vybrat soubor</button>
        <span className="text-xs muted">nebo přetáhni soubor sem</span>
      </div>
    </div>
  );
}

