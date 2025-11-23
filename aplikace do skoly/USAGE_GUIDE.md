# Component Usage Guide

## How to Use Each New Component

### 1. Dashboard Component

**File**: `src/components/Dashboard.tsx`

```tsx
import Dashboard from '@/components/Dashboard';

export default function MyPage() {
  return (
    <Dashboard
      user={{
        name: "John Student",
        avatarUrl: "https://example.com/avatar.jpg"
      }}
      subjects={[
        { id: '1', slug: 'nemcina', title: 'Němčina' },
        { id: '2', slug: 'anglictina', title: 'Angličtina' }
      ]}
      currentSubject={{ id: '1', slug: 'nemcina', title: 'Němčina' }}
      progress={{
        totalPoints: 1250,
        spendablePoints: 500,
        tokens: 50
      }}
      lessons={[
        {
          id: 'lesson-1',
          title: 'Greetings',
          description: 'Learn basic greetings',
          published: true
        }
      ]}
      streakDays={7}
    />
  );
}
```

### 2. Casino Lobby Component

**File**: `src/components/CasinoLobby.tsx`

```tsx
import CasinoLobby from '@/components/CasinoLobby';

export default function CasinoPage() {
  const handleExchange = (points: number) => {
    // Call API to exchange points
    console.log(`Exchanging ${points} points for tokens`);
    // TODO: Call server action
  };

  return (
    <CasinoLobby
      spendablePoints={500}
      tokens={50}
      onExchange={handleExchange}
    />
  );
}
```

### 3. Shop Component

**File**: `src/components/Shop.tsx`

```tsx
import Shop from '@/components/Shop';

export default function ShopPage() {
  const items = [
    {
      id: 'item-1',
      name: 'Double XP Booster',
      type: 'BOOSTER',
      pricePoints: 100,
      description: 'Double your XP for 30 minutes',
      imageUrl: 'https://example.com/booster.png'
    }
  ];

  const handlePurchase = (itemId: string, useTokens: boolean) => {
    console.log(`Purchased ${itemId} with ${useTokens ? 'tokens' : 'points'}`);
    // TODO: Call server action
  };

  return (
    <Shop
      items={items}
      spendablePoints={500}
      tokens={50}
      inventory={[]}
      onPurchase={handlePurchase}
    />
  );
}
```

### 4. GameSession Component

**File**: `src/components/GameSession.tsx`

```tsx
'use client';

import GameSession from '@/components/GameSession';

export default function QuizPage() {
  const entries = [
    {
      id: 'entry-1',
      term: 'Guten Morgen',
      translation: 'Good morning',
      imageUrl: 'https://example.com/morning.jpg'
    },
    {
      id: 'entry-2',
      term: 'Danke',
      translation: 'Thank you'
    }
  ];

  const handleComplete = (results) => {
    console.log('Quiz completed:', results);
    // Results format:
    // [
    //   {
    //     entryId: 'entry-1',
    //     userAnswer: 'Good morning',
    //     correct: true,
    //     pointsEarned: 10
    //   }
    // ]
  };

  return (
    <GameSession
      entries={entries}
      mode="mc" // or "write"
      title="German Basics"
      timerSec={30}
      onComplete={handleComplete}
    />
  );
}
```

### 5. AI Chat Component

**File**: `src/components/AIChat.tsx`

```tsx
'use client';

import AIChat from '@/components/AIChat';

export default function ChatPage() {
  const characters = [
    {
      id: 'hans',
      name: 'Hans the Baker',
      description: 'A friendly baker from Berlin',
      language: 'de',
      avatarUrl: 'https://example.com/hans.jpg'
    }
  ];

  const handleSendMessage = async (characterId, message) => {
    // Call your AI API here
    const response = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ characterId, message })
    });
    const data = await response.json();
    return data.reply;
  };

  return (
    <AIChat
      characters={characters}
      onSendMessage={handleSendMessage}
    />
  );
}
```

## Using the Zustand Store

**File**: `src/lib/store.ts`

```tsx
import { useUserStore } from '@/lib/store';

export default function MyComponent() {
  const { 
    userId, 
    selectedSubject, 
    spendablePoints, 
    tokens 
  } = useUserStore();

  const { 
    setUserData, 
    exchangePointsToTokens, 
    setSelectedSubject 
  } = useUserStore();

  // Update user data
  const handleLogin = (user) => {
    setUserData({
      userId: user.id,
      userName: user.name,
      avatarUrl: user.avatar,
      globalStreakDays: user.streak
    });
  };

  // Exchange points for tokens
  const handleExchange = () => {
    exchangePointsToTokens(100); // 100 points → 10 tokens
  };

  // Switch subject
  const handleSubjectChange = () => {
    setSelectedSubject('anglictina', 'anglictina');
  };

  return (
    <div>
      <p>User: {userName}</p>
      <p>Points: {spendablePoints}</p>
      <p>Tokens: {tokens}</p>
    </div>
  );
}
```

## Using UI Components

### Progress Bar

```tsx
import { Progress } from '@/components/ui/Progress';

export default function ProgressExample() {
  const [value, setValue] = useState(50);

  return (
    <div className="space-y-4">
      <Progress value={value} />
      <input 
        type="range" 
        value={value} 
        onChange={(e) => setValue(Number(e.target.value))}
      />
    </div>
  );
}
```

### Dialog Modal

```tsx
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/Dialog';

export default function DialogExample() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button>Open Dialog</button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Example Dialog</DialogTitle>
          <DialogDescription>
            This is an example dialog description
          </DialogDescription>
        </DialogHeader>
        <div>
          {/* Your content here */}
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

### Card

```tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';

export default function CardExample() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card description goes here</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Your content here */}
      </CardContent>
    </Card>
  );
}
```

## Server Actions for Backend Integration

### Exchange Points to Tokens

```tsx
// app/actions/exchange.ts
'use server';

export async function exchangePointsAction(userId: string, points: number) {
  // TODO: Validate user has enough points
  // TODO: Update UserSubjectProgress
  // TODO: Calculate tokens (10 points = 1 token)
  // TODO: Return success/error
}
```

### Purchase Shop Item

```tsx
// app/actions/shop.ts
'use server';

export async function purchaseItemAction(
  userId: string,
  itemId: string,
  useTokens: boolean
) {
  // TODO: Validate user has enough currency
  // TODO: Deduct from spendablePoints or tokens
  // TODO: Add to UserInventory
  // TODO: Return success/error
}
```

### Save Game Results

```tsx
// app/actions/game.ts
'use server';

export async function saveGameResultsAction(
  userId: string,
  lessonId: string,
  results: GameResult[]
) {
  // TODO: Calculate total points
  // TODO: Create Attempt records
  // TODO: Update UserSubjectProgress
  // TODO: Return points earned
}
```

## Styling & Customization

### Tailwind Classes Used

- **Gradients**: `bg-gradient-to-br`, `from-*-600`, `to-*-800`
- **Borders**: `border-2`, `border-*-400`, `rounded-lg`
- **Spacing**: `p-6`, `gap-4`, `space-y-4`
- **Responsive**: `grid-cols-1`, `md:grid-cols-2`, `lg:grid-cols-3`
- **Effects**: `shadow-lg`, `hover:shadow-2xl`, `transition-all`

### Color Scheme

- **Primary**: Yellow/Gold (#EAB308) - Actions, highlights
- **Success**: Green (#22C55E) - Correct answers, wallet
- **Error**: Red (#EF4444) - Wrong answers
- **Info**: Blue (#3B82F6) - Progress, information
- **Secondary**: Purple (#A855F7) - Casino, premium
- **Background**: Gray (#111827) - Dark background
- **Cards**: Gray (#1F2937) - Card backgrounds

## Common Patterns

### Fetching Data for Components

```tsx
// Server component
import Dashboard from '@/components/Dashboard';

export default async function DashboardPage() {
  const user = await getUserById(userId);
  const subjects = await listSubjects();
  const lessons = await getLessons();

  return (
    <Dashboard
      user={user}
      subjects={subjects}
      lessons={lessons}
      // ... other props
    />
  );
}
```

### Client Component with State

```tsx
'use client';

import { useState } from 'react';
import CasinoLobby from '@/components/CasinoLobby';

export default function CasinoPage() {
  const [points, setPoints] = useState(500);
  const [tokens, setTokens] = useState(50);

  const handleExchange = async (amount) => {
    const response = await fetch('/api/exchange', {
      method: 'POST',
      body: JSON.stringify({ points: amount })
    });
    // Update local state
  };

  return <CasinoLobby onExchange={handleExchange} {...} />;
}
```

---

For more detailed examples, refer to the actual component files and the included page implementations.
