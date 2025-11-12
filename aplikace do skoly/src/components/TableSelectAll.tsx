"use client";
import { useEffect, useState } from "react";

export default function TableSelectAll() {
  const [checked, setChecked] = useState(false);
  useEffect(() => {
    const boxes = document.querySelectorAll<HTMLInputElement>('input[name="ids"]');
    boxes.forEach(b => (b.checked = checked));
  }, [checked]);
  return (
    <input
      type="checkbox"
      aria-label="Vybrat vše"
      checked={checked}
      onChange={(e) => setChecked(e.target.checked)}
    />
  );
}

