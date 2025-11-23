"use client";

import React, { useState } from 'react';

export default function WordSlot() {
  const [bet, setBet] = useState(5);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [reels, setReels] = useState<string[]>([]);

  const play = async () => {
    setLoading(true);
    setMessage(null);
    try {
      // include subjectId from query if present so server uses correct progress record
      const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
      const subjectId = params?.get('subject');
      const res = await fetch('/api/casino/slot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ betTokens: bet, subjectId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data?.error || 'Chyba hry');
      } else {
        const r = data.result;
        setReels(r.reels);
        if (r.won) setMessage(`Vyhrál(a) jsi ${r.payout} žetonů!`);
        else setMessage('Bohužel, prohrál(a) jsi.');
      }
    } catch (err) {
      console.error(err);
      setMessage('Chyba spojení');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Word Slot Machine</h1>
        <p className="text-gray-400">Sázej žetony a zkus štěstí</p>
      </div>

      <div className="max-w-xl mx-auto">
        <div className="bg-gray-800 rounded-lg p-6 text-center">
          <div className="text-6xl mb-4">{reels.length ? reels.join(' ') : '🎰 🎰 🎰'}</div>
          <div className="flex items-center gap-2 justify-center mb-4">
            <input type="number" value={bet} min={1} onChange={(e) => setBet(Math.max(1, Number(e.target.value)))} className="w-24 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white" />
            <button onClick={play} disabled={loading} className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-4 py-2 rounded">{loading ? '...' : 'Hrát'}</button>
          </div>
          {message && <div className="text-sm text-gray-200">{message}</div>}
        </div>
      </div>
    </div>
  );
}
