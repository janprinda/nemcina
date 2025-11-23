'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/Dialog';

interface ShopItem {
  id: string;
  name: string;
  description?: string;
  type: 'BOOSTER' | 'STREAK_FREEZE' | 'STICKER' | 'CHEST' | 'TOKEN_PACK';
  pricePoints?: number;
  priceTokens?: number;
  imageUrl?: string;
  config?: any;
}

interface UserInventory {
  itemId: string;
  quantity: number;
}

interface ShopProps {
  items: ShopItem[];
  spendablePoints: number;
  tokens: number;
  inventory: UserInventory[];
  onPurchase?: (itemId: string, useTokens: boolean) => void;
  subjectId?: string | null;
}

const categoryIcons: Record<string, string> = {
  BOOSTER: '⚡',
  STREAK_FREEZE: '❄️',
  STICKER: '✨',
  CHEST: '🎁',
  TOKEN_PACK: '🎰',
};

const categoryLabels: Record<string, string> = {
  BOOSTER: 'Vylepšení',
  STREAK_FREEZE: 'Ochrana Série',
  STICKER: 'Kosmetika',
  CHEST: 'Truhly',
  TOKEN_PACK: 'Sady Žetonů',
};

export default function Shop({ items, spendablePoints, tokens, inventory, onPurchase, subjectId }: ShopProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('BOOSTER');
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [purchaseError, setPurchaseError] = useState<string>('');
  const [localPoints, setLocalPoints] = useState<number | null>(spendablePoints ?? null);
  const [localTokens, setLocalTokens] = useState<number | null>(tokens ?? null);

  const filteredItems = items.filter((item) => item.type === selectedCategory);
  const categories = Array.from(new Set(items.map((item) => item.type)));

  const getInventoryCount = (itemId: string) => {
    return inventory.find((inv) => inv.itemId === itemId)?.quantity || 0;
  };

  const handlePurchase = (item: ShopItem, useTokens: boolean) => {
    setPurchaseError('');

    if (useTokens) {
      if (!item.priceTokens) {
        setPurchaseError('Tento předmět se nedá koupit za žetony');
        return;
      }
      if (tokens < item.priceTokens) {
        setPurchaseError('Nemáš dostatek žetonů');
        return;
      }
    } else {
      if (!item.pricePoints) {
        setPurchaseError('Tento předmět se nedá koupit za body');
        return;
      }
      if (spendablePoints < item.pricePoints) {
        setPurchaseError('Nemáš dostatek bodů');
        return;
      }
    }

    if (onPurchase) {
      onPurchase(item.id, useTokens);
      setSelectedItem(null);
    } else {
      // Call server API to perform purchase and update local balances
      (async () => {
        try {
          const res = await fetch('/api/shop/purchase', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ itemId: item.id, useTokens, subjectId }),
          });
          const data = await res.json();
          if (!res.ok) {
            setPurchaseError(data?.error || 'Chyba při nákupu');
            return;
          }
          setSelectedItem(null);
          if (typeof data.spendablePoints === 'number') setLocalPoints(data.spendablePoints);
          if (typeof data.tokens === 'number') setLocalTokens(data.tokens);
        } catch (err) {
          console.error('Purchase error', err);
          setPurchaseError('Chyba spojení při nákupu');
        }
      })();
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold">🛍️ Obchod</h1>
        <p className="text-gray-400">Nakupuj vylepšení a doplňky</p>
      </div>

      {/* Wallet Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-green-900 to-green-800 rounded-lg p-6 border-2 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-200">Tvoje Body</p>
              <p className="text-3xl font-bold text-white">{spendablePoints}</p>
            </div>
            🛒
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-900 to-purple-800 rounded-lg p-6 border-2 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-200">Tvoje Žetony</p>
              <p className="text-3xl font-bold text-white">{tokens}</p>
            </div>
            ✨
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Kategorie</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`p-4 rounded-lg font-bold transition-all text-center ${
                selectedCategory === category
                  ? 'bg-yellow-500 text-black shadow-lg'
                  : 'bg-gray-800 text-white border border-gray-700 hover:border-yellow-400'
              }`}
            >
              <div className="text-2xl mb-1">{categoryIcons[category]}</div>
              <div className="text-xs">{categoryLabels[category]}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Items Grid */}
      <div>
        <h3 className="text-xl font-bold mb-4">{categoryLabels[selectedCategory]}</h3>
        {filteredItems.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            V této kategorii nejsou žádné předměty.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => (
              <Dialog key={item.id}>
                <DialogTrigger asChild>
                  <div className="bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-gray-700 rounded-lg p-6 hover:border-yellow-400 transition-all cursor-pointer hover:shadow-lg hover:shadow-yellow-500/20">
                    <div className="space-y-3">
                      {item.imageUrl ? (
                        <Image src={item.imageUrl} alt={item.name} width={256} height={128} className="object-cover rounded" />
                      ) : (
                        <div className="w-full h-32 bg-gradient-to-br from-purple-600 to-pink-600 rounded flex items-center justify-center text-4xl">
                          {categoryIcons[item.type]}
                        </div>
                      )}

                      <h3 className="font-bold text-lg">{item.name}</h3>
                      <p className="text-sm text-gray-400">{item.description}</p>

                      {/* Pricing */}
                      <div className="pt-3 border-t border-gray-700 space-y-2">
                        {item.pricePoints && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-green-400">Cena:</span>
                            <span className="font-bold">{item.pricePoints} 🟢</span>
                          </div>
                        )}
                        {item.priceTokens && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-purple-400">Cena:</span>
                            <span className="font-bold">{item.priceTokens} 🎰</span>
                          </div>
                        )}
                      </div>

                      {/* Ownership indicator */}
                      {getInventoryCount(item.id) > 0 && (
                        <div className="text-xs bg-blue-900 border border-blue-500 rounded px-2 py-1 text-blue-200">
                          Vlastníš: {getInventoryCount(item.id)}x
                        </div>
                      )}
                    </div>
                  </div>
                </DialogTrigger>

                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{item.name}</DialogTitle>
                    <DialogDescription>{item.description}</DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    {item.imageUrl && (
                      <Image src={item.imageUrl} alt={item.name} width={256} height={192} className="object-cover rounded" />
                    )}

                    {item.config && (
                      <div className="bg-gray-800 rounded p-3">
                        <p className="text-sm text-gray-300">
                          {JSON.stringify(item.config, null, 2)}
                        </p>
                      </div>
                    )}

                    {purchaseError && (
                      <div className="bg-red-900 border border-red-500 rounded p-3 text-red-200 text-sm">
                        {purchaseError}
                      </div>
                    )}

                    <div className="flex gap-2">
                      {item.pricePoints && (
                        <button
                          onClick={() => handlePurchase(item, false)}
                          className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded transition-colors"
                        >
                          Koupit za {item.pricePoints} 🟢
                        </button>
                      )}
                      {item.priceTokens && (
                        <button
                          onClick={() => handlePurchase(item, true)}
                          className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded transition-colors"
                        >
                          Koupit za {item.priceTokens} 🎰
                        </button>
                      )}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
