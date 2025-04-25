import { NextRequest, NextResponse } from 'next/server';

// Use the Edge runtime so we can call req.formData() and stream files easily
export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    // ---- 1. Make sure we actually received multipart data
    const contentType = req.headers.get('content-type') ?? '';
    if (!contentType.startsWith('multipart/form-data')) {
      return NextResponse.json(
        { error: 'Content-Type must be multipart/form-data' },
        { status: 415 },
      );
    }

    // ---- 2. Pull the audio file out of the request
    const formData = await req.formData();
    const audio = formData.get('audio');

    if (!(audio instanceof File)) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    // ---- 3. Build the payload for Groq (OpenAI-compatible) Whisper
    const groqForm = new FormData();
    groqForm.append('file', audio, audio.name); // third arg sets filename header
    groqForm.append('model', process.env.GROQ_STT_MODEL ?? 'whisper-large-v3-turbo');
    groqForm.append('response_format', 'json');

    // ---- 4. Hit Groq’s transcription endpoint
    const groqRes = await fetch(
      'https://api.groq.com/openai/v1/audio/transcriptions',
      {
        method: 'POST',
        headers: {
          // Don’t set Content-Type manually – let fetch add the proper form boundary.
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: groqForm,
      },
    );

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      throw new Error(`Groq STT failed: ${groqRes.status} – ${errText}`);
    }

    const { text = '' } = await groqRes.json();

    // ---- 5. Return the transcription
    return NextResponse.json({ text });
  } catch (err) {
    console.error('[STT-API] error:', err);
    return NextResponse.json(
      { error: 'Failed to transcribe audio' },
      { status: 500 },
    );
  }
}
