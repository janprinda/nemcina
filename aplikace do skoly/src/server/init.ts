import { upsertAdmin, getLessons, createLesson, addEntry } from "@/server/store";
import bcrypt from "bcrypt";

let initialized = false;

export async function ensureSeed() {
  if (initialized) return;
  initialized = true;
  const hash = await bcrypt.hash("admin123", 10);
  await upsertAdmin("admin@example.com", "Admin", hash);
  const lessons = await getLessons();
  if (lessons.length === 0) {
    const l = await createLesson({ title: "Pozdravy a základy", description: "Základní fráze" });
    await addEntry(l.id, { term: "Guten Tag", translation: "Dobrý den", type: "PHRASE" });
    await addEntry(l.id, { term: "Bitte", translation: "Prosím", type: "WORD" });
    await addEntry(l.id, { term: "Danke", translation: "Děkuji", type: "WORD" });
  }
}
