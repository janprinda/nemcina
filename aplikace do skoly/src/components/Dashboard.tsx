'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Progress } from '@/components/ui/Progress';

interface Subject {
  id: string;
  slug: string;
  title: string;
}

interface UserProgress {
  totalPoints: number;
  spendablePoints: number;
  tokens: number;
  currentRankId?: string;
}

interface Lesson {
  id: string;
  title: string;
  description?: string | null;
  published?: boolean;
}

interface DashboardProps {
  user: {
    name?: string;
    avatarUrl?: string;
  };
  subjects: Subject[];
  currentSubject: Subject;
  progress: UserProgress;
  lessons: Lesson[];
  streakDays: number;
}

export default function Dashboard({
  user,
  subjects,
  currentSubject,
  progress,
  lessons,
  streakDays,
}: DashboardProps) {
  const [selectedSubject, setSelectedSubject] = useState(currentSubject);
  const [animateStreak, setAnimateStreak] = useState(false);

  useEffect(() => {
    setAnimateStreak(true);
    const timeout = setTimeout(() => setAnimateStreak(false), 600);
    return () => clearTimeout(timeout);
  }, [streakDays]);

  const completedLessons = lessons.filter((l) => l.published).length;
  const progressPercent = completedLessons > 0 ? (completedLessons / lessons.length) * 100 : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {user.avatarUrl ? (
            <Image
              src={user.avatarUrl}
              alt={user.name || 'avatar'}
              width={48}
              height={48}
              className="rounded-full border-2 border-yellow-500"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold">Vítej, {user.name}!</h1>
            <p className="text-sm text-gray-400">Pokračuj v učení</p>
          </div>
        </div>

        {/* Streak Display */}
        <div
          className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg font-bold text-white transition-transform ${
            animateStreak ? 'scale-110' : 'scale-100'
          }`}
        >
          🔥
          <span>{streakDays}</span>
          <span className="text-xs">dní</span>
        </div>
      </div>

      {/* Subject Switcher */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <label className="block text-sm font-medium mb-2">Vybrat předmět</label>
        <select
          value={selectedSubject.slug}
          onChange={(e) => {
            const subject = subjects.find((s) => s.slug === e.target.value);
            if (subject) setSelectedSubject(subject);
          }}
          className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
        >
          {subjects.map((s) => (
            <option key={s.id} value={s.slug}>
              {s.title}
            </option>
          ))}
        </select>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Points */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg p-6 border border-blue-400">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-200 mb-1">Rank Progress</p>
              <p className="text-3xl font-bold text-white">{progress.totalPoints}</p>
            </div>
            ⚡
          </div>
          <div className="mt-3">
            <Progress value={Math.min(100, (progress.totalPoints / 1000) * 100)} />
          </div>
        </div>

        {/* Spendable Points */}
        <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-lg p-6 border border-green-400">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-200 mb-1">Wallet</p>
              <p className="text-3xl font-bold text-white">{progress.spendablePoints}</p>
            </div>
            🪙
          </div>
          <p className="text-xs text-green-200 mt-2">Použitelné body</p>
        </div>

        {/* Tokens */}
        <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg p-6 border border-purple-400">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-200 mb-1">Casino Chips</p>
              <p className="text-3xl font-bold text-white">{progress.tokens}</p>
            </div>
            🔥
          </div>
          <p className="text-xs text-purple-200 mt-2">Žetony v kasinu</p>
        </div>
      </div>

      {/* Lesson Path */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Tvoje Lekce</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lessons.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-400">
              Zatím zde nejsou žádné lekce.
            </div>
          ) : (
            lessons.map((lesson, index) => (
              <div
                key={lesson.id}
                className={`rounded-lg p-4 border-2 transition-all hover:shadow-lg ${
                  lesson.published
                    ? 'bg-gray-800 border-gray-600 hover:border-yellow-400'
                    : 'bg-gray-900 border-gray-700 opacity-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold text-white">{lesson.title}</span>
                      {!lesson.published && <span className="text-gray-500">🔒</span>}
                    </div>
                    <p className="text-sm text-gray-400 mt-1">{lesson.description}</p>
                  </div>
                  <div className="flex gap-1 ml-2">
                    {[...Array(3)].map((_, i) => (
                      <span
                        key={i}
                        className={`text-lg ${
                          i < (Math.random() > 0.5 ? 2 : 1) ? '' : 'opacity-30'
                        }`}
                      >
                        ⭐
                      </span>
                    ))}
                  </div>
                </div>
                {lesson.published && (
                  <Link
                    href={`/quiz/${lesson.id}`}
                    className="mt-3 block text-center bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 rounded transition-colors"
                  >
                    Začít
                  </Link>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/casino"
          className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-6 hover:shadow-lg transition-all border border-purple-400"
        >
          <h3 className="text-xl font-bold mb-2">Kasino 🎰</h3>
          <p className="text-sm text-purple-100">Hraj mini hry a vyhrávej žetony</p>
        </Link>
        <Link
          href="/shop"
          className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg p-6 hover:shadow-lg transition-all border border-blue-400"
        >
          <h3 className="text-xl font-bold mb-2">Obchod 🛒</h3>
          <p className="text-sm text-blue-100">Nakupuj vylepšení a kostýmy</p>
        </Link>
        <Link
          href="/ai-chat"
          className="bg-gradient-to-r from-green-600 to-teal-600 rounded-lg p-6 hover:shadow-lg transition-all border border-green-400"
        >
          <h3 className="text-xl font-bold mb-2">AI Chat 🤖</h3>
          <p className="text-sm text-green-100">Praktikuj rozhovory s AI</p>
        </Link>
      </div>
    </div>
  );
}
