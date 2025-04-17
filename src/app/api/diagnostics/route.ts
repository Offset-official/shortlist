// app/api/diagnostics/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { poseData, faceData, cameraImage, screenpipeData } = await req.json();

    // TODO: do something with these (e.g., save to DB, forward to another service...)
    console.log('poseData:', poseData);
    console.log('faceData:', faceData);
    console.log('cameraImage (base64 length):', cameraImage?.length);
    console.log('screenpipeData:', screenpipeData);


    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('🛑 diagnostics error:', err);
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
}
