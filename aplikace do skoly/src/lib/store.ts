import { create } from 'zustand';

interface UserState {
  // User Data
  userId: string | null;
  userName: string | null;
  avatarUrl: string | null;
  globalStreakDays: number;
  
  // Subject Economy
  selectedSubject: string; // e.g., "nemcina"
  subjectSlug: string;
  totalPoints: number;
  spendablePoints: number;
  tokens: number;
  
  // Actions
  setUserData: (data: Partial<Omit<UserState, 'setUserData' | 'setSelectedSubject' | 'updateEconomy' | 'addPoints' | 'resetStore'>>) => void;
  setSelectedSubject: (subject: string, slug: string) => void;
  updateEconomy: (totalPoints: number, spendablePoints: number, tokens: number) => void;
  addPoints: (amount: number) => void;
  spendPoints: (amount: number) => void;
  exchangePointsToTokens: (points: number) => void;
  resetStore: () => void;
}

const initialState = {
  userId: null,
  userName: null,
  avatarUrl: null,
  globalStreakDays: 0,
  selectedSubject: 'nemcina',
  subjectSlug: 'nemcina',
  totalPoints: 0,
  spendablePoints: 0,
  tokens: 0,
};

export const useUserStore = create<UserState>((set) => ({
  ...initialState,
  
  setUserData: (data) => set((state) => ({ ...state, ...data })),
  
  setSelectedSubject: (subject: string, slug: string) => 
    set(() => ({ selectedSubject: subject, subjectSlug: slug })),
  
  updateEconomy: (totalPoints: number, spendablePoints: number, tokens: number) =>
    set(() => ({ totalPoints, spendablePoints, tokens })),
  
  addPoints: (amount: number) =>
    set((state) => ({
      totalPoints: state.totalPoints + amount,
      spendablePoints: state.spendablePoints + amount,
    })),
  
  spendPoints: (amount: number) =>
    set((state) => ({
      spendablePoints: Math.max(0, state.spendablePoints - amount),
    })),
  
  exchangePointsToTokens: (points: number) =>
    set((state) => ({
      spendablePoints: Math.max(0, state.spendablePoints - points),
      tokens: state.tokens + Math.floor(points / 10), // 10 points = 1 token
    })),
  
  resetStore: () => set(() => initialState),
}));
