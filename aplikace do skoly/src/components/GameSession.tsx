'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Progress } from '@/components/ui/Progress';

interface Entry {
  id: string;
  term: string;
  translation: string;
  imageUrl?: string;
}

interface GameSessionProps {
  entries: Entry[];
  mode: 'mc' | 'write';
  title: string;
  onComplete?: (results: GameResult[]) => void;
  timerSec?: number;
}

export interface GameResult {
  entryId: string;
  userAnswer: string;
  correct: boolean;
  pointsEarned: number;
}

export default function GameSession({
  entries,
  mode,
  title,
  onComplete,
  timerSec = 30,
}: GameSessionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [results, setResults] = useState<GameResult[]>([]);
  const [isAnswered, setIsAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timerSec);
  const [gameFinished, setGameFinished] = useState(false);

  const currentEntry = entries[currentIndex];
  const progress = ((currentIndex + 1) / entries.length) * 100;

  // Generate MC options
  const generateOptions = () => {
    const options = [currentEntry.translation];
    const otherEntries = entries.filter((_, i) => i !== currentIndex).sort(() => Math.random() - 0.5).slice(0, 3);
    options.push(...otherEntries.map((e) => e.translation));
    return options.sort(() => Math.random() - 0.5);
  };

  const checkAnswer = (answer: string): boolean => {
    return answer.toLowerCase().trim() === currentEntry.translation.toLowerCase().trim();
  };

  const handleAnswer = (answer: string) => {
    if (isAnswered) return;

    const isCorrect = checkAnswer(answer);
    const pointsEarned = isCorrect ? 10 : 0;

    setUserAnswer(answer);
    setFeedback(isCorrect ? 'correct' : 'incorrect');
    setIsAnswered(true);

    const newResult: GameResult = {
      entryId: currentEntry.id,
      userAnswer: answer,
      correct: isCorrect,
      pointsEarned,
    };

    setResults([...results, newResult]);

    setTimeout(() => {
      if (currentIndex < entries.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setUserAnswer('');
        setFeedback(null);
        setIsAnswered(false);
        setTimeLeft(timerSec);
      } else {
        setGameFinished(true);
        onComplete?.([...results, newResult]);
      }
    }, 1500);
  };

  const handleSkip = useCallback(() => {
    if (!isAnswered) {
      const newResult: GameResult = {
        entryId: currentEntry.id,
        userAnswer: '',
        correct: false,
        pointsEarned: 0,
      };
      setResults(prev => [...prev, newResult]);
    }

    if (currentIndex < entries.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setUserAnswer('');
      setFeedback(null);
      setIsAnswered(false);
      setTimeLeft(timerSec);
    } else {
      setGameFinished(true);
      onComplete?.(results);
    }
  }, [isAnswered, currentEntry, currentIndex, entries.length, timerSec, onComplete, results]);

  // Timer effect
  useEffect(() => {
    if (gameFinished || isAnswered) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSkip();
          return timerSec;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isAnswered, gameFinished, timerSec, handleSkip]);

  if (!currentEntry || gameFinished) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold mb-4">Hra Skončila!</h2>
        <p className="text-gray-400 mb-6">
          Správných odpovědí: {results.filter((r) => r.correct).length} / {results.length}
        </p>
        <div className="space-y-2">
          {results.map((result, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-gray-300">
              {result.correct ? (
                <span className="text-green-500">✓</span>
              ) : (
                <span className="text-red-500">✗</span>
              )}
              <span>{result.userAnswer || '(přeskočeno)'}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const options = mode === 'mc' ? generateOptions() : [];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">{title}</h2>
        <div className="flex items-center justify-between text-sm text-gray-400">
          <span>
            Otázka {currentIndex + 1} / {entries.length}
          </span>
          <span className="text-lg font-bold text-yellow-400">{timeLeft}s</span>
        </div>
      </div>

      {/* Progress Bar */}
      <Progress value={progress} />

      {/* Question Card */}
      <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-lg p-8 border-2 border-blue-500 space-y-6">
        {/* Word Display */}
        <div className="text-center space-y-4">
          {currentEntry.imageUrl && (
            <Image src={currentEntry.imageUrl} alt={currentEntry.term} width={128} height={128} className="mx-auto rounded" />
          )}
          <div className="space-y-1">
            <p className="text-sm text-blue-200">Přelož slovo:</p>
            <p className="text-4xl font-bold">{currentEntry.term}</p>
          </div>
        </div>

        {/* Feedback Animation */}
        {feedback && (
          <div
            className={`py-2 rounded font-bold text-center text-lg animate-in ${
              feedback === 'correct'
                ? 'bg-green-500 text-white'
                : 'bg-red-500 text-white'
            }`}
          >
            {feedback === 'correct' ? '✓ Správně!' : '✗ Špatně!'}
          </div>
        )}

        {/* Answer Input (Write Mode) */}
        {mode === 'write' && !isAnswered && (
          <div className="space-y-3">
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAnswer(userAnswer)}
              placeholder="Napiš překlad..."
              autoFocus
              className="w-full bg-gray-700 border-2 border-gray-600 rounded px-4 py-3 text-white focus:outline-none focus:border-yellow-400"
            />
            <button
              onClick={() => handleAnswer(userAnswer)}
              disabled={!userAnswer.trim()}
              className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:bg-gray-600 text-black disabled:text-gray-400 font-bold py-3 rounded transition-colors flex items-center justify-center gap-2"
            >
              Potvrdit →
            </button>
          </div>
        )}

        {/* Multiple Choice (MC Mode) */}
        {mode === 'mc' && !isAnswered && (
          <div className="grid gap-3">
            {options.map((option, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(option)}
                className="bg-gray-700 hover:bg-gray-600 border-2 border-gray-600 hover:border-yellow-400 text-white font-bold py-3 px-4 rounded transition-all text-left"
              >
                {option}
              </button>
            ))}
          </div>
        )}

        {/* Skip Button */}
        {!isAnswered && (
          <button
            onClick={handleSkip}
            className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 rounded transition-colors text-sm"
          >
            Přeskočit
          </button>
        )}

        {/* Show Answer After Feedback */}
        {isAnswered && (
          <div className="bg-gray-700 rounded p-4">
            <p className="text-sm text-gray-300 mb-1">Správná odpověď:</p>
            <p className="text-xl font-bold text-yellow-400">{currentEntry.translation}</p>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 text-sm text-center">
        <div className="bg-gray-800 rounded p-2">
          <p className="text-gray-400">Správně</p>
          <p className="text-xl font-bold text-green-400">
            {results.filter((r) => r.correct).length}
          </p>
        </div>
        <div className="bg-gray-800 rounded p-2">
          <p className="text-gray-400">Špatně</p>
          <p className="text-xl font-bold text-red-400">
            {results.filter((r) => !r.correct).length}
          </p>
        </div>
        <div className="bg-gray-800 rounded p-2">
          <p className="text-gray-400">Body</p>
          <p className="text-xl font-bold text-yellow-400">
            {results.reduce((sum, r) => sum + r.pointsEarned, 0)}
          </p>
        </div>
      </div>
    </div>
  );
}
