// app/api/diagnostics/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { poseData, faceData, cameraImage, screenpipeData, interviewId } = await req.json();

    if (!interviewId) {
      return NextResponse.json({ error: 'Missing interviewId' }, { status: 400 });
    }

    await prisma.diagnostics.create({
      data: {
        interviewId: Number(interviewId),
        poseData,
        faceData,
        cameraImage,
        screenpipeData,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Diagnostics POST error:', err);
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
}

// export async function GET() {
//   // Grab all values from the Map
//   // const allDiagnostics = Array.from(diagnosticsStore.values());

//   return NextResponse.json({
//     success: true,
//     count: allDiagnostics.length,
//     data: allDiagnostics
//   });
// }
