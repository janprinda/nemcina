'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface CasinoLobbyProps {
  spendablePoints: number;
  tokens: number;
  subjectId?: string | null;
  onExchange?: (points: number) => void;
}

const games = [
  {
    id: 'word-slot',
    name: 'Word Slot Machine',
    description: 'Přiřazuj slova a vyhrávej žetony',
    image: '🎰',
    difficulty: '⭐⭐',
    minBet: 5,
  },
  {
    id: 'translation-blackjack',
    name: 'Translation Blackjack',
    description: 'Překládej slova a buď blíž 21',
    image: '🃏',
    difficulty: '⭐⭐⭐',
    minBet: 10,
  },
  {
    id: 'word-roulette',
    name: 'Word Roulette',
    description: 'Tipuj správné přeložení',
    image: '🎡',
    difficulty: '⭐',
    minBet: 3,
  },
  {
    id: 'memory-cards',
    name: 'Memory Cards',
    description: 'Najdi odpovídající dvojice slov',
    image: '🎴',
    difficulty: '⭐⭐',
    minBet: 7,
  },
  {
    id: 'rapid-fire',
    name: 'Rapid Fire',
    description: 'Překládej co nejrychleji',
    image: '⚡',
    difficulty: '⭐⭐⭐⭐',
    minBet: 15,
  },
  {
    id: 'lucky-draw',
    name: 'Lucky Draw',
    description: 'Losuj a doufej na svězu',
    image: '🎲',
    difficulty: '⭐',
    minBet: 5,
  },
];

export default function CasinoLobby({ spendablePoints, tokens, subjectId, onExchange }: CasinoLobbyProps) {
  const [exchangeAmount, setExchangeAmount] = useState(10);
  const [showExchange, setShowExchange] = useState(false);
  const [localPoints, setLocalPoints] = useState<number | null>(spendablePoints ?? null);
  const [localTokens, setLocalTokens] = useState<number | null>(tokens ?? null);

  const handleExchange = () => {
    if (exchangeAmount <= spendablePoints) {
      if (onExchange) {
        onExchange(exchangeAmount);
        setExchangeAmount(10);
        setShowExchange(false);
        return;
      }

      // Perform client-side exchange via API route and update local balances
      (async () => {
        try {
          const res = await fetch('/api/casino/exchange', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ points: exchangeAmount, subjectId }),
          });
          const data = await res.json();
          if (!res.ok) {
            console.error('Exchange failed', data);
            return;
          }
          setExchangeAmount(10);
          setShowExchange(false);
          if (typeof data.spendablePoints === 'number') setLocalPoints(data.spendablePoints);
          if (typeof data.tokens === 'number') setLocalTokens(data.tokens);
        } catch (err) {
          console.error('Exchange error', err);
        }
      })();
    }
  };

  const resultTokens = Math.floor(exchangeAmount / 10);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-black bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
          🎰 KASINO 🎰
        </h1>
        <p className="text-gray-400">Koupi si žetony v obchodě a sázej!</p>
      </div>

      {/* Economy Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-green-900 to-green-800 rounded-lg p-6 border-2 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-200">Tvoje Body</p>
                <p className="text-4xl font-bold text-white">{localPoints ?? spendablePoints}</p>
            </div>
            🪙
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-900 to-purple-800 rounded-lg p-6 border-2 border-purple-500">
          <div className="flex items-center justify-between">
              <div>
              <p className="text-sm text-purple-200">Tvoje Žetony</p>
              <p className="text-4xl font-bold text-white">{localTokens ?? tokens}</p>
            </div>
            🔥
          </div>
        </div>
      </div>

      {/* Exchange Widget */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-lg font-semibold mb-3">💱 Výměna bodů za žetony</h2>

        {!showExchange ? (
          <div className="flex items-center gap-4">
            <div>
              <p className="text-xs text-gray-300">Aktuálně k dispozici</p>
              <p className="text-2xl font-bold text-white">{localPoints ?? spendablePoints} bodů</p>
            </div>
            <div className="ml-auto">
              <button
                onClick={() => setShowExchange(true)}
                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold rounded"
              >
                Vyměnit
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-300 w-40">Kolik bodů?</label>
              <input
                type="number"
                min={10}
                step={10}
                value={exchangeAmount}
                onChange={(e) => setExchangeAmount(Math.max(0, Math.min((spendablePoints ?? 0), Number(e.target.value))))}
                className="w-36 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              />
              <div className="text-sm text-gray-300">→ <span className="font-semibold text-white">{resultTokens} žetonů</span></div>
              <div className="ml-auto text-xs text-gray-400">Poměr 10:1</div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleExchange}
                disabled={exchangeAmount > (spendablePoints ?? 0) || exchangeAmount === 0}
                className="flex-1 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 text-white font-bold py-2 rounded transition-colors"
              >
                Potvrdit
              </button>
              <button
                onClick={() => setShowExchange(false)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 rounded transition-colors"
              >
                Zpět
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Games Grid */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Dostupné Hry</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {games.map((game) => (
            <Link
              key={game.id}
              href={subjectId ? `/casino/${game.id}?subject=${subjectId}` : `/casino/${game.id}`}
              className="group bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-gray-700 rounded-lg p-6 hover:border-yellow-400 hover:shadow-2xl transition-all hover:shadow-yellow-500/30"
            >
              <div className="space-y-3">
                <div className="text-5xl text-center group-hover:scale-110 transition-transform">
                  {game.image}
                </div>
                <div>
                  <h3 className="font-bold text-lg group-hover:text-yellow-400 transition-colors">
                    {game.name}
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">{game.description}</p>
                </div>
                <div className="pt-3 border-t border-gray-700">
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <span className="text-gray-400">Obtížnost:</span>
                      <span className="ml-2 font-bold text-yellow-400">{game.difficulty}</span>
                    </div>
                    <div className="flex items-center gap-1 text-green-400 font-bold">
                      🪙
                      {game.minBet}+
                    </div>
                  </div>
                </div>
                {tokens >= game.minBet ? (
                  <button className="w-full mt-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2 rounded transition-colors">
                    Hrát
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full mt-3 bg-gray-600 text-gray-400 font-bold py-2 rounded cursor-not-allowed"
                  >
                    Nedostatek žetonů
                  </button>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 text-sm text-gray-300">
        <p className="mb-2">
          <span className="font-bold">ℹ️ Tip:</span> Žetony můžeš získat výměnou svých zbytečných bodů. Vyšší obtížnost = větší výhry!
        </p>
      </div>
    </div>
  );
}
