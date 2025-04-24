// app/api/diagnostics/route.ts
import { NextResponse } from 'next/server';

// In-memory store for demo—loses data on cold starts.
// In production, replace this with a real database.
const diagnosticsStore = new Map<string, {
  poseData: any,
  faceData: any,
  cameraImage: string | undefined,
  screenpipeData: any,
  interviewId: string
}>();

export async function POST(req: Request) {
  try {
    const { poseData, faceData, cameraImage, screenpipeData, interviewId } = await req.json();

    if (!interviewId) {
      return NextResponse.json({ error: 'Missing interviewId' }, { status: 400 });
    }

    diagnosticsStore.set(interviewId, {
      poseData,
      faceData,
      cameraImage,
      screenpipeData,
      interviewId
    });

    console.log(`Stored diagnostics for interviewId=${interviewId}`);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Diagnostics POST error:', err);
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
}

export async function GET() {
  // Grab all values from the Map
  const allDiagnostics = Array.from(diagnosticsStore.values());

  return NextResponse.json({
    success: true,
    count: allDiagnostics.length,
    data: allDiagnostics
  });
}
