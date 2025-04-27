import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import fetch from 'node-fetch'; // Ensure node-fetch is installed for server-side fetch

export async function POST(req: NextRequest) {
  try {
    const { interviewId } = await req.json();
    if (!interviewId) {
      return NextResponse.json({ error: 'Missing interviewId' }, { status: 400 });
    }

    // Fetch interview
    const interview = await prisma.interview.findUnique({
      where: { id: Number(interviewId) },
    });
    if (!interview) {
      return NextResponse.json({ error: 'Interview not found' }, { status: 404 });
    }

    // Fetch all diagnostics for this interview
    const diagnostics = await prisma.diagnostics.findMany({
      where: { interviewId: Number(interviewId) },
      orderBy: { createdAt: 'asc' },
    });

    // Analyze MediaPipe and Screenpipe data
    const analysis = analyzeDiagnostics(diagnostics);

    // Call Gemini API for textual summary
    const geminiSummary = await getGeminiAnalysis(analysis);

    // Combine metrics and summary into interviewAnalysis
    const interviewAnalysis = {
      poseStability: analysis.poseStability,
      faceVisibility: analysis.faceVisibility,
      faceDirectionDistribution: analysis.faceDirectionDistribution,
      violationCount: analysis.violationCount,
      violationDetails: analysis.violationDetails,
      geminiSummary,
    };

    // Update interview with interviewEndedAt and interviewAnalysis
    const updatedInterview = await prisma.interview.update({
      where: { id: Number(interviewId) },
      data: {
        interviewEndedAt: new Date(), // Set current timestamp
        interviewAnalysis: interviewAnalysis, // Store as JSON
      },
    });

    return NextResponse.json({ interview: updatedInterview, diagnostics });
  } catch (err) {
    console.error('/api/interviewOver error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Analyze diagnostics to generate analysis metrics
function analyzeDiagnostics(diagnostics: any[]) {
  let poseStabilityScore = 0;
  let faceVisibilityCount = 0;
  const faceDirectionCounts = {
    Forward: 0,
    Left: 0,
    Right: 0,
    "No Face Detected": 0,
  };
  let totalSamples = diagnostics.length;
  let violations: { timestamp: string; website: string }[] = [];

  diagnostics.forEach((diag) => {
    // Pose stability: Count "Good Pose" as stable
    if (diag.poseData === 'Good Pose') {
      poseStabilityScore += 1;
    }

    // Face visibility: Count "Forward" as visible (direct camera engagement)
    if (diag.faceData === 'Forward') {
      faceVisibilityCount += 1;
    }

    // Track face direction distribution
    if (diag.faceData in faceDirectionCounts) {
      faceDirectionCounts[diag.faceData as keyof typeof faceDirectionCounts] += 1;
    }

    // Collect violations
    if (diag.violations && Array.isArray(diag.violations)) {
      violations.push(...diag.violations);
    }
  });

  // Calculate percentages
  const poseStability = totalSamples > 0 ? (poseStabilityScore / totalSamples) * 100 : 0;
  const faceVisibility = totalSamples > 0 ? (faceVisibilityCount / totalSamples) * 100 : 0;
  const violationCount = violations.length;

  // Calculate face direction distribution as percentages
  const faceDirectionDistribution = {
    Forward: totalSamples > 0 ? Number(((faceDirectionCounts.Forward / totalSamples) * 100).toFixed(2)) : 0,
    Left: totalSamples > 0 ? Number(((faceDirectionCounts.Left / totalSamples) * 100).toFixed(2)) : 0,
    Right: totalSamples > 0 ? Number(((faceDirectionCounts.Right / totalSamples) * 100).toFixed(2)) : 0,
    "No Face Detected": totalSamples > 0 ? Number(((faceDirectionCounts["No Face Detected"] / totalSamples) * 100).toFixed(2)) : 0,
  };

  return {
    poseStability: Number(poseStability.toFixed(2)), // % of time pose was "Good Pose"
    faceVisibility: Number(faceVisibility.toFixed(2)), // % of time face was "Forward"
    faceDirectionDistribution, // % distribution of face directions
    violationCount, // Total number of violations
    violationDetails: violations, // List of violations
  };
}

// Call Gemini API to generate textual summary
async function getGeminiAnalysis(analysis: any) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY is not set');
    return 'Gemini analysis unavailable: API key missing';
  }

  const prompt = `
    Analyze the following interview diagnostics data and provide a concise summary (150-200 words) of the candidate's performance, focusing on their engagement, professionalism, and adherence to interview guidelines. Highlight strengths and areas for improvement.

    - Pose Stability: ${analysis.poseStability}% (percentage of time the candidate maintained a "Good Pose")
    - Face Visibility: ${analysis.faceVisibility}% (percentage of time the candidate faced the camera directly, i.e., "Forward")
    - Face Direction Distribution: ${JSON.stringify(analysis.faceDirectionDistribution)}% (percentage of time facing Forward, Left, Right, or No Face Detected)
    - Violation Count: ${analysis.violationCount} (number of times the candidate accessed forbidden websites or left the interview tab)
    - Violation Details: ${JSON.stringify(analysis.violationDetails)}

    Provide actionable feedback for the candidate.
  `;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            maxOutputTokens: 300,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API error:', errorData);
      return 'Gemini analysis unavailable: API request failed';
    }

    const data = (await response.json()) as {
      candidates: { content: { parts: { text: string }[] } }[];
    };
    return data.candidates[0]?.content?.parts[0]?.text?.trim() || 'Gemini analysis unavailable: No response';
  } catch (err) {
    console.error('Gemini API fetch error:', err);
    return 'Gemini analysis unavailable: Network error';
  }
}