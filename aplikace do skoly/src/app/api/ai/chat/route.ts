import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { characterId, message } = body || {};

    // Placeholder AI response. Replace with actual AI provider integration.
    const responseText = `Odpověď z ${characterId}: "${message}"`;

    return NextResponse.json({ response: responseText });
  } catch (err) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
