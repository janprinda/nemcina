'use client';

import Link from 'next/link';

interface QuickAccessLink {
  title: string;
  description: string;
  icon: string;
  href: string;
  color: string;
}

const quickLinks: QuickAccessLink[] = [
  {
    title: 'Kasino',
    description: 'Hraj minihry a vyhrávej žetony',
    icon: '🎰',
    href: '/casino',
    color: 'from-purple-600 to-pink-600',
  },
  {
    title: 'Obchod',
    description: 'Nakupuj vylepšení a kostýmy',
    icon: '🛒',
    href: '/shop',
    color: 'from-blue-600 to-cyan-600',
  },
  {
    title: 'AI Chat',
    description: 'Praktikuj rozhovory s AI',
    icon: '🤖',
    href: '/ai-chat',
    color: 'from-green-600 to-teal-600',
  },
];

export default function QuickAccess() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Rychlý přístup</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {quickLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="group bg-gray-800 rounded-lg p-4 hover:shadow-lg transition transform border border-gray-700 flex items-start gap-4"
          >
            <div className={`w-1 rounded-md mt-1 ${link.color.replace('from-', 'bg-').split(' to-')[0]}`} />
            <div className="flex-1">
              <div className="text-3xl mb-1">{link.icon}</div>
              <h3 className="font-semibold text-lg text-white">{link.title}</h3>
              <p className="text-sm text-gray-300 mt-1">{link.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
