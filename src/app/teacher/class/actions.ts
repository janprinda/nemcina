import { db } from "@/server/db";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const gameRouter = createTRPCRouter({
  start: protectedProcedure
    .input(
      z.object({
        lessonId: z.string(),
        mode: z.enum(["mc", "write"]),
        timerSec: z.number().min(5).max(120).nullish(),
      })
    )
    .mutation(async ({ input }) => {
      const { lessonId, mode, timerSec } = input;

      // Vytvoření nové herní session v databázi
      const gameSession = await db.gameSession.create({
        data: {
          lessonId,
          mode,
          timerSec,
          // Další potřebná pole...
        },
      });

      return gameSession;
    }),

  nextQuestion: protectedProcedure
    .input(z.string())
    .mutation(async ({ input: gameId }) => {
      // TODO: Logika pro posunutí na další otázku
    }),

  end: protectedProcedure
    .input(z.string())
    .mutation(async ({ input: gameId }) => {
      // TODO: Logika pro ukončení hry a vyhodnocení výsledků
    }),

  submitAnswer: protectedProcedure
    .input(
      z.object({
        gameId: z.string(),
        userId: z.string(),
        questionIdx: z.number(),
        answer: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { gameId, userId, questionIdx, answer } = input;

      // TODO: Uložení odpovědi a výpočet skóre
    }),
});

export async function startGameAction(formData: FormData) {
  "use server";
  const lessonId = String(formData.get("lessonId"));
  const mode = String(formData.get("mode")) as "mc" | "write";
  const timerSec = Number(formData.get("timerSec") || 30);

  // TODO: Vytvořit game session v DB
  const gameId = `game_${Date.now()}`;
  return gameId;
}

export async function nextQuestionAction(gameId: string) {
  "use server";
  // TODO: Posunout na další otázku
}

export async function endGameAction(gameId: string) {
  "use server";
  // TODO: Ukončit hru a přesunout na results
}