import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const MATCHING_STRATEGY: "keyword" | "ai" = "keyword";

const STOPWORDS = new Set([
  "the", "is", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
  "of", "with", "are", "was", "were", "i", "we", "my", "our", "years",
  "year", "work", "working", "experience", "background",
]);

function extractKeywords(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter((word) => word.length > 2 && !STOPWORDS.has(word))
  );
}

function keywordScore(a: string, b: string): number {
  const wordsA = extractKeywords(a);
  const wordsB = extractKeywords(b);
  let shared = 0;
  for (const word of wordsA) {
    if (wordsB.has(word)) shared++;
  }
  return shared;
}

async function aiScore(a: string, b: string, openai: OpenAI): Promise<number> {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You compare two professional descriptions and return ONLY a number from 0 to 100 representing how likely these two people would have an interesting professional connection. Return only the number.",
      },
      { role: "user", content: `Person A: ${a}\n\nPerson B: ${b}` },
    ],
  });
  return parseInt(completion.choices[0]?.message?.content?.trim() ?? "0", 10);
}

export async function POST() {
  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return NextResponse.json({ matched: false, reason: "not_logged_in" });
  }
  const myId = userData.user.id;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const { data: todaysConnects } = await admin
    .from("connects")
    .select("id")
    .or(`user_a.eq.${myId},user_b.eq.${myId}`)
    .gte("created_at", todayStart.toISOString());

  if ((todaysConnects?.length ?? 0) >= 2) {
    return NextResponse.json({ matched: false, reason: "daily_limit_reached" });
  }

  const { data: myProfile } = await admin
    .from("profiles")
    .select("description")
    .eq("id", myId)
    .single();

  if (!myProfile?.description) {
    return NextResponse.json({ matched: false, reason: "no_profile" });
  }

  const { data: existingConnects } = await admin
    .from("connects")
    .select("user_a, user_b")
    .or(`user_a.eq.${myId},user_b.eq.${myId}`);
  const alreadyConnectedIds = new Set(
    (existingConnects ?? [])
      .flatMap((c: { user_a: string; user_b: string }) => [c.user_a, c.user_b])
      .filter((id: string) => id !== myId),
  );

  const { data: searchers } = await admin
    .from("search_status")
    .select("user_id")
    .eq("is_searching", true)
    .neq("user_id", myId);

  const candidateIds = (searchers ?? [])
    .map((s: { user_id: string }) => s.user_id)
    .filter((id: string) => !alreadyConnectedIds.has(id));

  if (candidateIds.length === 0) {
    return NextResponse.json({ matched: false, reason: "no_candidates" });
  }

  const { data: candidates } = await admin
    .from("profiles")
    .select("id, description")
    .in("id", candidateIds);

  let bestMatch: { id: string; score: number } | null = null;
  const openai = MATCHING_STRATEGY === "ai" ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

  for (const candidate of candidates ?? []) {
    if (!candidate.description) continue;

    const score =
      MATCHING_STRATEGY === "ai" && openai
        ? await aiScore(myProfile.description, candidate.description, openai)
        : keywordScore(myProfile.description, candidate.description);

    if (!bestMatch || score > bestMatch.score) {
      bestMatch = { id: candidate.id, score };
    }
  }

  const minScore = MATCHING_STRATEGY === "ai" ? 50 : 1;
  if (!bestMatch || bestMatch.score < minScore) {
    return NextResponse.json({ matched: false, reason: "no_good_match" });
  }

  const { data: newConnect, error } = await admin
    .from("connects")
    .insert({ user_a: myId, user_b: bestMatch.id, status: "new" })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ matched: false, reason: "db_error" });
  }

  return NextResponse.json({ matched: true, connect: newConnect });
}