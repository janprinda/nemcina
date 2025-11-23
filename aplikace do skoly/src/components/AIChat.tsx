'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

interface AICharacter {
  id: string;
  name: string;
  description?: string;
  avatarUrl?: string;
  language: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
}

interface AIChatProps {
  characters: AICharacter[];
  onSendMessage?: (characterId: string, message: string) => Promise<string>;
}

export default function AIChat({ characters, onSendMessage }: AIChatProps) {
  const [selectedCharacter, setSelectedCharacter] = useState<AICharacter | null>(
    characters.length > 0 ? characters[0] : null
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !selectedCharacter || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      let assistantResponse = '';
      if (onSendMessage) {
        assistantResponse = await onSendMessage(selectedCharacter.id, inputValue);
      } else {
        // Call local API route for AI responses (client-side)
        try {
          const res = await fetch('/api/ai/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ characterId: selectedCharacter.id, message: inputValue }),
          });
          const data = await res.json();
          assistantResponse = data?.response ?? `Odpověď na: "${inputValue}"`;
        } catch (err) {
          console.error('AI API error', err);
          assistantResponse = `Odpověď na: "${inputValue}"`;
        }
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: assistantResponse,
        createdAt: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Character List */}
      <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h2 className="font-bold text-lg text-white flex items-center gap-2">
            💬
            AI Postavy
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          {characters.length === 0 ? (
            <div className="p-4 text-center text-gray-400 text-sm">
              Žádné postavy nejsou dostupné
            </div>
          ) : (
            characters.map((character) => (
              <button
                key={character.id}
                onClick={() => {
                  setSelectedCharacter(character);
                  setMessages([]);
                }}
                className={`w-full text-left p-4 border-b border-gray-700 transition-colors ${
                  selectedCharacter?.id === character.id
                    ? 'bg-yellow-500/20 border-l-4 border-l-yellow-500'
                    : 'hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  {character.avatarUrl ? (
                    <Image
                      src={character.avatarUrl}
                      alt={character.name}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                      {character.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate">{character.name}</p>
                    <p className="text-xs text-gray-400">
                      🌍 {character.language === 'de' ? 'Němčina' : 'Angličtina'}
                    </p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedCharacter ? (
          <>
            {/* Header */}
            <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center gap-3">
              {selectedCharacter.avatarUrl ? (
                <Image
                  src={selectedCharacter.avatarUrl}
                  alt={selectedCharacter.name}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                  {selectedCharacter.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <p className="font-bold text-white">{selectedCharacter.name}</p>
                <p className="text-xs text-gray-400">{selectedCharacter.description}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-center text-gray-400">
                  <div>
                    <p className="text-lg font-semibold mb-2">Začni rozhovor s {selectedCharacter.name}</p>
                    <p className="text-sm">
                      Piš ve {selectedCharacter.language === 'de' ? 'německém' : 'anglickém'} jazyce
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
                        {selectedCharacter.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-100'
                      }`}
                    >
                      <p className="text-sm break-words">{message.content}</p>
                      <p className="text-xs mt-1 opacity-60">
                        {message.createdAt.toLocaleTimeString('cs-CZ', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    {message.role === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
                        U
                      </div>
                    )}
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">
                      {selectedCharacter.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="bg-gray-800 border-t border-gray-700 p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Napiš svou zprávu..."
                  disabled={isLoading}
                  className="flex-1 bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-yellow-400 disabled:opacity-50"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className="bg-yellow-500 hover:bg-yellow-400 disabled:bg-gray-600 text-black disabled:text-gray-400 font-bold px-4 py-2 rounded transition-colors flex items-center gap-2"
                >
                  ➤
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Vyberi si postavu ze seznamu vlevo
          </div>
        )}
      </div>
    </div>
  );
}
