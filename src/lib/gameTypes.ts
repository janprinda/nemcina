export type GameMode = "mc" | "write";
export type GameStatus = "setup" | "running" | "results";

export interface GameSession {
  id: string;
  classId: string;
  lessonId: string;
  mode: GameMode;
  timerSec: number;
  status: GameStatus;
  currentQuestionIdx: number;
  startedAt: Date;
  createdAt: Date;
}

export interface GameParticipant {
  userId: string;
  displayName: string;
  score: number;
  answeredCount: number;
}

export interface GameAnswer {
  userId: string;
  questionIdx: number;
  answer: string;
  isCorrect: boolean;
}
