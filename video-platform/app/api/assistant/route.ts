import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT =
  'You are the Localy Assistant for Localy, an app that helps people discover and support small local businesses. ' +
  'Features: a Discover video feed, communities, search with category/rating filters, reviews & ratings, ' +
  'bookmarking favorites, deals/coupons, cart & checkout (Stripe), order history, a Business Manager with Reports, ' +
  'and Localy Premium. Help users navigate and answer questions concisely and in a friendly tone. ' +
  'If asked something unrelated, gently steer back to using Localy.';

const FALLBACK = "I'm having trouble right now — try a suggested question below.";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message: string = body?.message ?? '';
    const history: { role: string; text: string }[] = body?.history ?? [];

    if (!message.trim()) {
      return NextResponse.json({ reply: FALLBACK });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('[Assistant] GEMINI_API_KEY is not set');
      return NextResponse.json({ reply: FALLBACK });
    }

    // Build Gemini contents array: last 6 history items (3 exchanges) + new message
    const contents: { role: string; parts: { text: string }[] }[] = [];
    for (const msg of history.slice(-6)) {
      contents.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }],
      });
    }
    contents.push({ role: 'user', parts: [{ text: message }] });

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents,
          generationConfig: { maxOutputTokens: 300, temperature: 0.7 },
        }),
      }
    );

    if (!geminiRes.ok) {
      console.error('[Assistant] Gemini API error', geminiRes.status, await geminiRes.text());
      return NextResponse.json({ reply: FALLBACK });
    }

    const data = await geminiRes.json();
    const reply: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!reply) {
      console.error('[Assistant] Unexpected Gemini response shape:', JSON.stringify(data));
      return NextResponse.json({ reply: FALLBACK });
    }

    return NextResponse.json({ reply });
  } catch (err) {
    console.error('[Assistant] Route error:', err);
    return NextResponse.json({ reply: FALLBACK });
  }
}
