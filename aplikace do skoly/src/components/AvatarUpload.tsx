"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

export default function AvatarUpload({ name, initialSrc }: { name: string; initialSrc: string }) {
  const [preview, setPreview] = useState(initialSrc || "/avatar-placeholder.svg");
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setPreview(initialSrc || "/avatar-placeholder.svg");
  }, [initialSrc]);

  const handleFile = (file: File | null | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    setPreview(URL.createObjectURL(file));
    if (inputRef.current) {
      const dt = new DataTransfer();
      dt.items.add(file);
      inputRef.current.files = dt.files;
    }
  };

  return (
    <div
      className="border border-[var(--border)] rounded-lg p-4 bg-[var(--card)] text-center space-y-3"
      onDragOver={(e) => {
        e.preventDefault();
      }}
      onDrop={(e) => {
        e.preventDefault();
        handleFile(e.dataTransfer.files?.[0] || null);
      }}
    >
      <Image
        src={preview}
        alt="Profilová fotka"
        width={112}
        height={112}
        unoptimized
        className="w-28 h-28 mx-auto rounded-full object-cover mb-1"
      />
      <input
        ref={inputRef}
        type="file"
        name={name}
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0] || null)}
      />
      <div className="flex items-center justify-center gap-2">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => inputRef.current?.click()}
        >
          Vybrat soubor
        </button>
        <span className="text-xs muted">nebo přetáhni soubor sem</span>
      </div>
    </div>
  );
}
